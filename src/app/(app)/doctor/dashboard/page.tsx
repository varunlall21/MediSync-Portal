
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Activity, Clock, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getAppointments, type Appointment } from '@/lib/appointment-service';
import { useAuth } from '@/contexts/auth-context';
import { format, isToday, parseISO } from 'date-fns';

interface DoctorDashboardStats {
  todaysAppointmentsCount: number;
  pendingRequestsCount: number;
  totalPatients: string; // Keeping as string for now as it's mock
}

export default function DoctorDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<DoctorDashboardStats>({
    todaysAppointmentsCount: 0,
    pendingRequestsCount: 0,
    totalPatients: "157", // Mock, to be updated
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseTime = useCallback((timeStr: string): number => {
    const [timePart, modifier] = timeStr.toUpperCase().split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    else if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!user || authLoading) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const allAppointments = await getAppointments();
      
      // Upcoming Appointments for Today (system-wide for now)
      const today = new Date();
      const todaysApprovedAppointments = allAppointments
        .filter(appt => {
          try {
            return appt.status?.toLowerCase() === 'approved' && isToday(parseISO(appt.date));
          } catch (e) { return false; }
        })
        .sort((a, b) => parseTime(a.time) - parseTime(b.time));
      setUpcomingAppointments(todaysApprovedAppointments);

      // Stats
      const pendingCount = allAppointments.filter(appt => appt.status?.toLowerCase() === 'pending').length;
      
      setStats(prevStats => ({
        ...prevStats,
        todaysAppointmentsCount: todaysApprovedAppointments.length,
        pendingRequestsCount: pendingCount,
        // totalPatients: "..." // Implement later if needed
      }));

    } catch (err: any) {
      console.error("Error fetching doctor dashboard data:", err);
      setError(err.message || "Could not load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  }, [user, authLoading, parseTime]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [
    { title: "Today's Appointments", value: stats.todaysAppointmentsCount.toString(), icon: CalendarDays, color: "text-primary", link: "/doctor/schedule" },
    { title: "Pending Requests", value: stats.pendingRequestsCount.toString(), icon: Clock, color: "text-yellow-500 dark:text-yellow-400", link: "/doctor/appointments" },
    { title: "Total Patients", value: stats.totalPatients, icon: Users, color: "text-green-500 dark:text-green-400", link: "/doctor/patients" }, // Link to patient list
  ];

  if (isLoading || authLoading) {
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
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Doctor's Dashboard</h1>

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
          <CardDescription>Your approved appointments for today. (System-wide view for now)</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <ul className="space-y-4">
              {upcomingAppointments.map((appt) => (
                <li key={appt.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg border bg-card hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors hover:shadow-md">
                  <div>
                    <p className="font-semibold text-foreground">{appt.time} - {appt.patient_name}</p>
                    <p className="text-sm text-muted-foreground">Reason: {appt.reason || "N/A"}</p>
                    <p className="text-sm text-muted-foreground">With: Dr. {appt.doctor_name} ({appt.specialty})</p>
                  </div>
                  <div className="mt-2 sm:mt-0 flex gap-2">
                    <Button size="sm" variant="outline" className="transition-all duration-300 hover:shadow-sm active:scale-95" asChild>
                      {/* This link needs patient identifier for proper routing */}
                      <Link href={`/doctor/patients/${appt.patient_name?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}/medical-history`}>View History</Link>
                    </Button>
                    <Button size="sm" className="transition-all duration-300 hover:shadow-sm active:scale-95" disabled>Start Consult</Button>
                  </div>
                </li>
              ))}
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
          <Button variant="outline" className="w-full justify-start text-base py-6 hover:border-primary transition-all duration-300 hover:shadow-md active:scale-95" asChild>
             <Link href="/doctor/patients">
                <Users className="mr-2 h-5 w-5"/> Manage My Patients
             </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start text-base py-6 hover:border-primary transition-all duration-300 hover:shadow-md active:scale-95" asChild>
            <Link href="/doctor/appointments">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500 dark:text-green-400"/> Review Pending Appointments
            </Link>
          </Button>
           <Button variant="outline" className="w-full justify-start text-base py-6 hover:border-primary transition-all duration-300 hover:shadow-md active:scale-95" asChild>
             <Link href="/doctor/appointments"> {/* Both link to the same page for now */}
                <CalendarDays className="mr-2 h-5 w-5"/> Manage All Appointments
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

    