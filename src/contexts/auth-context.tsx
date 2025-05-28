
"use client";

import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export type UserRole = 'admin' | 'doctor' | 'patient' | null;

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  login: (email: string, pass: string) => Promise<SupabaseUser | null>;
  signup: (email: string, pass: string) => Promise<SupabaseUser | null>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>; // Google Sign-In now initiates redirect, doesn't return user directly
  assignRole: (newRole: UserRole) => void; // For demo purposes
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock function to get role. In a real app, this would come from Supabase user metadata or a DB.
const getMockRole = (email?: string | null): UserRole => {
  if (!email) return null;
  if (email.includes('admin')) return 'admin';
  if (email.includes('doctor')) return 'doctor';
  return 'patient';
};

// Helper to create a mock Supabase user for guest mode
const createMockGuestUser = (): SupabaseUser => {
  const guestEmail = 'guest@example.com';
  return {
    id: 'guest-preview-user',
    email: guestEmail,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {
      email: guestEmail,
      name: 'Guest Preview',
      // Ensure common fields used by UserNav are present, even if empty
      full_name: 'Guest Preview',
      avatar_url: '',
      picture: '',
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    // Add other fields required by Supabase User type with default/mock values
    confirmed_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    last_sign_in_at: new Date().toISOString(),
    identities: [],
    updated_at: new Date().toISOString(),
  };
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      if (currentUser) {
        setUser(currentUser);
        setRole(getMockRole(currentUser.email));
      } else {
        // Activate guest mode
        const guestUser = createMockGuestUser();
        setUser(guestUser);
        setRole(getMockRole(guestUser.email));
      }
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        if (currentUser) {
          setUser(currentUser);
          setRole(getMockRole(currentUser.email));
        } else {
          // Activate guest mode on logout or no session
          const guestUser = createMockGuestUser();
          setUser(guestUser);
          setRole(getMockRole(guestUser.email));
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        setRole(getMockRole(data.user.email));
        return data.user;
      }
      return null;
    } catch (error) {
      console.error("Supabase login error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          // data: { full_name: 'New User' }
        }
      });
      if (error) throw error;
      if (data.user) {
         if (data.session) {
            setUser(data.user);
            setRole(getMockRole(data.user.email));
            return data.user;
         }
         return data.user;
      }
      return null;
    } catch (error) {
      console.error("Supabase signup error:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Supabase logout error:", error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin + '/auth/callback' : undefined,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Supabase Google sign-in error:", error.message);
    }
  };

  const assignRole = (newRole: UserRole) => {
    setRole(newRole);
    if (user && user.id === 'guest-preview-user') {
      console.warn("Assigning role to guest user. This is for UI demo only.");
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? window.location.origin + '/update-password' : undefined,
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Supabase password reset error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, login, signup, logout, signInWithGoogle, assignRole, sendPasswordReset }}>
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
