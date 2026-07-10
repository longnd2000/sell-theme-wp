import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate if variables are present and not placeholders
export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseKey !== 'your-anon-public-key';

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase credentials are not configured. The app will fallback to client-side mockup data. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.'
  );
}

// Safely create the client using placeholders if not configured to avoid application boot crash
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured ? supabaseKey : 'placeholder-key'
);
