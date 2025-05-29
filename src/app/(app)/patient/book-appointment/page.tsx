
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, CalendarCheck, Clock, FileText, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { addAppointmentEntry, getDoctors, type DoctorInfo, type NewAppointmentData } from '@/lib/appointment-service';
import { useAuth } from '@/contexts/auth-context';

const availableTimeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];

export default function BookAppointmentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [reason, setReason] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const loadDoctors = async () => {
      setIsLoadingDoctors(true);
      try {
        const fetchedDoctors = await getDoctors();
        setDoctors(fetchedDoctors);
        
        // Pre-select doctor if doctorId is in query params
        const doctorIdFromQuery = searchParams.get('doctorId');
        if (doctorIdFromQuery && fetchedDoctors.find(doc => doc.id === doctorIdFromQuery)) {
          setSelectedDoctorId(doctorIdFromQuery);
        }
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
        toast({ title: "Error", description: "Could not load doctor list. Please try again.", variant: "destructive" });
      } finally {
        setIsLoadingDoctors(false);
      }
    };
    loadDoctors();
  }, [searchParams, toast]);


  const resetForm = useCallback(() => {
    const doctorIdFromQuery = searchParams.get('doctorId');
    if (!doctorIdFromQuery) {
        setSelectedDoctorId(undefined);
    }
    setSelectedDate(new Date());
    setSelectedTime(undefined);
    setReason("");
  },[searchParams]);

  const handleBooking = async () => {
    if (!user) {
      toast({ title: "Authentication Error", description: "You must be logged in to book an appointment.", variant: "destructive" });
      return;
    }
    if (!selectedDoctorId || !selectedDate || !selectedTime) {
      toast({ title: "Missing Information", description: "Please select a doctor, date, and time slot.", variant: "destructive" });
      return;
    }

    const selectedDoctor = doctors.find(doc => doc.id === selectedDoctorId);
    if (!selectedDoctor) {
      toast({ title: "Error", description: "Selected doctor not found.", variant: "destructive" });
      return;
    }

    setIsBooking(true);
    const patientName = user.user_metadata?.full_name || user.email?.split('@')[0] || "Guest Patient";

    const appointmentData: NewAppointmentData = {
      patient_name: patientName,
      patient_user_id: user.id,
      doctor_id: selectedDoctor.id,
      doctor_name: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD
      time: selectedTime,
      reason: reason || undefined,
    };

    try {
      const newAppointment = await addAppointmentEntry(appointmentData);
      if (newAppointment) {
        toast({
          title: "Appointment Request Sent!",
          description: `Your appointment with ${selectedDoctor.name} on ${selectedDate.toLocaleDateString()} at ${selectedTime} is pending confirmation.`,
        });
        resetForm();
      } else {
        throw new Error("Failed to save appointment.");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast({ title: "Booking Failed", description: "Could not send appointment request. Please try again.", variant: "destructive" });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Book an Appointment</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><UserPlus className="mr-2 h-5 w-5 text-primary" /> Appointment Details</CardTitle>
          <CardDescription>Select a doctor, date, and time for your appointment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="doctor" className="flex items-center mb-1"><UserPlus className="mr-2 h-4 w-4 text-muted-foreground"/> Select Doctor</Label>
            <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId} disabled={isLoadingDoctors}>
              <SelectTrigger id="doctor">
                <SelectValue placeholder={isLoadingDoctors ? "Loading doctors..." : "Choose a doctor"} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingDoctors ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : doctors.length > 0 ? (
                  doctors.map((doc: DoctorInfo) => (
                    <SelectItem key={doc.id} value={doc.id}>{doc.name} ({doc.specialty})</SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-doctors" disabled>No doctors available.</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="flex items-center mb-1"><CalendarCheck className="mr-2 h-4 w-4 text-muted-foreground"/> Select Date</Label>
            <div className="flex justify-center p-2 border rounded-md">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md"
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } // Disable past dates
                />
            </div>
          </div>

          {selectedDate && (
            <div>
              <Label htmlFor="timeSlot" className="flex items-center mb-1"><Clock className="mr-2 h-4 w-4 text-muted-foreground"/> Select Time Slot</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger id="timeSlot">
                  <SelectValue placeholder="Choose an available time" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimeSlots.map(slot => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <Label htmlFor="reason" className="flex items-center mb-1"><FileText className="mr-2 h-4 w-4 text-muted-foreground"/> Reason for Visit (Optional)</Label>
            <Textarea 
              id="reason" 
              placeholder="Briefly describe the reason for your visit..." 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button onClick={handleBooking} className="w-full text-lg py-6" disabled={!selectedDoctorId || !selectedDate || !selectedTime || isBooking || isLoadingDoctors}>
            {isBooking ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CalendarCheck className="mr-2 h-5 w-5" />}
            {isBooking ? "Booking..." : "Book Appointment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
