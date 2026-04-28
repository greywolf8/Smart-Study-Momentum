import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { SmartReminder } from '../types';
import { StorageService } from './StorageService';

export class NotificationService {
  static async initialize(): Promise<void> {
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (Platform.OS !== 'web') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    }
  }

  static async scheduleReminder(reminder: SmartReminder): Promise<string> {
    try {
      const triggerDate = new Date(reminder.scheduledTime);
      const trigger: Notifications.DateTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      };
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.message,
          data: { reminderId: reminder.id, type: reminder.type },
          sound: 'default',
          priority: reminder.priority === 'high' ? Notifications.AndroidNotificationPriority.HIGH : 
                     reminder.priority === 'medium' ? Notifications.AndroidNotificationPriority.DEFAULT : 
                     Notifications.AndroidNotificationPriority.LOW,
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      throw error;
    }
  }

  static async scheduleStudyReminders(): Promise<void> {
    try {
      const settings = await StorageService.getSettings();
      const notificationsEnabled = settings?.notifications !== false;
      
      if (!notificationsEnabled) return;

      const now = new Date();
      const reminders = this.generateSmartReminders(now);
      
      for (const reminder of reminders) {
        await this.scheduleReminder(reminder);
      }
    } catch (error) {
      console.error('Error scheduling study reminders:', error);
    }
  }

  static async scheduleFocusSessionReminder(subject: string, startTime: Date): Promise<void> {
    const reminder: SmartReminder = {
      id: `focus_${Date.now()}`,
      title: 'Focus Session Starting Soon',
      message: `Your ${subject} focus session starts in 5 minutes. Get ready to focus!`,
      scheduledTime: new Date(startTime.getTime() - 5 * 60000),
      type: 'study',
      priority: 'medium',
    };

    await this.scheduleReminder(reminder);
  }

  static async scheduleBreakReminder(sessionDuration: number): Promise<void> {
    const breakTime = new Date(Date.now() + sessionDuration * 60000);
    const reminder: SmartReminder = {
      id: `break_${Date.now()}`,
      title: 'Time for a Break!',
      message: `You've been studying for ${sessionDuration} minutes. Take a 5-minute break to recharge.`,
      scheduledTime: breakTime,
      type: 'break',
      priority: 'low',
    };

    await this.scheduleReminder(reminder);
  }

  static async cancelReminder(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling reminder:', error);
    }
  }

  static async cancelAllReminders(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all reminders:', error);
    }
  }

  static async getScheduledReminders(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled reminders:', error);
      return [];
    }
  }

  private static generateSmartReminders(now: Date): SmartReminder[] {
    const reminders: SmartReminder[] = [];
    const currentHour = now.getHours();

    // Morning motivation reminder
    if (currentHour >= 7 && currentHour <= 9) {
      reminders.push({
        id: `morning_${Date.now()}`,
        title: 'Good Morning! Time to Study',
        message: 'Start your day with a productive study session. You\'ve got this!',
        scheduledTime: new Date(now.getTime() + 30 * 60000), // 30 minutes from now
        type: 'study',
        priority: 'medium',
      });
    }

    // Afternoon focus reminder
    if (currentHour >= 13 && currentHour <= 15) {
      reminders.push({
        id: `afternoon_${Date.now()}`,
        title: 'Afternoon Focus Session',
        message: 'Beat the afternoon slump with a focused study session!',
        scheduledTime: new Date(now.getTime() + 15 * 60000), // 15 minutes from now
        type: 'study',
        priority: 'medium',
      });
    }

    // Evening review reminder
    if (currentHour >= 19 && currentHour <= 21) {
      reminders.push({
        id: `evening_${Date.now()}`,
        title: 'Evening Review',
        message: 'Review today\'s learning progress and plan for tomorrow.',
        scheduledTime: new Date(now.getTime() + 20 * 60000), // 20 minutes from now
        type: 'review',
        priority: 'low',
      });
    }

    // Weekend motivation
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 6 || dayOfWeek === 0) { // Saturday or Sunday
      if (currentHour >= 10 && currentHour <= 11) {
        reminders.push({
          id: `weekend_${Date.now()}`,
          title: 'Weekend Study Power!',
          message: 'Use the weekend to get ahead with your studies!',
          scheduledTime: new Date(now.getTime() + 60 * 60000), // 1 hour from now
          type: 'study',
          priority: 'low',
        });
      }
    }

    return reminders;
  }

  static async sendInstantNotification(title: string, message: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error sending instant notification:', error);
    }
  }

  static async sendSessionCompleteNotification(subject: string, duration: number): Promise<void> {
    await this.sendInstantNotification(
      'Great Job! Session Complete',
      `You completed a ${duration}-minute ${subject} session. Take a well-deserved break!`
    );
  }

  static async sendStreakNotification(streakDays: number): Promise<void> {
    if (streakDays > 0 && streakDays % 7 === 0) {
      await this.sendInstantNotification(
        'Amazing Streak! ',
        `You've maintained a ${streakDays}-day study streak! Keep up the incredible work!`
      );
    }
  }

  static async sendGoalAchievedNotification(goal: string): Promise<void> {
    await this.sendInstantNotification(
      'Goal Achieved! ',
      `Congratulations! You've achieved your goal: ${goal}`
    );
  }
}
