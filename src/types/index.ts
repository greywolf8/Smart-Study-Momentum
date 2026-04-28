export interface StudySession {
  id: string;
  subject: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  focusLevel: number;
  completedTasks: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StudyPlan {
  id: string;
  date: Date;
  sessions: StudySession[];
  totalStudyTime: number;
  difficultyBalance: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface UserBehavior {
  peakFocusHours: number[];
  averageSessionDuration: number;
  preferredDifficultyOrder: string[];
  breakPatterns: number[];
  productivityScore: number;
}

export interface MicroTask {
  id: string;
  title: string;
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  subject: string;
}

export interface FocusSession {
  id: string;
  subject: string;
  duration: number;
  microTasks: MicroTask[];
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  currentTaskIndex: number;
}

export interface ProgressMetrics {
  weeklyStudyTime: number;
  streakDays: number;
  subjectProgress: Record<string, number>;
  productivityTrend: number[];
  completionRate: number;
}

export interface SmartReminder {
  id: string;
  title: string;
  scheduledTime: Date;
  type: 'study' | 'break' | 'deadline' | 'review';
  priority: 'low' | 'medium' | 'high';
  message: string;
}

export interface Integration {
  id: string;
  type: 'google_calendar' | 'github' | 'canvas' | 'other';
  isConnected: boolean;
  lastSync: Date;
  data: Record<string, any>;
}
