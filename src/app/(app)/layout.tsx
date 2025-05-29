
"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth, type UserRole } from '@/contexts/auth-context';
import Header from '@/components/layout/header';
import { Loader2 } from 'lucide-react';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarInset,
  SidebarRail
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { navConfig, type NavItem } from '@/config/nav-config';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // If auth is resolved and there's no user, redirect to login
      router.replace('/login');
    }
    // If user exists but role is somehow null (after loading),
    // they will see the loading spinner below until role is determined.
    // Or, if they are on a page that doesn't match their role, they might get stuck
    // on the spinner if the target dashboard isn't accessible due to navConfig.
    // This part might need refinement based on how roles are fully managed.
  }, [user, loading, router]);

  if (loading || (user && !role)) { 
    // Show loading if:
    // 1. Auth context is still loading initial state.
    // 2. User object exists, but role is not yet determined (e.g., getMockRole hasn't run or returned null).
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Initializing your session...</p>
      </div>
    );
  }

  if (!user) { 
    // This case should ideally be handled by the useEffect redirecting to /login.
    // However, as a safeguard or if the redirect hasn't happened yet,
    // return null to prevent rendering the app layout for an unauthenticated user.
    return null;
  }
  
  const currentNavItems = navConfig[role as Exclude<UserRole, null>] || [];

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" variant="sidebar" side="left">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <Logo className="text-sidebar-primary group-data-[collapsible=icon]:hidden" />
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {currentNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href))}
                    tooltip={{ children: item.title, className: "bg-popover text-popover-foreground" }}
                    disabled={item.disabled}
                  >
                    <a> {/* Link needs an <a> tag as child when using asChild with SidebarMenuButton that renders a button */}
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          <Button variant="ghost" onClick={logout} className="w-full justify-start group-data-[collapsible=icon]:justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="h-4 w-4 group-data-[collapsible=icon]:mr-0 mr-2" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarRail />
      <SidebarInset>
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
