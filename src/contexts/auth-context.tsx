
"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { useRouter } from 'next/navigation';

export type UserRole = 'admin' | 'doctor' | 'patient' | null;

interface AuthContextType {
  user: FirebaseUser | null;
  role: UserRole;
  loading: boolean;
  login: (email: string, pass: string) => Promise<FirebaseUser | null>;
  signup: (email: string, pass: string) => Promise<FirebaseUser | null>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<FirebaseUser | null>;
  assignRole: (newRole: UserRole) => void; // For demo purposes
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock function to get role. In a real app, this would come from Firebase custom claims or a DB.
const getMockRole = (email?: string | null): UserRole => {
  if (!email) return null;
  if (email.includes('admin')) return 'admin';
  if (email.includes('doctor')) return 'doctor';
  if (email.includes('patient')) return 'patient';
  return 'patient'; // Default role for demo
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Simulate fetching role after user logs in
        const userRole = getMockRole(firebaseUser.email);
        setRole(userRole); 
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const userRole = getMockRole(userCredential.user.email);
      setRole(userRole);
      setUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      // Assign a default role upon signup, e.g., 'patient'
      // In a real app, role assignment might be a separate admin step or based on signup flow
      const userRole = getMockRole(userCredential.user.email); // Or just default to 'patient'
      setRole(userRole);
      setUser(userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Signup error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userRole = getMockRole(result.user.email);
      setRole(userRole);
      setUser(result.user);
      return result.user;
    } catch (error) {
      console.error("Google sign-in error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const assignRole = (newRole: UserRole) => {
    // This is a mock function for demo UI. In a real app, this would update Firebase custom claims or a database.
    setRole(newRole);
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset error:", error);
      throw error; // Re-throw to handle in UI
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, signup, logout, signInWithGoogle, assignRole, sendPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
