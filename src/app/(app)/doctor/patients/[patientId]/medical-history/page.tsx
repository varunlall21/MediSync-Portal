
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClipboardList, Save, PlusCircle } from "lucide-react";
import { useParams } from 'next/navigation';

export default function PatientMedicalHistoryPage() {
  const params = useParams();
  const patientId = params.patientId; // e.g., "p1" or "alice-wonderland"

  // Mock data fetch based on patientId
  const patientName = patientId === "p1" ? "Alice Wonderland" : patientId === "p2" ? "Bob The Builder" : "A Patient";
  const mockHistory = [
    { date: "2023-05-10", diagnosis: "Common Cold", notes: "Prescribed rest and fluids." },
    { date: "2023-01-20", diagnosis: "Sprained Ankle", notes: "Advised RICE protocol." },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Medical History: {patientName}</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><ClipboardList className="mr-2 h-5 w-5 text-primary" /> Current Records</CardTitle>
          <CardDescription>View and manage {patientName}'s medical records.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockHistory.length > 0 ? (
            <ul className="space-y-4">
              {mockHistory.map((record, index) => (
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
          <Button className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" /> Add Record
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
