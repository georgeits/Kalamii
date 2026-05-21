import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/src/lib/supabase/env";

export function createAdminClient() {
  const { supabaseUrl, serviceRoleKey } = getSupabaseEnv();

  if (!serviceRoleKey) {
    throw new Error("Supabase admin environment variables are not configured.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
