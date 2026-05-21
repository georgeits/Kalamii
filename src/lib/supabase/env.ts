function cleanEnvValue(value: string | undefined, label: string) {
  const normalized = value?.replace(/^['"]|['"]$/g, "").trim();

  if (!normalized) {
    throw new Error(`${label} is not configured.`);
  }

  const contaminationPatterns = [
    /\s+NEXT_PUBLIC_[A-Z0-9_]+=.+$/u,
    /\s+SUPABASE_[A-Z0-9_]+=.+$/u,
    /\s+[A-Z0-9_]+=https?:\/\/.+$/u,
  ];

  for (const pattern of contaminationPatterns) {
    const match = normalized.match(pattern);
    if (match?.index !== undefined) {
      return normalized.slice(0, match.index).trim();
    }
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
