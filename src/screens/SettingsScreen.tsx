import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { Card, Button, List } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Integration } from '../types';
import { StorageService } from '../services/StorageService';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [autoGeneratePlans, setAutoGeneratePlans] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: 'google_calendar', type: 'google_calendar', isConnected: false, lastSync: new Date(), data: {} },
    { id: 'github', type: 'github', isConnected: false, lastSync: new Date(), data: {} },
    { id: 'canvas', type: 'canvas', isConnected: false, lastSync: new Date(), data: {} },
  ]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const notificationSetting = await StorageService.getSetting('notifications');
      const autoPlanSetting = await StorageService.getSetting('autoGeneratePlans');
      const darkModeSetting = await StorageService.getSetting('darkMode');
      
      setNotifications(notificationSetting !== false);
      setAutoGeneratePlans(autoPlanSetting !== false);
      setDarkMode(darkModeSetting === true);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    try {
      await StorageService.saveSetting(key, value);
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotifications(value);
    await saveSetting('notifications', value);
  };

  const handleAutoPlanToggle = async (value: boolean) => {
    setAutoGeneratePlans(value);
    await saveSetting('autoGeneratePlans', value);
  };

  const handleDarkModeToggle = async (value: boolean) => {
    setDarkMode(value);
    await saveSetting('darkMode', value);
  };

  const handleIntegrationToggle = (integrationId: string) => {
    Alert.alert(
      'Connect Integration',
      `Connect to ${integrationId.replace('_', ' ').toUpperCase()} to sync your data?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Connect', 
          onPress: () => {
            setIntegrations(prev => 
              prev.map(integration => 
                integration.id === integrationId 
                  ? { ...integration, isConnected: true, lastSync: new Date() }
                  : integration
              )
            );
          }
        },
      ]
    );
  };

  const handleDisconnectIntegration = (integrationId: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, isConnected: false }
          : integration
      )
    );
  };

  const handleLogout = () => {
    console.log('Logout button pressed');
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            console.log('Logout confirmed');
            try {
              console.log('Calling logout function...');
              await logout();
              console.log('Logout function completed - AuthWrapper will handle navigation');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        },
      ]
    );
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your study history, settings, and progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Everything', 
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              Alert.alert('Success', 'All data has been cleared. The app will restart with default settings.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          }
        },
      ]
    );
  };

  const exportData = () => {
    Alert.alert(
      'Export Data',
      'Your study data will be exported and saved to your device.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export', 
          onPress: () => {
            // Implementation for data export
            Alert.alert('Success', 'Data exported successfully!');
          }
        },
      ]
    );
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'google_calendar': return 'calendar-today';
      case 'github': return 'code';
      case 'canvas': return 'school';
      default: return 'extension';
    }
  };

  const getIntegrationName = (type: string) => {
    switch (type) {
      case 'google_calendar': return 'Google Calendar';
      case 'github': return 'GitHub';
      case 'canvas': return 'Canvas';
      default: return 'Unknown';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366f1', '#8b5cf6', '#3b82f6']}
        style={styles.gradient}
        pointerEvents="none"
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="settings" size={40} color="#ffffff" />
          </View>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your study experience</Text>
        </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="notifications" size={20} color="#6366f1" />
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#e2e8f0', true: '#c7d2fe' }}
              thumbColor={notifications ? '#6366f1' : '#64748b'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="auto-awesome" size={20} color="#10b981" />
              <Text style={styles.settingText}>Auto-generate Plans</Text>
            </View>
            <Switch
              value={autoGeneratePlans}
              onValueChange={handleAutoPlanToggle}
              trackColor={{ false: '#e2e8f0', true: '#d1fae5' }}
              thumbColor={autoGeneratePlans ? '#10b981' : '#64748b'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="dark-mode" size={20} color="#8b5cf6" />
              <Text style={styles.settingText}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#e2e8f0', true: '#e9d5ff' }}
              thumbColor={darkMode ? '#8b5cf6' : '#64748b'}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Integrations</Text>
          <Text style={styles.sectionSubtitle}>Connect your favorite tools</Text>
          
          {integrations.map(integration => (
            <View key={integration.id} style={styles.integrationItem}>
              <View style={styles.integrationLeft}>
                <Icon 
                  name={getIntegrationIcon(integration.type)} 
                  size={20} 
                  color={integration.isConnected ? '#10b981' : '#64748b'} 
                />
                <View>
                  <Text style={styles.integrationName}>
                    {getIntegrationName(integration.type)}
                  </Text>
                  <Text style={styles.integrationStatus}>
                    {integration.isConnected ? 'Connected' : 'Not connected'}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.integrationButton,
                  { backgroundColor: integration.isConnected ? '#ef4444' : '#6366f1' }
                ]}
                onPress={() => {
                  if (integration.isConnected) {
                    handleDisconnectIntegration(integration.id);
                  } else {
                    handleIntegrationToggle(integration.id);
                  }
                }}
              >
                <Text style={styles.integrationButtonText}>
                  {integration.isConnected ? 'Disconnect' : 'Connect'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Study Preferences</Text>
          
          <TouchableOpacity style={styles.preferenceItem}>
            <Icon name="schedule" size={20} color="#f59e0b" />
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceTitle}>Default Session Duration</Text>
              <Text style={styles.preferenceValue}>45 minutes</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.preferenceItem}>
            <Icon name="psychology" size={20} color="#ef4444" />
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceTitle}>Focus Difficulty</Text>
              <Text style={styles.preferenceValue}>Balanced</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.preferenceItem}>
            <Icon name="notifications-active" size={20} color="#8b5cf6" />
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceTitle}>Reminder Frequency</Text>
              <Text style={styles.preferenceValue}>Daily</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#64748b" />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.dataItem} onPress={exportData}>
            <Icon name="file-download" size={20} color="#6366f1" />
            <Text style={styles.dataText}>Export Data</Text>
            <Icon name="chevron-right" size={20} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dataItem} onPress={clearAllData}>
            <Icon name="delete-forever" size={20} color="#ef4444" />
            <Text style={[styles.dataText, styles.dangerText]}>Clear All Data</Text>
            <Icon name="chevron-right" size={20} color="#64748b" />
          </TouchableOpacity>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>User Profile</Text>
          
          <View style={styles.profileItem}>
            <Icon name="account" size={24} color="#6366f1" />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'Student'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'student@example.com'}</Text>
            </View>
          </View>
          
          <Button 
            mode="outlined"
            onPress={handleLogout}
            style={{ marginTop: 8, borderColor: '#ef4444' }}
            textColor="#ef4444"
            icon="logout"
          >
            Sign Out
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
          
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Build</Text>
            <Text style={styles.aboutValue}>Expo SDK 50</Text>
          </View>
          
          <TouchableOpacity style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Privacy Policy</Text>
            <Icon name="chevron-right" size={20} color="#64748b" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>Terms of Service</Text>
            <Icon name="chevron-right" size={20} color="#64748b" />
          </TouchableOpacity>
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
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
    fontWeight: '500',
  },
  integrationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  integrationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  integrationName: {
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
    fontWeight: '500',
  },
  integrationStatus: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 12,
  },
  integrationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  integrationButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  preferenceContent: {
    flex: 1,
    marginLeft: 12,
  },
  preferenceTitle: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  preferenceValue: {
    fontSize: 14,
    color: '#64748b',
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dataText: {
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  dangerText: {
    color: '#ef4444',
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  aboutLabel: {
    fontSize: 16,
    color: '#1e293b',
  },
  aboutValue: {
    fontSize: 14,
    color: '#64748b',
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default SettingsScreen;
