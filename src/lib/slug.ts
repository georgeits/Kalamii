export function slugifyGeorgian(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"`´]+/g, "")
    .replace(/[^a-z0-9\u10A0-\u10FF\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ensureSlug(value: string, fallback: string) {
  const normalized = slugifyGeorgian(value);
  return normalized || fallback;
}
