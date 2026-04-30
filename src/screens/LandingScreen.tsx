import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const LandingScreen: React.FC = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const startAnimations = () => {
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();

      // Slide up animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }).start();

      // Scale animation
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    };

    startAnimations();
  }, []);

  const handleGetStarted = () => {
    router.push('/auth/signup');
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/icon.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.9)', 'rgba(139, 92, 246, 0.8)', 'rgba(59, 130, 246, 0.7)']}
          style={styles.gradient}
        />
      </ImageBackground>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoCircle}>
            <Icon name="school" size={80} color="#ffffff" />
          </View>
          
          <Text style={styles.appTitle}>Smart Study</Text>
          <Text style={styles.appSubtitle}>Momentum</Text>
          
          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>AI-Powered Study Planning</Text>
            <Text style={styles.subTagline}>Learn Smarter, Not Harder</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.featuresContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.featureRow}>
            <View style={styles.featureItem}>
              <Icon name="psychology" size={24} color="#ffffff" />
              <Text style={styles.featureText}>AI Planning</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="timer" size={24} color="#ffffff" />
              <Text style={styles.featureText}>Focus Sessions</Text>
            </View>
          </View>
          
          <View style={styles.featureRow}>
            <View style={styles.featureItem}>
              <Icon name="trending-up" size={24} color="#ffffff" />
              <Text style={styles.featureText}>Progress Tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="notifications-active" size={24} color="#ffffff" />
              <Text style={styles.featureText}>Smart Reminders</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <Icon name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginText}>I already have an account</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.footerContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.footerText}>
            Join thousands of students achieving their academic goals
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
  },
  gradient: {
    position: 'absolute',
    width: width,
    height: height,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  appTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 32,
  },
  taglineContainer: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subTagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 60,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  featureItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    padding: 16,
    borderRadius: 16,
    width: width * 0.4,
  },
  featureText: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366f1',
    marginRight: 8,
  },
  loginButton: {
    paddingVertical: 12,
  },
  loginText: {
    fontSize: 16,
    color: '#ffffff',
    textDecorationLine: 'underline',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 32,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default LandingScreen;
