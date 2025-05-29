
"use client";

import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'admin' | 'doctor' | 'patient' | null;

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  login: (email: string, pass: string) => Promise<SupabaseUser | null>;
  signup: (email: string, pass: string) => Promise<SupabaseUser | null>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  assignRole: (newRole: UserRole) => void; 
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getMockRole = (email?: string | null): UserRole => {
  if (!email) return null;
  if (email.includes('admin')) return 'admin';
  if (email.includes('doctor')) return 'doctor';
  return 'patient';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const fetchInitialSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error && isMounted) {
          console.error("Error fetching initial session:", error);
          // No guest user fallback here
          setInitialLoading(false);
          return;
        }
        if (isMounted) {
          setSession(currentSession);
          const currentUser = currentSession?.user ?? null;
          setUser(currentUser);
          setRole(currentUser ? getMockRole(currentUser.email) : null);
          setInitialLoading(false);
        }
      } catch (e) {
        console.error("Exception during initial session fetch:", e);
        if (isMounted) {
            setInitialLoading(false);
        }
      }
    };

    fetchInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (isMounted) {
          setSession(currentSession);
          const currentUser = currentSession?.user ?? null;
          setUser(currentUser);
          setRole(currentUser ? getMockRole(currentUser.email) : null);
          
          // Ensure loading is set to false after the first auth event if it wasn't already
          if (initialLoading) { 
            setInitialLoading(false);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []); // Empty dependency array to run once on mount for setup

  const login = useCallback(async (email: string, pass: string): Promise<SupabaseUser | null> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      // onAuthStateChange will handle setting user and role
      return data.user;
    } catch (error: any) {
      console.error("Supabase login error:", error);
      toast({ title: "Login Failed", description: error.message || "Invalid email or password.", variant: "destructive" });
      return null;
    }
  }, [toast]);

  const signup = useCallback(async (email: string, pass: string): Promise<SupabaseUser | null> => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password: pass });
      if (error) throw error;

      if (data.user && !data.session && data.user.identities && data.user.identities.length > 0 && !data.user.email_confirmed_at) {
         toast({ title: "Signup Almost Complete!", description: "Please check your email to confirm your account." });
      } else if (data.user && data.session) {
         toast({ title: "Signup Successful!", description: "Welcome to MediSync." });
      }
      // onAuthStateChange will handle setting user and role if signup includes session
      return data.user;
    } catch (error: any) { 
      console.error("Supabase signup error:", error);
      toast({ title: "Signup Failed", description: error.message || "Could not create account.", variant: "destructive" });
      return null;
    } 
  }, [toast]);


  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // onAuthStateChange will set user, session, and role to null
      // No need to set guest user here
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error: any) {
      console.error("Supabase logout error:", error);
      toast({ title: "Logout Error", description: error.message || "Failed to logout.", variant: "destructive" });
    }
  }, [toast]);

  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin + '/auth/callback' : undefined,
        },
      });
      if (error) throw error;
      // Supabase handles redirect and onAuthStateChange will update state
    } catch (error: any) {
      console.error("Supabase Google sign-in error:", error.message);
      toast({ title: "Google Sign-In Failed", description: error.message || "Could not sign in with Google.", variant: "destructive" });
    }
  }, [toast]);
  
  const assignRole = useCallback((newRole: UserRole) => {
    // This function might be less relevant if roles are purely derived from email
    // or managed differently in a real backend scenario.
    // For now, it directly sets the role if needed for UI logic that isn't RLS-driven.
    if (user) { // Only assign role if there is a user
        setRole(newRole);
    }
  }, [user]); 

  const sendPasswordReset = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? window.location.origin + '/update-password' : undefined,
      });
      if (error) throw error;
      toast({ title: "Password Reset Email Sent", description: "If an account exists for this email, a password reset link has been sent." });
    } catch (error: any) {
      console.error("Supabase password reset error:", error);
      toast({ title: "Password Reset Failed", description: error.message || "Could not send reset email.", variant: "destructive" });
    }
  }, [toast]);

  const contextValue: AuthContextType = useMemo(() => ({
    user,
    session,
    role,
    loading: initialLoading,
    login,
    signup,
    logout,
    signInWithGoogle,
    assignRole,
    sendPasswordReset,
  }), [user, session, role, initialLoading, login, signup, logout, signInWithGoogle, assignRole, sendPasswordReset]);

  return (
    <AuthContext.Provider value={contextValue}>
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
    
