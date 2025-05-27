
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user && role) {
        switch (role) {
          case 'admin':
            router.replace('/admin/dashboard');
            break;
          case 'doctor':
            router.replace('/doctor/dashboard');
            break;
          case 'patient':
            router.replace('/patient/dashboard');
            break;
          default:
            router.replace('/login'); // Fallback if role is somehow null but user exists
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, role, loading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 text-lg text-foreground">Loading MediSync Portal...</p>
    </div>
  );
}
