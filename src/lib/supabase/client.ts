import { createClient } from '@supabase/supabase-js';

/**
 * Returns public Supabase client using anonymous key for read operations (subject to RLS).
 */
export function getSupabasePublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Returns server-only admin Supabase client using service role key for privileged writes.
 */
export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

// Backwards compatibility aliases
export const getSupabaseClient = getSupabasePublicClient;
export const getSupabaseAdmin = getSupabaseAdminClient;
