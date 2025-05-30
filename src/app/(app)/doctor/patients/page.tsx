
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAppointments, type Appointment } from '@/lib/appointment-service';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

interface PatientListItem {
  id: string; // patient_user_id or fallback to name
  name: string;
  lastVisit?: string;
  raw_patient_user_id?: string | null; // Store the original patient_user_id if available
}

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allAppointments = await getAppointments();
      
      const patientMap = new Map<string, PatientListItem>();

      allAppointments.forEach(appt => {
        // Use patient_user_id as the primary key if available, otherwise fall back to patient_name.
        // This helps group appointments for the same registered user even if their name was entered slightly differently.
        // For unregistered/guest patients, patient_name will be the key.
        const patientKey = appt.patient_user_id || appt.patient_name; 
        if (!patientKey) return; // Skip if no identifier

        const existingPatient = patientMap.get(patientKey);
        let appointmentDate;
        try {
            appointmentDate = parseISO(appt.date);
        } catch (e) {
            console.warn(`Invalid date format for appointment ${appt.id}: ${appt.date}. Skipping this appointment for patient aggregation.`);
            return; 
        }


        if (!existingPatient) {
          patientMap.set(patientKey, {
            id: patientKey, // This is the key used for the map, could be user_id or name
            name: appt.patient_name, // Always store the display name
            lastVisit: format(appointmentDate, 'yyyy-MM-dd'),
            raw_patient_user_id: appt.patient_user_id // Store the actual user_id if present
          });
        } else {
          // Update last visit if this appointment is more recent
          if (existingPatient.lastVisit && parseISO(existingPatient.lastVisit) < appointmentDate) {
            existingPatient.lastVisit = format(appointmentDate, 'yyyy-MM-dd');
          }
          // Ensure raw_patient_user_id is captured if it wasn't on the first encounter
          if (!existingPatient.raw_patient_user_id && appt.patient_user_id) {
            existingPatient.raw_patient_user_id = appt.patient_user_id;
          }
        }
      });

      let uniquePatientList = Array.from(patientMap.values());
      
      // Filter out patients whose name is "doctor" (case-insensitive)
      uniquePatientList = uniquePatientList.filter(p => p.name?.toLowerCase() !== 'doctor');
      
      // Sort patients by name
      uniquePatientList.sort((a,b) => (a.name || "").localeCompare(b.name || ""));
      
      setPatients(uniquePatientList);

    } catch (err: any) {
      console.error("Error fetching patients data for doctor:", err);
      setError(err.message || "Could not load patient list.");
      toast({ title: "Error", description: "Failed to load patient list.", variant: "destructive"});
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading patient list...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/10 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" /> Error Loading Patients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive/90">{error}</p>
          <Button onClick={fetchPatients} variant="outline" className="mt-4">Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Patients</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> Patient List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            List of patients who have had appointments. Click on a patient to view or update their medical history.
          </p>
          
          {patients.length > 0 ? (
            <ul className="space-y-3">
              {patients.map(patient => {
                // Prioritize raw_patient_user_id for linking if available, otherwise use the patient.id (which might be the name)
                const patientLinkIdentifier = patient.raw_patient_user_id || patient.id.toLowerCase().replace(/\s+/g, '-');
                return (
                  <li key={patient.id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-semibold text-foreground">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">Last Visit: {patient.lastVisit ? format(parseISO(patient.lastVisit), 'MMMM d, yyyy') : 'N/A'}</p>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href={`/doctor/patients/${patientLinkIdentifier}/medical-history`}>View/Edit History</Link>
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : (
             <div className="mt-4 p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
                No patients found. This list is populated based on appointment history.
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
