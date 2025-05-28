
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, MoreVertical, Edit, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAppointments, updateAppointmentStatusEntry, type Appointment } from '@/lib/appointment-service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context'; // To filter by patient


export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { toast } = useToast();
  const { user } = useAuth(); // Get current user to filter appointments

  const fetchAppointments = useCallback(() => {
    if (user) {
      const allAppointments = getAppointments();
      // Filter appointments for the current patient.
      // This assumes patientName was stored accurately during booking.
      const patientName = user.displayName || user.email?.split('@')[0] || "Guest Patient";
      const userAppointments = allAppointments.filter(
        appt => appt.patientName === patientName
      ).sort((a,b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()); // Show newest first
      setAppointments(userAppointments);
    } else {
      setAppointments([]);
    }
  }, [user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancelAppointment = (appointmentId: string) => {
    const updatedAppointment = updateAppointmentStatusEntry(appointmentId, "Cancelled");
    if (updatedAppointment) {
      toast({
        title: "Appointment Cancelled",
        description: `Your appointment with ${updatedAppointment.doctorName} has been cancelled.`,
      });
      fetchAppointments(); // Re-fetch to update list
    } else {
      toast({
        title: "Error",
        description: "Could not cancel appointment. Please try again.",
        variant: "destructive",
      });
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
                    <p className="font-semibold text-lg text-foreground">{appt.doctorName} <span className="text-sm text-muted-foreground">({appt.specialty})</span></p>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <CalendarDays className="mr-1.5 h-4 w-4" /> {new Date(appt.date).toLocaleDateString()} {/* Format date for display */}
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
                          {appt.status === "Pending" && <DropdownMenuItem onClick={handleReschedule}><Edit className="mr-2 h-4 w-4"/>Reschedule</DropdownMenuItem>}
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
