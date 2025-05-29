
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mzlqdximyrnzneeclwzf.supabase.co"; // Directly using the provided URL
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  // This check is less critical now as the URL is hardcoded, but kept for structure
  throw new Error("Supabase URL is somehow still not defined even when hardcoded. This is unexpected.");
}

if (!supabaseAnonKey) {
  console.warn(
    "Supabase anon key not found in environment variables (NEXT_PUBLIC_SUPABASE_ANON_KEY). " +
    "Using a placeholder key. Supabase functionality will be limited or fail. " +
    "Please set your actual anon key in .env.local and restart the server."
  );
  supabaseAnonKey = "YOUR_PLACEHOLDER_SUPABASE_ANON_KEY"; // THIS IS A PLACEHOLDER
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
