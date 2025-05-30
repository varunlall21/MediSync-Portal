
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, UserPlus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getDoctors, addDoctorEntry, type DoctorInfo, type NewDoctorData } from '@/lib/appointment-service';
import { useToast } from '@/hooks/use-toast';

export default function ManageDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDoctorDialogOpen, setIsAddDoctorDialogOpen] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState("");
  const [newDoctorSpecialty, setNewDoctorSpecialty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchDoctors = useCallback(async () => {
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
  }, [toast]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleAddDoctor = async () => {
    if (!newDoctorName || !newDoctorSpecialty) {
      toast({ title: "Validation Error", description: "Please enter both name and specialty.", variant: "destructive"});
      return;
    }
    setIsSubmitting(true);
    const newDoctorData: NewDoctorData = {
      name: newDoctorName,
      specialty: newDoctorSpecialty,
    };

    
    try {
      const addedDoctor = await addDoctorEntry(newDoctorData);
      if (addedDoctor) {
        // setDoctors(prevDoctors => [...prevDoctors, addedDoctor]); // Add to local state
        await fetchDoctors(); // Or re-fetch the list
        toast({ title: "Doctor Added", description: `${addedDoctor.name} has been added successfully.` });
        setNewDoctorName("");
        setNewDoctorSpecialty("");
        setIsAddDoctorDialogOpen(false);
      } else {
        throw new Error("Failed to add doctor to database.");
      }
    } catch (error) {
      console.error("Add doctor error:", error);
      toast({ title: "Error Adding Doctor", description: "Could not add new doctor. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Manage Doctors</h1>
        <Dialog open={isAddDoctorDialogOpen} onOpenChange={setIsAddDoctorDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Add New Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
              <DialogDescription>
                Enter the details for the new doctor.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doctorName" className="text-right">
                  Name
                </Label>
                <Input 
                  id="doctorName" 
                  value={newDoctorName} 
                  onChange={(e) => setNewDoctorName(e.target.value)} 
                  className="col-span-3" 
                  placeholder="e.g., Dr. Jane Doe" 
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="specialty" className="text-right">
                  Specialty
                </Label>
                <Input 
                  id="specialty" 
                  value={newDoctorSpecialty} 
                  onChange={(e) => setNewDoctorSpecialty(e.target.value)} 
                  className="col-span-3" 
                  placeholder="e.g., Cardiology" 
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDoctorDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" onClick={handleAddDoctor} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Doctor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Stethoscope className="mr-2 h-5 w-5 text-primary" /> Doctor List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Doctor management interface. Admins can edit doctor details and assign specialties.</p>
          {doctors.length > 0 ? (
            <ul className="space-y-3">
              {doctors.map(doc => (
                <li key={doc.id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-semibold text-foreground">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">{doc.specialty}</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>Edit</Button> {/* Edit functionality can be added later */}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
              No doctors added yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
