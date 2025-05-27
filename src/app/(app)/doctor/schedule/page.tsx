
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export default function DoctorSchedulePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" /> Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Detailed view of the doctor's schedule and upcoming appointments.</p>
           <div className="mt-4 p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
            Full schedule view with calendar integration will be here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
