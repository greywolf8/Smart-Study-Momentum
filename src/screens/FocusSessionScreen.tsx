import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Card, Button, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { FocusSession, MicroTask } from '../types';
import { AIStudyPlanner } from '../services/AIStudyPlanner';
import { StorageService } from '../services/StorageService';

const { width, height } = Dimensions.get('window');

const FocusSessionScreen: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [aiPlanner] = useState(() => new AIStudyPlanner());
  
  const progressAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentSession && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          if (newTime >= currentSession.duration * 60) {
            completeSession();
            return prev;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentSession, isPaused]);

  useEffect(() => {
    if (currentSession) {
      const remaining = Math.max(0, (currentSession.duration * 60) - elapsedTime);
      setTimeRemaining(remaining);
      
      const progress = elapsedTime / (currentSession.duration * 60);
      Animated.timing(progressAnimation, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [elapsedTime, currentSession]);

  const startNewSession = (subject: string, duration: number) => {
    const session = aiPlanner.createFocusSession(subject, duration);
    setCurrentSession(session);
    setElapsedTime(0);
    setIsPaused(false);
  };

  const pauseSession = () => {
    setIsPaused(!isPaused);
  };

  const completeSession = () => {
    if (currentSession) {
      Alert.alert(
        'Session Complete!',
        `Great job! You've completed ${currentSession.duration} minutes of focused study.`,
        [
          { text: 'Start Another', onPress: () => setCurrentSession(null) },
          { text: 'View Progress', onPress: () => console.log('Navigate to progress') },
        ]
      );
      
      saveSessionData();
      setCurrentSession(null);
      setElapsedTime(0);
    }
  };

  const saveSessionData = async () => {
    if (currentSession) {
      try {
        const completedTasks = currentSession.microTasks.filter(task => task.completed);
        const studySession = {
          id: currentSession.id,
          subject: currentSession.subject,
          startTime: currentSession.startTime,
          endTime: new Date(),
          duration: currentSession.duration,
          focusLevel: calculateFocusLevel(),
          completedTasks: completedTasks.map(task => task.title),
          difficulty: getDifficultyFromTasks(currentSession.microTasks)
        };
        
        await StorageService.saveStudySession(studySession);
        aiPlanner.updateUserBehavior(studySession);
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }
  };

  const calculateFocusLevel = () => {
    if (!currentSession) return 5;
    const completionRate = currentSession.microTasks.filter(task => task.completed).length / 
                          (currentSession.microTasks.length || 1);
    return Math.round(5 + completionRate * 5);
  };

  const getDifficultyFromTasks = (tasks: MicroTask[]): 'easy' | 'medium' | 'hard' => {
    const difficulties = tasks.map(task => task.difficulty);
    const hardCount = difficulties.filter(d => d === 'hard').length;
    const mediumCount = difficulties.filter(d => d === 'medium').length;
    
    if (hardCount > mediumCount) return 'hard';
    if (mediumCount > hardCount) return 'medium';
    return 'easy';
  };

  const toggleTaskCompletion = (taskId: string) => {
    if (!currentSession) return;
    
    const updatedSession = {
      ...currentSession,
      microTasks: currentSession.microTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    };
    
    setCurrentSession(updatedSession);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMotivationalQuote = () => {
    const quotes = [
      "Focus on being productive instead of busy.",
      "The secret to getting ahead is getting started.",
      "Success is the sum of small efforts repeated day in and day out.",
      "Don't watch the clock; do what it does. Keep going.",
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  if (!currentSession) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#6366f1', '#8b5cf6', '#3b82f6']}
          style={styles.gradient}
        />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Icon name="timer" size={40} color="#ffffff" />
              </View>
              <Text style={styles.title}>Focus Session</Text>
              <Text style={styles.subtitle}>{getMotivationalQuote()}</Text>
            </View>

            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Start a New Session</Text>
                
                <View style={styles.quickStartGrid}>
                  <TouchableOpacity 
                    style={styles.quickStartButton}
                    onPress={() => startNewSession('Quick Study', 25)}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                      <Icon name="bolt" size={28} color="#6366f1" />
                    </View>
                    <Text style={styles.quickStartText}>Quick Focus</Text>
                    <Text style={styles.quickStartSubtext}>25 minutes</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.quickStartButton}
                    onPress={() => startNewSession('Deep Work', 45)}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                      <Icon name="psychology" size={28} color="#8b5cf6" />
                    </View>
                    <Text style={styles.quickStartText}>Deep Work</Text>
                    <Text style={styles.quickStartSubtext}>45 minutes</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.quickStartButton}
                    onPress={() => startNewSession('Review Session', 30)}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                      <Icon name="replay" size={28} color="#10b981" />
                    </View>
                    <Text style={styles.quickStartText}>Review</Text>
                    <Text style={styles.quickStartSubtext}>30 minutes</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.quickStartButton}
                    onPress={() => startNewSession('Practice', 60)}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                      <Icon name="fitness-center" size={28} color="#f59e0b" />
                    </View>
                    <Text style={styles.quickStartText}>Practice</Text>
                    <Text style={styles.quickStartSubtext}>60 minutes</Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Recent Sessions</Text>
                <Text style={styles.noSessionsText}>No recent sessions. Start your first focus session!</Text>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366f1', '#8b5cf6', '#3b82f6']}
        style={styles.gradient}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Icon name="timer" size={40} color="#ffffff" />
            </View>
            <Text style={styles.title}>{currentSession.subject}</Text>
            <Text style={styles.subtitle}>Stay focused and productive</Text>
          </View>

        <Card style={styles.timerCard}>
          <Card.Content>
            <View style={styles.timerDisplay}>
              <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
              <Text style={styles.sessionDuration}>{currentSession.duration} minutes</Text>
            </View>
            
            <Animated.View style={[styles.progressBarContainer, { width: progressAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }) }]} />
            
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={[styles.controlButton, styles.pauseButton]}
                onPress={pauseSession}
              >
                <Icon 
                  name={isPaused ? "play-arrow" : "pause"} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.controlButton, styles.completeButton]}
                onPress={completeSession}
              >
                <Icon name="check" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Micro Tasks</Text>
            <Text style={styles.taskProgress}>
              {currentSession.microTasks.filter(task => task.completed).length} / {currentSession.microTasks.length} completed
            </Text>
            
            {currentSession.microTasks.map((task, index) => (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskItem,
                  index === currentSession.currentTaskIndex && styles.currentTask
                ]}
                onPress={() => toggleTaskCompletion(task.id)}
              >
                <View style={styles.taskLeft}>
                  <Icon
                    name={task.completed ? "check-circle" : "radio-button-unchecked"}
                    size={20}
                    color={task.completed ? "#10b981" : "#64748b"}
                  />
                  <Text style={[
                    styles.taskText,
                    task.completed && styles.completedTaskText
                  ]}>
                    {task.title}
                  </Text>
                </View>
                <View style={styles.taskRight}>
                  <Text style={styles.taskTime}>{task.estimatedTime} min</Text>
                  <View style={[
                    styles.difficultyDot,
                    { backgroundColor: task.difficulty === 'easy' ? '#4ade80' : 
                                      task.difficulty === 'medium' ? '#fbbf24' : '#f87171' }
                  ]} />
                </View>
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
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
  timerCard: {
    margin: 16,
    elevation: 8,
    backgroundColor: '#6366f1',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  quickStartGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickStartButton: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickStartText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 8,
  },
  quickStartSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  noSessionsText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  timerDisplay: {
    alignItems: 'center',
    padding: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  sessionDuration: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  completeButton: {
    backgroundColor: '#10b981',
  },
  taskProgress: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  currentTask: {
    backgroundColor: '#e0e7ff',
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskText: {
    fontSize: 14,
    color: '#1e293b',
    marginLeft: 12,
    flex: 1,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#64748b',
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskTime: {
    fontSize: 12,
    color: '#64748b',
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default FocusSessionScreen;
