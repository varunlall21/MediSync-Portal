
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";

const mockAppointmentRequests = [
  { id: "ar1", patientName: "Kevin McCallister", requestedTime: "Tomorrow, 03:00 PM", reason: "Fever and cough" },
  { id: "ar2", patientName: "Lisa Simpson", requestedTime: "Day after tomorrow, 11:00 AM", reason: "Annual checkup" },
];

export default function DoctorManageAppointmentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Manage Appointment Requests</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Clock className="mr-2 h-5 w-5 text-primary" /> Pending Requests</CardTitle>
          <CardDescription>Review and respond to new appointment requests from patients.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockAppointmentRequests.length > 0 ? (
            <ul className="space-y-4">
              {mockAppointmentRequests.map(req => (
                <li key={req.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-semibold text-foreground">{req.patientName}</p>
                    <p className="text-sm text-muted-foreground">Time: {req.requestedTime}</p>
                    <p className="text-sm text-foreground mt-1">Reason: {req.reason}</p>
                  </div>
                  <div className="mt-3 sm:mt-0 flex gap-2">
                    <Button size="sm" variant="outline" className="text-green-500 border-green-500 hover:bg-green-500/10 hover:text-green-400">
                      <CheckCircle className="mr-2 h-4 w-4" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-500 border-red-500 hover:bg-red-500/10 hover:text-red-400">
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
