
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Activity, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function DoctorDashboardPage() {
  const upcomingAppointments = [
    { time: "09:00 AM", patient: "Alice Wonderland", reason: "Follow-up" },
    { time: "10:30 AM", patient: "Bob The Builder", reason: "New Consultation" },
    { time: "02:00 PM", patient: "Charlie Brown", reason: "Routine Checkup" },
  ];

  const stats = [
    { title: "Today's Appointments", value: "12", icon: CalendarDays, color: "text-primary" },
    { title: "Pending Requests", value: "3", icon: Clock, color: "text-yellow-500 dark:text-yellow-400" },
    { title: "Total Patients", value: "157", icon: Users, color: "text-green-500 dark:text-green-400" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Doctor's Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-xl dark:hover:shadow-primary/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="shadow-lg hover:shadow-xl dark:hover:shadow-primary/20 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary" /> Upcoming Appointments</CardTitle>
          <CardDescription>Your schedule for the upcoming hours.</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <ul className="space-y-4">
              {upcomingAppointments.map((appt, index) => (
                <li key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg border bg-card hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors hover:shadow-md">
                  <div>
                    <p className="font-semibold text-foreground">{appt.time} - {appt.patient}</p>
                    <p className="text-sm text-muted-foreground">{appt.reason}</p>
                  </div>
                  <div className="mt-2 sm:mt-0 flex gap-2">
                    <Button size="sm" variant="outline" className="transition-all duration-300 hover:shadow-sm active:scale-95" asChild>
                      <Link href={`/doctor/patients/${appt.patient.toLowerCase().replace(' ','-')}/medical-history`}>View History</Link>
                    </Button>
                    <Button size="sm" className="transition-all duration-300 hover:shadow-sm active:scale-95">Start Consult</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No upcoming appointments scheduled.</p>
          )}
          <div className="mt-6 flex justify-end">
             <Button asChild className="transition-all duration-300 hover:shadow-lg active:scale-95">
                <Link href="/doctor/schedule">View Full Schedule</Link>
             </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl dark:hover:shadow-primary/20 transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center"><Activity className="mr-2 h-5 w-5 text-primary" /> Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button variant="outline" className="w-full justify-start text-base py-6 hover:border-primary transition-all duration-300 hover:shadow-md active:scale-95" asChild>
             <Link href="/doctor/patients">
                <Users className="mr-2 h-5 w-5"/> Manage My Patients
             </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start text-base py-6 hover:border-primary transition-all duration-300 hover:shadow-md active:scale-95" asChild>
            <Link href="/doctor/appointments">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500 dark:text-green-400"/> Approve Appointments
            </Link>
          </Button>
          <Button variant="outline" className="w-full justify-start text-base py-6 hover:border-primary transition-all duration-300 hover:shadow-md active:scale-95" asChild>
             <Link href="/doctor/appointments">
                <XCircle className="mr-2 h-5 w-5 text-red-500 dark:text-red-400"/> Cancel Appointments
            </Link>
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
