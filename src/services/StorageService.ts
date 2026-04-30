import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudySession, StudyPlan, UserBehavior, ProgressMetrics } from '../types';
import { AppConfig } from '../constants/appConfig';

const KEYS = {
  STUDY_HISTORY: 'study_history',
  USER_BEHAVIOR: 'user_behavior',
  CURRENT_PLAN: 'current_plan',
  PROGRESS_METRICS: 'progress_metrics',
  SETTINGS: 'app_settings',
  SUBJECTS: 'user_subjects',
  STUDY_PREFERENCES: 'study_preferences'
};

export class StorageService {
  static async saveStudySession(session: StudySession): Promise<void> {
    try {
      const existingSessions = await this.getStudyHistory();
      existingSessions.push(session);
      await AsyncStorage.setItem(KEYS.STUDY_HISTORY, JSON.stringify(existingSessions));
    } catch (error) {
      console.error('Error saving study session:', error);
    }
  }

  static async getStudyHistory(): Promise<StudySession[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.STUDY_HISTORY);
      if (!data) return [];
      
      const sessions = JSON.parse(data);
      return sessions.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime),
      }));
    } catch (error) {
      console.error('Error getting study history:', error);
      return [];
    }
  }

  static async saveUserBehavior(behavior: UserBehavior): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER_BEHAVIOR, JSON.stringify(behavior));
    } catch (error) {
      console.error('Error saving user behavior:', error);
    }
  }

  static async getUserBehavior(): Promise<UserBehavior | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_BEHAVIOR);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user behavior:', error);
      return null;
    }
  }

  static async saveCurrentPlan(plan: StudyPlan): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.CURRENT_PLAN, JSON.stringify(plan));
    } catch (error) {
      console.error('Error saving current plan:', error);
    }
  }

  static async getCurrentPlan(): Promise<StudyPlan | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CURRENT_PLAN);
      if (!data) return null;
      
      const plan = JSON.parse(data);
      return {
        ...plan,
        date: new Date(plan.date),
        sessions: plan.sessions.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: new Date(session.endTime),
        })),
      };
    } catch (error) {
      console.error('Error getting current plan:', error);
      return null;
    }
  }

  static async saveProgressMetrics(metrics: ProgressMetrics): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PROGRESS_METRICS, JSON.stringify(metrics));
    } catch (error) {
      console.error('Error saving progress metrics:', error);
    }
  }

  static async getProgressMetrics(): Promise<ProgressMetrics | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PROGRESS_METRICS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting progress metrics:', error);
      return null;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      for (const key of Object.values(KEYS)) {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  static async saveSetting(key: string, value: any): Promise<void> {
    try {
      const settings = await this.getSettings();
      settings[key] = value;
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  }

  static async getSettings(): Promise<Record<string, any>> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting settings:', error);
      return {};
    }
  }

  static async getSetting(key: string): Promise<any> {
    try {
      const settings = await this.getSettings();
      return settings[key];
    } catch (error) {
      console.error('Error getting setting:', error);
      return null;
    }
  }

  static async saveSubjects(subjects: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SUBJECTS, JSON.stringify(subjects));
    } catch (error) {
      console.error('Error saving subjects:', error);
    }
  }

  static async getSubjects(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SUBJECTS);
      if (!data) {
        // Return empty array if none exist - let user add subjects
        return [];
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting subjects:', error);
      return [];
    }
  }

  static async saveStudyPreferences(preferences: Record<string, any>): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.STUDY_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving study preferences:', error);
    }
  }

  static async getStudyPreferences(): Promise<Record<string, any>> {
    try {
      const data = await AsyncStorage.getItem(KEYS.STUDY_PREFERENCES);
      if (!data) {
        // Return default preferences if none exist
        const defaultPreferences = {
          defaultSessionDuration: AppConfig.focusSessionPresets[1].duration,
          focusDifficulty: 'balanced',
          reminderFrequency: 'daily',
        };
        await this.saveStudyPreferences(defaultPreferences);
        return defaultPreferences;
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting study preferences:', error);
      return {
        defaultSessionDuration: AppConfig.focusSessionPresets[1].duration,
        focusDifficulty: 'balanced',
        reminderFrequency: 'daily',
      };
    }
  }

  static async initializeDefaultData(): Promise<void> {
    try {
      // Check if data already exists
      const existingSubjects = await AsyncStorage.getItem(KEYS.SUBJECTS);
      const existingPreferences = await AsyncStorage.getItem(KEYS.STUDY_PREFERENCES);
      const existingMetrics = await AsyncStorage.getItem(KEYS.PROGRESS_METRICS);

      if (!existingSubjects) {
        await this.saveSubjects([]);
      }

      if (!existingPreferences) {
        await this.saveStudyPreferences({
          defaultSessionDuration: AppConfig.focusSessionPresets[1].duration,
          focusDifficulty: 'balanced',
          reminderFrequency: 'daily',
        });
      }

      if (!existingMetrics) {
        await this.saveProgressMetrics({
          weeklyStudyTime: 0,
          streakDays: 0,
          subjectProgress: {},
          productivityTrend: [],
          completionRate: 0,
        });
      }
    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  }

  static async calculateProgressMetrics(): Promise<ProgressMetrics> {
    try {
      const history = await this.getStudyHistory();
      const subjects = await this.getSubjects();
      
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Calculate weekly study time
      const weeklySessions = history.filter(session => 
        new Date(session.startTime) >= weekAgo
      );
      const weeklyStudyTime = weeklySessions.reduce((total, session) => total + session.duration, 0);
      
      // Calculate streak days
      let streakDays = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        
        const hasSessionOnDay = history.some(session => {
          const sessionDate = new Date(session.startTime);
          sessionDate.setHours(0, 0, 0, 0);
          return sessionDate.getTime() === checkDate.getTime();
        });
        
        if (hasSessionOnDay) {
          streakDays++;
        } else if (i > 0) {
          break;
        }
      }
      
      // Calculate subject progress
      const subjectProgress: Record<string, number> = {};
      subjects.forEach(subject => {
        const subjectSessions = history.filter(s => s.subject === subject);
        const totalDuration = subjectSessions.reduce((total, s) => total + s.duration, 0);
        // Progress based on total study time (arbitrary scale: 100 hours = 100%)
        subjectProgress[subject] = Math.min(1, totalDuration / (100 * 60));
      });
      
      // Calculate productivity trend (last 7 days)
      const productivityTrend: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(now);
        dayStart.setDate(dayStart.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        
        const daySessions = history.filter(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= dayStart && sessionDate <= dayEnd;
        });
        
        const dayStudyTime = daySessions.reduce((total, s) => total + s.duration, 0);
        productivityTrend.push(dayStudyTime / 60); // Convert to hours
      }
      
      // Calculate completion rate
      const totalSessions = history.length;
      const completedSessions = history.filter(s => s.completedTasks.length > 0).length;
      const completionRate = totalSessions > 0 ? completedSessions / totalSessions : 0;
      
      const metrics: ProgressMetrics = {
        weeklyStudyTime,
        streakDays,
        subjectProgress,
        productivityTrend,
        completionRate,
      };
      
      await this.saveProgressMetrics(metrics);
      return metrics;
    } catch (error) {
      console.error('Error calculating progress metrics:', error);
      return {
        weeklyStudyTime: 0,
        streakDays: 0,
        subjectProgress: {},
        productivityTrend: [],
        completionRate: 0,
      };
    }
  }
}
