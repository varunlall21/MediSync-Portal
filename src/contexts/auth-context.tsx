
"use client";

import type { User as SupabaseUser, Session, AuthError, Provider } from '@supabase/supabase-js';
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
  if (email.toLowerCase().includes('admin')) return 'admin';
  if (email.toLowerCase().includes('doctor')) return 'doctor';
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
          
          // Only set initialLoading to false here if it was true,
          // to prevent quick flashes if fetchInitialSession was faster.
          if (initialLoading && _event !== 'INITIAL_SESSION') { 
            setInitialLoading(false);
          } else if (_event === 'SIGNED_OUT' || (_event === 'USER_DELETED' && !currentSession)) {
            setInitialLoading(false); // Ensure loading is false on explicit sign out
          }
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [initialLoading]); // Keep initialLoading to ensure it runs if state changes early

  const login = useCallback(async (email: string, pass: string): Promise<SupabaseUser | null> => {
    setInitialLoading(true); // Indicate loading state
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      // onAuthStateChange will handle setting user, session, role, and initialLoading to false
      return data.user;
    } catch (error: any) {
      console.error("Supabase login error:", error);
      let description = error.message || "Invalid email or password.";
      const lowerErrorMessage = error.message?.toLowerCase() || "";

      if (lowerErrorMessage.includes("invalid login credentials")) {
        description = "Invalid email or password. Please try again.";
      } else if (lowerErrorMessage.includes("email address") && lowerErrorMessage.includes("invalid")) {
        description = `Supabase considers the email "${email}" invalid. Please try a different email or check Supabase project settings.`;
      } else if (lowerErrorMessage.includes("email not confirmed")) {
        description = "Please confirm your email address before logging in. Check your inbox for a confirmation link."
      }
      toast({ title: "Login Failed", description, variant: "destructive" });
      setInitialLoading(false); // Ensure loading is false on error
      return null;
    }
  }, [toast]);

  const signup = useCallback(async (email: string, pass: string): Promise<SupabaseUser | null> => {
    setInitialLoading(true); // Indicate loading state
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password: pass,
        options: {
          // You can add user_metadata here if needed at signup
          // data: { full_name: 'Initial Name' } 
        }
      });
      if (error) throw error;

      // Supabase handles user state via onAuthStateChange
      // The toast can be more generic here or specific based on data.user properties
      if (data.user && !data.user.email_confirmed_at && data.session === null) {
         toast({ title: "Signup Almost Complete!", description: "Please check your email to confirm your account before logging in." });
      } else if (data.user && (data.user.email_confirmed_at || data.session)) {
         toast({ title: "Signup Successful!", description: "Welcome! You can now log in." });
      }
      setInitialLoading(false); // Ensure loading is false after processing
      return data.user;
    } catch (error: any) { 
      console.error("Supabase signup error:", error);
      let description = error.message || "Could not create account.";
      const lowerErrorMessage = error.message?.toLowerCase() || "";

      if (lowerErrorMessage.includes("user already registered")) {
        description = "This email address is already registered. Please try logging in or use a different email."
      } else if (lowerErrorMessage.includes("email address") && lowerErrorMessage.includes("invalid")) {
         description = `Supabase considers the email "${email}" invalid. Please try a different email or check Supabase project settings (e.g., email provider blocklists).`;
      } else if (lowerErrorMessage.includes("password should be at least 6 characters")) {
        description = "Password is too short. It must be at least 6 characters long.";
      }
      
      toast({ title: "Signup Failed", description, variant: "destructive" });
      setInitialLoading(false); // Ensure loading is false on error
      return null;
    } 
  }, [toast]);


  const logout = useCallback(async () => {
    setInitialLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // onAuthStateChange will set user, session, role to null and initialLoading to false.
      // toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error: any) {
      console.error("Supabase logout error:", error);
      toast({ title: "Logout Error", description: error.message || "Failed to logout.", variant: "destructive" });
      setInitialLoading(false); // Ensure loading is false on error
    }
  }, [toast]);

  const signInWithGoogle = useCallback(async () => {
    setInitialLoading(true);
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) throw error;
      // Supabase handles redirect; onAuthStateChange will update state.
      // initialLoading will be set to false by onAuthStateChange or if an error occurs here.
    } catch (error: any) {
      console.error("Supabase Google sign-in error:", error.message);
      toast({ title: "Google Sign-In Failed", description: error.message || "Could not sign in with Google. Please try again.", variant: "destructive" });
      setInitialLoading(false); // Ensure loading is false on error
    }
  }, [toast]);
  
  const assignRole = useCallback((newRole: UserRole) => {
    // This function is less relevant if role is solely derived from email via getMockRole
    // It's kept for potential future use-cases where role might be set differently.
    if (user) { 
        setRole(newRole);
    }
  }, [user]); 

  const sendPasswordReset = useCallback(async (email: string) => {
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/update-password` : undefined; // You'd need to create this page
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      toast({ title: "Password Reset Email Sent", description: "If an account exists for this email, a password reset link has been sent. Please check your inbox (and spam folder)." });
    } catch (error: any) {
      console.error("Supabase password reset error:", error);
      let description = error.message || "Could not send reset email.";
      const lowerErrorMessage = error.message?.toLowerCase() || "";
      if (lowerErrorMessage.includes("email address") && lowerErrorMessage.includes("invalid")) {
        description = `Supabase considers the email "${email}" invalid. Please try a different email or check Supabase project settings.`;
      }
      toast({ title: "Password Reset Failed", description, variant: "destructive" });
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

