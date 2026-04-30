import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { StudySession, StudyPlan } from '../types';
import { StorageService } from './StorageService';
import { AppConfig } from '../constants/appConfig';

export class CalendarIntegration {
  private static calendarId: string | null = null;

  static async initialize(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        console.log('Calendar integration not available on web');
        return false;
      }

      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        console.log('Calendar permissions not granted');
        return false;
      }

      const calendars = await Calendar.getCalendarsAsync();
      const existingCalendar = calendars.find(cal => 
        cal.title === AppConfig.calendar.title || cal.source.name === AppConfig.calendar.title
      );

      if (existingCalendar) {
        this.calendarId = existingCalendar.id;
      } else {
        const newCalendar = await Calendar.createCalendarAsync({
          title: AppConfig.calendar.title,
          color: AppConfig.calendar.color,
          entityType: Calendar.EntityTypes.EVENT,
          sourceId: calendars[0]?.source?.id,
          source: calendars[0]?.source,
          name: AppConfig.calendar.title,
          accessLevel: Calendar.CalendarAccessLevel.OWNER,
        });
        this.calendarId = newCalendar;
      }

      return true;
    } catch (error) {
      console.error('Error initializing calendar:', error);
      return false;
    }
  }

  static async syncStudyPlan(plan: StudyPlan): Promise<void> {
    try {
      if (!this.calendarId) {
        const initialized = await this.initialize();
        if (!initialized) return;
      }

      // Clear existing study events for today
      await this.clearTodayEvents();

      // Add new study sessions
      for (const session of plan.sessions) {
        await this.createStudySessionEvent(session);
      }
    } catch (error) {
      console.error('Error syncing study plan:', error);
    }
  }

  static async createStudySessionEvent(session: StudySession): Promise<string> {
    try {
      if (!this.calendarId) {
        throw new Error('Calendar not initialized');
      }

      const eventId = await Calendar.createEventAsync(this.calendarId, {
        title: `Study: ${session.subject}`,
        startDate: session.startTime,
        endDate: session.endTime,
        location: 'Smart Study App',
        notes: this.generateSessionNotes(session),
        alarms: [
          {
            relativeOffset: -5, // 5 minutes before
            method: Calendar.AlarmMethod.ALERT,
          },
        ],
        // timeZone: Platform.OS === 'ios' ? TimeZone.currentTimeZone : undefined,
      });

      return eventId;
    } catch (error) {
      console.error('Error creating study session event:', error);
      throw error;
    }
  }

  static async updateStudySessionEvent(session: StudySession, eventId: string): Promise<void> {
    try {
      if (!this.calendarId) {
        throw new Error('Calendar not initialized');
      }

      await Calendar.updateEventAsync(eventId, {
        title: `Study: ${session.subject}`,
        startDate: session.startTime,
        endDate: session.endTime,
        location: 'Smart Study App',
        notes: this.generateSessionNotes(session),
        alarms: [
          {
            relativeOffset: -5, // 5 minutes before
            method: Calendar.AlarmMethod.ALERT,
          },
        ],
        // timeZone: Platform.OS === 'ios' ? TimeZone.currentTimeZone : undefined,
      });
    } catch (error) {
      console.error('Error updating study session event:', error);
      throw error;
    }
  }

  static async deleteStudySessionEvent(eventId: string): Promise<void> {
    try {
      await Calendar.deleteEventAsync(eventId);
    } catch (error) {
      console.error('Error deleting study session event:', error);
      throw error;
    }
  }

  static async getTodayEvents(): Promise<Calendar.Event[]> {
    try {
      if (!this.calendarId) {
        return [];
      }

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const events = await Calendar.getEventsAsync(
        [this.calendarId],
        startOfDay,
        endOfDay
      );

      return events;
    } catch (error) {
      console.error('Error getting today events:', error);
      return [];
    }
  }

  static async detectConflicts(): Promise<Calendar.Event[]> {
    try {
      const allCalendars = await Calendar.getCalendarsAsync();
      const calendarIds = allCalendars.map(cal => cal.id);

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const events = await Calendar.getEventsAsync(calendarIds, startOfDay, endOfDay);
      
      // Filter out our own events and return potential conflicts
      return events.filter(event => 
        event.calendarId !== this.calendarId &&
        !event.title?.includes('Study:') &&
        !event.title?.includes('Smart Study')
      );
    } catch (error) {
      console.error('Error detecting conflicts:', error);
      return [];
    }
  }

  static async syncFromGoogleCalendar(): Promise<StudySession[]> {
    try {
      // This would integrate with Google Calendar API
      // For now, return empty array as placeholder
      console.log('Google Calendar integration not yet implemented');
      return [];
    } catch (error) {
      console.error('Error syncing from Google Calendar:', error);
      return [];
    }
  }

  private static async clearTodayEvents(): Promise<void> {
    try {
      if (!this.calendarId) return;

      const todayEvents = await this.getTodayEvents();
      for (const event of todayEvents) {
        await Calendar.deleteEventAsync(event.id);
      }
    } catch (error) {
      console.error('Error clearing today events:', error);
    }
  }

  private static generateSessionNotes(session: StudySession): string {
    const notes = [
      `Smart Study Momentum Session`,
      `Subject: ${session.subject}`,
      `Duration: ${session.duration} minutes`,
      `Difficulty: ${session.difficulty}`,
      `Focus Level: ${session.focusLevel}/10`,
    ];

    if (session.completedTasks.length > 0) {
      notes.push(`Completed Tasks: ${session.completedTasks.join(', ')}`);
    }

    return notes.join('\n');
  }

  static async getUpcomingDeadlines(): Promise<Array<{ title: string; date: Date; type: string }>> {
    try {
      const allCalendars = await Calendar.getCalendarsAsync();
      const calendarIds = allCalendars.map(cal => cal.id);

      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const events = await Calendar.getEventsAsync(calendarIds, now, weekFromNow);
      
      // Filter for events that might be deadlines or assignments
      const deadlineKeywords = AppConfig.deadlineKeywords;
      
      return events
        .filter(event => {
          const title = event.title?.toLowerCase() || '';
          return deadlineKeywords.some(keyword => title.includes(keyword));
        })
        .map(event => ({
          title: event.title || 'Unknown',
          date: new Date(event.startDate || Date.now()),
          type: 'deadline',
        }));
    } catch (error) {
      console.error('Error getting upcoming deadlines:', error);
      return [];
    }
  }

  static async isConnected(): Promise<boolean> {
    return this.calendarId !== null;
  }

  static async disconnect(): Promise<void> {
    try {
      if (this.calendarId) {
        await Calendar.deleteCalendarAsync(this.calendarId);
        this.calendarId = null;
      }
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
    }
  }
}
