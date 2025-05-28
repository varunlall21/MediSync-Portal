
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Stethoscope, ClipboardList, UserPlus, BarChartHorizontalBig } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function PatientDashboardPage() {
  const nextAppointment = {
    doctor: "Dr. Emily Carter",
    specialty: "Cardiology",
    time: "Tomorrow, 10:30 AM",
    status: "Approved",
  };

  const quickLinks = [
    { title: "Book New Appointment", href: "/patient/book-appointment", icon: UserPlus },
    { title: "View My Appointments", href: "/patient/appointments", icon: CalendarDays },
    { title: "Access Medical History", href: "/patient/medical-history", icon: ClipboardList },
    { title: "Find a Doctor", href: "/patient/doctors", icon: Stethoscope },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Patient Dashboard</h1>
        <Button asChild className="transition-all duration-300 hover:shadow-md">
          <Link href="/patient/book-appointment">
            <UserPlus className="mr-2 h-4 w-4" /> Book Appointment
          </Link>
        </Button>
      </div>

      {nextAppointment && (
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 
                       bg-gradient-to-br from-[hsl(var(--primary)/0.05)] to-[hsl(var(--accent)/0.05)] 
                       dark:from-[hsl(var(--primary)/0.1)] dark:to-[hsl(var(--accent)/0.1)]
                       border-primary/30 dark:border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <CalendarDays className="mr-3 h-6 w-6 text-primary" />
              Your Next Appointment
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Image 
                src="https://placehold.co/100x100.png" 
                alt={nextAppointment.doctor} 
                width={80} 
                height={80} 
                className="rounded-full border-2 border-muted group-hover:border-primary/50 transition-colors duration-300"
                data-ai-hint="doctor portrait" 
            />
            <div className="flex-1">
              <p className="text-xl font-semibold text-foreground">{nextAppointment.doctor}</p>
              <p className="text-md text-muted-foreground">{nextAppointment.specialty}</p>
              <p className="text-lg text-foreground mt-1">{nextAppointment.time}</p>
            </div>
            <div className="sm:text-right">
              <p className={`text-sm font-medium px-3 py-1 rounded-full ${
                nextAppointment.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-700/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700/30 dark:text-yellow-300'
              }`}>
                Status: {nextAppointment.status}
              </p>
              <Button variant="outline" size="sm" className="mt-3 transition-all duration-300 hover:shadow-md" asChild>
                <Link href="/patient/appointments">Manage Appointment</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center"><BarChartHorizontalBig className="mr-2 h-5 w-5 text-primary" /> Quick Actions</CardTitle>
          <CardDescription>Easily access common portal features.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map((link) => (
            <Button key={link.title} variant="outline" className="w-full justify-start text-base py-6 group hover:border-primary hover:bg-accent/10 dark:hover:bg-accent/5 transition-all duration-300 hover:shadow-sm" asChild>
              <Link href={link.href}>
                <link.icon className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" /> {link.title}
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>
      
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center"><Stethoscope className="mr-2 h-5 w-5 text-primary"/> Health Resources</CardTitle>
          <CardDescription>Find useful health information and tips.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors duration-300 hover:border-accent/50">
                <h3 className="font-semibold text-foreground">Understanding Your Lab Results</h3>
                <p className="text-sm text-muted-foreground mt-1">Learn how to interpret common lab test results.</p>
                <Link href="#" className="text-sm text-primary hover:underline mt-2 inline-block">Read more &rarr;</Link>
            </div>
             <div className="p-4 border rounded-lg hover:bg-muted/50 dark:hover:bg-muted/20 transition-colors duration-300 hover:border-accent/50">
                <h3 className="font-semibold text-foreground">Tips for a Healthy Heart</h3>
                <p className="text-sm text-muted-foreground mt-1">Discover lifestyle changes for better cardiovascular health.</p>
                <Link href="#" className="text-sm text-primary hover:underline mt-2 inline-block">Read more &rarr;</Link>
            </div>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
