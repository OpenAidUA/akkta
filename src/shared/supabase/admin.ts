import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Create a server-side Supabase client using the Service Role key.
 * This MUST only be used in trusted server environments (API routes, workers).
 */
export const createSupabaseAdminClient = (): SupabaseClient => {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable (server-only)');
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
};

export default createSupabaseAdminClient;
