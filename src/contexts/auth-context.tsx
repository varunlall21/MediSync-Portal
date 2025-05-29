
"use client";

import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
// import { useRouter } from 'next/navigation'; // No longer used directly here
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
  assignRole: (newRole: UserRole) => void; // Kept for potential UI-driven role changes in guest mode
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
    // Ensure all required fields for SupabaseUser are present
    confirmed_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    last_sign_in_at: new Date().toISOString(),
    identities: [], // Add if missing
    updated_at: new Date().toISOString(), // Add if missing
  } as SupabaseUser; // Type assertion
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  // const router = useRouter(); // Not directly used for navigation here
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const fetchInitialSession = async () => {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching initial session:", error);
        // Potentially handle error, e.g. by setting loading to false with guest user
      }
      if (isMounted) {
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
      }
    };

    fetchInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (isMounted) {
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
          if (initialLoading) { // Only change initialLoading if it was true
            setInitialLoading(false);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [initialLoading]); // Dependency on initialLoading ensures this runs until initial load is complete

  const login = useCallback(async (email: string, pass: string): Promise<SupabaseUser | null> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      // onAuthStateChange will handle setUser and setRole
      return data.user;
    } catch (error: any) {
      console.error("Supabase login error:", error);
      toast({ title: "Login Failed", description: error.message || "Invalid email or password.", variant: "destructive" });
      return null;
    }
  }, [toast]);

  const signup = useCallback(async (email: string, pass: string): Promise<SupabaseUser | null> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
      });
      if (error) throw error;
      if (data.user && !data.session && data.user.identities && data.user.identities.length > 0 && !data.user.email_confirmed_at) {
         toast({ title: "Signup Almost Complete!", description: "Please check your email to confirm your account." });
      } else if (data.user && data.session) {
         toast({ title: "Signup Successful!", description: "Welcome to MediSync." });
      }
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
      // onAuthStateChange handles setting user to guest and role.
      // Navigation is handled by page useEffects based on auth state.
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
          redirectTo: typeof window !== 'undefined' ? window.location.origin + '/auth/callback' : undefined, // Ensure this callback route exists or is handled
        },
      });
      if (error) throw error;
      // Supabase handles redirection. onAuthStateChange will manage user state upon return.
    } catch (error: any) {
      console.error("Supabase Google sign-in error:", error.message);
      toast({ title: "Google Sign-In Failed", description: error.message || "Could not sign in with Google.", variant: "destructive" });
    }
  }, [toast]);

  // This function is mostly for UI demonstrations if a guest user needs to "change role" locally.
  // Real role changes for authenticated users would be managed via backend/Supabase.
  const assignRole = useCallback((newRole: UserRole) => {
    setRole(newRole);
    if (user && user.id === 'guest-preview-user') {
      console.warn("Assigning role to guest user. This is for UI demo only.");
    }
  }, [user]);

  const sendPasswordReset = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? window.location.origin + '/update-password' : undefined, // Ensure this route exists
      });
      if (error) throw error;
      toast({ title: "Password Reset Email Sent", description: "If an account exists for this email, a password reset link has been sent." });
    } catch (error: any) {
      console.error("Supabase password reset error:", error);
      toast({ title: "Password Reset Failed", description: error.message || "Could not send reset email.", variant: "destructive" });
    }
  }, [toast]);

  const contextValue: AuthContextType = { 
    user, 
    session, 
    role, 
    loading: initialLoading, 
    login, 
    signup, 
    logout, 
    signInWithGoogle, 
    assignRole, 
    sendPasswordReset 
  };

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
