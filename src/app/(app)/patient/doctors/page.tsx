
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stethoscope, Search, Filter, CalendarPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const mockDoctors = [
  { id: "d1", name: "Dr. Emily Carter", specialty: "Cardiology", image: "https://placehold.co/400x300.png", dataAiHint: "doctor portrait" },
  { id: "d2", name: "Dr. Johnathan Lee", specialty: "Pediatrics", image: "https://placehold.co/400x300.png", dataAiHint: "doctor smiling" },
  { id: "d3", name: "Dr. Sarah Miller", specialty: "Dermatology", image: "https://placehold.co/400x300.png", dataAiHint: "medical professional" },
  { id: "d4", name: "Dr. David Wilson", specialty: "Neurology", image: "https://placehold.co/400x300.png", dataAiHint: "doctor uniform" },
];

export default function PatientFindDoctorsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Find a Doctor</h1>
      
      <Card className="shadow-md sticky top-[calc(theme(spacing.16)+1px)] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 dark:bg-background/90"> {/* Made search/filter bar sticky */}
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name or specialty..." className="pl-10" />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" /> Filter by Specialty
            </Button>
          </div>
        </CardContent>
      </Card>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> {/* Added sm and xl breakpoints */}
        {mockDoctors.map(doctor => (
          <Card key={doctor.id} className="shadow-lg hover:shadow-xl dark:hover:shadow-primary/20 transition-all duration-300 overflow-hidden group">
            <CardHeader className="p-0 relative">
               <Image 
                src={doctor.image} 
                alt={doctor.name} 
                width={400} 
                height={300} 
                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"  /* Adjusted height */
                data-ai-hint={doctor.dataAiHint}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div> {/* Subtle gradient overlay */}
              <div className="absolute bottom-0 left-0 p-4">
                <CardTitle className="text-xl text-primary-foreground flex items-center mb-1">
                  {/* Icon removed from here for cleaner look on image */}
                  {doctor.name}
                </CardTitle>
                <CardDescription className="text-base text-accent-foreground/80">{doctor.specialty}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4"> {/* Adjusted padding */}
              {/* Button moved inside content for better flow */}
              <Button className="w-full group-hover:bg-accent transition-colors mt-2" asChild>
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
