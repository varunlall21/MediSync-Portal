
import { createClient } from '@supabase/supabase-js';

console.log("[SupabaseClient] Module loaded. Attempting to load Supabase environment variables...");

// The Supabase URL is hardcoded as per a previous request.
// For production, this should also come from an environment variable.
const supabaseUrl = "https://mzlqdximyrnzneeclwzf.supabase.co";

// Attempt to get the anon key from environment variables.
const supabaseAnonKeyFromEnv = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseAnonKey: string;

if (supabaseAnonKeyFromEnv && supabaseAnonKeyFromEnv.trim() !== "" && supabaseAnonKeyFromEnv !== "YOUR_ANON_KEY_PLACEHOLDER_ENSURE_ENV_IS_SET") {
  supabaseAnonKey = supabaseAnonKeyFromEnv;
  const keyStart = supabaseAnonKey.substring(0, 5);
  const keyEnd = supabaseAnonKey.substring(supabaseAnonKey.length - 5);
  console.log(
    `[SupabaseClient] Initializing with Supabase URL: ${supabaseUrl}`
  );
  console.log(
    `[SupabaseClient] USING NEXT_PUBLIC_SUPABASE_ANON_KEY FROM ENVIRONMENT. Key starts with: "${keyStart}..." and ends with: "...${keyEnd}"`
  );
} else {
  // THIS IS A WORKAROUND - The user should set the key in .env.local
  supabaseAnonKey = "YOUR_ANON_KEY_PLACEHOLDER_ENSURE_ENV_IS_SET"; // Assign a placeholder
  console.warn(
    "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  );
  console.warn(
    "[SupabaseClient] CRITICAL WARNING: NEXT_PUBLIC_SUPABASE_ANON_KEY was not found, was empty, or was the default placeholder in your environment variables."
  );
  console.warn(
    `[SupabaseClient] USING A TEMPORARY HARDCODED PLACEHOLDER ANON KEY: "${supabaseAnonKey.substring(0,10)}..."`
  );
  console.warn(
    "[SupabaseClient] This will likely result in '401 Invalid API key' errors from Supabase if this placeholder is incorrect."
  );
  console.warn(
    "[SupabaseClient] TO FIX THIS PERMANENTLY: "
  );
  console.warn(
    "[SupabaseClient] 1. Ensure a file named '.env.local' exists in your project root."
  );
  console.warn(
    "[SupabaseClient] 2. Add the line: NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_REAL_SUPABASE_ANON_KEY to .env.local."
  );
  console.warn(
    "[SupabaseClient] 3. Replace YOUR_REAL_SUPABASE_ANON_KEY with the actual public anon key from your Supabase project dashboard (Project Settings -> API)."
  );
  console.warn(
    "[SupabaseClient] 4. CRITICAL: You MUST stop and RESTART your Next.js development server after making changes to .env.local."
  );
  console.warn(
    "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  );
}

if (!supabaseUrl) {
  // This check is less critical now as the URL is hardcoded, but kept for structure
  throw new Error("CRITICAL: Supabase URL is somehow still not defined even when hardcoded. This is unexpected.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
    