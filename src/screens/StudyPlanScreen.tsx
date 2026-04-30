import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Card, Button, Chip, FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { StudyPlan, StudySession } from '../types';
import { AIStudyPlanner } from '../services/AIStudyPlanner';
import { StorageService } from '../services/StorageService';

const { width, height } = Dimensions.get('window');

const StudyPlanScreen: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<StudyPlan | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [availableTime, setAvailableTime] = useState(240);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [aiPlanner] = useState(() => new AIStudyPlanner());
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plan, loadedSubjects] = await Promise.all([
        StorageService.getCurrentPlan(),
        StorageService.getSubjects()
      ]);
      setCurrentPlan(plan);
      setSubjects(loadedSubjects);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const generatePlan = async () => {
    try {
      const plan = await aiPlanner.generateDailyPlan(subjects, availableTime, []);
      await StorageService.saveCurrentPlan(plan);
      setCurrentPlan(plan);
      Alert.alert('Success', 'New study plan generated successfully!');
    } catch (error) {
      console.error('Error generating plan:', error);
      Alert.alert('Error', 'Failed to generate study plan');
    }
  };

  const addSubject = async () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      const updatedSubjects = [...subjects, newSubject.trim()];
      setSubjects(updatedSubjects);
      setNewSubject('');
      await StorageService.saveSubjects(updatedSubjects);
    }
  };

  const removeSubject = async (subject: string) => {
    if (subjects.length > 1) {
      const updatedSubjects = subjects.filter(s => s !== subject);
      setSubjects(updatedSubjects);
      await StorageService.saveSubjects(updatedSubjects);
    }
  };

  const updateSessionTime = (sessionId: string, newTime: Date) => {
    if (!currentPlan) return;
    
    const updatedPlan = {
      ...currentPlan,
      sessions: currentPlan.sessions.map(session =>
        session.id === sessionId
          ? { ...session, startTime: newTime, endTime: new Date(newTime.getTime() + session.duration * 60000) }
          : session
      )
    };
    
    setCurrentPlan(updatedPlan);
    StorageService.saveCurrentPlan(updatedPlan);
  };

  const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return '#4ade80';
      case 'medium': return '#fbbf24';
      case 'hard': return '#f87171';
      default: return '#64748b';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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
            <Icon name="schedule" size={40} color="#ffffff" />
          </View>
          <Text style={styles.title}>Study Plan</Text>
          <Text style={styles.subtitle}>AI-powered daily study schedule</Text>
        </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Plan Configuration</Text>
          
          <View style={styles.inputSection}>
            <Text style={styles.label}>Available Study Time (minutes)</Text>
            <TouchableOpacity
              style={styles.timeInput}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timeText}>{formatTime(availableTime)}</Text>
              <Icon name="schedule" size={20} color="#6366f1" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Subjects</Text>
            <View style={styles.subjectInput}>
              <TextInput
                style={styles.textInput}
                value={newSubject}
                onChangeText={setNewSubject}
                placeholder="Add a subject"
                onSubmitEditing={addSubject}
              />
              <TouchableOpacity style={styles.addButton} onPress={addSubject}>
                <Icon name="add" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.subjectsList}>
              {subjects.map(subject => (
                <Chip
                  key={subject}
                  onClose={() => removeSubject(subject)}
                  style={styles.subjectChip}
                >
                  {subject}
                </Chip>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.generateButton}
            onPress={generatePlan}
          >
            <Icon name="auto-awesome" size={20} color="#ffffff" />
            <Text style={styles.generateButtonText}>Generate AI Plan</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {currentPlan && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <Text style={styles.planSummary}>
              {currentPlan.sessions.length} sessions · {formatTime(currentPlan.totalStudyTime)} total
            </Text>
            
            {currentPlan.sessions.map((session, index) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionSubject}>{session.subject}</Text>
                    <Text style={styles.sessionTime}>
                      {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.sessionDetails}>
                  <View style={styles.focusIndicator}>
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                      <Icon name="psychology" size={16} color="#6366f1" />
                    </View>
                    <Text style={styles.focusText}>Focus Level: {session.focusLevel}/10</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setEditingSession(session)}
                  >
                    <Icon name="edit" size={16} color="#64748b" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            <View style={styles.balanceSection}>
              <Text style={styles.balanceTitle}>Difficulty Balance</Text>
              <View style={styles.balanceBars}>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceLabel}>Easy</Text>
                  <View style={styles.balanceBar}>
                    <View 
                      style={[
                        styles.balanceFill, 
                        { backgroundColor: '#4ade80', width: `${(currentPlan.difficultyBalance.easy / currentPlan.sessions.length) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceLabel}>Medium</Text>
                  <View style={styles.balanceBar}>
                    <View 
                      style={[
                        styles.balanceFill, 
                        { backgroundColor: '#fbbf24', width: `${(currentPlan.difficultyBalance.medium / currentPlan.sessions.length) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
                <View style={styles.balanceItem}>
                  <Text style={styles.balanceLabel}>Hard</Text>
                  <View style={styles.balanceBar}>
                    <View 
                      style={[
                        styles.balanceFill, 
                        { backgroundColor: '#f87171', width: `${(currentPlan.difficultyBalance.hard / currentPlan.sessions.length) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {showTimePicker && (
        <DateTimePicker
          value={new Date(0, 0, 0, 0, availableTime)}
          mode="time"
          display="default"
          onChange={(event, selectedDate) => {
            setShowTimePicker(false);
            if (selectedDate) {
              const minutes = selectedDate.getHours() * 60 + selectedDate.getMinutes();
              setAvailableTime(minutes);
            }
          }}
        />
      )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  timeInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  timeText: {
    fontSize: 16,
    color: '#1e293b',
  },
  subjectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#6366f1',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectChip: {
    backgroundColor: '#e0e7ff',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  planSummary: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  sessionCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
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
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  sessionDuration: {
    fontSize: 12,
    color: '#64748b',
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  focusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  focusText: {
    fontSize: 12,
    color: '#64748b',
  },
  editButton: {
    padding: 4,
  },
  balanceSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  balanceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  balanceBars: {
    gap: 8,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#64748b',
    width: 60,
  },
  balanceBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  balanceFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default StudyPlanScreen;
