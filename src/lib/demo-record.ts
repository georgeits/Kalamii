export const DEMO_RECORD_MESSAGE =
  "ეს ჩანაწერი ჯერ ბაზაში არ არსებობს. ჯერ შექმენით /admin-იდან.";

export function isDemoRecord(record: { is_demo?: boolean; id: string }) {
  return Boolean(record.is_demo) || record.id.startsWith("fallback-");
}
