
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
    const { data, error, status } = await supabase
      .from(DOCTORS_TABLE)
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      let errorMessage = `Error fetching doctors from Supabase. Status: ${status}. Error: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`;
      if (status === 401) {
        errorMessage += "\n\n[DEVELOPER HINT] A 401 error (Invalid API Key) means the NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file is incorrect or your server hasn't been restarted after changing it. Please verify the key in your Supabase project API settings and ensure it's correctly set in .env.local.";
      }
      console.error(errorMessage);
      throw error; // Re-throw the error to be caught by the calling component
    }
    return data || [];
  } catch (caughtError: any) {
    // This block catches errors from the supabase call itself (network, etc.) OR the re-thrown error from above.
    console.error(
        `Exception in getDoctors service function: ${JSON.stringify(caughtError, Object.getOwnPropertyNames(caughtError), 2)}`
    );
    // Re-throw the error so UI components can handle it (e.g., show a toast)
    throw caughtError;
  }
};

export const addDoctorEntry = async (doctorData: NewDoctorData): Promise<DoctorInfo | null> => {
    try {
        const { data, error, status } = await supabase
            .from(DOCTORS_TABLE)
            .insert([
                { ...doctorData }
            ])
            .select()
            .single();

        if (error) {
            let errorMessage = `Error adding doctor. Status: ${status}. Error: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`;
            if (status === 401) {
              errorMessage += "\n\n[DEVELOPER HINT] A 401 error (Invalid API Key) means the NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file is incorrect or your server hasn't been restarted after changing it. Please verify the key in your Supabase project API settings and ensure it's correctly set in .env.local.";
            }
            console.error(errorMessage);
            throw error;
        }
        return data;
    } catch (caughtError: any) {
        console.error('Exception in addDoctorEntry service function:', JSON.stringify(caughtError, Object.getOwnPropertyNames(caughtError), 2));
        throw caughtError;
    }
};


// --- Appointment Service Functions ---

export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const { data, error, status } = await supabase
      .from(APPOINTMENTS_TABLE)
      .select('*')
      .order('booked_at', { ascending: false });

    if (error) {
      let errorMessage = `Error fetching appointments from Supabase. Status: ${status}. Error: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`;
      if (status === 401) {
        errorMessage += "\n\n[DEVELOPER HINT] A 401 error (Invalid API Key) means the NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file is incorrect or your server hasn't been restarted after changing it. Please verify the key in your Supabase project API settings and ensure it's correctly set in .env.local.";
      }
      console.error(errorMessage);
      throw error;
    }
    return data || [];
  } catch (caughtError: any) {
    console.error(
        `Exception in getAppointments service function: ${JSON.stringify(caughtError, Object.getOwnPropertyNames(caughtError), 2)}`
    );
    throw caughtError;
  }
};

export const addAppointmentEntry = async (newAppointmentData: NewAppointmentData): Promise<Appointment | null> => {
  try {
    const appointmentToInsert = {
      ...newAppointmentData,
      status: 'Pending' as Appointment['status'],
    };

    const { data, error, status } = await supabase
      .from(APPOINTMENTS_TABLE)
      .insert([appointmentToInsert])
      .select()
      .single();

    if (error) {
      let errorMessage = `Error adding appointment. Status: ${status}. Error: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`;
      if (status === 401) {
        errorMessage += "\n\n[DEVELOPER HINT] A 401 error (Invalid API Key) means the NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file is incorrect or your server hasn't been restarted after changing it. Please verify the key in your Supabase project API settings and ensure it's correctly set in .env.local.";
      }
      console.error(errorMessage);
      throw error;
    }
    return data;
  } catch (caughtError: any) {
    console.error(
        `Exception in addAppointmentEntry service function: ${JSON.stringify(caughtError, Object.getOwnPropertyNames(caughtError), 2)}`
    );
    throw caughtError;
  }
};

export const updateAppointmentStatusEntry = async (appointmentId: string, newStatus: Appointment['status']): Promise<Appointment | null> => {
  try {
    const { data, error, status } = await supabase
      .from(APPOINTMENTS_TABLE)
      .update({ status: newStatus })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) {
      let errorMessage = `Error updating appointment status. Status: ${status}. Error: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`;
      if (status === 401) {
        errorMessage += "\n\n[DEVELOPER HINT] A 401 error (Invalid API Key) means the NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file is incorrect or your server hasn't been restarted after changing it. Please verify the key in your Supabase project API settings and ensure it's correctly set in .env.local.";
      }
      console.error(errorMessage);
      throw error;
    }
    return data;
  } catch (caughtError: any) {
    console.error(
        `Exception in updateAppointmentStatusEntry service function: ${JSON.stringify(caughtError, Object.getOwnPropertyNames(caughtError), 2)}`
    );
    throw caughtError;
  }
};

    