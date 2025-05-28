
'use client'; // Since it uses localStorage

export interface Appointment {
  id: string;
  patientName: string; 
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string; // Store as YYYY-MM-DD
  time: string;
  reason?: string;
  status: "Pending" | "Approved" | "Cancelled" | "Completed";
  bookedAt: string; // ISO string for when it was booked
}

const APPOINTMENTS_STORAGE_KEY = 'mediSyncAppointments';

export const getAppointments = (): Appointment[] => {
  if (typeof window === 'undefined') return [];
  try {
    const storedAppointments = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    return storedAppointments ? JSON.parse(storedAppointments) : [];
  } catch (error) {
    console.error("Error reading appointments from localStorage:", error);
    return [];
  }
};

export const saveAppointments = (appointments: Appointment[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
  } catch (error)
    {
    console.error("Error saving appointments to localStorage:", error);
  }
};

export const addAppointmentEntry = (newAppointmentData: {
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string; // YYYY-MM-DD
  time: string;
  reason?: string;
}): Appointment => {
  const appointments = getAppointments();
  const appointmentWithMeta: Appointment = {
    ...newAppointmentData,
    id: `appt_${new Date().getTime()}_${Math.random().toString(36).substring(2, 7)}`,
    status: 'Pending',
    bookedAt: new Date().toISOString(),
  };
  const updatedAppointments = [...appointments, appointmentWithMeta];
  saveAppointments(updatedAppointments);
  return appointmentWithMeta;
};

export const updateAppointmentStatusEntry = (appointmentId: string, newStatus: Appointment['status']): Appointment | undefined => {
  let appointments = getAppointments();
  let updatedAppointment: Appointment | undefined;
  appointments = appointments.map(appt => {
    if (appt.id === appointmentId) {
      updatedAppointment = { ...appt, status: newStatus };
      return updatedAppointment;
    }
    return appt;
  });
  if (updatedAppointment) {
    saveAppointments(appointments);
  }
  return updatedAppointment;
};

export interface DoctorInfo {
    id: string;
    name: string;
    specialty: string;
}

export const mockDoctorsList: DoctorInfo[] = [
  { id: "d1", name: "Dr. Emily Carter", specialty: "Cardiology" },
  { id: "d2", name: "Dr. Johnathan Lee", specialty: "Pediatrics" },
  { id: "d3", name: "Dr. Sarah Miller", specialty: "Dermatology" },
  { id: "d4", name: "Dr. David Wilson", specialty: "Neurology" },
];
