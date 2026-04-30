import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Card, Button, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StudyPlan, ProgressMetrics, SmartReminder } from '../types';
import { AIStudyPlanner } from '../services/AIStudyPlanner';
import { StorageService } from '../services/StorageService';
import { AppConfig } from '../constants/appConfig';

const { width, height } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null);
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetrics | null>(null);
  const [reminders, setReminders] = useState<SmartReminder[]>([]);
  const [aiPlanner] = useState(() => new AIStudyPlanner());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const plan = await StorageService.getCurrentPlan();
      const metrics = await StorageService.calculateProgressMetrics();
      
      setCurrentPlan(plan);
      setProgressMetrics(metrics);
      
      if (!plan) {
        generateNewPlan();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const generateNewPlan = async () => {
    try {
      const subjects = await StorageService.getSubjects();
      const preferences = await StorageService.getStudyPreferences();
      const availableTime = preferences.defaultSessionDuration * 4; // 4 sessions
      const plan = await aiPlanner.generateDailyPlan(subjects, availableTime, []);
      await StorageService.saveCurrentPlan(plan);
      setCurrentPlan(plan);
    } catch (error) {
      console.error('Error generating plan:', error);
    }
  };

  const startFocusSession = async (subject: string) => {
    const preferences = await StorageService.getStudyPreferences();
    Alert.alert(
      'Start Focus Session',
      `Start a ${preferences.defaultSessionDuration}-minute focus session for ${subject}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start', onPress: () => handleStartSession(subject) },
      ]
    );
  };

  const handleStartSession = (subject: string) => {
    // Navigate to focus session screen
    router.push('/(tabs)/focus');
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Keep up the great work! Every study session counts.",
      "You're building strong study habits!",
      "Consistency is key to success!",
      "Your future self will thank you!",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366f1', '#8b5cf6', '#3b82f6']}
        style={styles.gradient}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="school" size={40} color="#ffffff" />
          </View>
          <Text style={styles.title}>Smart Study Momentum</Text>
          <Text style={styles.subtitle}>{getMotivationalMessage()}</Text>
        </View>

      {progressMetrics && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <Icon name="local-fire-department" size={24} color="#ef4444" />
                </View>
                <Text style={styles.statValue}>{progressMetrics.streakDays}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <Icon name="timer" size={24} color="#10b981" />
                </View>
                <Text style={styles.statValue}>{Math.round(progressMetrics.weeklyStudyTime / 60)}h</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.iconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                  <Icon name="trending-up" size={24} color="#6366f1" />
                </View>
                <Text style={styles.statValue}>{Math.round(progressMetrics.completionRate * 100)}%</Text>
                <Text style={styles.statLabel}>Completion</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {currentPlan && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Today's Study Plan</Text>
              <Text style={styles.totalTime}>
                {Math.round(currentPlan.totalStudyTime / 60)} hours total
              </Text>
            </View>
            
            {currentPlan.sessions.map((session, index) => (
              <TouchableOpacity
                key={session.id}
                style={styles.sessionItem}
                onPress={() => startFocusSession(session.subject)}
              >
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionSubject}>{session.subject}</Text>
                    <Text style={styles.sessionTime}>
                      {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={styles.sessionMeta}>
                    <Text style={styles.sessionDuration}>{session.duration} min</Text>
                    <View style={[
                      styles.difficultyBadge,
                      { backgroundColor: session.difficulty === 'easy' ? '#4ade80' : 
                                        session.difficulty === 'medium' ? '#fbbf24' : '#f87171' }
                    ]}>
                      <Text style={styles.difficultyText}>{session.difficulty}</Text>
                    </View>
                  </View>
                </View>
                <ProgressBar
                  progress={0}
                  color="#6366f1"
                  style={styles.progressBar}
                />
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.regenerateButton}
              onPress={generateNewPlan}
            >
              <Icon name="auto-awesome" size={20} color="#ffffff" />
              <Text style={styles.regenerateText}>Regenerate Plan</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleStartSession('Quick Study')}>
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                <Icon name="play-arrow" size={28} color="#6366f1" />
              </View>
              <Text style={styles.actionText}>Quick Study</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/progress')}>
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Icon name="assessment" size={28} color="#10b981" />
              </View>
              <Text style={styles.actionText}>Review Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/study-plan')}>
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Icon name="schedule" size={28} color="#f59e0b" />
              </View>
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/settings')}>
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                <Icon name="lightbulb" size={28} color="#8b5cf6" />
              </View>
              <Text style={styles.actionText}>Tips</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 60,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 8,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 8,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  totalTime: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  sessionItem: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 12,
    color: '#64748b',
  },
  sessionMeta: {
    alignItems: 'flex-end',
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionDuration: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  regenerateText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#1e293b',
    marginTop: 8,
    fontWeight: '600',
  },
});

export default DashboardScreen;
