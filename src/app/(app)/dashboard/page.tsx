
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function GenericDashboardPage() {
  const { role, loading } = useAuth();
  const router = useRouter();

  
  useEffect(() => {
    if (!loading && role) {
      router.replace(`/${role}/dashboard`);
    } else if (!loading && !role) {
      // If role is somehow not set, redirect to login
      router.replace('/login');
    }
  }, [role, loading, router]);

  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2">Loading dashboard...</p>
    </div>
  );
}
