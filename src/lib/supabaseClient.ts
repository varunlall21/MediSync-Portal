
import { createClient } from '@supabase/supabase-js';

// The Supabase URL is hardcoded as per a previous request.
// For production, this should also come from an environment variable.
const supabaseUrl = "https://mzlqdximyrnzneeclwzf.supabase.co"; 

// Attempt to get the anon key from environment variables.
const supabaseAnonKeyFromEnv = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseAnonKey: string;

if (supabaseAnonKeyFromEnv) {
  supabaseAnonKey = supabaseAnonKeyFromEnv;
} else {
  console.warn(
    "CRITICAL: Supabase anon key not found in environment variables (NEXT_PUBLIC_SUPABASE_ANON_KEY). " +
    "Using a placeholder key. Supabase functionality will likely be impaired or fail. " +
    "Please set your actual anon key in .env.local and restart your development server."
  );
  // Using a placeholder. Supabase will not work correctly with this.
  supabaseAnonKey = "YOUR_ANON_KEY_PLACEHOLDER_ENSURE_ENV_IS_SET"; 
}

if (!supabaseUrl) {
  // This check is less critical now as the URL is hardcoded, but kept for structure
  throw new Error("CRITICAL: Supabase URL is somehow still not defined even when hardcoded. This is unexpected.");
}

// No explicit check for supabaseAnonKey causing a throw here anymore,
// as we're using a placeholder if it's not found.
// The createClient function itself might fail or subsequent Supabase calls will fail
// if the key is truly invalid or a placeholder.

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
