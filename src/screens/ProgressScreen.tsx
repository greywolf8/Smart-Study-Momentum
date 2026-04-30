import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ProgressMetrics, StudySession } from '../types';
import { StorageService } from '../services/StorageService';

const { width: screenWidth } = Dimensions.get('window');

const ProgressScreen: React.FC = () => {
  const router = useRouter();
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetrics | null>(null);
  const [studyHistory, setStudyHistory] = useState<StudySession[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const metrics = await StorageService.calculateProgressMetrics();
      const history = await StorageService.getStudyHistory();
      
      setProgressMetrics(metrics);
      setStudyHistory(history);
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const getChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en', { weekday: 'short' });
    });

    const dailyStudyTime = last7Days.map((_, index) => {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - (6 - index));
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const daySessions = studyHistory.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= dayStart && sessionDate <= dayEnd;
      });

      return daySessions.reduce((total, session) => total + session.duration, 0);
    });

    return {
      labels: last7Days,
      datasets: [{
        data: dailyStudyTime,
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        strokeWidth: 2,
      }]
    };
  };

  const getSubjectDistribution = () => {
    const subjectTotals: Record<string, number> = {};
    
    studyHistory.forEach(session => {
      if (!subjectTotals[session.subject]) {
        subjectTotals[session.subject] = 0;
      }
      subjectTotals[session.subject] += session.duration;
    });

    const subjects = Object.keys(subjectTotals);
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    
    return subjects.map((subject, index) => ({
      name: subject,
      population: subjectTotals[subject],
      color: colors[index % colors.length],
      legendFontColor: '#1e293b',
      legendFontSize: 12,
    }));
  };

  const getDifficultyBreakdown = () => {
    const difficulties = { easy: 0, medium: 0, hard: 0 };
    
    studyHistory.forEach(session => {
      difficulties[session.difficulty]++;
    });

    const total = difficulties.easy + difficulties.medium + difficulties.hard;
    
    return {
      labels: ['Easy', 'Medium', 'Hard'],
      datasets: [{
        data: [
          (difficulties.easy / total) * 100 || 0,
          (difficulties.medium / total) * 100 || 0,
          (difficulties.hard / total) * 100 || 0,
        ],
      }]
    };
  };

  const getInsights = () => {
    const insights = [];
    
    if (progressMetrics?.streakDays && progressMetrics.streakDays > 7) {
      insights.push({
        icon: 'local-fire-department',
        color: '#ef4444',
        text: `Amazing! ${progressMetrics.streakDays} day streak!`
      });
    }
    
    if (progressMetrics?.productivityTrend && progressMetrics.productivityTrend.length > 1) {
      const trend = progressMetrics.productivityTrend[progressMetrics.productivityTrend.length - 1] - 
                   progressMetrics.productivityTrend[0];
      if (trend > 0.1) {
        insights.push({
          icon: 'trending-up',
          color: '#10b981',
          text: 'Your productivity is improving!'
        });
      }
    }
    
    const avgSession = studyHistory.reduce((sum, s) => sum + s.duration, 0) / (studyHistory.length || 1);
    if (avgSession > 45) {
      insights.push({
        icon: 'psychology',
        color: '#8b5cf6',
        text: 'Great focus sessions! Average over 45 minutes'
      });
    }
    
    return insights;
  };

  const chartConfig = {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    backgroundGradientFrom: 'rgba(139, 92, 246, 0.1)',
    backgroundGradientTo: 'rgba(139, 92, 246, 0.1)',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#6366f1',
    },
  };

  if (!progressMetrics) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#6366f1', '#8b5cf6', '#3b82f6']}
          style={styles.gradient}
        />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Icon name="assessment" size={40} color="#ffffff" />
            </View>
            <Text style={styles.title}>Progress Analytics</Text>
            <Text style={styles.subtitle}>Track your learning journey</Text>
          </View>
          
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.noDataText}>No progress data yet. Start studying to see your analytics!</Text>
              <TouchableOpacity style={styles.startButton} onPress={() => router.push('/(tabs)/focus')}>
                <Icon name="play-arrow" size={20} color="#ffffff" />
                <Text style={styles.startButtonText}>Start First Session</Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="assessment" size={40} color="#ffffff" />
          </View>
          <Text style={styles.title}>Progress Analytics</Text>
          <Text style={styles.subtitle}>Your learning journey insights</Text>
        </View>

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
                <Icon name="check-circle" size={24} color="#6366f1" />
              </View>
              <Text style={styles.statValue}>{Math.round(progressMetrics.completionRate * 100)}%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Daily Study Time (Last 7 Days)</Text>
          <LineChart
            data={getChartData()}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {getSubjectDistribution().length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Subject Distribution</Text>
            <PieChart
              data={getSubjectDistribution()}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Difficulty Balance</Text>
          <BarChart
            data={getDifficultyBreakdown()}
            width={screenWidth - 64}
            height={220}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
            }}
            style={styles.chart}
          />
        </Card.Content>
      </Card>

      {getInsights().length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Insights</Text>
            {getInsights().map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <Icon name={insight.icon} size={20} color={insight.color} />
                <Text style={styles.insightText}>{insight.text}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Subject Progress</Text>
          {Object.entries(progressMetrics.subjectProgress).map(([subject, progress]) => (
            <View key={subject} style={styles.progressItem}>
              <Text style={styles.progressSubject}>{subject}</Text>
              <Text style={styles.progressValue}>{Math.round(progress * 100)}%</Text>
            </View>
          ))}
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#1e293b',
    marginLeft: 12,
    flex: 1,
  },
  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  progressSubject: {
    fontSize: 14,
    color: '#1e293b',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  noDataText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProgressScreen;
