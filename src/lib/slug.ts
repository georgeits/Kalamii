const georgianToLatin: Array<[string, string]> = [
  ["ჭ", "ch"],
  ["ჩ", "ch"],
  ["შ", "sh"],
  ["ც", "ts"],
  ["ძ", "dz"],
  ["წ", "ts"],
  ["ჟ", "zh"],
  ["ხ", "kh"],
  ["ღ", "gh"],
  ["თ", "t"],
  ["ქ", "k"],
  ["ფ", "p"],
  ["ჯ", "j"],
  ["ა", "a"],
  ["ბ", "b"],
  ["გ", "g"],
  ["დ", "d"],
  ["ე", "e"],
  ["ვ", "v"],
  ["ზ", "z"],
  ["ი", "i"],
  ["კ", "k"],
  ["ლ", "l"],
  ["მ", "m"],
  ["ნ", "n"],
  ["ო", "o"],
  ["პ", "p"],
  ["რ", "r"],
  ["ს", "s"],
  ["ტ", "t"],
  ["უ", "u"],
  ["ჟ", "zh"],
  ["ჰ", "h"],
  ["ყ", "q"],
];

export function slugifyGeorgian(value: string) {
  const transliterated = georgianToLatin.reduce(
    (current, [georgian, latin]) => current.replaceAll(georgian, latin),
    value.trim().toLowerCase(),
  );

  return transliterated
    .replace(/['"`´]+/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ensureSlug(value: string, fallback: string) {
  const normalized = slugifyGeorgian(value);
  return normalized || fallback;
}
