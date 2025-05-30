
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
  const [hasAuthProviderMounted, setHasAuthProviderMounted] = useState(false); // New state for mount
  const { toast } = useToast();

  const fetchInitialSession = useCallback(async () => {
    console.log("[AuthContext] fetchInitialSession called");
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("[AuthContext] Error fetching initial session:", error);
        if (error.name === 'AuthSessionMissingError' || error.message?.includes('Auth session missing')) {
          toast({
            title: "Session Issue",
            description: "Your session could not be retrieved. Please try logging in again.",
            variant: "destructive",
          });
        }
        setSession(null);
        setUser(null);
        setRole(null);
      } else {
        console.log("[AuthContext] Initial session fetched:", currentSession ? "Session Exists" : "Session Null");
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);
        setRole(currentUser ? getMockRole(currentUser.email) : null);
      }
    } catch (e: any) {
      console.error("[AuthContext] Exception during initial session fetch (supabase.auth.getSession()):", e);
      setSession(null);
      setUser(null);
      setRole(null);
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
    } finally {
      console.log("[AuthContext] fetchInitialSession finished, setting initialLoading to false.");
      setInitialLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    setHasAuthProviderMounted(true); // Mark as mounted on client

    console.log("[AuthContext] AuthProvider mounted. Calling fetchInitialSession.");
    fetchInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        console.log("[AuthContext] onAuthStateChange event:", _event, "Current session:", currentSession ? "Exists" : "Null");
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);
        setRole(currentUser ? getMockRole(currentUser.email) : null);
        
        if (initialLoading && (_event === 'INITIAL_SESSION' || _event === 'SIGNED_IN' || _event === 'SIGNED_OUT')) {
          console.log("[AuthContext] onAuthStateChange: event '", _event, "' received, setting initialLoading to false.");
          setInitialLoading(false);
        } else if (_event === 'SIGNED_OUT') {
          console.log("[AuthContext] onAuthStateChange: SIGNED_OUT, ensuring initialLoading is false.");
          setInitialLoading(false);
        }
      }
    );

    return () => {
      console.log("[AuthContext] AuthProvider unmounting. Cleaning up listener.");
      authListener?.subscription.unsubscribe();
    };
  }, [fetchInitialSession]); // fetchInitialSession is now stable

  const login = useCallback(async (email: string, pass: string): Promise<SupabaseUser | null> => {
    setInitialLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
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
      setInitialLoading(false);
      return null;
    }
  }, [toast]);

  const signup = useCallback(async (email: string, pass: string): Promise<SupabaseUser | null> => {
    setInitialLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password: pass });
      if (error) {
        const supabaseError = error as AuthError;
        if (supabaseError.code === 'email_address_invalid' || supabaseError.message?.includes('email_address_invalid')) {
            toast({ title: "Signup Failed", description: `Supabase considers the email "${email}" invalid. This might be due to disallowed characters, a blocked domain, or other validation rules. Please try a different email.`, variant: "destructive" });
        } else {
            throw error; // Re-throw other errors
        }
        return null; // Return null on specific handled error
      }
      if (data.user && !data.user.email_confirmed_at && data.session === null) {
         toast({ title: "Signup Almost Complete!", description: "Please check your email to confirm your account before logging in." });
      } else if (data.user && (data.user.email_confirmed_at || data.session)) {
         toast({ title: "Signup Successful!", description: "Welcome! You can now log in." });
      }
      return data.user;
    } catch (error: any) { 
      console.error("Supabase signup error:", error);
      let description = error.message || "Could not create account.";
      const supabaseError = error as AuthError;
      if (supabaseError.code === 'email_address_invalid' || (supabaseError.message?.toLowerCase().includes("email address") && supabaseError.message?.toLowerCase().includes("invalid"))) {
        description = `Supabase considers the email "${email}" invalid. Please try a different email.`;
      } else if (supabaseError.message?.toLowerCase().includes("user already registered")) {
        description = "This email address is already registered. Please try logging in or use a different email."
      } else if (supabaseError.message?.toLowerCase().includes("password should be at least 6 characters")) {
        description = "Password is too short. It must be at least 6 characters long.";
      }
      toast({ title: "Signup Failed", description, variant: "destructive" });
      setInitialLoading(false);
      return null;
    } 
  }, [toast]);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        if (error.name === 'AuthSessionMissingError' || error.message?.includes('Auth session missing')) {
          console.warn("[AuthContext] Logout called but no active session found by Supabase.");
          setSession(null);
          setUser(null);
          setRole(null);
          setInitialLoading(false);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Supabase logout error:", error);
      toast({ title: "Logout Error", description: error.message || "Failed to logout.", variant: "destructive" });
      setInitialLoading(false);
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
    } catch (error: any) {
      console.error("Supabase Google sign-in error:", error.message);
      toast({ title: "Google Sign-In Failed", description: error.message || "Could not sign in with Google. Please try again.", variant: "destructive" });
      setInitialLoading(false);
    }
  }, [toast]);
  
  const assignRole = useCallback((newRole: UserRole) => {
    if (user) { 
        console.warn("[AuthContext] assignRole called. Role is currently email-derived. This function is a placeholder.", newRole);
    }
  }, [user]); 

  const sendPasswordReset = useCallback(async (email: string) => {
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/update-password` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      toast({ title: "Password Reset Email Sent", description: "If an account exists for this email, a password reset link has been sent." });
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

  if (!hasAuthProviderMounted) {
    // Render nothing on the server and on the very first client render pass
    // to avoid hydration mismatches before client-side effects run.
    return null; 
  }

  // After AuthProvider has mounted, proceed with its usual loading logic
  if (initialLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {/* You could add a simple text like "Initializing session..." here if preferred over a blank screen */}
      </div>
    );
  }

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
