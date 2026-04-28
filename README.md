# Smart Study Momentum :rocket:

An AI-driven mobile app that helps students maintain consistent learning habits and avoid burnout through intelligent study planning and personalized recommendations.

## Features

### Core Functionality
- **AI-Powered Study Planning**: Generates adaptive daily study plans based on your patterns and deadlines
- **Focus Sessions**: AI-generated micro-tasks with difficulty balancing across subjects
- **Smart Reminders**: Contextual notifications based on productivity patterns
- **Visual Progress Dashboards**: Comprehensive analytics and progress tracking
- **Calendar Integration**: Sync with Google Calendar and detect upcoming deadlines
- **Behavior Learning**: AI learns your study patterns and provides personalized recommendations

### Key Screens
- **Dashboard**: Overview of daily plan, progress metrics, and quick actions
- **Study Plan**: AI-generated daily schedule with difficulty balancing
- **Focus Session**: Timer-based study sessions with micro-tasks
- **Progress**: Visual analytics with charts and insights
- **Settings**: Preferences, integrations, and data management

## Technology Stack

- **Framework**: React Native + Expo
- **Navigation**: Expo Router (file-based routing)
- **UI Components**: React Native Paper
- **Charts**: React Native Chart Kit
- **Storage**: AsyncStorage
- **Notifications**: Expo Notifications
- **Calendar**: Expo Calendar
- **Icons**: React Native Vector Icons

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd SmartStudyMomentum
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npx expo start
   ```

### Running the App

Choose one of the following options:

- **Web**: Press `w` in the terminal or open http://localhost:8081
- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Expo Go**: Scan the QR code with the Expo Go app

## App Structure

```
SmartStudyMomentum/
|-- app/                    # Expo Router pages
|   |-- (tabs)/            # Tab navigation screens
|   |-- _layout.tsx        # Root layout
|-- src/
|   |-- components/        # Reusable components
|   |-- screens/          # Main app screens
|   |-- services/         # Business logic and APIs
|   |-- types/            # TypeScript type definitions
|   |-- utils/            # Utility functions
|   |-- hooks/            # Custom React hooks
```

## Key Services

### AIStudyPlanner
- Generates personalized study plans
- Creates micro-tasks for focus sessions
- Learns user behavior patterns
- Provides recommendations

### NotificationService
- Smart reminder scheduling
- Session completion notifications
- Streak achievements
- Goal celebrations

### CalendarIntegration
- Syncs study sessions with device calendar
- Detects conflicts and deadlines
- Google Calendar integration (planned)

### StorageService
- Persistent data management
- User preferences
- Study history
- Progress metrics

## Features in Detail

### Study Pattern Analysis
- Tracks focus hours and session duration
- Identifies productivity patterns
- Suggests optimal study times
- Balances difficulty across subjects

### Focus Sessions
- Timer-based study periods
- AI-generated micro-tasks
- Progress tracking
- Completion rewards

### Progress Analytics
- Daily/weekly study time
- Subject distribution charts
- Difficulty balance visualization
- Streak tracking
- Productivity trends

### Smart Reminders
- Contextual timing based on patterns
- Session start notifications
- Break reminders
- Deadline alerts
- Motivational messages

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

---

Built with :heart: using Expo and React Native
