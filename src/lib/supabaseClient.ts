
import { createClient } from '@supabase/supabase-js';

console.log("[SupabaseClient] Module loaded. Attempting to load Supabase environment variables...");

// The Supabase URL is hardcoded as per a previous request.
// For production, this should also come from an environment variable.
const supabaseUrl = "https://mzlqdximyrnzneeclwzf.supabase.co";

// The Supabase anon key is hardcoded here as requested.
// IMPORTANT: For production, it's STRONGLY recommended to use an environment variable
// (e.g., NEXT_PUBLIC_SUPABASE_ANON_KEY in a .env.local file) instead of hardcoding.
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bHFkeGlteXJuem5lZWNsd3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NTQxNjksImV4cCI6MjA2NDAzMDE2OX0.TDT2FLnvT3qRy8vWXBeJnKYhQsvC6prndj3qVUnGMpA";

if (!supabaseUrl) {
  // This check is less critical now as the URL is hardcoded, but kept for structure
  throw new Error("CRITICAL: Supabase URL is somehow still not defined even when hardcoded. This is unexpected.");
}

if (!supabaseAnonKey || supabaseAnonKey === "YOUR_ANON_KEY_PLACEHOLDER_ENSURE_ENV_IS_SET") {
  // This block should ideally not be reached if the key is hardcoded above correctly.
  console.error(
    "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  );
  console.error(
    "[SupabaseClient] CRITICAL ERROR: The hardcoded Supabase anon key is missing or is still the placeholder value."
  );
  console.error(
    "[SupabaseClient] Please ensure the 'supabaseAnonKey' variable in 'src/lib/supabaseClient.ts' is set to your actual Supabase public anon key."
  );
  console.error(
    "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  );
  throw new Error(
    "CRITICAL ERROR in src/lib/supabaseClient.ts: Hardcoded Supabase anon key is missing or invalid. Please check the variable in the file."
  );
}

const keyStart = supabaseAnonKey.substring(0, 5);
const keyEnd = supabaseAnonKey.substring(supabaseAnonKey.length - 5);
console.log(
  `[SupabaseClient] Initializing with Supabase URL: ${supabaseUrl}`
);
console.log(
  `[SupabaseClient] USING HARDCODED Supabase anon key. Key starts with: "${keyStart}..." and ends with: "...${keyEnd}"`
);


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
    