
'use client';

import { supabase } from './supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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
  console.log("[AppointmentService] Attempting to fetch doctors from Supabase...");
  try {
    const { data, error, status, count } = await supabase
      .from(DOCTORS_TABLE)
      .select('*', { count: 'exact' }) // Request count for debugging
      .order('name', { ascending: true });

    if (error) {
      let errorMessage = `Error fetching doctors from Supabase. Status: ${status}. Error: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`;
      if (status === 401) {
        errorMessage += `\n\n[DEVELOPER HINT] A 401 error (Invalid API Key) means the Supabase anon key used by the application (likely NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local or hardcoded in supabaseClient.ts) is INCORRECT for your Supabase project or your server hasn't been restarted after changing it. Please verify the key *value* in your Supabase project API settings and ensure it's correctly set.`;
      } else if (status === 404) {
         errorMessage += `\n\n[DEVELOPER HINT] A 404 error likely means the table '${DOCTORS_TABLE}' was not found. Please ensure the table exists in your Supabase project.`;
      } else {
        errorMessage += `\n\n[DEVELOPER HINT] This could be due to network issues, incorrect table name ('${DOCTORS_TABLE}'), or Row Level Security (RLS) policies preventing access. Data received (if any): ${JSON.stringify(data)}. Count: ${count}`;
      }
      console.error(errorMessage);
      throw new Error(errorMessage); // Re-throw a new error with the composed message
    }
    
    console.log(`[AppointmentService] Successfully fetched ${data?.length || 0} doctors. Supabase reported count: ${count}.`);
    if (data && data.length === 0 && count === 0) {
      console.log(`[AppointmentService] No doctors found in the '${DOCTORS_TABLE}' table.`);
    } else if (data && data.length === 0 && (count || 0) > 0) {
      console.warn(`[AppointmentService] Fetched 0 doctors, but Supabase count is ${count}. This strongly suggests RLS policies are filtering out all records for the current user.`);
    }
    return data || [];
  } catch (caughtError: any) {
    // Ensure the error message is a string
    const errorMessage = caughtError.message || `An unexpected error occurred in getDoctors: ${JSON.stringify(caughtError)}`;
    console.error(
        `[AppointmentService] Exception in getDoctors service function: ${errorMessage}`
    );
    throw new Error(errorMessage); // Re-throw to be caught by the calling component
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
                errorMessage += `\n\n[DEVELOPER HINT] A 401 error (Invalid API Key) means the Supabase anon key is incorrect. Please check supabaseClient.ts and/or your .env.local file and restart the server.`;
            } else if (status === 403) {
                 errorMessage += `\n\n[DEVELOPER HINT] A 403 error (Forbidden) likely means Row Level Security (RLS) policies are preventing this user from inserting into the '${DOCTORS_TABLE}' table. Ensure an INSERT policy exists for this user's role.`;
            }
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
        return data;
    } catch (caughtError: any)
     {
        const errorMessage = caughtError.message || `An unexpected error occurred in addDoctorEntry: ${JSON.stringify(caughtError)}`;
        console.error(`[AppointmentService] Exception in addDoctorEntry: ${errorMessage}`);
        throw new Error(errorMessage);
    }
};


// --- Appointment Service Functions ---

export const getAppointments = async (): Promise<Appointment[]> => {
  console.log("[AppointmentService] Attempting to fetch appointments...");
  try {
    const { data, error, status, count } = await supabase
      .from(APPOINTMENTS_TABLE)
      .select('*', { count: 'exact' })
      .order('booked_at', { ascending: false });

    if (error) {
      let errorMessage = `Error fetching appointments from Supabase. Status: ${status}. Error: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`;
      if (status === 401) {
        errorMessage += `\n\n[DEVELOPER HINT] A 401 error (Invalid API Key) means the Supabase anon key is incorrect. Please check supabaseClient.ts and/or your .env.local file and restart the server.`;
      } else {
         errorMessage += `\n\n[DEVELOPER HINT] This could be due to network issues, incorrect table name ('${APPOINTMENTS_TABLE}'), or Row Level Security (RLS) policies preventing access. Count: ${count}. Data: ${JSON.stringify(data)}`;
      }
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    console.log(`[AppointmentService] Successfully fetched ${data?.length || 0} appointments. Supabase reported count: ${count}.`);
     if (data && data.length === 0 && (count || 0) > 0) {
      console.warn(`[AppointmentService] Fetched 0 appointments, but Supabase count is ${count}. This strongly suggests RLS policies are filtering out all records for the current user.`);
    }
    return data || [];
  } catch (caughtError: any) {
     const errorMessage = caughtError.message || `An unexpected error occurred in getAppointments: ${JSON.stringify(caughtError)}`;
    console.error(
        `[AppointmentService] Exception in getAppointments: ${errorMessage}`
    );
    throw new Error(errorMessage);
  }
};

export const addAppointmentEntry = async (newAppointmentData: NewAppointmentData): Promise<Appointment | null> => {
  try {
    const appointmentToInsert = {
      ...newAppointmentData,
      status: 'Pending' as Appointment['status'], // Default status
    };

    const { data, error, status } = await supabase
      .from(APPOINTMENTS_TABLE)
      .insert([appointmentToInsert])
      .select()
      .single();

    if (error) {
      let errorMessage = `Error adding appointment. Status: ${status}. Error: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`;
      if (status === 401) {
        errorMessage += `\n\n[DEVELOPER HINT] A 401 error (Invalid API Key) means the Supabase anon key is incorrect. Please check supabaseClient.ts and/or your .env.local file and restart the server.`;
      } else if (status === 403) {
        errorMessage += `\n\n[DEVELOPER HINT] A 403 error (Forbidden) likely means Row Level Security (RLS) policies are preventing this user (patient_user_id: ${newAppointmentData.patient_user_id}) from inserting into the '${APPOINTMENTS_TABLE}' table. Ensure an INSERT policy exists for this user.`;
      }
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return data;
  } catch (caughtError: any) {
    const errorMessage = caughtError.message || `An unexpected error occurred in addAppointmentEntry: ${JSON.stringify(caughtError)}`;
    console.error(
        `[AppointmentService] Exception in addAppointmentEntry: ${errorMessage}`
    );
    throw new Error(errorMessage);
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
        errorMessage += `\n\n[DEVELOPER HINT] A 401 error (Invalid API Key) means the Supabase anon key is incorrect. Please check supabaseClient.ts and/or your .env.local file and restart the server.`;
      } else if (status === 403) {
         errorMessage += `\n\n[DEVELOPER HINT] A 403 error (Forbidden) likely means Row Level Security (RLS) policies are preventing this user from updating appointment ${appointmentId}. Ensure an UPDATE policy exists for this user's role and the specific conditions.`;
      }
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return data;
  } catch (caughtError: any) {
    const errorMessage = caughtError.message || `An unexpected error occurred in updateAppointmentStatusEntry: ${JSON.stringify(caughtError)}`;
    console.error(
        `[AppointmentService] Exception in updateAppointmentStatusEntry: ${errorMessage}`
    );
    throw new Error(errorMessage);
  }
};
    

    