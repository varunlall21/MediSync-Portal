
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Activity, Clock, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getAppointments, type Appointment } from '@/lib/appointment-service';
import { useAuth } from '@/contexts/auth-context';
import { format, isToday, parseISO } from 'date-fns';

interface DoctorDashboardStats {
  todaysAppointmentsCount: number;
  pendingRequestsCount: number;
  totalPatients: string; 
}

export default function DoctorDashboardPage() {
  const { user, loading: authLoading } = useAuth(); // Removed role as it's not directly used here for data fetching logic in this reverted state
  
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<DoctorDashboardStats>({
    todaysAppointmentsCount: 0,
    pendingRequestsCount: 0,
    totalPatients: "157", // Static as per previous plan
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseTime = useCallback((timeStr: string | undefined | null): number => {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const [timePart, modifier] = timeStr.toUpperCase().split(' ');
    if (!timePart) return 0;
    let [hours, minutes] = timePart.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return 0;

    if (modifier === 'PM' && hours < 12) hours += 12;
    else if (modifier === 'AM' && hours === 12) hours = 0; // Midnight
    return hours * 60 + minutes;
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allAppointments = await getAppointments();
      
      const today = new Date();
      const todaysApprovedAppointments = allAppointments
        .filter(appt => {
          try {
            // Check if status is 'Approved' (case-insensitive) and date is today
            return appt.status?.toLowerCase() === 'approved' && isToday(parseISO(appt.date));
          } catch (e) { 
            console.warn("[DoctorDashboard] Invalid date for appointment during 'todaysApproved' filter:", appt, e); 
            return false; 
          }
        })
        .sort((a, b) => parseTime(a.time) - parseTime(b.time)); // Sort by time
      
      setUpcomingAppointments(todaysApprovedAppointments);

      const pendingCount = allAppointments.filter(
        appt => appt.status?.toLowerCase() === 'pending'
      ).length;
      
      setStats(prevStats => ({
        ...prevStats,
        todaysAppointmentsCount: todaysApprovedAppointments.length,
        pendingRequestsCount: pendingCount,
      }));

    } catch (err: any) {
      console.error("[DoctorDashboard] Error fetching dashboard data:", err);
      setError(err.message || "Could not load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, [parseTime]); // Added parseTime to dependency array

  useEffect(() => {
     // Fetch data when auth is resolved and user exists (or for a general view if not user-dependent for this iteration)
     if (!authLoading) {
        fetchDashboardData();
     }
  }, [authLoading, user, fetchDashboardData]); // Added user to ensure re-fetch if user context changes (though data isn't personalized yet)

  const statCards = [
    { title: "Today's Approved Appointments", value: stats.todaysAppointmentsCount.toString(), icon: CalendarDays, color: "text-primary", link: "/doctor/schedule" },
    { title: "Pending Requests", value: stats.pendingRequestsCount.toString(), icon: Clock, color: "text-yellow-500 dark:text-yellow-400", link: "/doctor/appointments" },
    { title: "Total Patients Seen", value: stats.totalPatients, icon: Users, color: "text-green-500 dark:text-green-400", link: "/doctor/patients" }, 
  ];

  if (authLoading || isLoading) { 
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/10 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" /> Error Loading Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive/90">{error}</p>
          <Button onClick={fetchDashboardData} variant="outline" className="mt-4">Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Doctor's Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-xl dark:hover:shadow-primary/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
               {stat.link && (
                 <p className="text-xs text-muted-foreground pt-1">
                    <Link href={stat.link} className="hover:underline hover:text-primary">
                    View Details &rarr;
                    </Link>
                 </p>
               )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="shadow-lg hover:shadow-xl dark:hover:shadow-primary/20 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" /> Today's Approved Appointments</CardTitle>
          <CardDescription>Approved appointments scheduled for today across the system.</CardDescription>
        </CardHeader>
        <CardContent>
           {isLoading ? ( // Changed from isLoadingAppointments
             <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="ml-2">Loading appointments...</p>
            </div>
           ) : upcomingAppointments.length > 0 ? (
            <ul className="space-y-4">
              {upcomingAppointments.map((appt) => {
                const patientIdentifier = appt.patient_user_id || appt.patient_name?.toLowerCase().replace(/\s+/g, '-') || 'unknown-patient';
                return (
                  <li key={appt.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg border bg-card hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors hover:shadow-md">
                    <div>
                      <p className="font-semibold text-foreground">{appt.time} - {appt.patient_name}</p>
                      <p className="text-sm text-muted-foreground">Reason: {appt.reason || "N/A"}</p>
                      <p className="text-sm text-muted-foreground">With: Dr. {appt.doctor_name} ({appt.specialty})</p>
                    </div>
                    <div className="mt-2 sm:mt-0 flex gap-2">
                      <Button size="sm" variant="outline" className="transition-all duration-300 hover:shadow-sm active:scale-95" asChild>
                        <Link href={`/doctor/patients/${patientIdentifier}/medical-history`}>View History</Link>
                      </Button>
                      <Button size="sm" className="transition-all duration-300 hover:shadow-sm active:scale-95" disabled>Start Consult</Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground">No upcoming approved appointments scheduled for today.</p>
          )}
          <div className="mt-6 flex justify-end">
             <Button asChild className="transition-all duration-300 hover:shadow-lg active:scale-95">
                <Link href="/doctor/schedule">View Full Schedule</Link>
             </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl dark:hover:shadow-primary/20 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center"><Activity className="mr-2 h-5 w-5 text-primary" /> Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           <Button variant="outline" className="w-full justify-start text-sm py-3 px-4 group hover:border-primary hover:bg-accent/10 dark:hover:bg-accent/5 hover:text-foreground transition-all duration-300 hover:shadow-md active:scale-95" asChild>
             <Link href="/doctor/patients" className="flex items-center">
                <Users className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors"/> 
                <span className="ml-2 truncate">Manage Patients</span>
             </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start text-sm py-3 px-4 group hover:border-primary hover:bg-accent/10 dark:hover:bg-accent/5 hover:text-foreground transition-all duration-300 hover:shadow-md active:scale-95" asChild>
            <Link href="/doctor/appointments" className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 group-hover:text-primary transition-colors"/>
                <span className="ml-2 truncate">Review Pending Appointments</span>
            </Link>
          </Button>
           <Button variant="outline" className="w-full justify-start text-sm py-3 px-4 group hover:border-primary hover:bg-accent/10 dark:hover:bg-accent/5 hover:text-foreground transition-all duration-300 hover:shadow-md active:scale-95" asChild>
             <Link href="/doctor/schedule" className="flex items-center">
                <CalendarDays className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors"/>
                <span className="ml-2 truncate">View Full Schedule</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
    
