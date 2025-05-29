
"use client";

import type { User as SupabaseUser, Session, AuthError, Provider } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo, useRef } from 'react';
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
  assignRole: (newRole: UserRole) => void; // Kept for potential future use, currently role is email-derived
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This function determines role based on email.
// For production, consider Supabase Custom Claims or a roles table.
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
  const isMountedRef = useRef(false);

  const fetchInitialSession = useCallback(async () => {
    console.log("[AuthContext] fetchInitialSession called");
    try {
      // supabase.auth.getSession() should not throw AuthSessionMissingError itself.
      // It returns { data: { session: null } } if no session.
      // This error typically occurs if other auth methods are called when session is missing.
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error && isMountedRef.current) {
        console.error("[AuthContext] Error fetching initial session:", error);
        if (isMountedRef.current) {
          setSession(null);
          setUser(null);
          setRole(null);
        }
      } else if (isMountedRef.current) {
        console.log("[AuthContext] Initial session fetched:", currentSession ? "Session Exists" : "Session Null");
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);
        setRole(currentUser ? getMockRole(currentUser.email) : null);
      }
    } catch (e: any) {
      console.error("[AuthContext] Exception during initial session fetch (supabase.auth.getSession()):", e);
      if (isMountedRef.current) {
        setSession(null);
        setUser(null);
        setRole(null);
        // Handle AuthSessionMissingError specifically if it somehow occurs here
        if (e.name === 'AuthSessionMissingError' || e.message?.includes('Auth session missing')) {
          toast({
            title: "Session Issue",
            description: "Your session could not be retrieved. Please try logging in again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Initialization Error",
            description: "Could not initialize session. Please try again.",
            variant: "destructive",
          });
        }
      }
    } finally {
      if (isMountedRef.current) {
        console.log("[AuthContext] fetchInitialSession finished, setting initialLoading to false.");
        setInitialLoading(false);
      }
    }
  }, [toast]); // isMountedRef is a ref, not needed in deps

  useEffect(() => {
    isMountedRef.current = true;
    console.log("[AuthContext] Component mounted. Calling fetchInitialSession.");
    fetchInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (!isMountedRef.current) {
          console.log("[AuthContext] onAuthStateChange: component unmounted, bailing.");
          return;
        }
        console.log("[AuthContext] onAuthStateChange event:", _event, "Current session:", currentSession ? "Exists" : "Null");
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);
        setRole(currentUser ? getMockRole(currentUser.email) : null);
        
        // If initialLoading is still true when a significant auth event occurs,
        // it means this is likely part of the initial auth resolution.
        if (initialLoading && (_event === 'INITIAL_SESSION' || _event === 'SIGNED_IN' || _event === 'SIGNED_OUT')) {
          console.log("[AuthContext] onAuthStateChange: event '", _event, "' received, setting initialLoading to false.");
          setInitialLoading(false);
        } else if (_event === 'SIGNED_OUT') {
          // Ensure loading is false on explicit sign out if it wasn't already
          console.log("[AuthContext] onAuthStateChange: SIGNED_OUT, ensuring initialLoading is false.");
          setInitialLoading(false);
        }
      }
    );

    return () => {
      console.log("[AuthContext] Component unmounting. Cleaning up listener.");
      isMountedRef.current = false;
      authListener?.subscription.unsubscribe();
    };
  }, [fetchInitialSession, initialLoading]); // initialLoading added to deps for specific loading state updates

  const login = useCallback(async (email: string, pass: string): Promise<SupabaseUser | null> => {
    setInitialLoading(true); // Indicate loading during login attempt
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      // onAuthStateChange will handle setting user/session/role and initialLoading=false
      return data.user;
    } catch (error: any) {
      console.error("Supabase login error:", error);
      let description = error.message || "Invalid email or password.";
      const supabaseError = error as AuthError;

      if (supabaseError.message.toLowerCase().includes("invalid login credentials")) {
        description = "Invalid email or password. Please try again.";
      } else if (supabaseError.code === 'validation_failed' && supabaseError.message.toLowerCase().includes("should be a valid email")) {
        description = `The email address "${email}" appears to be invalid. Please check the format.`;
      } else if (supabaseError.message.toLowerCase().includes("email not confirmed")) {
        description = "Please confirm your email address before logging in. Check your inbox for a confirmation link."
      }
      toast({ title: "Login Failed", description, variant: "destructive" });
      if (isMountedRef.current) setInitialLoading(false); // Reset loading on error
      return null;
    }
  }, [toast]);

  const signup = useCallback(async (email: string, pass: string): Promise<SupabaseUser | null> => {
    setInitialLoading(true); // Indicate loading during signup attempt
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password: pass,
      });
      if (error) throw error;

      // Let onAuthStateChange handle state updates.
      // Provide feedback based on Supabase response.
      if (data.user && !data.user.email_confirmed_at && data.session === null) {
         toast({ title: "Signup Almost Complete!", description: "Please check your email to confirm your account before logging in." });
      } else if (data.user && (data.user.email_confirmed_at || data.session)) {
         toast({ title: "Signup Successful!", description: "Welcome! You can now log in." });
      }
      // initialLoading will be set to false by onAuthStateChange or fetchInitialSession's finally block
      return data.user;
    } catch (error: any) { 
      console.error("Supabase signup error:", error);
      let description = error.message || "Could not create account.";
      const supabaseError = error as AuthError;

      if (supabaseError.code === 'email_address_invalid' || (supabaseError.message?.toLowerCase().includes("email address") && supabaseError.message?.toLowerCase().includes("invalid"))) {
        description = `Supabase considers the email "${email}" invalid. This might be due to disallowed characters, a blocked domain, or other validation rules set by Supabase or your project. Please try a different email.`;
      } else if (supabaseError.message?.toLowerCase().includes("user already registered")) {
        description = "This email address is already registered. Please try logging in or use a different email."
      } else if (supabaseError.message?.toLowerCase().includes("password should be at least 6 characters")) {
        description = "Password is too short. It must be at least 6 characters long.";
      }
      
      toast({ title: "Signup Failed", description, variant: "destructive" });
      if (isMountedRef.current) setInitialLoading(false); // Reset loading on error
      return null;
    } 
  }, [toast]);

  const logout = useCallback(async () => {
    // No need to setInitialLoading(true) for logout, as onAuthStateChange will trigger
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        // Check if the error is due to a missing session, though signOut usually handles this gracefully
        if (error.name === 'AuthSessionMissingError' || error.message?.includes('Auth session missing')) {
          console.warn("[AuthContext] Logout called but no active session found by Supabase. This is usually okay.");
          // Ensure local state is cleared if onAuthStateChange doesn't fire quickly enough or if an error prevents it
          if (isMountedRef.current) {
            setSession(null);
            setUser(null);
            setRole(null);
            setInitialLoading(false); // Ensure UI updates if it was stuck
          }
        } else {
          throw error; // Re-throw other errors
        }
      }
      // onAuthStateChange will handle setting user/session to null & initialLoading to false
    } catch (error: any) {
      console.error("Supabase logout error:", error);
      toast({ title: "Logout Error", description: error.message || "Failed to logout.", variant: "destructive" });
      // If logout fails critically, ensure loading state is reset
      if (isMountedRef.current) setInitialLoading(false);
    }
  }, [toast]);

  const signInWithGoogle = useCallback(async () => {
    setInitialLoading(true); // Indicate loading
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) throw error;
      // Redirection will occur if successful. onAuthStateChange handles the rest.
    } catch (error: any) {
      console.error("Supabase Google sign-in error:", error.message);
      toast({ title: "Google Sign-In Failed", description: error.message || "Could not sign in with Google. Please try again.", variant: "destructive" });
      if (isMountedRef.current) setInitialLoading(false); // Reset loading on error
    }
  }, [toast]);
  
  const assignRole = useCallback((newRole: UserRole) => {
    // This is a mock function for now as role is derived from email.
    // If you implement more complex role management, this would update Supabase user_metadata or a roles table.
    if (user && isMountedRef.current) { 
        console.warn("[AuthContext] assignRole called. In current setup, role is email-derived. This function is a placeholder.", newRole);
        // setRole(newRole); // Forcing frontend role change if needed, but backend RLS uses email.
    }
  }, [user]); 

  const sendPasswordReset = useCallback(async (email: string) => {
    // No need to setInitialLoading(true)
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/update-password` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      toast({ title: "Password Reset Email Sent", description: "If an account exists for this email, a password reset link has been sent. Please check your inbox (and spam folder)." });
    } catch (error: any) {
      console.error("Supabase password reset error:", error);
      let description = error.message || "Could not send reset email.";
      const supabaseError = error as AuthError;
      if (supabaseError.code === 'validation_failed' && supabaseError.message.toLowerCase().includes("should be a valid email")) {
        description = `The email address "${email}" appears to be invalid. Please check the format.`;
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

    