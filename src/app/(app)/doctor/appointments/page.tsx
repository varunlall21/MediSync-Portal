
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, CalendarDays } from "lucide-react";
import { getAppointments, updateAppointmentStatusEntry, type Appointment } from '@/lib/appointment-service';
import { useToast } from '@/hooks/use-toast';
// import { useAuth } from '@/contexts/auth-context'; // If doctors are assigned specific patients or need their ID

export default function DoctorManageAppointmentsPage() {
  const [appointmentRequests, setAppointmentRequests] = useState<Appointment[]>([]);
  const { toast } = useToast();
  // const { user } = useAuth(); // Potentially use to filter appointments for this specific doctor

  const fetchAppointmentRequests = useCallback(() => {
    const allAppointments = getAppointments();
    // For now, doctor sees all pending requests. 
    // In a real app, filter by doctorId if user is a doctor.
    // const doctorId = user?.uid; // Example: if doctor's Firebase UID is their ID
    // const pending = allAppointments.filter(appt => appt.status === "Pending" && appt.doctorId === doctorId);
    const pending = allAppointments.filter(appt => appt.status === "Pending")
                                 .sort((a,b) => new Date(a.bookedAt).getTime() - new Date(b.bookedAt).getTime()); // Show oldest first
    setAppointmentRequests(pending);
  }, []);

  useEffect(() => {
    fetchAppointmentRequests();
  }, [fetchAppointmentRequests]);

  const handleUpdateStatus = (appointmentId: string, newStatus: "Approved" | "Cancelled") => {
    const updatedAppointment = updateAppointmentStatusEntry(appointmentId, newStatus);
    if (updatedAppointment) {
      toast({
        title: `Appointment ${newStatus}`,
        description: `The appointment for ${updatedAppointment.patientName} has been ${newStatus.toLowerCase()}.`,
      });
      fetchAppointmentRequests(); // Refresh list
    } else {
      toast({
        title: "Error",
        description: "Could not update appointment status. Please try again.",
        variant: "destructive",
      });
    }
  };

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
                    <p className="font-semibold text-foreground">Patient: {req.patientName}</p>
                    <p className="text-sm text-muted-foreground">Doctor: {req.doctorName} ({req.specialty})</p>
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
