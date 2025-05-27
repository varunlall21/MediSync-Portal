
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export default function AdminAppointmentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Manage Appointments</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" /> All Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Appointment management interface for admins. Admins can approve, cancel, or reschedule appointments.</p>
           <div className="mt-4 p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
            Appointment data will be displayed here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
