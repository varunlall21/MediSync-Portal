
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Stethoscope, MoreVertical, Edit, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mockAppointments = [
  { id: "appt1", doctor: "Dr. Emily Carter", specialty: "Cardiology", date: "2023-07-15", time: "10:30 AM", status: "Approved" },
  { id: "appt2", doctor: "Dr. Johnathan Lee", specialty: "Pediatrics", date: "2023-07-20", time: "02:00 PM", status: "Pending" },
  { id: "appt3", doctor: "Dr. Sarah Miller", specialty: "Dermatology", date: "2023-06-10", time: "09:00 AM", status: "Cancelled" },
  { id: "appt4", doctor: "Dr. Emily Carter", specialty: "Cardiology", date: "2023-05-01", time: "11:00 AM", status: "Completed" },
];

export default function PatientAppointmentsPage() {
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'bg-green-500/80 hover:bg-green-600/80';
      case 'pending':
        return 'bg-yellow-500/80 hover:bg-yellow-600/80';
      case 'cancelled':
        return 'bg-red-500/80 hover:bg-red-600/80';
      default:
        return 'bg-slate-500/80 hover:bg-slate-600/80';
    }
  };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" /> Appointment History</CardTitle>
          <CardDescription>View your past, upcoming, and cancelled appointments.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockAppointments.length > 0 ? (
            <ul className="space-y-4">
              {mockAppointments.map(appt => (
                <li key={appt.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-muted/50 transition-colors">
                  <div className="flex-1 mb-3 sm:mb-0">
                    <p className="font-semibold text-lg text-foreground">{appt.doctor} <span className="text-sm text-muted-foreground">({appt.specialty})</span></p>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <CalendarDays className="mr-1.5 h-4 w-4" /> {appt.date}
                        <Clock className="ml-3 mr-1.5 h-4 w-4" /> {appt.time}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusBadgeVariant(appt.status)} text-white text-xs`}>{appt.status}</Badge>
                    {(appt.status === "Approved" || appt.status === "Pending") && (
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {appt.status === "Pending" && <DropdownMenuItem><Edit className="mr-2 h-4 w-4"/>Reschedule</DropdownMenuItem>}
                          <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-500/10"><X className="mr-2 h-4 w-4"/>Cancel Appointment</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
                You have no appointments scheduled.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
