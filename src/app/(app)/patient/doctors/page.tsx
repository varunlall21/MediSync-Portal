
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stethoscope, Search, Filter, CalendarPlus, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getDoctors, type DoctorInfo } from '@/lib/appointment-service';
import { useToast } from '@/hooks/use-toast';

export default function PatientFindDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const loadDoctors = async () => {
      setIsLoading(true);
      try {
        const fetchedDoctors = await getDoctors();
        setDoctors(fetchedDoctors);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
        toast({ title: "Error", description: "Could not load doctor list.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    loadDoctors();
  }, [toast]);

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading doctors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Find a Doctor</h1>
      
      <Card className="shadow-lg sticky top-[calc(theme(spacing.16)+1px)] z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 dark:bg-background/90">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search by name or specialty..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto transition-all duration-300 hover:shadow-md active:scale-95">
              <Filter className="mr-2 h-4 w-4" /> Filter by Specialty
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDoctors.map(doctor => (
          <Card key={doctor.id} className="shadow-xl hover:shadow-2xl dark:hover:shadow-primary/20 transition-all duration-300 overflow-hidden group">
            <CardHeader className="p-0 relative">
               <Image 
                src={doctor.image_url || `https://placehold.co/400x300.png?text=${doctor.name.charAt(0)}`} 
                alt={doctor.name} 
                width={400} 
                height={300} 
                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-lg" 
                data-ai-hint="doctor portrait"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-lg"></div>
              <div className="absolute bottom-0 left-0 p-4">
                <CardTitle className="text-xl text-primary-foreground flex items-center mb-1">
                  {doctor.name}
                </CardTitle>
                <CardDescription className="text-base text-accent-foreground/80">{doctor.specialty}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Button className="w-full group-hover:bg-accent transition-all duration-300 hover:shadow-md active:scale-95" asChild>
                <Link href={`/patient/book-appointment?doctorId=${doctor.id}`}>
                  <CalendarPlus className="mr-2 h-4 w-4" /> Book Appointment
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
       {filteredDoctors.length === 0 && !isLoading && (
         <div className="mt-4 p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
            No doctors found matching your criteria.
        </div>
       )}
       {doctors.length === 0 && !isLoading && (
         <div className="mt-4 p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
            No doctors are currently available.
        </div>
       )}
    </div>
  );
}
