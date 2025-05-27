
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Download, FileText, CalendarDays } from "lucide-react";

const mockMedicalHistory = [
  { id: "mh1", date: "2023-07-15", doctor: "Dr. Emily Carter", diagnosis: "Routine Checkup", details: "All vitals normal. Discussed diet and exercise.", type: "Consultation Note" },
  { id: "mh2", date: "2023-05-10", doctor: "Dr. Lab Tech", diagnosis: "Blood Test Results", details: "Cholesterol slightly elevated. HDL: 45, LDL: 130.", type: "Lab Report" },
  { id: "mh3", date: "2023-03-01", doctor: "Dr. Johnathan Lee", diagnosis: "Flu Vaccine", details: "Administered annual influenza vaccine.", type: "Vaccination Record" },
];

export default function PatientMedicalHistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">My Medical History</h1>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Download Full History (PDF)
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><ClipboardList className="mr-2 h-5 w-5 text-primary" /> Your Medical Records</CardTitle>
          <CardDescription>A summary of your health records. For detailed information, consult your doctor.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockMedicalHistory.length > 0 ? (
            <ul className="space-y-6">
              {mockMedicalHistory.map(record => (
                <li key={record.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg text-foreground">{record.diagnosis}</p>
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <FileText className="mr-1.5 h-4 w-4" /> {record.type}
                        <span className="mx-2">|</span>
                        <CalendarDays className="mr-1.5 h-4 w-4" /> {record.date}
                        <span className="mx-2">|</span>
                        By: {record.doctor}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-accent">View Details</Button>
                  </div>
                  <p className="text-sm text-foreground mt-2 pt-2 border-t border-border/50">{record.details}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
                No medical records found. Your history will appear here as it's updated by your doctors.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
