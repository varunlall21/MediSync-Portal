
"use client"; // Required for useEffect

import React, { useEffect, useState } from 'react'; // Ensure React, useState, useEffect are imported
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after initial mount
    setIsClient(true);

    const theme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (theme === "dark" || (!theme && systemPrefersDark)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <div> {/* This div is the single child of AuthProvider */}
            {children} {/* Children directly rendered */}
            {isClient && <Toaster key="app-toaster" />}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
