import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (userToken && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, accept any valid email/password
      if (email && password.length >= 6) {
        const userData: User = {
          id: Date.now().toString(),
          name: email.split('@')[0],
          email: email,
        };
        
        await AsyncStorage.setItem('userToken', 'demo-token');
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, accept any valid data
      if (name && email && password.length >= 6) {
        const userData: User = {
          id: Date.now().toString(),
          name: name,
          email: email,
        };
        
        await AsyncStorage.setItem('userToken', 'demo-token');
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        setUser(userData);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Starting logout process');
      console.log('AuthContext: Current user state:', user);
      
      // Clear AsyncStorage first
      console.log('AuthContext: Removing userToken from AsyncStorage');
      await AsyncStorage.removeItem('userToken');
      
      console.log('AuthContext: Removing userData from AsyncStorage');
      await AsyncStorage.removeItem('userData');
      
      // Update state to trigger navigation
      console.log('AuthContext: Setting user to null');
      setUser(null);
      
      console.log('AuthContext: Logout process completed');
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      // Even if there's an error, try to clear the user state
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
