
"use client"; // Required for useEffect

// import type { Metadata } from 'next'; // Removed as metadata object is removed
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from 'react'; 

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
    // Removed hardcoded className="dark". suppressHydrationWarning is helpful for theme toggling.
    <html lang="en" suppressHydrationWarning> 
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <> {/* Wrap children of AuthProvider in a Fragment */}
            {children}
            <Toaster />
          </>
        </AuthProvider>
      </body>
    </html>
  );
}
