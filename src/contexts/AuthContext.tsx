import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { ref, set, get } from 'firebase/database';
import { database } from '../config/firebase';

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userRef = ref(database, `users/${firebaseUser.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUser({
              id: firebaseUser.uid,
              name: userData.name || firebaseUser.displayName || '',
              email: firebaseUser.email || '',
            });
          } else {
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userRef = ref(database, `users/${firebaseUser.uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setUser({
          id: firebaseUser.uid,
          name: userData.name || firebaseUser.displayName || '',
          email: firebaseUser.email || '',
        });
      } else {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
        });
      }
      
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      const errorCode = error.code;
      let errorMessage = 'Login failed. Please try again.';
      
      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (errorCode === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      await updateProfile(firebaseUser, { displayName: name });
      
      const userRef = ref(database, `users/${firebaseUser.uid}`);
      await set(userRef, {
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
      });
      
      setUser({
        id: firebaseUser.uid,
        name: name,
        email: email,
      });
      
      return true;
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorCode = error.code;
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (errorCode === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (errorCode === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (errorCode === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
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
