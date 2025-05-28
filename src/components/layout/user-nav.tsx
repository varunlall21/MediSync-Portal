
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { LogOut, User as UserIcon, Settings, ShieldCheck, Stethoscope, Activity } from "lucide-react";
import Link from "next/link";

export function UserNav() {
  const { user, role, logout } = useAuth();

  if (!user) {
    return null;
  }

  const getInitials = (email: string | null | undefined) => {
    if (!email) return "U";
    const nameFromMetadata = user.user_metadata?.full_name || user.user_metadata?.name;
    if (nameFromMetadata && typeof nameFromMetadata === 'string' && nameFromMetadata.length > 0) {
      const parts = nameFromMetadata.split(' ');
      if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length -1][0]).toUpperCase();
      }
      return nameFromMetadata.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };
  
  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "User";
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || "";


  const getRoleIcon = () => {
    switch(role) {
      case 'admin': return <ShieldCheck className="mr-2 h-4 w-4" />;
      case 'doctor': return <Stethoscope className="mr-2 h-4 w-4" />;
      case 'patient': return <Activity className="mr-2 h-4 w-4" />;
      default: return <UserIcon className="mr-2 h-4 w-4" />;
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-primary hover:border-accent transition-colors">
            <AvatarImage src={avatarUrl || `https://placehold.co/100x100.png?text=${getInitials(user.email)}`} alt={String(displayName)} data-ai-hint="avatar person" />
            <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{String(displayName)}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href={`/${role}/dashboard`}>
              {getRoleIcon()}
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/settings"> {/* Placeholder settings page */}
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive-foreground focus:bg-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
