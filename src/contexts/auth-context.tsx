
"use client";

import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
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

const createMockGuestUser = (): SupabaseUser => {
  const guestEmail = 'guest@example.com';
  return {
    id: 'guest-preview-user',
    email: guestEmail,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {
      email: guestEmail,
      name: 'Guest Preview',
      full_name: 'Guest Preview',
      avatar_url: '',
      picture: '',
    },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
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
  const [initialLoading, setInitialLoading] = useState(true); // Renamed for clarity
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Only run initial session check once
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      if (currentUser) {
        setUser(currentUser);
        setRole(getMockRole(currentUser.email));
      } else {
        const guestUser = createMockGuestUser();
        setUser(guestUser);
        setRole(getMockRole(guestUser.email));
      }
      setInitialLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        if (currentUser) {
          setUser(currentUser);
          setRole(getMockRole(currentUser.email));
        } else {
          const guestUser = createMockGuestUser();
          setUser(guestUser);
          setRole(getMockRole(guestUser.email));
        }
        // If initial loading was already false, no need to set it again.
        // This also helps if auth state changes rapidly after initial load.
        if (initialLoading) {
            setInitialLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [initialLoading]); // Ensure this effect only runs to set up listener and initial state check

  const login = useCallback(async (email: string, pass: string) => {
    // setLoading(true); // Handled by component using the hook if needed for UI changes
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      // onAuthStateChange will handle setUser and setRole
      return data.user;
    } catch (error: any) {
      console.error("Supabase login error:", error);
      toast({ title: "Login Failed", description: error.message || "Invalid email or password.", variant: "destructive" });
      return null;
    } finally {
      // setLoading(false);
    }
  }, [toast]);

  const signup = useCallback(async (email: string, pass: string) => {
    // setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
      });
      if (error) throw error;
      // onAuthStateChange will handle user state.
      // Supabase returns user object even if email confirmation is pending.
      if (data.user && !data.session) {
         toast({ title: "Signup Almost Complete!", description: "Please check your email to confirm your account." });
      } else if (data.user && data.session) {
         toast({ title: "Signup Successful!", description: "Welcome to MediSync." });
      }
      return data.user;
    } catch (error: any) {
      console.error("Supabase signup error:", error);
      toast({ title: "Signup Failed", description: error.message || "Could not create account.", variant: "destructive" });
      return null;
    } finally {
      // setLoading(false);
    }
  }, [toast]);

  const logout = useCallback(async () => {
    // setLoading(true);
    try {
      await supabase.auth.signOut();
      // onAuthStateChange will handle setting user to guest and updating role.
      // It will also cause initialLoading to become false if it wasn't already.
      // router.push('/login'); // Let useEffect in page.tsx or dashboard handle redirect
    } catch (error: any) {
      console.error("Supabase logout error:", error);
      toast({ title: "Logout Error", description: error.message || "Failed to logout.", variant: "destructive" });
    } finally {
      // setLoading(false);
    }
  }, [toast]); // router removed from deps

  const signInWithGoogle = useCallback(async () => {
    // setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin + '/auth/callback' : undefined,
        },
      });
      if (error) throw error;
      // Redirect happens, onAuthStateChange will handle the rest
    } catch (error: any) {
      console.error("Supabase Google sign-in error:", error.message);
      toast({ title: "Google Sign-In Failed", description: error.message || "Could not sign in with Google.", variant: "destructive" });
      // setLoading(false); // Only set loading false on error, redirect takes over
    }
  }, [toast]);

  const assignRole = useCallback((newRole: UserRole) => {
    setRole(newRole);
    if (user && user.id === 'guest-preview-user') {
      console.warn("Assigning role to guest user. This is for UI demo only.");
    }
  }, [user]); // user is a dependency

  const sendPasswordReset = useCallback(async (email: string) => {
    // setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? window.location.origin + '/update-password' : undefined,
      });
      if (error) throw error;
      toast({ title: "Password Reset Email Sent", description: "If an account exists for this email, a password reset link has been sent." });
    } catch (error: any) {
      console.error("Supabase password reset error:", error);
      toast({ title: "Password Reset Failed", description: error.message || "Could not send reset email.", variant: "destructive" });
      // No re-throw, let toast handle user feedback
    } finally {
      // setLoading(false);
    }
  }, [toast]);

  const contextValue = { 
    user, 
    session, 
    role, 
    loading: initialLoading, // Use initialLoading for the exposed loading state
    login, 
    signup, 
    logout, 
    signInWithGoogle, 
    assignRole, 
    sendPasswordReset 
  };

  return (
    <AuthContext.Provider value={contextValue}>
      <div>{/* Explicit div wrapper for children */}
        {children}
      </div>
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
