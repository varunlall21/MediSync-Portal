
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Stethoscope, CalendarDays, ShieldCheck, Activity, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Total Users", value: "1,250", icon: Users, color: "text-sky-500 dark:text-sky-400", link: "/admin/users" },
    { title: "Active Doctors", value: "75", icon: Stethoscope, color: "text-green-500 dark:text-green-400", link: "/admin/doctors" },
    { title: "Pending Appointments", value: "32", icon: CalendarDays, color: "text-yellow-500 dark:text-yellow-400", link: "/admin/appointments" },
    { title: "System Health", value: "Optimal", icon: ShieldCheck, color: "text-teal-500 dark:text-teal-400", link: "#" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <Button asChild className="transition-all duration-300 hover:shadow-lg active:scale-95">
          <Link href="/admin/users?action=add"> 
            <Users className="mr-2 h-4 w-4" /> Add New User
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
              <p className="text-xs text-muted-foreground pt-1">
                <Link href={stat.link} className="hover:underline hover:text-primary">
                  View Details &rarr;
                </Link>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg hover:shadow-xl dark:hover:shadow-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center"><Activity className="mr-2 h-5 w-5 text-primary" /> Recent Activity</CardTitle>
            <CardDescription>Overview of recent portal activities.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              {[
                "Dr. Smith updated a patient record.",
                "New patient 'Jane Doe' registered.",
                "Appointment for 'John Wick' approved.",
                "Admin role assigned to 'admin@example.com'."
              ].map((activity, i) => (
                <li key={i} className="flex items-center p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <span className="mr-2 h-2 w-2 rounded-full bg-accent"></span>
                  {activity}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl dark:hover:shadow-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" /> Quick Reports</CardTitle>
            <CardDescription>Access common system reports.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start hover:border-primary transition-all duration-300 hover:shadow-md active:scale-95">User Activity Report</Button>
            <Button variant="outline" className="w-full justify-start hover:border-primary transition-all duration-300 hover:shadow-md active:scale-95">Appointment Statistics</Button>
            <Button variant="outline" className="w-full justify-start hover:border-primary transition-all duration-300 hover:shadow-md active:scale-95">Doctor Performance</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
