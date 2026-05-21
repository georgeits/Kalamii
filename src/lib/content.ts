import { genres, literaryPeriods } from "@/data/taxonomy";
import { ADMIN_EMAIL, isAdminEmail } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

export type AccessLevel = "free" | "standard" | "premium";

export type QuizQuestion = {
  id?: string;
  question: string;
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
};

export type SummaryChapter = {
  id: string;
  title: string;
  body: string;
};

export type ProfileRecord = {
  id: string;
  full_name: string | null;
  email: string;
  role: "admin" | "user";
};

export type AuthorRecord = {
  id: string;
  slug: string;
  name: string;
  period: keyof typeof literaryPeriods;
  movement: string;
  biography: string;
  themes: string[];
  image_url?: string | null;
  access_level: AccessLevel;
  created_at?: string;
  updated_at?: string;
};

export type WorkRecord = {
  id: string;
  slug: string;
  title: string;
  author_id: string;
  genre: keyof typeof genres;
  summary: string;
  summary_chapters?: SummaryChapter[] | null;
  plan?: string | null;
  analysis?: string | null;
  quiz_data?: QuizQuestion[] | null;
  themes: string[];
  characters: string[];
  symbols: string[];
  exam_tips: string[];
  access_level: AccessLevel;
  created_at?: string;
  updated_at?: string;
};

type WorkWithAuthor = WorkRecord & {
  author: Pick<AuthorRecord, "id" | "name" | "period" | "movement" | "image_url"> | null;
};

type CatalogData = {
  authors: AuthorRecord[];
  works: WorkWithAuthor[];
};

async function loadCatalogData(): Promise<CatalogData> {
  const supabase = await createClient();
  const [{ data: authorsData, error: authorsError }, { data: worksData, error: worksError }] =
    await Promise.all([
      supabase.from("authors").select("*").order("name"),
      supabase
        .from("works")
        .select("*, author:authors(id, name, period, movement, image_url)")
        .order("title"),
    ]);

  if (authorsError || worksError) {
    throw new Error(
      `Supabase catalog load failed: ${authorsError?.message ?? worksError?.message ?? "unknown error"}`,
    );
  }

  const authors = (authorsData ?? []) as AuthorRecord[];
  const works = (worksData ?? []) as WorkWithAuthor[];

  return { authors, works };
}

export function getAccessLevelOptions() {
  return [
    { value: "free", label: "უფასო" },
    { value: "standard", label: "სტანდარტი" },
    { value: "premium", label: "პრემიუმი" },
  ] as const;
}

export function getAccessLevelLabel(accessLevel: AccessLevel) {
  return getAccessLevelOptions().find((item) => item.value === accessLevel)?.label ?? accessLevel;
}

export async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) {
    return {
      ...profile,
      role: profile.role === "admin" || isAdminEmail(profile.email) ? "admin" : "user",
    } as ProfileRecord;
  }

  return {
    id: user.id,
    full_name: (user.user_metadata.full_name as string | undefined) ?? null,
    email: user.email ?? "",
    role: user.email && isAdminEmail(user.email) ? "admin" : "user",
  } satisfies ProfileRecord;
}

export async function getAuthors() {
  const { authors } = await loadCatalogData();
  return authors;
}

export async function getWorks() {
  const { works } = await loadCatalogData();
  return works;
}

export async function getAuthorsWithWorks() {
  const [authors, works] = await Promise.all([getAuthors(), getWorks()]);

  return authors.map((author) => ({
    ...author,
    periodLabel: literaryPeriods[author.period],
    accessLevelLabel: getAccessLevelLabel(author.access_level),
    works: works
      .filter((work) => work.author?.id === author.id)
      .map((work) => ({
        ...work,
        genreLabel: genres[work.genre],
        accessLevelLabel: getAccessLevelLabel(work.access_level),
      })),
  }));
}

export async function getAuthorDetail(slug: string) {
  const authors = await getAuthorsWithWorks();
  return authors.find((item) => item.slug === slug) ?? null;
}

export async function getAuthorById(id: string) {
  const authors = await getAuthors();
  return authors.find((item) => item.id === id) ?? null;
}

export async function getWorkProfiles() {
  const works = await getWorks();

  return works.map((work) => ({
    ...work,
    author: work.author?.name ?? "უცნობი ავტორი",
    authorImageUrl: work.author?.image_url ?? null,
    genreLabel: genres[work.genre],
    periodLabel: work.author ? literaryPeriods[work.author.period] : "",
    movement: work.author?.movement ?? "",
    accessLevelLabel: getAccessLevelLabel(work.access_level),
  }));
}

export async function getWorkDetail(slug: string) {
  const works = await getWorks();
  const work = works.find((item) => item.slug === slug);

  if (!work) {
    return null;
  }

  return {
    ...work,
    author: work.author?.name ?? "უცნობი ავტორი",
    authorImageUrl: work.author?.image_url ?? null,
    genreLabel: genres[work.genre],
    periodLabel: work.author ? literaryPeriods[work.author.period] : "",
    movement: work.author?.movement ?? "",
    accessLevelLabel: getAccessLevelLabel(work.access_level),
  };
}

export async function getWorkById(id: string) {
  const works = await getWorks();
  return works.find((item) => item.id === id) ?? null;
}

export async function getLibraryData() {
  const [authors, works] = await Promise.all([getAuthorsWithWorks(), getWorkProfiles()]);

  return {
    authors,
    works,
    featuredAuthor: authors.find((author) => author.slug === "ilia-chavchavadze") ?? authors[0] ?? null,
  };
}

export function getAuthorPeriodOptions() {
  return Object.entries(literaryPeriods).map(([value, label]) => ({ value, label }));
}

export function getGenreOptions() {
  return Object.entries(genres).map(([value, label]) => ({ value, label }));
}

export { ADMIN_EMAIL };
