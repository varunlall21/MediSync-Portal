
"use client";


import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CalendarDays, CheckCircle, XCircle, MoreHorizontal, Loader2, AlertTriangle, Users, Stethoscope, Clock } from "lucide-react";
import { getAppointments, updateAppointmentStatusEntry, type Appointment } from '@/lib/appointment-service';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all"); // "all", "Pending", "Approved", "Cancelled", "Completed"
  const { toast } = useToast();

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allAppointments = await getAppointments();
      setAppointments(allAppointments.sort((a,b) => new Date(b.booked_at).getTime() - new Date(a.booked_at).getTime()));
    } catch (err: any) {
      console.error("AdminAppointmentsPage - Error fetching appointments:", err);
      setError(err.message || "Could not load appointments.");
      toast({ title: "Error", description: "Failed to load appointments.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleUpdateStatus = async (appointmentId: string, newStatus: Appointment['status']) => {
    const originalAppointments = [...appointments];
    // Optimistic update
    setAppointments(prev => prev.map(appt => appt.id === appointmentId ? { ...appt, status: newStatus } : appt));

    try {
      const updatedAppointment = await updateAppointmentStatusEntry(appointmentId, newStatus);
      if (updatedAppointment) {
        toast({
          title: `Appointment ${newStatus}`,
          description: `Appointment ID ${appointmentId.substring(0,8)}... for ${updatedAppointment.patient_name} has been ${newStatus.toLowerCase()}.`,
        });
        // Re-fetch to ensure data consistency, or rely on optimistic update if confident
        fetchAppointments(); 
      } else {
        throw new Error("Failed to update appointment on server.");
      }
    } catch (error: any) {
      console.error("Update appointment status error:", error);
      toast({ title: "Error", description: "Could not update appointment status. Please try again.", variant: "destructive" });
      setAppointments(originalAppointments); // Revert optimistic update
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-500/80 hover:bg-green-600/80';
      case 'pending': return 'bg-yellow-500/80 hover:bg-yellow-600/80';
      case 'cancelled': return 'bg-red-500/80 hover:bg-red-600/80';
      case 'completed': return 'bg-blue-500/80 hover:bg-blue-600/80';
      default: return 'bg-slate-500/80 hover:bg-slate-600/80';
    }
  };
  
  const filteredAppointments = appointments.filter(appt => 
    filterStatus === "all" || appt.status?.toLowerCase() === filterStatus.toLowerCase()
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-lg">Loading all appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/10 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" /> Error Loading Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive/90">{error}</p>
          <Button onClick={fetchAppointments} variant="outline" className="mt-4">Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Manage All Appointments</h1>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Filter by Status: {filterStatus === "all" ? "All" : filterStatus}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setFilterStatus("all")}>All</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setFilterStatus("Pending")}>Pending</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setFilterStatus("Approved")}>Approved</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setFilterStatus("Cancelled")}>Cancelled</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setFilterStatus("Completed")}>Completed</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" /> Appointments List</CardTitle>
          <CardDescription>View and manage all patient appointments in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map(appt => (
                  <TableRow key={appt.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="font-medium text-foreground flex items-center">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" /> {appt.patient_name}
                      </div>
                      {appt.patient_user_id && <div className="text-xs text-muted-foreground ml-6">ID: {appt.patient_user_id.substring(0,8)}...</div>}
                    </TableCell>
                    <TableCell>
                        <div className="font-medium text-foreground flex items-center">
                           <Stethoscope className="mr-2 h-4 w-4 text-muted-foreground" /> {appt.doctor_name}
                        </div>
                        <div className="text-xs text-muted-foreground ml-6">{appt.specialty}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-foreground">
                        <CalendarDays className="mr-1.5 h-4 w-4 text-muted-foreground" /> {format(parseISO(appt.date), 'PP')}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground ml-6">
                        <Clock className="mr-1.5 h-3 w-3" /> {appt.time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusBadgeVariant(appt.status)} text-white text-xs`}>{appt.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Manage</DropdownMenuLabel>
                          {appt.status?.toLowerCase() === 'pending' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(appt.id, "Approved")} className="text-green-600 dark:text-green-400 focus:bg-green-500/10">
                              <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            </DropdownMenuItem>
                          )}
                          {appt.status?.toLowerCase() !== 'cancelled' && appt.status?.toLowerCase() !== 'completed' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(appt.id, "Cancelled")} className="text-red-600 dark:text-red-400 focus:bg-red-500/10">
                              <XCircle className="mr-2 h-4 w-4" /> Cancel
                            </DropdownMenuItem>
                          )}
                           {appt.status?.toLowerCase() === 'approved' && ( // Option to mark as completed if approved
                            <DropdownMenuItem onClick={() => handleUpdateStatus(appt.id, "Completed")} className="text-blue-600 dark:text-blue-400 focus:bg-blue-500/10">
                              <CheckCircle className="mr-2 h-4 w-4" /> Mark as Completed
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="mt-4 p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
                No appointments found{filterStatus !== "all" ? ` with status: ${filterStatus}` : ''}.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

