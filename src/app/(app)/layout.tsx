
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
      router.replace('/login');
    }
    // If user is logged in but role is not yet determined (or null),
    // and they are not on a generic app page, redirect them.
    // This depends on how roles are fetched. For now, if role is null, we wait.
    // Or redirect to a "role pending" page or back to login if role is critical.
  }, [user, loading, router]);

  if (loading || !role) { // Wait for role to be determined
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Initializing your session...</p>
      </div>
    );
  }

  if (!user) { // Should be caught by useEffect, but as a safeguard
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
