
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const mockPatients = [
  { id: "p1", name: "Alice Wonderland", lastVisit: "2023-05-10" },
  { id: "p2", name: "Bob The Builder", lastVisit: "2023-06-15" },
  { id: "p3", name: "Charlie Brown", lastVisit: "2023-07-01" },
];

export default function DoctorPatientsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Patients</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> Patient List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">List of patients assigned to you. Click on a patient to view or update their medical history.</p>
          
          <ul className="space-y-3">
            {mockPatients.map(patient => (
              <li key={patient.id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-semibold text-foreground">{patient.name}</p>
                  <p className="text-sm text-muted-foreground">Last Visit: {patient.lastVisit}</p>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/doctor/patients/${patient.id}/medical-history`}>View/Edit History</Link>
                </Button>
              </li>
            ))}
          </ul>
           {mockPatients.length === 0 && (
             <div className="mt-4 p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
                You currently have no patients assigned.
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
