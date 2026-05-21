export function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

export function matchesSearch(value: string, query: string) {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) {
    return true;
  }

  return normalizeSearchValue(value).includes(normalizedQuery);
}
