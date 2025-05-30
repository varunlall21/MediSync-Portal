
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, CalendarDays, Loader2 } from "lucide-react";
import { getAppointments, updateAppointmentStatusEntry, type Appointment } from '@/lib/appointment-service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

export default function DoctorManageAppointmentsPage() {
  const [appointmentRequests, setAppointmentRequests] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, loading: authLoading, role } = useAuth();

  
  const fetchAppointmentRequests = useCallback(async () => {
    if (!user || role !== 'doctor') {
        setAppointmentRequests([]);
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    try {
      const allAppointments = await getAppointments();
      // Doctor sees all pending requests for now. 
      // TODO: Filter by doctorId if appointments are assigned to specific doctors.
      // const doctorId = user?.id; 
      // const pending = allAppointments.filter(appt => appt.status === "Pending" && appt.doctor_id === doctorId);
      const pending = allAppointments
        .filter(appt => appt.status === "Pending")
        .sort((a,b) => new Date(a.booked_at).getTime() - new Date(b.booked_at).getTime());
      setAppointmentRequests(pending);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      toast({ title: "Error", description: "Could not load appointment requests.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, role, toast]);

  useEffect(() => {
    if (!authLoading) {
        fetchAppointmentRequests();
    }
  }, [authLoading, fetchAppointmentRequests]);

  const handleUpdateStatus = async (appointmentId: string, newStatus: "Approved" | "Cancelled") => {
    const originalAppointments = [...appointmentRequests];
    // Optimistic update
    setAppointmentRequests(prev => prev.filter(appt => appt.id !== appointmentId));

    try {
      const updatedAppointment = await updateAppointmentStatusEntry(appointmentId, newStatus);
      if (updatedAppointment) {
        toast({
          title: `Appointment ${newStatus}`,
          description: `The appointment for ${updatedAppointment.patient_name} has been ${newStatus.toLowerCase()}.`,
        });
        // fetchAppointmentRequests(); // Re-fetch to update list, or rely on optimistic update
      } else {
        throw new Error("Failed to update appointment on server.");
      }
    } catch (error) {
      console.error("Update appointment status error:", error);
      toast({ title: "Error", description: "Could not update appointment status. Please try again.", variant: "destructive" });
      setAppointmentRequests(originalAppointments); // Revert optimistic update
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading appointment requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Manage Appointment Requests</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Clock className="mr-2 h-5 w-5 text-primary" /> Pending Requests</CardTitle>
          <CardDescription>Review and respond to new appointment requests from patients.</CardDescription>
        </CardHeader>
        <CardContent>
          {appointmentRequests.length > 0 ? (
            <ul className="space-y-4">
              {appointmentRequests.map(req => (
                <li key={req.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-semibold text-foreground">Patient: {req.patient_name}</p>
                    <p className="text-sm text-muted-foreground">Doctor: {req.doctor_name} ({req.specialty})</p>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <CalendarDays className="mr-1.5 h-4 w-4" /> {new Date(req.date).toLocaleDateString()}
                        <Clock className="ml-3 mr-1.5 h-4 w-4" /> {req.time}
                    </div>
                    {req.reason && <p className="text-sm text-foreground mt-1">Reason: {req.reason}</p>}
                  </div>
                  <div className="mt-3 sm:mt-0 flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-green-500 border-green-500 hover:bg-green-500/10 hover:text-green-400"
                      onClick={() => handleUpdateStatus(req.id, "Approved")}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-500 border-red-500 hover:bg-red-500/10 hover:text-red-400"
                      onClick={() => handleUpdateStatus(req.id, "Cancelled")}
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
             <div className="mt-4 p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
                No pending appointment requests.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
