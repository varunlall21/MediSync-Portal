
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stethoscope, Search, Filter, CalendarPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const mockDoctors = [
  { id: "d1", name: "Dr. Emily Carter", specialty: "Cardiology", image: "https://placehold.co/150x150.png", dataAiHint: "doctor portrait" },
  { id: "d2", name: "Dr. Johnathan Lee", specialty: "Pediatrics", image: "https://placehold.co/150x150.png", dataAiHint: "doctor portrait" },
  { id: "d3", name: "Dr. Sarah Miller", specialty: "Dermatology", image: "https://placehold.co/150x150.png", dataAiHint: "doctor portrait" },
  { id: "d4", name: "Dr. David Wilson", specialty: "Neurology", image: "https://placehold.co/150x150.png", dataAiHint: "doctor portrait" },
];

export default function PatientFindDoctorsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Find a Doctor</h1>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg bg-card shadow">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or specialty..." className="pl-10" />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" /> Filter by Specialty
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockDoctors.map(doctor => (
          <Card key={doctor.id} className="shadow-lg hover:shadow-primary/20 transition-all duration-300 overflow-hidden group">
            <CardHeader className="p-0">
               <Image 
                src={doctor.image} 
                alt={doctor.name} 
                width={400} 
                height={300} 
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                data-ai-hint={doctor.dataAiHint}
              />
            </CardHeader>
            <CardContent className="p-6">
              <CardTitle className="text-xl flex items-center mb-1">
                <Stethoscope className="mr-2 h-5 w-5 text-primary" /> {doctor.name}
              </CardTitle>
              <CardDescription className="text-base text-accent mb-4">{doctor.specialty}</CardDescription>
              <Button className="w-full group-hover:bg-accent transition-colors" asChild>
                <Link href={`/patient/book-appointment?doctorId=${doctor.id}`}>
                  <CalendarPlus className="mr-2 h-4 w-4" /> Book Appointment
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
       {mockDoctors.length === 0 && (
         <div className="mt-4 p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
            No doctors found matching your criteria.
        </div>
       )}
    </div>
  );
}
