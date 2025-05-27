
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function HomePage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user && role) { // If user is logged in and role is determined
        let targetDashboard = '/login'; // Default to login if role is unexpected or null
        switch (role) {
          case 'admin':
            targetDashboard = '/admin/dashboard';
            break;
          case 'doctor':
            targetDashboard = '/doctor/dashboard';
            break;
          case 'patient':
            targetDashboard = '/patient/dashboard';
            break;
        }
        router.replace(targetDashboard);
      }
      // If !user (and !loading), the page will render the Login/Signup options below.
      // No automatic redirect to /login for unauthenticated users from this useEffect.
    }
  }, [user, role, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
        <Logo className="mb-8 text-3xl" />
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 mt-4 text-lg">Loading MediSync Portal...</p>
      </div>
    );
  }

  // If not loading and user is NOT authenticated, show login/signup options.
  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <Logo className="mb-12 text-4xl" />
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">Welcome to MediSync Portal</h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-xl">
          Manage your healthcare journey with ease. Book appointments, view medical history, and connect with your doctors seamlessly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="px-8 py-6 text-lg w-full sm:w-auto">
            <Link href="/login">
              <LogIn className="mr-2 h-5 w-5" /> Login
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg w-full sm:w-auto">
            <Link href="/signup">
              <UserPlus className="mr-2 h-5 w-5" /> Sign Up
            </Link>
          </Button>
        </div>
        <p className="mt-12 text-sm text-muted-foreground max-w-md">
          If you are an admin or a doctor, please use the credentials provided to you for login. New patients can sign up.
        </p>
      </div>
    );
  }

  // Fallback for authenticated users while waiting for useEffect to redirect
  // This state should be very brief.
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
      <Logo className="mb-8 text-3xl" />
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 mt-4 text-lg">Finalizing your session...</p>
    </div>
  );
}
