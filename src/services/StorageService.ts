import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudySession, StudyPlan, UserBehavior, ProgressMetrics } from '../types';

const KEYS = {
  STUDY_HISTORY: 'study_history',
  USER_BEHAVIOR: 'user_behavior',
  CURRENT_PLAN: 'current_plan',
  PROGRESS_METRICS: 'progress_metrics',
  SETTINGS: 'app_settings'
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
}
