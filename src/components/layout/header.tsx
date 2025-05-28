
import { Logo } from '@/components/logo';
import { UserNav } from '@/components/layout/user-nav';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button"; // Added import

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" /> {/* Only show on smaller screens */}
          <Logo />
        </div>
        <div className="flex items-center gap-2"> {/* Added gap for multiple items */}
          <ThemeToggleButton /> {/* Added theme toggle button */}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
