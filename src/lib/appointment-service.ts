
'use client';

import { supabase } from './supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Corresponds to the 'doctors' table in Supabase
export interface DoctorInfo {
  id: string; // uuid from Supabase, primary key of doctors table
  name: string;
  specialty?: string | null | undefined;
  created_at: string; // Supabase timestamp
  image_url?: string | null;
  auth_user_id?: string | null; // Foreign key to Supabase auth.users.id
}

// Corresponds to the 'appointments' table in Supabase
export interface Appointment {
  id: string; // uuid from Supabase
  patient_name: string;
  patient_user_id: string | null; // User's auth ID
  doctor_id: string; // uuid, foreign key to doctors.id
  doctor_name: string; // Denormalized for easy display
  specialty: string; // Denormalized
  date: string; // YYYY-MM-DD
  time: string;
  reason?: string | null;
  status: "Pending" | "Approved" | "Cancelled" | "Completed";
  booked_at: string; // Supabase timestamp
  doctor_image_url?: string | null;
}

export interface NewAppointmentData {
  patient_name: string;
  patient_user_id: string | null;
  doctor_id: string;
  doctor_name: string;
  specialty: string;
  date: string;
  time: string;
  reason?: string;
  doctor_image_url?: string | null;
}

export interface NewDoctorData {
    name: string;
    specialty: string;
    image_url?: string | null;
    auth_user_id?: string | null; // To link to an auth user if needed
}


const DOCTORS_TABLE = 'doctors';
const APPOINTMENTS_TABLE = 'appointments';

// --- Doctor Service Functions ---

export const getDoctors = async (): Promise<DoctorInfo[]> => {
  console.log("[AppointmentService] Attempting to fetch doctors from Supabase...");
  try {
    const { data, error, status, count } = await supabase
      .from(DOCTORS_TABLE)
      .select('*', { count: 'exact' })
      .order('name', { ascending: true });

    if (error) {
      let errorMessage = `Error fetching doctors from Supabase. Status: ${status}. Error: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`;
      if (status === 401) {
        errorMessage += `\n\n[DEVELOPER HINT] A 401 error (Invalid API Key) means the value of NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file is incorrect for your Supabase project or your server hasn't been restarted after changing it. Please verify the key *value* in your Supabase project API settings and ensure it's correctly set in .env.local. The key being used by the client starts with "${(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'undefined_or_hardcoded').substring(0,5)}" and ends with "${(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'undefined_or_hardcoded').slice(-5)}"`;
      } else if (status === 404) {
         errorMessage += `\n\n[DEVELOPER HINT] A 404 error likely means the table '${DOCTORS_TABLE}' was not found. Please ensure the table exists in your Supabase project.`;
      } else {
        errorMessage += `\n\n[DEVELOPER HINT] This could be due to network issues, incorrect table name ('${DOCTORS_TABLE}'), or Row Level Security (RLS) policies preventing access. Data received (if any): ${JSON.stringify(data)}. Count: ${count}`;
      }
      console.error(errorMessage);
      throw error; // Re-throw the original Supabase error object
    }
    
    console.log(`[AppointmentService] Successfully fetched ${data?.length || 0} doctors. Supabase reported count: ${count}.`);
    
    if (data && data.length > 0) {
      console.log("[AppointmentService] First few fetched doctor records (raw from Supabase):", JSON.stringify(data.slice(0, 3), null, 2));
      
      const mappedData = data.map((doc: any) => {
        const foundSpecialty = doc.specialty || doc.Specialty || doc.speciality || null;
        return {
          ...doc,
          specialty: foundSpecialty,
        };
      });
      console.log("[AppointmentService] First few mapped doctor records (for app use):", JSON.stringify(mappedData.slice(0, 3), null, 2));

      const specialtiesFoundInMappedData = mappedData.some(doc => doc.specialty && typeof doc.specialty === 'string' && doc.specialty.trim() !== '');
      if (!specialtiesFoundInMappedData && mappedData.length > 0) { // Added check for mappedData.length > 0
        console.warn("[AppointmentService] DEVELOPER HINT: Doctors were fetched, but after mapping, the 'specialty' field seems to be missing or empty in the processed data. Check the 'doctors' table schema in Supabase: ensure a column for specialty (e.g., 'specialty', 'Specialty', 'speciality') exists, is of type 'text', and contains data. Also verify RLS policies aren't hiding this column.");
      }
      return mappedData as DoctorInfo[];
    } else if (data && data.length === 0 && (count || 0) > 0) {
      console.warn(`[AppointmentService] Fetched 0 doctors, but Supabase count is ${count}. This strongly suggests RLS policies are filtering out all records for the current user, or the SELECT policy is missing/incorrect for the '${DOCTORS_TABLE}' table.`);
    } else {
      console.log(`[AppointmentService] No doctors found in the '${DOCTORS_TABLE}' table or RLS preventing access.`);
    }
    return [];
  } catch (caughtError: any) {
    // Log the caught error directly. If it has properties, they should be visible.
    // If it's still an empty object, the error being thrown is truly minimal.
    console.error(`[AppointmentService] Exception in getDoctors service function:`, caughtError);
    // Provide more context for common error types
    if (caughtError && caughtError.message && caughtError.message.includes("fetch")) {
        console.error("[AppointmentService] This might be a network issue or a problem reaching the Supabase server.");
    }
    throw caughtError; // Re-throw the error to be handled by the calling component
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
            throw error;
        }
        return data as DoctorInfo;
    } catch (caughtError: any)
     {
        console.error(`[AppointmentService] Exception in addDoctorEntry:`, caughtError);
        throw caughtError;
    }
};

export const getDoctorProfileByAuthUserId = async (authUserId: string): Promise<DoctorInfo | null> => {
  console.log(`[AppointmentService] Attempting to fetch doctor profile for auth_user_id: ${authUserId}`);
  try {
    const { data, error, status } = await supabase
      .from(DOCTORS_TABLE)
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();

    if (error && status !== 406) {
      let errorMessage = `[AppointmentService] Error fetching doctor profile by auth_user_id ${authUserId}. Status: ${status}. Supabase error: message - ${error.message}, code - ${error.code}, details - ${error.details}, hint - ${error.hint}. Full error object: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`;
      console.error(errorMessage);
      throw error;
    }
    
    if (data) {
      console.log(`[AppointmentService] Doctor profile found for auth_user_id ${authUserId}:`, data);
      return data as DoctorInfo;
    } else {
      console.log(`[AppointmentService] No doctor profile found for auth_user_id ${authUserId}. This doctor may need their profile linked in the 'doctors' table.`);
      return null;
    }
  } catch (caughtError: any) {
    // Custom stringify for better error logging
    const getCircularReplacer = () => {
      const seen = new WeakSet();
      return (key: string, value: any) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return "[Circular]";
          }
          seen.add(value);
        }
        return value;
      };
    };
    const errorDetails = {
      message: caughtError.message,
      name: caughtError.name,
      stack: caughtError.stack ? caughtError.stack.split('\n').slice(0, 5).join('\n') : undefined, // First 5 lines of stack
      status: caughtError.status, // Common in Supabase errors
      code: caughtError.code,     // Common in Supabase errors
      details: caughtError.details, // Common in Supabase errors
      hint: caughtError.hint,       // Common in Supabase errors
      fullErrorString: JSON.stringify(caughtError, getCircularReplacer(), 2)
    };
    console.error(`[AppointmentService] Exception in getDoctorProfileByAuthUserId for ${authUserId}:`, errorDetails);
    throw caughtError;
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
        errorMessage += `\n\n[DEVELOPER HINT] A 401 error (Invalid API Key) means the Supabase anon key is incorrect. Please check supabaseClient.ts and/or your .env.local file and restart the server. The key being used by the client starts with "${(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'undefined_or_hardcoded').substring(0,5)}" and ends with "${(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'undefined_or_hardcoded').slice(-5)}"`;
      } else {
         errorMessage += `\n\n[DEVELOPER HINT] This could be due to network issues, incorrect table name ('${APPOINTMENTS_TABLE}'), or Row Level Security (RLS) policies preventing access. Count: ${count}. Data: ${JSON.stringify(data)}`;
      }
      console.error(errorMessage);
      throw error;
    }
    console.log(`[AppointmentService] Successfully fetched ${data?.length || 0} appointments. Supabase reported count: ${count}.`);
     if (data && data.length === 0 && (count || 0) > 0) {
      console.warn(`[AppointmentService] Fetched 0 appointments, but Supabase count is ${count}. This strongly suggests RLS policies are filtering out all records for the current user for the table '${APPOINTMENTS_TABLE}'.`);
    }
    return (data || []) as Appointment[];
  } catch (caughtError: any) {
    console.error(`[AppointmentService] Exception in getAppointments:`, caughtError);
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
        errorMessage += `\n\n[DEVELOPER HINT] A 401 error (Invalid API Key) means the Supabase anon key is incorrect. Please check supabaseClient.ts and/or your .env.local file and restart the server.`;
      } else if (status === 403) {
        errorMessage += `\n\n[DEVELOPER HINT] A 403 error (Forbidden) likely means Row Level Security (RLS) policies are preventing this user (patient_user_id: ${newAppointmentData.patient_user_id}) from inserting into the '${APPOINTMENTS_TABLE}' table. Ensure an INSERT policy exists for this user.`;
      }
      console.error(errorMessage);
      throw error;
    }
    return data as Appointment;
  } catch (caughtError: any) {
    console.error(`[AppointmentService] Exception in addAppointmentEntry:`, caughtError);
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
        errorMessage += `\n\n[DEVELOPER HINT] A 401 error (Invalid API Key) means the Supabase anon key is incorrect. Please check supabaseClient.ts and/or your .env.local file and restart the server.`;
      } else if (status === 403) {
         errorMessage += `\n\n[DEVELOPER HINT] A 403 error (Forbidden) likely means Row Level Security (RLS) policies are preventing this user from updating appointment ${appointmentId}. Ensure an UPDATE policy exists for this user's role and the specific conditions.`;
      }
      console.error(errorMessage);
      throw error;
    }
    return data as Appointment;
  } catch (caughtError: any) {
    console.error(`[AppointmentService] Exception in updateAppointmentStatusEntry:`, caughtError);
    throw caughtError;
  }
};
    
    

    


