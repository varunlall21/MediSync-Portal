import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed from GeistSans
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ // Changed from geistSans to inter
  variable: '--font-sans', // Changed CSS variable to a generic --font-sans
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MediSync Portal',
  description: 'A modern healthcare management portal.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}> {/* Use the new font variable */}
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
