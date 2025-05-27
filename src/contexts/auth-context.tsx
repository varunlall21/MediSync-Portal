
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
  // For 'guest@example.com' or any other non-admin/doctor email, default to 'patient'
  return 'patient'; 
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userRole = getMockRole(firebaseUser.email);
        setRole(userRole); 
      } else {
        // Simulate a guest user to bypass login and see stuff
        const mockGuestUser = {
          uid: 'guest-preview-user',
          email: 'guest@example.com', // This email will be used by getMockRole
          displayName: 'Guest Preview',
          photoURL: null,
          emailVerified: true,
          isAnonymous: true, // Mark as anonymous for clarity
          // --- Minimal FirebaseUser fields to satisfy the type ---
          // UserInfo part
          phoneNumber: null,
          providerId: 'guest',
          // User methods (noop for mock)
          delete: async () => { console.warn("Mock user delete called"); },
          getIdToken: async (_forceRefresh?: boolean) => "mock-guest-token",
          getIdTokenResult: async (_forceRefresh?: boolean) => ({
            token: "mock-guest-token",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            claims: {} as any,
            authTime: new Date().toISOString(),
            expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(),
            issuedAtTime: new Date().toISOString(),
            signInProvider: null,
            signInSecondFactor: null,
          }),
          reload: async () => { console.warn("Mock user reload called"); },
          toJSON: () => ({ uid: 'guest-preview-user', email: 'guest@example.com', displayName: 'Guest Preview' }),
          // User properties
          metadata: {}, // Add basic metadata if needed by other parts, e.g. creationTime, lastSignInTime
          providerData: [],
          refreshToken: 'mock-guest-refresh-token',
          tenantId: null,
        } as FirebaseUser; // Cast to FirebaseUser type

        setUser(mockGuestUser);
        setRole(getMockRole(mockGuestUser.email)); // This should assign 'patient' role
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
      const userRole = getMockRole(userCredential.user.email); 
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
      // After logout, to re-enable guest mode if desired, a page refresh might be needed
      // or we could explicitly set the guest user again here.
      // For now, push to login, standard behavior.
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
     if (user && user.email === 'guest@example.com') {
      // Potentially update the mock user's perceived role if needed, though getMockRole is static
      console.warn("Assigning role to guest user. This is for UI demo only.");
    }
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
