import { authors as fallbackAuthors, authorProfiles as fallbackAuthorProfiles } from "@/data/authors";
import { genres, literaryPeriods } from "@/data/taxonomy";
import { works as fallbackWorks } from "@/data/works";
import { createClient } from "@/src/lib/supabase/server";

export type AuthorRecord = {
  id: string;
  slug: string;
  name: string;
  period: keyof typeof literaryPeriods;
  movement: string;
  biography: string;
  themes: string[];
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
  created_at?: string;
  updated_at?: string;
};

type WorkWithAuthor = WorkRecord & {
  author: Pick<AuthorRecord, "id" | "name" | "period" | "movement"> | null;
};

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
    .select("id, email, role")
    .eq("id", user.id)
    .maybeSingle();

  return profile;
}

export async function getAuthors() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("authors").select("*").order("name");

  if (error || !data?.length) {
    return fallbackAuthors.map((author, index) => ({
      id: `fallback-author-${index}`,
      ...author,
    }));
  }

  return data as AuthorRecord[];
}

export async function getAuthorBySlug(slug: string) {
  const authors = await getAuthors();
  return authors.find((author) => author.slug === slug) ?? null;
}

export async function getWorks() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("works")
    .select("*, author:authors(id, name, period, movement)")
    .order("title");

  if (error || !data?.length) {
    return fallbackWorks.map((work, index) => {
      const author = fallbackAuthors.find((item) => item.name === work.author);

      return {
        id: `fallback-work-${index}`,
        slug: work.slug,
        title: work.title,
        author_id: `fallback-author-${author ? fallbackAuthors.indexOf(author) : index}`,
        genre: work.genre,
        summary: work.summary,
        themes: work.themes,
        characters: work.characters,
        symbols: work.symbols,
        exam_tips: work.examTips,
        author: author
          ? {
              id: `fallback-author-${fallbackAuthors.indexOf(author)}`,
              name: author.name,
              period: author.period,
              movement: author.movement,
            }
          : null,
      };
    });
  }

  return data as WorkWithAuthor[];
}

export async function getWorkBySlug(slug: string) {
  const works = await getWorks();
  return works.find((work) => work.slug === slug) ?? null;
}

export async function getAuthorsWithWorks() {
  const [authors, works] = await Promise.all([getAuthors(), getWorks()]);

  return authors.map((author) => ({
    ...author,
    periodLabel: literaryPeriods[author.period],
    works: works
      .filter((work) => work.author?.id === author.id)
      .map((work) => ({
        ...work,
        genreLabel: genres[work.genre],
      })),
  }));
}

export async function getAuthorDetail(slug: string) {
  const authors = await getAuthorsWithWorks();
  return authors.find((author) => author.slug === slug) ?? null;
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
  }));
}

export async function getWorkDetail(slug: string) {
  const works = await getWorkProfiles();
  return works.find((work) => work.slug === slug) ?? null;
}

export function getAuthorPeriodOptions() {
  return Object.entries(literaryPeriods).map(([value, label]) => ({ value, label }));
}

export function getGenreOptions() {
  return Object.entries(genres).map(([value, label]) => ({ value, label }));
}

export function getFallbackAuthorProfiles() {
  return fallbackAuthorProfiles;
}
