import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AuthWrapper: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('AuthWrapper: Effect triggered', { isLoading, isAuthenticated, user: !!user });
    if (!isLoading) {
      if (isAuthenticated && user) {
        // User is authenticated, redirect to dashboard
        console.log('AuthWrapper: User is authenticated, navigating to tabs');
        router.replace('/(tabs)');
      } else {
        // User is not authenticated, show landing page
        console.log('AuthWrapper: User is not authenticated, navigating to landing');
        router.replace('/landing');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#6366f1', '#8b5cf6', '#3b82f6']}
          style={styles.gradient}
        />
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Icon name="school" size={60} color="#ffffff" />
          </View>
          <Text style={styles.title}>Smart Study</Text>
          <Text style={styles.subtitle}>Momentum</Text>
          <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // This component doesn't render anything directly
  // It just handles the navigation logic
  return null;
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '300',
    color: '#ffffff',
    marginBottom: 32,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default AuthWrapper;
