
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Stethoscope, ClipboardList, UserPlus, BarChartHorizontalBig, HeartPulse, Brain, FileSpreadsheet, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from '@/contexts/auth-context';
import { getAppointments, type Appointment } from '@/lib/appointment-service';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

export default function PatientDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [nextAppointmentData, setNextAppointmentData] = useState<Appointment | null | undefined>(undefined); // undefined: loading, null: no appt, Appointment: found
  const [isLoadingAppointment, setIsLoadingAppointment] = useState(true);
  const [appointmentError, setAppointmentError] = useState<string | null>(null);

  const parseTime = useCallback((timeStr: string): number => {
    const [timePart, modifier] = timeStr.toUpperCase().split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) {
        hours += 12;
    } else if (modifier === 'AM' && hours === 12) { // Midnight case (12 AM)
        hours = 0;
    }
    return hours * 60 + minutes; // Total minutes from midnight
  }, []);

  const fetchNextAppointment = useCallback(async () => {
    if (!user) {
      setIsLoadingAppointment(false);
      setNextAppointmentData(null);
      console.log("[PatientDashboard] No user, not fetching appointments.");
      return;
    }

    setIsLoadingAppointment(true);
    setAppointmentError(null);
    console.log("[PatientDashboard] Fetching next appointment for user ID:", user.id);

    try {
      const allAppointments = await getAppointments();
      console.log(`[PatientDashboard] Raw appointments fetched from service for ANY user (count: ${allAppointments.length}):`, allAppointments.slice(0, 5).map(a => ({id: a.id, patient_user_id: a.patient_user_id, status: a.status, date: a.date, time: a.time })));

      const userApprovedAppointments = allAppointments.filter(
        (appt) => appt.patient_user_id === user.id && appt.status?.toLowerCase() === "approved"
      );
      console.log(`[PatientDashboard] Appointments for user ${user.id} with status 'approved' (case-insensitive) (count: ${userApprovedAppointments.length}):`, userApprovedAppointments.slice(0, 3).map(a => ({id: a.id, status: a.status, date: a.date, time: a.time })));

      const upcomingAppointments = userApprovedAppointments
        .filter(appt => {
          try {
            const appointmentDate = parseISO(appt.date); 
            const today = new Date();
            const startOfTodayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
            const isUpcoming = appointmentDate.getTime() >= startOfTodayUTC.getTime();
            // For detailed debugging of date filtering:
            // console.log(`[PatientDashboard] Checking Appt ID ${appt.id}: Date: ${appt.date}, ApptDateUTC: ${appointmentDate.toISOString()}, StartTodayUTC: ${startOfTodayUTC.toISOString()}, isUpcoming: ${isUpcoming}`);
            return isUpcoming;
          } catch (e) {
            console.warn(`[PatientDashboard] Invalid date format for appointment ${appt.id}: ${appt.date}`, e);
            return false;
          }
        })
        .sort((a, b) => {
            const dateA = parseISO(a.date);
            const dateB = parseISO(b.date);
            const dateDiff = dateA.getTime() - dateB.getTime();
            if (dateDiff !== 0) return dateDiff; // Sort by date first
            
            const numericTimeA = parseTime(a.time);
            const numericTimeB = parseTime(b.time);
            return numericTimeA - numericTimeB; // Then by time
        });
      
      console.log(`[PatientDashboard] Filtered for upcoming (today/future) & sorted (count: ${upcomingAppointments.length}):`, upcomingAppointments.slice(0, 3).map(a => ({id: a.id, date: a.date, time: a.time })));
      
      const nextOne = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;
      setNextAppointmentData(nextOne);
      console.log('[PatientDashboard] Next upcoming approved appointment set to:', nextOne ? {id: nextOne.id, date: nextOne.date, time: nextOne.time, doctor: nextOne.doctor_name} : 'None');

    } catch (error: any) {
      console.error("[PatientDashboard] Failed to fetch next appointment:", error);
      setAppointmentError(error.message || "Could not load appointment details.");
      setNextAppointmentData(null);
    } finally {
      setIsLoadingAppointment(false);
    }
  }, [user, parseTime]);

  useEffect(() => {
    if (!authLoading && user) { 
      fetchNextAppointment();
    } else if (!authLoading && !user) { 
      setIsLoadingAppointment(false);
      setNextAppointmentData(null);
    }
  }, [authLoading, user, fetchNextAppointment]);

  const formatAppointmentTime = (appointment: Appointment): string => {
    try {
      const date = parseISO(appointment.date);
      if (isToday(date)) {
        return `Today, ${appointment.time}`;
      }
      if (isTomorrow(date)) {
        return `Tomorrow, ${appointment.time}`;
      }
      return `${format(date, 'EEE, MMM d')} at ${appointment.time}`;
    } catch (e) {
        console.warn(`[PatientDashboard] Error formatting date for appointment ${appointment.id}: ${appointment.date}`, e);
        return `On ${appointment.date} at ${appointment.time}`;
    }
  };

  const quickLinks = [
    { title: "Book New Appointment", href: "/patient/book-appointment", icon: UserPlus },
    { title: "View My Appointments", href: "/patient/appointments", icon: CalendarDays },
    { title: "Access Medical History", href: "/patient/medical-history", icon: ClipboardList },
    { title: "Find a Doctor", href: "/patient/doctors", icon: Stethoscope },
  ];

  const healthResources = [
    { 
      title: "Understanding Your Lab Results", 
      description: "Learn how to interpret common lab test results and what they mean for your health.",
      icon: FileSpreadsheet,
      slug: "understanding-lab-results" 
    },
    { 
      title: "Tips for a Healthy Heart", 
      description: "Discover lifestyle changes and dietary advice for better cardiovascular health.",
      icon: HeartPulse,
      slug: "tips-for-healthy-heart" 
    },
    {
      title: "Managing Stress for Better Wellness",
      description: "Explore techniques for stress reduction and improving your mental well-being.",
      icon: Brain,
      slug: "managing-stress-for-wellness"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Patient Dashboard</h1>
        <Button asChild className="transition-all duration-300 hover:shadow-lg active:scale-95">
          <Link href="/patient/book-appointment">
            <UserPlus className="mr-2 h-4 w-4" /> Book Appointment
          </Link>
        </Button>
      </div>

      <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 
                       bg-gradient-to-br from-[hsl(var(--primary)/0.05)] to-[hsl(var(--accent)/0.05)] 
                       dark:from-[hsl(var(--primary)/0.1)] dark:to-[hsl(var(--accent)/0.1)]
                       border-primary/30 dark:border-primary/20 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center text-foreground">
            <CalendarDays className="mr-3 h-6 w-6 text-primary" />
            Your Next Appointment
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-h-[130px]">
          <Image 
              src={nextAppointmentData?.doctor_image_url || "https://placehold.co/100x100.png"} 
              alt={nextAppointmentData ? nextAppointmentData.doctor_name : "Doctor placeholder"}
              width={80} 
              height={80} 
              className="rounded-full border-2 border-muted group-hover:border-primary/50 transition-colors duration-300"
              data-ai-hint="doctor portrait" 
          />
          {isLoadingAppointment ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading appointment...
            </div>
          ) : appointmentError ? (
            <div className="flex-1 text-destructive">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <p className="font-semibold">Error loading appointment</p>
              </div>
              <p className="text-sm ">{appointmentError}</p>
            </div>
          ) : nextAppointmentData ? (
            <>
              <div className="flex-1">
                <p className="text-xl font-semibold text-foreground">{nextAppointmentData.doctor_name}</p>
                <p className="text-md text-muted-foreground">{nextAppointmentData.specialty}</p>
                <p className="text-lg text-primary mt-1 font-medium">{formatAppointmentTime(nextAppointmentData)}</p>
              </div>
              <div className="sm:text-right">
                <p className={`text-sm font-medium px-3 py-1 rounded-full ${
                  nextAppointmentData.status?.toLowerCase() === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300'
                }`}>
                  Status: {nextAppointmentData.status}
                </p>
                <Button variant="outline" size="sm" className="mt-3 transition-all duration-300 hover:shadow-md active:scale-95" asChild>
                  <Link href="/patient/appointments">Manage Appointment</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1">
              <p className="text-lg font-semibold text-foreground">No upcoming approved appointments.</p>
              <p className="text-md text-muted-foreground">You're all caught up! Feel free to book a new one.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center"><BarChartHorizontalBig className="mr-2 h-5 w-5 text-primary" /> Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map((link) => (
            <Button 
              key={link.title} 
              variant="outline" 
              className="w-full justify-start text-base py-6 group hover:border-primary hover:bg-accent/10 dark:hover:bg-accent/5 hover:text-foreground transition-all duration-300 hover:shadow-md active:scale-95" 
              asChild
            >
              <Link href={link.href}>
                <link.icon className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" /> {link.title}
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>
      
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center"><Stethoscope className="mr-2 h-5 w-5 text-primary"/> Health Resources</CardTitle>
          <CardDescription>Find useful health information and tips.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-4">
            {healthResources.map((resource, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 dark:hover:bg-muted/20 transition-all duration-300 hover:border-accent/50 hover:shadow-md flex flex-col">
                <div className="flex items-center mb-2">
                  <resource.icon className="h-6 w-6 mr-3 text-primary flex-shrink-0" />
                  <h3 className="font-semibold text-lg text-foreground">{resource.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1 flex-grow">{resource.description}</p>
                <Link href={`/patient/health-resources/${resource.slug}`} className="text-sm text-primary hover:underline mt-3 inline-block self-start group">
                  Read more <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">&rarr;</span>
                </Link>
              </div>
            ))}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
    
