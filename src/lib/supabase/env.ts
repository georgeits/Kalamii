function cleanEnvValue(value: string | undefined, label: string) {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`${label} is not configured.`);
  }

  // Guard against accidentally concatenated env vars such as:
  // "<jwt> NEXT_PUBLIC_SITE_URL=https://..."
  const contaminatedIndex = normalized.indexOf(" NEXT_PUBLIC_");
  if (contaminatedIndex >= 0) {
    return normalized.slice(0, contaminatedIndex).trim();
  }

  return normalized;
}

export function getSupabaseEnv() {
  return {
    supabaseUrl: cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY")
      : undefined,
  };
}
