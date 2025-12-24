import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("http") &&
  !supabaseUrl.includes("placeholder") &&
  !supabaseAnonKey.includes("placeholder") &&
  !supabaseUrl.includes("your_supabase") &&
  !supabaseAnonKey.includes("your_supabase");

if (!isSupabaseConfigured) {
  console.warn(
    "Supabase not configured. App will work in demo mode without authentication and data persistence."
  );
  console.warn(
    "To enable full features, add your Supabase credentials to .env.local file."
  );
}

let supabase: ReturnType<typeof createClient> | null = null;

if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
