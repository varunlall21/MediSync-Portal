
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

// Mock existing doctors - you might fetch this from a DB
const mockExistingDoctors: Doctor[] = [
  { id: "doc1", name: "Dr. Alice Wonderland", specialty: "Cardiology" },
  { id: "doc2", name: "Dr. Bob The Builder", specialty: "Pediatrics" },
];

export default function ManageDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>(mockExistingDoctors);
  const [isAddDoctorDialogOpen, setIsAddDoctorDialogOpen] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState("");
  const [newDoctorSpecialty, setNewDoctorSpecialty] = useState("");

  const handleAddDoctor = () => {
    if (!newDoctorName || !newDoctorSpecialty) {
      // Basic validation, can be enhanced with toasts or form validation library
      alert("Please enter both name and specialty.");
      return;
    }
    const newDoctor: Doctor = {
      id: `doc${doctors.length + 1}`, // Simple ID generation
      name: newDoctorName,
      specialty: newDoctorSpecialty,
    };
    setDoctors([...doctors, newDoctor]);
    setNewDoctorName("");
    setNewDoctorSpecialty("");
    setIsAddDoctorDialogOpen(false);
    // In a real app, call API to create doctor
  };

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
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDoctorDialogOpen(false)}>Cancel</Button>
              <Button type="submit" onClick={handleAddDoctor}>Add Doctor</Button>
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
