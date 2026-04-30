import { StudyPlan, StudySession, UserBehavior, MicroTask, FocusSession } from '../types';
import { openRouterService } from './OpenRouterService';
import { StorageService } from './StorageService';
import { AppConfig } from '../constants/appConfig';

export class AIStudyPlanner {
  private userBehavior: UserBehavior;
  private studyHistory: StudySession[];

  constructor() {
    this.userBehavior = this.initializeUserBehavior();
    this.studyHistory = [];
  }

  private async loadUserBehavior(): Promise<UserBehavior> {
    const savedBehavior = await StorageService.getUserBehavior();
    if (savedBehavior) {
      return savedBehavior;
    }
    return this.initializeUserBehavior();
  }

  private initializeUserBehavior(): UserBehavior {
    return {
      peakFocusHours: [9, 10, 11, 14, 15, 16, 19, 20],
      averageSessionDuration: AppConfig.focusSessionPresets[1].duration,
      preferredDifficultyOrder: ['medium', 'easy', 'hard'],
      breakPatterns: [15, 30, 60],
      productivityScore: 0.7
    };
  }

  async generateDailyPlan(subjects: string[], availableTime: number, deadlines: any[]): Promise<StudyPlan> {
    // Load user behavior from storage if not initialized
    if (this.userBehavior.productivityScore === 0.7 && this.studyHistory.length === 0) {
      this.userBehavior = await this.loadUserBehavior();
    }
    try {
      const userContext = `User behavior: Productivity score ${this.userBehavior.productivityScore}, average session duration ${this.userBehavior.averageSessionDuration} minutes, peak focus hours ${this.userBehavior.peakFocusHours.join(', ')}`;
      const aiPlan = await openRouterService.generateStudyPlan(subjects, availableTime, userContext);
      
      const sessions: StudySession[] = aiPlan.sessions.map((session: any, index: number) => ({
        id: `session_${Date.now()}_${index}`,
        subject: session.subject,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime),
        duration: session.duration,
        focusLevel: session.focusLevel,
        completedTasks: [],
        difficulty: session.difficulty
      }));

      return {
        id: `plan_${Date.now()}`,
        date: new Date(),
        sessions,
        totalStudyTime: sessions.reduce((total, session) => total + session.duration, 0),
        difficultyBalance: aiPlan.difficultyBalance
      };
    } catch (error) {
      console.error('AI plan generation failed, falling back to mock:', error);
      // Fall back to mock implementation
      const sessions: StudySession[] = [];
      const currentTime = new Date();
      currentTime.setHours(this.userBehavior.peakFocusHours[0], 0, 0, 0);

      const difficultyBalance = this.calculateDifficultyBalance(subjects);
      let remainingTime = availableTime;

      subjects.forEach((subject, index) => {
        const difficulty = this.getDifficultyForSubject(subject, index);
        const sessionDuration = Math.min(
          this.userBehavior.averageSessionDuration,
          remainingTime / (subjects.length - index)
        );

        if (remainingTime > 0) {
          const session: StudySession = {
            id: `session_${Date.now()}_${index}`,
            subject,
            startTime: new Date(currentTime),
            endTime: new Date(currentTime.getTime() + sessionDuration * 60000),
            duration: sessionDuration,
            focusLevel: this.predictFocusLevel(currentTime.getHours()),
            completedTasks: [],
            difficulty
          };

          sessions.push(session);
          currentTime.setTime(currentTime.getTime() + (sessionDuration + 15) * 60000);
          remainingTime -= sessionDuration;
        }
      });

      return {
        id: `plan_${Date.now()}`,
        date: new Date(),
        sessions,
        totalStudyTime: sessions.reduce((total, session) => total + session.duration, 0),
        difficultyBalance
      };
    }
  }

  async generateMicroTasks(subject: string, sessionDuration: number, difficulty: 'easy' | 'medium' | 'hard'): Promise<MicroTask[]> {
    try {
      const aiTasks = await openRouterService.generateMicroTasks(subject, sessionDuration, difficulty);
      
      return aiTasks.map((task: any, index: number) => ({
        id: `task_${Date.now()}_${index}`,
        title: task.title,
        estimatedTime: task.estimatedTime,
        difficulty: task.difficulty,
        completed: false,
        subject
      }));
    } catch (error) {
      console.error('AI micro-task generation failed, falling back to mock:', error);
      // Fall back to mock implementation
      const taskTemplates = this.getTaskTemplates(subject, difficulty);
      const microTasks: MicroTask[] = [];
      let remainingTime = sessionDuration;

      taskTemplates.forEach((template, index) => {
        if (remainingTime > 5) {
          const taskTime = Math.min(template.estimatedTime, remainingTime / (taskTemplates.length - index));
          microTasks.push({
            id: `task_${Date.now()}_${index}`,
            title: template.title,
            estimatedTime: taskTime,
            difficulty,
            completed: false,
            subject
          });
          remainingTime -= taskTime;
        }
      });

      return microTasks;
    }
  }

  async createFocusSession(subject: string, duration: number): Promise<FocusSession> {
    const difficulty = this.getDifficultyForSubject(subject, 0);
    const microTasks = await this.generateMicroTasks(subject, duration, difficulty);

    return {
      id: `focus_${Date.now()}`,
      subject,
      duration,
      microTasks,
      startTime: new Date(),
      isActive: true,
      currentTaskIndex: 0
    };
  }

  updateUserBehavior(session: StudySession): void {
    this.studyHistory.push(session);
    
    const hour = session.startTime.getHours();
    if (!this.userBehavior.peakFocusHours.includes(hour)) {
      this.userBehavior.peakFocusHours.push(hour);
      this.userBehavior.peakFocusHours.sort();
    }

    this.userBehavior.averageSessionDuration = 
      (this.userBehavior.averageSessionDuration * 0.8 + session.duration * 0.2);

    this.userBehavior.productivityScore = 
      Math.min(1, this.userBehavior.productivityScore * 0.9 + (session.focusLevel / 10) * 0.1);
  }

  async getRecommendations(): Promise<string[]> {
    try {
      const aiRecommendations = await openRouterService.getRecommendations(
        this.studyHistory,
        this.userBehavior.productivityScore
      );
      return aiRecommendations;
    } catch (error) {
      console.error('AI recommendation generation failed, falling back to mock:', error);
      // Fall back to mock implementation
      const recommendations: string[] = [];

      if (this.userBehavior.productivityScore < 0.5) {
        recommendations.push("Consider taking more breaks to maintain focus");
      }

      if (this.userBehavior.averageSessionDuration < 30) {
        recommendations.push("Try extending study sessions for better deep work");
      }

      const lastSessions = this.studyHistory.slice(-5);
      const hardSessions = lastSessions.filter(s => s.difficulty === 'hard').length;
      
      if (hardSessions < 2) {
        recommendations.push("Include more challenging tasks to improve learning");
      }

      return recommendations;
    }
  }

  private calculateDifficultyBalance(subjects: string[]) {
    const balance = { easy: 0, medium: 0, hard: 0 };
    subjects.forEach((_, index) => {
      const difficulty = this.getDifficultyForSubject('', index);
      balance[difficulty]++;
    });
    return balance;
  }

  private getDifficultyForSubject(subject: string, index: number): 'easy' | 'medium' | 'hard' {
    const order = this.userBehavior.preferredDifficultyOrder;
    return order[index % order.length] as 'easy' | 'medium' | 'hard';
  }

  private predictFocusLevel(hour: number): number {
    const peakHours = this.userBehavior.peakFocusHours;
    if (peakHours.includes(hour)) {
      return 8 + Math.random() * 2;
    }
    return 5 + Math.random() * 3;
  }

  private getTaskTemplates(subject: string, difficulty: 'easy' | 'medium' | 'hard') {
    const templates = {
      easy: [
        { title: `Review ${subject} fundamentals`, estimatedTime: 10 },
        { title: `Practice basic ${subject} problems`, estimatedTime: 15 },
        { title: `Organize ${subject} notes`, estimatedTime: 10 }
      ],
      medium: [
        { title: `Solve intermediate ${subject} exercises`, estimatedTime: 20 },
        { title: `Study ${subject} concepts in depth`, estimatedTime: 25 },
        { title: `Complete ${subject} practice quiz`, estimatedTime: 15 }
      ],
      hard: [
        { title: `Tackle advanced ${subject} problems`, estimatedTime: 30 },
        { title: `Work on ${subject} project/assignment`, estimatedTime: 35 },
        { title: `Research complex ${subject} topics`, estimatedTime: 25 }
      ]
    };

    return templates[difficulty] || templates.medium;
  }
}
