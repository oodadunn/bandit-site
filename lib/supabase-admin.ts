import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role key.
// Bypasses RLS — use ONLY in server routes that have already
// authenticated the request (e.g. admin API routes that check the
// bandit-admin cookie).
//
// Required env vars (set in Vercel):
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY  (copy from Supabase dashboard → Settings → API)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // fallback so build doesn't crash

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  cached = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
