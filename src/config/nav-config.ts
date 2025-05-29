
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Users, Stethoscope, CalendarDays, ClipboardList, UserPlus, Settings, BriefcaseMedical, ShieldAlert, BookHeart } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  external?: boolean;
  items?: NavItem[]; // For sub-menus
}

export const navConfig: Record<string, NavItem[]> = {
  admin: [
    { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Manage Users', href: '/admin/users', icon: Users },
    { title: 'Manage Doctors', href: '/admin/doctors', icon: Stethoscope },
    { title: 'Appointments', href: '/admin/appointments', icon: CalendarDays },
    { title: 'Medical Records', href: '/admin/medical-history', icon: ClipboardList },
    { title: 'System Settings', href: '/settings', icon: Settings },
  ],
  doctor: [
    { title: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
    { title: 'My Schedule', href: '/doctor/schedule', icon: CalendarDays },
    { title: 'My Patients', href: '/doctor/patients', icon: Users },
    { title: 'Appointment Requests', href: '/doctor/appointments', icon: ShieldAlert },
    { title: 'Profile Settings', href: '/settings', icon: Settings },
  ],
  patient: [
    { title: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
    { title: 'Find Doctors', href: '/patient/doctors', icon: BriefcaseMedical },
    { title: 'Book Appointment', href: '/patient/book-appointment', icon: UserPlus },
    { title: 'My Appointments', href: '/patient/appointments', icon: CalendarDays },
    { title: 'My Medical History', href: '/patient/medical-history', icon: BookHeart },
    { title: 'Profile Settings', href: '/settings', icon: Settings },
  ],
};
