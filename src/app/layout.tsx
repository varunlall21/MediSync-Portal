
"use client"; // Required for useEffect

import React, { useEffect } from 'react'; // Ensure React is imported for React.Fragment
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (theme === "dark" || (!theme && systemPrefersDark)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning> 
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <React.Fragment key="medisync-app-root-children"> {/* Explicit keyed fragment */}
            {children}
            <Toaster />
          </React.Fragment>
        </AuthProvider>
      </body>
    </html>
  );
}
