import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/src/lib/supabase/env";

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
