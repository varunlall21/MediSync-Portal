
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClipboardList, Save, PlusCircle, Loader2 } from "lucide-react";
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
// import { getPatientDetails } from '@/lib/patient-service'; // Assuming a service to fetch patient details by ID if needed

// Mock medical history - this would eventually come from a service based on patientId
const mockPatientMedicalRecords: Record<string, Array<{ date: string; diagnosis: string; notes: string }>> = {
  "default-history": [ // Fallback if patientId doesn't match a specific record key
    { date: "2023-05-10", diagnosis: "Common Cold", notes: "Prescribed rest and fluids." },
    { date: "2023-01-20", diagnosis: "Sprained Ankle", notes: "Advised RICE protocol." },
  ],
  "alice-wonderland": [ // Example for slugified name
     { date: "2023-07-15", diagnosis: "Routine Checkup", notes: "All vitals normal for Alice." },
  ],
  // Add more entries if patientId is expected to be patient_user_id
  // e.g., "auth-user-uuid-123": [ { ... medical records for this user ... } ]
};


export default function PatientMedicalHistoryPage() {
  const params = useParams();
  const patientId = params.patientId as string; 
  const { toast } = useToast();
  
  const [patientName, setPatientName] = useState<string>("A Patient");
  const [medicalHistory, setMedicalHistory] = useState<Array<{ date: string; diagnosis: string; notes: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // In a real app, you would fetch patient details and their medical history using patientId.
    // For now, we'll try to derive a name and use mock history.
    
    // Attempt to format patientId if it's a slug or use it as is if it might be a UUID
    let displayName = "Details for " + patientId;
    if (patientId && !patientId.includes('-') && patientId.length > 20) { // Heuristic for UUID
      displayName = `Patient ID: ${patientId.substring(0,8)}...`;
      // Potentially fetch patient name by UUID here
    } else if (patientId) {
      displayName = patientId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    setPatientName(displayName);

    // Load mock history
    // If patientId is a known key in mock records, use that, otherwise use default.
    // In a real app, this would be a fetch based on patientId (which could be user_id or a db id)
    const history = mockPatientMedicalRecords[patientId] || mockPatientMedicalRecords['default-history'];
    setMedicalHistory(history);
    setIsLoading(false);
  }, [patientId]);

  const handleAddRecord = () => {
    toast({
      title: "Not Implemented",
      description: "Adding new medical records is not yet available.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading medical history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Medical History: {patientName}</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><ClipboardList className="mr-2 h-5 w-5 text-primary" /> Current Records</CardTitle>
          <CardDescription>View and manage {patientName}'s medical records.</CardDescription>
        </CardHeader>
        <CardContent>
          {medicalHistory.length > 0 ? (
            <ul className="space-y-4">
              {medicalHistory.map((record, index) => (
                <li key={index} className="p-4 border rounded-lg bg-card">
                  <p className="font-semibold text-foreground">Date: {record.date}</p>
                  <p className="text-sm text-muted-foreground">Diagnosis: {record.diagnosis}</p>
                  <p className="text-sm text-foreground mt-1">Notes: {record.notes}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No medical records found for this patient.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><PlusCircle className="mr-2 h-5 w-5 text-primary" /> Add New Record</CardTitle>
          <CardDescription>Add a new entry to {patientName}'s medical history.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="recordDate">Date of Record</Label>
            <Input id="recordDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input id="diagnosis" placeholder="Enter diagnosis" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="notes">Notes / Treatment Details</Label>
            <Textarea id="notes" placeholder="Enter detailed notes, treatment plan, prescriptions, etc." className="mt-1 min-h-[120px]" />
          </div>
          <Button onClick={handleAddRecord} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" /> Add Record
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
