
'use client';

import { supabase } from './supabaseClient';

// Corresponds to the 'doctors' table in Supabase
export interface DoctorInfo {
  id: string; // uuid from Supabase
  name: string;
  specialty: string;
  created_at: string; // Supabase timestamp
  image_url?: string | null;
}

// Corresponds to the 'appointments' table in Supabase
export interface Appointment {
  id: string; // uuid from Supabase
  patient_name: string;
  patient_user_id: string | null; // User's auth ID
  doctor_id: string; // uuid, foreign key to doctors.id
  doctor_name: string; // Denormalized for easy display
  specialty: string; // Denormalized for easy display
  date: string; // YYYY-MM-DD
  time: string;
  reason?: string | null;
  status: "Pending" | "Approved" | "Cancelled" | "Completed";
  booked_at: string; // Supabase timestamp
}

export interface NewAppointmentData {
  patient_name: string;
  patient_user_id: string | null;
  doctor_id: string;
  doctor_name: string; // Pass this from selected doctor
  specialty: string;   // Pass this from selected doctor
  date: string; // YYYY-MM-DD
  time: string;
  reason?: string;
}

export interface NewDoctorData {
    name: string;
    specialty: string;
    image_url?: string | null;
}


const DOCTORS_TABLE = 'doctors';
const APPOINTMENTS_TABLE = 'appointments';

// --- Doctor Service Functions ---

export const getDoctors = async (): Promise<DoctorInfo[]> => {
  try {
    const { data, error } = await supabase
      .from(DOCTORS_TABLE)
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Supabase getDoctors error:', error);
    return [];
  }
};

export const addDoctorEntry = async (doctorData: NewDoctorData): Promise<DoctorInfo | null> => {
    try {
        const { data, error } = await supabase
            .from(DOCTORS_TABLE)
            .insert([
                { ...doctorData }
            ])
            .select()
            .single(); // Assuming you want the newly created doctor back

        if (error) {
            console.error('Error adding doctor:', error);
            throw error;
        }
        return data;
    } catch (error) {
        console.error('Supabase addDoctor error:', error);
        return null;
    }
};


// --- Appointment Service Functions ---

export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .select('*')
      .order('booked_at', { ascending: false }); // Or by date/time as needed

    if (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Supabase getAppointments error:', error);
    return [];
  }
};

export const addAppointmentEntry = async (newAppointmentData: NewAppointmentData): Promise<Appointment | null> => {
  try {
    // 'id' and 'booked_at' will be handled by Supabase defaults or triggers
    // 'status' will be 'Pending' by default for new appointments
    const appointmentToInsert = {
      ...newAppointmentData,
      status: 'Pending' as Appointment['status'],
      // booked_at is set by Supabase default now()
    };

    const { data, error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .insert([appointmentToInsert])
      .select()
      .single(); // Return the newly created appointment

    if (error) {
      console.error('Error adding appointment:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Supabase addAppointmentEntry error:', error);
    return null;
  }
};

export const updateAppointmentStatusEntry = async (appointmentId: string, newStatus: Appointment['status']): Promise<Appointment | null> => {
  try {
    const { data, error } = await supabase
      .from(APPOINTMENTS_TABLE)
      .update({ status: newStatus })
      .eq('id', appointmentId)
      .select()
      .single(); // Return the updated appointment

    if (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Supabase updateAppointmentStatusEntry error:', error);
    return null;
  }
};
