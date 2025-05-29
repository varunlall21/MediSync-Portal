
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ClipboardList, Download, FileText, CalendarDays, Paperclip, User } from "lucide-react"; // Changed UserMd to User
import { useToast } from '@/hooks/use-toast';

interface MedicalRecord {
  id: string;
  date: string;
  doctor: string;
  diagnosis: string;
  type: string;
  summary: string;
  fullDetails: string;
  attachments?: string | null;
}

const mockMedicalHistory: MedicalRecord[] = [
  { 
    id: "mh1", 
    date: "2023-07-15", 
    doctor: "Dr. Emily Carter", 
    diagnosis: "Routine Checkup", 
    type: "Consultation Note", 
    summary: "All vitals normal. Discussed diet and exercise.",
    fullDetails: "Patient presented for annual checkup. Blood pressure 120/80, heart rate 70bpm. No acute complaints. Advised on maintaining balanced diet and regular physical activity. Next checkup in one year.",
    attachments: null 
  },
  { 
    id: "mh2", 
    date: "2023-05-10", 
    doctor: "Dr. Lab Tech", 
    diagnosis: "Blood Test Results", 
    type: "Lab Report", 
    summary: "Cholesterol slightly elevated. HDL: 45, LDL: 130.",
    fullDetails: "Complete Blood Count: Within normal limits.\nLipid Panel: Total Cholesterol 210 mg/dL (High), HDL 45 mg/dL, LDL 130 mg/dL (Borderline High), Triglycerides 150 mg/dL. Advised dietary changes and follow-up lipid panel in 3 months.",
    attachments: "lipid_panel_051023.pdf" 
  },
  { 
    id: "mh3", 
    date: "2023-03-01", 
    doctor: "Dr. Johnathan Lee", 
    diagnosis: "Flu Vaccine", 
    type: "Vaccination Record", 
    summary: "Administered annual influenza vaccine.",
    fullDetails: "Patient received the quadrivalent influenza vaccine, lot #XYZ123, administered in the left deltoid. No adverse reactions observed.",
    attachments: null 
  },
];

export default function PatientMedicalHistoryPage() {
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleViewDetails = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleDownloadHistory = () => {
    toast({
      title: "Feature Not Implemented",
      description: "Downloading full medical history as PDF is not yet available.",
    });
  };
  
  const handleDownloadAttachment = (fileName: string | null | undefined) => {
    if (!fileName) return;
    toast({
        title: "Feature Not Implemented",
        description: `Downloading attachment "${fileName}" is not yet available.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">My Medical History</h1>
        <Button variant="outline" onClick={handleDownloadHistory} className="transition-all duration-300 hover:shadow-md active:scale-95">
          <Download className="mr-2 h-4 w-4" /> Download Full History (PDF)
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><ClipboardList className="mr-2 h-5 w-5 text-primary" /> Your Medical Records</CardTitle>
          <CardDescription>A summary of your health records. Click "View Details" for more information.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockMedicalHistory.length > 0 ? (
            <ul className="space-y-6">
              {mockMedicalHistory.map(record => (
                <li key={record.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200 bg-card">
                  <div className="flex flex-col sm:flex-row justify-between items-start">
                    <div className="flex-1 mb-3 sm:mb-0">
                      <p className="font-semibold text-lg text-foreground">{record.diagnosis}</p>
                      <p className="text-sm text-muted-foreground flex items-center mt-1 flex-wrap">
                        <FileText className="mr-1.5 h-4 w-4 flex-shrink-0" /> {record.type}
                        <span className="mx-2 hidden sm:inline">|</span>
                        <CalendarDays className="ml-0 sm:ml-0 mr-1.5 h-4 w-4 flex-shrink-0" /> {record.date}
                        <span className="mx-2 hidden sm:inline">|</span>
                        <User className="ml-0 sm:ml-0 mr-1.5 h-4 w-4 flex-shrink-0" /> By: {record.doctor} {/* Changed UserMd to User */}
                      </p>
                    </div>
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={() => handleViewDetails(record)}
                      className="text-primary hover:underline p-0 sm:px-3 sm:py-1 self-start sm:self-center"
                    >
                      View Details
                    </Button>
                  </div>
                  <p className="text-sm text-foreground mt-2 pt-2 border-t border-border/50">{record.summary}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 p-8 border-2 border-dashed border-border rounded-lg text-center text-muted-foreground">
                No medical records found. Your history will appear here as it's updated by your doctors.
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRecord && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center">
                <ClipboardList className="mr-3 h-6 w-6 text-primary" /> Medical Record Details
              </DialogTitle>
              <DialogDescription>
                Detailed information for diagnosis: {selectedRecord.diagnosis}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 overflow-y-auto px-1 pr-3 flex-grow">
              <div className="grid grid-cols-3 gap-x-4 gap-y-2 items-center">
                <strong className="text-muted-foreground col-span-1 text-right">Date:</strong>
                <p className="col-span-2 text-foreground">{selectedRecord.date}</p>
                
                <strong className="text-muted-foreground col-span-1 text-right">Doctor:</strong>
                <p className="col-span-2 text-foreground">{selectedRecord.doctor}</p>
                
                <strong className="text-muted-foreground col-span-1 text-right">Diagnosis:</strong>
                <p className="col-span-2 text-foreground font-semibold">{selectedRecord.diagnosis}</p>
                
                <strong className="text-muted-foreground col-span-1 text-right">Record Type:</strong>
                <p className="col-span-2 text-foreground">{selectedRecord.type}</p>
              </div>
              
              <div className="space-y-1">
                <strong className="text-muted-foreground">Full Details / Notes:</strong>
                <p className="text-foreground bg-muted/30 p-3 rounded-md whitespace-pre-wrap text-sm">{selectedRecord.fullDetails}</p>
              </div>

              {selectedRecord.attachments && (
                 <div className="space-y-1">
                    <strong className="text-muted-foreground">Attachments:</strong>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDownloadAttachment(selectedRecord.attachments)}
                        className="flex items-center text-sm"
                    >
                        <Paperclip className="mr-2 h-4 w-4" /> {selectedRecord.attachments}
                    </Button>
                </div>
              )}
            </div>
            <DialogFooter className="mt-auto pt-4 border-t">
              <DialogClose asChild>
                <Button type="button" variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
