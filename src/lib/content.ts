import { authors as fallbackAuthors } from "@/data/authors";
import { genres, literaryPeriods } from "@/data/taxonomy";
import { works as fallbackWorks } from "@/data/works";
import { ADMIN_EMAIL, isAdminEmail } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

export type AccessLevel = "free" | "standard" | "premium";

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
  themes: string[];
  characters: string[];
  symbols: string[];
  exam_tips: string[];
  access_level: AccessLevel;
  created_at?: string;
  updated_at?: string;
};

export type SummaryRecord = {
  id: string;
  work_id: string;
  title: string;
  body: string;
  access_level: AccessLevel;
  created_at?: string;
  updated_at?: string;
};

export type StudyMaterialRecord = {
  id: string;
  title: string;
  description: string;
  material_type: string;
  url: string;
  author_id: string | null;
  work_id: string | null;
  access_level: AccessLevel;
  created_at?: string;
  updated_at?: string;
};

type WorkWithAuthor = WorkRecord & {
  author: Pick<AuthorRecord, "id" | "name" | "period" | "movement"> | null;
};

type MaterialWithRelations = StudyMaterialRecord & {
  author: Pick<AuthorRecord, "id" | "name" | "slug"> | null;
  work: Pick<WorkRecord, "id" | "title" | "slug"> | null;
};

function fallbackAuthorRows(): AuthorRecord[] {
  return fallbackAuthors.map((author, index) => ({
    id: `fallback-author-${index}`,
    slug: author.slug,
    name: author.name,
    period: author.period,
    movement: author.movement,
    biography: author.biography,
    themes: author.themes,
    access_level: "free",
  }));
}

function fallbackWorkRows(): WorkWithAuthor[] {
  const authors = fallbackAuthorRows();

  return fallbackWorks.map((work, index) => {
    const author = authors.find((item) => item.name === work.author) ?? null;

    return {
      id: `fallback-work-${index}`,
      slug: work.slug,
      title: work.title,
      author_id: author?.id ?? `fallback-author-${index}`,
      genre: work.genre,
      summary: work.summary,
      themes: work.themes,
      characters: work.characters,
      symbols: work.symbols,
      exam_tips: work.examTips,
      access_level: "free",
      author: author
        ? {
            id: author.id,
            name: author.name,
            period: author.period,
            movement: author.movement,
          }
        : null,
    };
  });
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
      role: (profile.role === "admin" || isAdminEmail(profile.email)) ? "admin" : "user",
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
  const supabase = await createClient();
  const { data, error } = await supabase.from("authors").select("*").order("name");

  if (error || !data?.length) {
    return fallbackAuthorRows();
  }

  return data as AuthorRecord[];
}

export async function getWorks() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("works")
    .select("*, author:authors(id, name, period, movement)")
    .order("title");

  if (error || !data?.length) {
    return fallbackWorkRows();
  }

  return data as WorkWithAuthor[];
}

export async function getSummaries() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("summaries").select("*").order("created_at");

  if (error || !data) {
    return [] as SummaryRecord[];
  }

  return data as SummaryRecord[];
}

export async function getStudyMaterials() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_materials")
    .select("*, author:authors(id, name, slug), work:works(id, title, slug)")
    .order("created_at");

  if (error || !data) {
    return [] as MaterialWithRelations[];
  }

  return data as MaterialWithRelations[];
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
  const [authors, materials] = await Promise.all([getAuthorsWithWorks(), getStudyMaterials()]);
  const author = authors.find((item) => item.slug === slug) ?? null;

  if (!author) {
    return null;
  }

  return {
    ...author,
    materials: materials.filter((material) => material.author?.id === author.id),
  };
}

export async function getWorkProfiles() {
  const works = await getWorks();

  return works.map((work) => ({
    ...work,
    examTips: work.exam_tips,
    author: work.author?.name ?? "უცნობი ავტორი",
    genreLabel: genres[work.genre],
    periodLabel: work.author ? literaryPeriods[work.author.period] : "",
    movement: work.author?.movement ?? "",
    accessLevelLabel: getAccessLevelLabel(work.access_level),
  }));
}

export async function getWorkDetail(slug: string) {
  const [works, summaries, materials] = await Promise.all([getWorks(), getSummaries(), getStudyMaterials()]);
  const work = works.find((item) => item.slug === slug);

  if (!work) {
    return null;
  }

  return {
    ...work,
    examTips: work.exam_tips,
    author: work.author?.name ?? "უცნობი ავტორი",
    genreLabel: genres[work.genre],
    periodLabel: work.author ? literaryPeriods[work.author.period] : "",
    movement: work.author?.movement ?? "",
    accessLevelLabel: getAccessLevelLabel(work.access_level),
    summaries: summaries.filter((summary) => summary.work_id === work.id),
    materials: materials.filter((material) => material.work?.id === work.id || material.work_id === work.id),
  };
}

export async function getLibraryData() {
  const [authors, works, materials] = await Promise.all([
    getAuthorsWithWorks(),
    getWorkProfiles(),
    getStudyMaterials(),
  ]);

  return {
    authors,
    works,
    materials,
    featuredAuthor: authors.find((author) => author.slug === "ilia-chavchavadze") ?? authors[0] ?? null,
  };
}

export function getAuthorPeriodOptions() {
  return Object.entries(literaryPeriods).map(([value, label]) => ({ value, label }));
}

export function getGenreOptions() {
  return Object.entries(genres).map(([value, label]) => ({ value, label }));
}

export function getMaterialTypeOptions() {
  return [
    { value: "summary-sheet", label: "შეჯამების ფაილი" },
    { value: "analysis", label: "ანალიზი" },
    { value: "worksheet", label: "სავარჯიშო" },
    { value: "essay-plan", label: "ესეს გეგმა" },
    { value: "pdf", label: "PDF მასალა" },
  ];
}

export { ADMIN_EMAIL };
