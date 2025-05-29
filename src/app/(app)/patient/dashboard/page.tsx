
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Stethoscope, ClipboardList, UserPlus, BarChartHorizontalBig, HeartPulse, Brain, FileSpreadsheet } from "lucide-react";
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

  const healthResources = [
    { 
      title: "Understanding Your Lab Results", 
      description: "Learn how to interpret common lab test results and what they mean for your health.",
      icon: FileSpreadsheet,
      slug: "understanding-lab-results" 
    },
    { 
      title: "Tips for a Healthy Heart", 
      description: "Discover lifestyle changes and dietary advice for better cardiovascular health.",
      icon: HeartPulse,
      slug: "tips-for-healthy-heart" 
    },
    {
      title: "Managing Stress for Better Wellness",
      description: "Explore techniques for stress reduction and improving your mental well-being.",
      icon: Brain,
      slug: "managing-stress-for-wellness"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Patient Dashboard</h1>
        <Button asChild className="transition-all duration-300 hover:shadow-lg active:scale-95">
          <Link href="/patient/book-appointment">
            <UserPlus className="mr-2 h-4 w-4" /> Book Appointment
          </Link>
        </Button>
      </div>

      {nextAppointment && (
        <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 
                       bg-gradient-to-br from-[hsl(var(--primary)/0.05)] to-[hsl(var(--accent)/0.05)] 
                       dark:from-[hsl(var(--primary)/0.1)] dark:to-[hsl(var(--accent)/0.1)]
                       border-primary/30 dark:border-primary/20 overflow-hidden">
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
              <Button variant="outline" size="sm" className="mt-3 transition-all duration-300 hover:shadow-md active:scale-95" asChild>
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
            <Button 
              key={link.title} 
              variant="outline" 
              className="w-full justify-start text-base py-6 group hover:border-primary hover:bg-accent/10 dark:hover:bg-accent/5 hover:text-foreground transition-all duration-300 hover:shadow-md active:scale-95" 
              asChild
            >
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
           <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-4">
            {healthResources.map((resource, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 dark:hover:bg-muted/20 transition-all duration-300 hover:border-accent/50 hover:shadow-md flex flex-col">
                <div className="flex items-center mb-2">
                  <resource.icon className="h-6 w-6 mr-3 text-primary flex-shrink-0" />
                  <h3 className="font-semibold text-lg text-foreground">{resource.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1 flex-grow">{resource.description}</p>
                <Link href={`/patient/health-resources/${resource.slug}`} className="text-sm text-primary hover:underline mt-3 inline-block self-start group">
                  Read more <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">&rarr;</span>
                </Link>
              </div>
            ))}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}

    