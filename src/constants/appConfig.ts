// App configuration constants
export const AppConfig = {
  // Calendar configuration
  calendar: {
    title: 'Smart Study Momentum',
    color: '#6366f1',
  },

  // Notification reminder time ranges (hours)
  reminderTimes: {
    morning: { start: 7, end: 9, offsetMinutes: 30 },
    afternoon: { start: 13, end: 15, offsetMinutes: 15 },
    evening: { start: 19, end: 21, offsetMinutes: 20 },
    weekend: { start: 10, end: 11, offsetMinutes: 60 },
  },

  // Default notification messages
  reminderMessages: {
    morning: {
      title: 'Good Morning! Time to Study',
      message: 'Start your day with a productive study session. You\'ve got this!',
    },
    afternoon: {
      title: 'Afternoon Focus Session',
      message: 'Beat the afternoon slump with a focused study session!',
    },
    evening: {
      title: 'Evening Review',
      message: 'Review today\'s learning progress and plan for tomorrow.',
    },
    weekend: {
      title: 'Weekend Study Power!',
      message: 'Use the weekend to get ahead with your studies!',
    },
  },

  // Default focus session presets
  focusSessionPresets: [
    { name: 'Quick Focus', duration: 25, icon: 'bolt' },
    { name: 'Deep Work', duration: 45, icon: 'psychology' },
    { name: 'Review', duration: 30, icon: 'replay' },
    { name: 'Practice', duration: 60, icon: 'fitness-center' },
  ],

  // Motivational messages
  motivationalMessages: [
    "Keep up the great work! Every study session counts.",
    "You're building strong study habits!",
    "Consistency is key to success!",
    "Your future self will thank you!",
  ],

  // Focus quotes
  focusQuotes: [
    "Focus on being productive instead of busy.",
    "The secret to getting ahead is getting started.",
    "Success is the sum of small efforts repeated day in and day out.",
    "Don't watch the clock; do what it does. Keep going.",
  ],

  // Deadline keywords for calendar detection
  deadlineKeywords: ['deadline', 'due', 'assignment', 'test', 'exam', 'quiz'],
};
