import { createClient } from '@supabase/supabase-js';

// Fallbacks are safe to embed: the URL is public and the anon key is the
// browser-scoped public key (data protection comes from row-level security).
// They keep the deployed app working when Vercel env vars are not configured.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://iqdpixaahrcqsvmuolpb.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxZHBpeGFhaHJjcXN2bXVvbHBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyMjgzNzIsImV4cCI6MjEwNzgwNDM3Mn0.QpvqDOZ6OZLQd6GXaUNfECwX6DLmDCgcBRI1qNc2kPU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
