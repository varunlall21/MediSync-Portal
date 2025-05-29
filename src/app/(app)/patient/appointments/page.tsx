
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MoreVertical, Edit, X, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAppointments, updateAppointmentStatusEntry, type Appointment } from '@/lib/appointment-service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const fetchAppointments = useCallback(async () => {
    if (!user) { 
      setAppointments([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const allAppointments = await getAppointments();
      // RLS should handle filtering by patient_user_id, but we can still filter here
      // to be safe or if RLS isn't fully restrictive yet.
      const userAppointments = allAppointments.filter(
        (appt: Appointment) => appt.patient_user_id === user.id
      ).sort((a, b) => new Date(b.booked_at).getTime() - new Date(a.booked_at).getTime());
      setAppointments(userAppointments);
    } catch (error: any) {
      console.error("Failed to fetch appointments:", error);
      toast({ title: "Error", description: error.message || "Could not load your appointments.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    // Wait for auth to resolve and user object to be available
    if (!authLoading && user) { 
        fetchAppointments();
    } else if (!authLoading && !user) {
        // If auth resolved and no user, clear appointments and stop loading
        setAppointments([]);
        setIsLoading(false);
    }
  }, [authLoading, user, fetchAppointments]);

  const handleCancelAppointment = async (appointmentId: string) => {
    const originalAppointments = [...appointments];
    setAppointments(prev => prev.map(appt => appt.id === appointmentId ? {...appt, status: "Cancelled"} : appt));

    try {
      const updatedAppointment = await updateAppointmentStatusEntry(appointmentId, "Cancelled");
      if (updatedAppointment) {
        toast({
          title: "Appointment Cancelled",
          description: `Your appointment with ${updatedAppointment.doctor_name} has been cancelled.`,
        });
        fetchAppointments(); 
      } else {
        throw new Error("Failed to cancel appointment on server.");
      }
    } catch (error: any) {
      console.error("Cancel appointment error:", error);
      toast({ title: "Error", description: error.message || "Could not cancel appointment. Please try again.", variant: "destructive" });
      setAppointments(originalAppointments);
    }
  };

  const handleReschedule = () => {
    toast({
      title: "Not Implemented",
      description: "Reschedule functionality is not yet available.",
    });
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'bg-green-500/80 hover:bg-green-600/80';
      case 'pending':
        return 'bg-yellow-500/80 hover:bg-yellow-600/80';
      case 'cancelled':
        return 'bg-red-500/80 hover:bg-red-600/80';
      default:
        return 'bg-slate-500/80 hover:bg-slate-600/80';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading your appointments...</p>
      </div>
    );
  }
  
  if (!user) { // This check ensures that if user logs out, this page doesn't try to render data
     return (
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" /> Appointment History</CardTitle>
              <CardDescription>View your past, upcoming, and cancelled appointments.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4 p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
                Please log in to view your appointment history.
              </div>
            </CardContent>
          </Card>
        </div>
      );
  }


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" /> Appointment History</CardTitle>
          <CardDescription>View your past, upcoming, and cancelled appointments.</CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length > 0 ? (
            <ul className="space-y-4">
              {appointments.map(appt => (
                <li key={appt.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-muted/50 transition-colors">
                  <div className="flex-1 mb-3 sm:mb-0">
                    <p className="font-semibold text-lg text-foreground">{appt.doctor_name} <span className="text-sm text-muted-foreground">({appt.specialty})</span></p>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <CalendarDays className="mr-1.5 h-4 w-4" /> {new Date(appt.date).toLocaleDateString()}
                        <Clock className="ml-3 mr-1.5 h-4 w-4" /> {appt.time}
                    </div>
                    {appt.reason && <p className="text-sm text-muted-foreground mt-1">Reason: {appt.reason}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusBadgeVariant(appt.status)} text-white text-xs`}>{appt.status}</Badge>
                    {(appt.status === "Approved" || appt.status === "Pending") && (
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(appt.status === "Pending" || appt.status === "Approved") && <DropdownMenuItem onClick={handleReschedule}><Edit className="mr-2 h-4 w-4"/>Reschedule</DropdownMenuItem>}
                          <DropdownMenuItem onClick={() => handleCancelAppointment(appt.id)} className="text-red-500 focus:text-red-500 focus:bg-red-500/10"><X className="mr-2 h-4 w-4"/>Cancel Appointment</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
                You have no appointments scheduled.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
