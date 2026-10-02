import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsDemoUser: (role?: 'customer' | 'merchant') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Synchronize user profile in Firestore
  const syncUserProfile = async (user: User, role: 'customer' | 'merchant' | 'admin' = 'customer', customName?: string) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        setUserProfile(data);
      } else {
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || 'customer@novacart.internal',
          displayName: customName || user.displayName || user.email?.split('@')[0] || 'Member',
          role: user.email === 'kosuruavinay@gmail.com' ? 'admin' : role,
          createdAt: new Date().toISOString(),
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.warn('Profile sync fallback:', err);
      // Fallback local profile if offline or restricted
      setUserProfile({
        uid: user.uid,
        email: user.email || 'customer@novacart.internal',
        displayName: customName || user.displayName || 'Member',
        role: user.email === 'kosuruavinay@gmail.com' ? 'admin' : role,
        createdAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserProfile(user);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      await syncUserProfile(cred.user);
    } catch (err: any) {
      const msg = err.code ? formatAuthError(err.code) : err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name?: string) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (name && cred.user) {
        await updateProfile(cred.user, { displayName: name });
      }
      await syncUserProfile(cred.user, 'customer', name);
    } catch (err: any) {
      const msg = err.code ? formatAuthError(err.code) : err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await syncUserProfile(cred.user);
    } catch (err: any) {
      // If popup was cancelled or blocked, surface clean error
      if (err.code !== 'auth/popup-closed-by-user') {
        const msg = err.code ? formatAuthError(err.code) : err.message;
        setError(msg);
      }
    }
  };

  // Instant demo login for evaluation purposes
  const loginAsDemoUser = async (role: 'customer' | 'merchant' = 'customer') => {
    setError(null);
    const demoEmail = role === 'merchant' ? 'merchant@novacart.design' : 'collector@novacart.design';
    const demoPassword = 'NovaPassword2026!';
    try {
      try {
        await loginWithEmail(demoEmail, demoPassword);
      } catch {
        // If not registered yet, create the demo account
        await registerWithEmail(
          demoEmail,
          demoPassword,
          role === 'merchant' ? 'Nova Operations Director' : 'Aesthetic Collector'
        );
      }
    } catch (err: any) {
      // In case network auth fails, provide synthetic demo session
      const syntheticUser = {
        uid: `demo-${role}-${Date.now()}`,
        email: demoEmail,
        displayName: role === 'merchant' ? 'Nova Director' : 'Nova Member',
      } as unknown as User;
      setCurrentUser(syntheticUser);
      setUserProfile({
        uid: syntheticUser.uid,
        email: demoEmail,
        displayName: syntheticUser.displayName || 'Nova Member',
        role,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      const msg = err.code ? formatAuthError(err.code) : err.message;
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const clearError = () => setError(null);

  const formatAuthError = (code: string): string => {
    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No user found with this email.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password credentials.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/popup-blocked':
        return 'Google sign-in popup was blocked by your browser. Please allow popups.';
      default:
        return 'Authentication failed. Please verify credentials and try again.';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        error,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginAsDemoUser,
        resetPassword,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
