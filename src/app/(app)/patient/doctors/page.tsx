
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stethoscope, Search, Filter as FilterIcon, CalendarPlus, Loader2, AlertTriangle, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getDoctors, type DoctorInfo } from '@/lib/appointment-service';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PatientFindDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { toast } = useToast();

  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState<string | null>(null);
  const [allSpecialties, setAllSpecialties] = useState<string[]>([]);

  const loadDoctors = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const fetchedDoctors = await getDoctors();
      setDoctors(fetchedDoctors || []);
      if (fetchedDoctors && fetchedDoctors.length > 0) {
        const uniqueSpecs = Array.from(
          new Set(
            fetchedDoctors
              .map(doc => doc.specialty) // doc.specialty might be string, null, or undefined
              .filter(spec => typeof spec === 'string' && spec.trim() !== '') as string[] // Ensure it's a non-empty string
          )
        );
        setAllSpecialties(uniqueSpecs.sort());
      } else {
        setAllSpecialties([]);
      }
    } catch (error: any) {
      console.error("PatientFindDoctorsPage - Failed to fetch doctors:", error.message);
      const detailedError = error.message || "Could not load doctor list. Please check console for more details.";
      setFetchError(detailedError);
      toast({
        title: "Error Loading Doctors",
        description: detailedError,
        variant: "destructive",
        duration: 10000
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);


  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const filteredAndSortedDoctors = useMemo(() => {
    let result = [...doctors];

    if (selectedSpecialtyFilter) {
      result = result.filter(doctor =>
        doctor.specialty && typeof doctor.specialty === 'string' &&
        doctor.specialty.toLowerCase() === selectedSpecialtyFilter.toLowerCase()
      );
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(doctor => {
        const nameMatch = doctor.name && typeof doctor.name === 'string' &&
                          doctor.name.toLowerCase().includes(lowerSearchTerm);
        
        const specialtySearchMatch = !selectedSpecialtyFilter && doctor.specialty &&
                                     typeof doctor.specialty === 'string' &&
                                     doctor.specialty.toLowerCase().includes(lowerSearchTerm);
        return nameMatch || specialtySearchMatch;
      });
    }
    return result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [doctors, searchTerm, selectedSpecialtyFilter]);


  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-3">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Loading available doctors...</p>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto transition-all duration-300 hover:shadow-md active:scale-95">
                  <FilterIcon className="mr-2 h-4 w-4" /> 
                  {selectedSpecialtyFilter ? `Specialty: ${selectedSpecialtyFilter}` : "Filter by Specialty"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px] sm:w-auto">
                <DropdownMenuLabel>Filter by Specialty</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setSelectedSpecialtyFilter(null)}>
                  All Specialties
                </DropdownMenuItem>
                {allSpecialties.map(spec => (
                  <DropdownMenuItem key={spec} onSelect={() => setSelectedSpecialtyFilter(spec)}>
                    {spec}
                  </DropdownMenuItem>
                ))}
                 {allSpecialties.length === 0 && <DropdownMenuItem disabled>No specialties found</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {fetchError && (
        <Card className="border-destructive bg-destructive/10 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" /> Unable to Load Doctors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive/90">
              There was an issue fetching the list of doctors. Please try again later.
            </p>
            <p className="mt-2 text-xs text-destructive/70">
              Details: {fetchError}
            </p>
             <p className="mt-2 text-xs text-destructive/70">
              This could be due to network issues, database configuration, or Row Level Security policies if data is expected. Check the browser console for more technical details from the "AppointmentService".
            </p>
          </CardContent>
        </Card>
      )}

      {!fetchError && doctors.length === 0 && !isLoading && (
         <div className="mt-8 p-10 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
            <Stethoscope className="mx-auto h-12 w-12 mb-4 text-primary/50" />
            <h3 className="text-xl font-semibold mb-2">No Doctors Available</h3>
            <p>No doctors are currently listed in the system, or none match your current filters.</p>
            <p className="text-sm mt-1">If you believe this is an error, please contact support or check RLS policies if data is expected. You can also try adding doctors via the Admin dashboard.</p>
        </div>
       )}

      {!fetchError && doctors.length > 0 && filteredAndSortedDoctors.length === 0 && !isLoading && ( 
         <div className="mt-8 p-10 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
            <Search className="mx-auto h-12 w-12 mb-4 text-primary/50" />
            <h3 className="text-xl font-semibold mb-2">No Doctors Found</h3>
            <p>No doctors found matching your search criteria "{searchTerm}" {selectedSpecialtyFilter ? `and specialty "${selectedSpecialtyFilter}"` : ""}. Try different search terms or filters.</p>
        </div>
       )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedDoctors.map(doctor => (
          <Card key={doctor.id} className="shadow-xl hover:shadow-2xl dark:hover:shadow-primary/20 transition-all duration-300 overflow-hidden group flex flex-col">
            <CardHeader className="p-0 relative">
               <Image 
                src={doctor.image_url || `https://placehold.co/400x300.png?text=${doctor.name ? doctor.name.charAt(0) : 'D'}`} 
                alt={doctor.name || 'Doctor'} 
                width={400} 
                height={300} 
                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-lg" 
                data-ai-hint="doctor portrait"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-lg"></div>
              <div className="absolute bottom-0 left-0 p-4 w-full">
                <CardTitle className="text-xl text-primary-foreground flex items-center mb-0.5 truncate" title={doctor.name || 'N/A'}>
                  {doctor.name || 'N/A'}
                </CardTitle>
                <CardDescription className="text-sm text-accent-foreground/90 truncate" title={doctor.specialty || 'N/A'}>
                  {doctor.specialty || 'N/A'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow flex flex-col justify-end">
              <Button className="w-full group-hover:bg-accent transition-all duration-300 hover:shadow-md active:scale-95 mt-auto" asChild>
                <Link href={`/patient/book-appointment?doctorId=${doctor.id}`}>
                  <CalendarPlus className="mr-2 h-4 w-4" /> Book Appointment
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


    