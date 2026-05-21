import { genres, literaryPeriods } from "@/data/taxonomy";
import { getAccessLevelLabel, type AccessLevel } from "@/src/lib/access";
import { ADMIN_EMAIL, isAdminEmail } from "@/src/lib/auth";
import { normalizeSearchValue } from "@/src/lib/search";
import { ensureSlug } from "@/src/lib/slug";
import { createClient } from "@/src/lib/supabase/server";

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
  subscription_plan: AccessLevel;
  subscription_status: "active" | "expired" | "cancelled" | "none";
  subscription_expires_at?: string | null;
};

export type SubscriptionRecord = {
  id: string;
  user_id: string;
  email: string;
  plan: AccessLevel;
  status: "active" | "expired" | "cancelled";
  starts_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  full_name?: string | null;
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
  author: Pick<AuthorRecord, "id" | "name" | "period" | "movement" | "image_url" | "slug"> | null;
};

type CatalogData = {
  authors: AuthorRecord[];
  works: WorkWithAuthor[];
};

type SiteSettingsRecord = {
  featured_author_id: string | null;
};

function isMissingColumnError(message: string, column: string) {
  return message.toLowerCase().includes(`column ${column.toLowerCase()} does not exist`);
}

async function fetchAuthors(supabase: Awaited<ReturnType<typeof createClient>>) {
  const fullResult = await supabase
    .from("authors")
    .select("id, slug, name, period, movement, biography, themes, image_url, access_level, created_at, updated_at")
    .order("name");

  if (!fullResult.error) {
    return ((fullResult.data ?? []) as Array<Record<string, unknown>>).map((author) => ({
      ...(author as unknown as AuthorRecord),
      slug: ensureSlug(String(author.slug ?? author.name ?? ""), `author-${String(author.id ?? "").slice(0, 8)}`),
    })) as AuthorRecord[];
  }

  if (!isMissingColumnError(fullResult.error.message, "authors.image_url")) {
    throw fullResult.error;
  }

  const fallbackResult = await supabase
    .from("authors")
    .select("id, slug, name, period, movement, biography, themes, access_level, created_at, updated_at")
    .order("name");

  if (fallbackResult.error) {
    throw fallbackResult.error;
  }

  return (fallbackResult.data ?? []).map((author) => ({
    ...author,
    slug: ensureSlug(String(author.slug ?? author.name ?? ""), `author-${String(author.id ?? "").slice(0, 8)}`),
    image_url: null,
  })) as AuthorRecord[];
}

async function fetchWorks(supabase: Awaited<ReturnType<typeof createClient>>) {
  const fullResult = await supabase
    .from("works")
    .select("id, slug, title, author_id, genre, summary, summary_chapters, plan, analysis, quiz_data, themes, characters, symbols, exam_tips, access_level, created_at, updated_at, author:authors(id, slug, name, period, movement, image_url)")
    .order("title");

  if (!fullResult.error) {
    return normalizeWorks((fullResult.data ?? []) as Record<string, unknown>[]);
  }

  const fallbackColumns = [
    "works.summary_chapters",
    "works.plan",
    "works.analysis",
    "works.quiz_data",
    "authors.image_url",
  ];

  if (!fallbackColumns.some((column) => isMissingColumnError(fullResult.error.message, column))) {
    throw fullResult.error;
  }

  const fallbackResult = await supabase
    .from("works")
    .select("id, slug, title, author_id, genre, summary, themes, characters, symbols, exam_tips, access_level, created_at, updated_at, author:authors(id, slug, name, period, movement)")
    .order("title");

  if (fallbackResult.error) {
    throw fallbackResult.error;
  }

  return normalizeWorks((fallbackResult.data ?? []) as Record<string, unknown>[]).map((work) => ({
    ...work,
    summary_chapters: [],
    plan: null,
    analysis: null,
    quiz_data: [],
    author: work.author ? { ...work.author, image_url: null } : null,
  }));
}

function normalizeWorks(rows: Record<string, unknown>[]) {
  return rows.map((work) => {
    const authorValue = work.author;
    const authorRecord = Array.isArray(authorValue) ? authorValue[0] : authorValue;

    return {
      ...work,
      slug: ensureSlug(String(work.slug ?? work.title ?? ""), `work-${String(work.id ?? "").slice(0, 8)}`),
      author: authorRecord
        ? {
            id: String((authorRecord as Record<string, unknown>).id ?? ""),
            slug: String((authorRecord as Record<string, unknown>).slug ?? ""),
            name: String((authorRecord as Record<string, unknown>).name ?? ""),
            period: String((authorRecord as Record<string, unknown>).period ?? "") as AuthorRecord["period"],
            movement: String((authorRecord as Record<string, unknown>).movement ?? ""),
            image_url: ((authorRecord as Record<string, unknown>).image_url as string | null | undefined) ?? null,
          }
        : null,
    };
  }) as WorkWithAuthor[];
}

async function loadCatalogData(): Promise<CatalogData> {
  const supabase = await createClient();
  const [authors, works] = await Promise.all([fetchAuthors(supabase), fetchWorks(supabase)]);

  return { authors, works };
}

async function getSiteSettings(): Promise<SiteSettingsRecord | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("featured_author_id")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Site settings query failed", { error: error.message });
      }
      return null;
    }

    return (data as SiteSettingsRecord | null) ?? null;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Site settings lookup failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
    return null;
  }
}

export function getAccessLevelOptions() {
  return [
    { value: "free", label: "უფასო" },
    { value: "standard", label: "სტანდარტი" },
    { value: "premium", label: "პრემიუმი" },
  ] as const;
}

function getSubscriptionState(subscription: {
  plan: AccessLevel;
  status: "active" | "expired" | "cancelled";
  expires_at: string | null;
} | null) {
  if (!subscription) {
    return {
      plan: "free" as AccessLevel,
      status: "none" as const,
      expires_at: null,
    };
  }

  if (subscription.status !== "active") {
    return {
      plan: "free" as AccessLevel,
      status: subscription.status,
      expires_at: subscription.expires_at,
    };
  }

  if (subscription.expires_at && new Date(subscription.expires_at).getTime() < Date.now()) {
    return {
      plan: "free" as AccessLevel,
      status: "expired" as const,
      expires_at: subscription.expires_at,
    };
  }

  return {
    plan: subscription.plan,
    status: subscription.status,
    expires_at: subscription.expires_at,
  };
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
  let subscription: { plan: AccessLevel; status: "active" | "expired" | "cancelled"; expires_at: string | null } | null = null;
  try {
    const { data } = await supabase
      .from("subscriptions")
      .select("plan, status, expires_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    subscription = (data as typeof subscription) ?? null;
  } catch {
    subscription = null;
  }

  const subscriptionState = getSubscriptionState(
    subscription,
  );

  if (profile) {
    return {
      ...profile,
      role: profile.role === "admin" || isAdminEmail(profile.email) ? "admin" : "user",
      subscription_plan: profile.role === "admin" || isAdminEmail(profile.email) ? "premium" : subscriptionState.plan,
      subscription_status: profile.role === "admin" || isAdminEmail(profile.email) ? "active" : subscriptionState.status,
      subscription_expires_at: subscriptionState.expires_at,
    } as ProfileRecord;
  }

  return {
    id: user.id,
    full_name: (user.user_metadata.full_name as string | undefined) ?? null,
    email: user.email ?? "",
    role: user.email && isAdminEmail(user.email) ? "admin" : "user",
    subscription_plan: user.email && isAdminEmail(user.email) ? "premium" : subscriptionState.plan,
    subscription_status: user.email && isAdminEmail(user.email) ? "active" : subscriptionState.status,
    subscription_expires_at: subscriptionState.expires_at,
  } satisfies ProfileRecord;
}

export async function getSubscriptions() {
  const supabase = await createClient();
  const [{ data, error }, { data: profiles }] = await Promise.all([
    supabase
    .from("subscriptions")
    .select("id, user_id, email, plan, status, starts_at, expires_at, created_at, updated_at")
    .order("updated_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name, email"),
  ]);

  if (error) {
    throw new Error(`Subscriptions query failed: ${error.message}`);
  }

  const profileMap = new Map(
    ((profiles ?? []) as Array<{ id: string; full_name: string | null; email: string }>).map((item) => [
      item.id,
      item,
    ]),
  );

  return ((data ?? []) as Array<Record<string, unknown>>).map((item) => ({
    id: String(item.id ?? ""),
    user_id: String(item.user_id ?? ""),
    email: String(item.email ?? ""),
    plan: String(item.plan ?? "free") as AccessLevel,
    status: String(item.status ?? "expired") as SubscriptionRecord["status"],
    starts_at: String(item.starts_at ?? ""),
    expires_at: (item.expires_at as string | null | undefined) ?? null,
    created_at: String(item.created_at ?? ""),
    updated_at: String(item.updated_at ?? ""),
    full_name: profileMap.get(String(item.user_id ?? ""))?.full_name ?? null,
  })) as SubscriptionRecord[];
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
  const normalizedSlug = normalizeSearchValue(slug);
  const author =
    authors.find((item) => normalizeSearchValue(item.slug) === normalizedSlug || item.id === slug) ?? null;

  if (!author && process.env.NODE_ENV !== "production") {
    console.error("Author detail lookup failed", {
      slug,
      availableSlugs: authors.slice(0, 20).map((item) => item.slug),
    });
  }

  return author;
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
    authorSlug: work.author?.slug ?? "",
    authorImageUrl: work.author?.image_url ?? null,
    genreLabel: genres[work.genre],
    periodLabel: work.author ? literaryPeriods[work.author.period] : "",
    movement: work.author?.movement ?? "",
    accessLevelLabel: getAccessLevelLabel(work.access_level),
  }));
}

export async function getWorkDetail(slug: string) {
  const works = await getWorks();
  const normalizedSlug = normalizeSearchValue(slug);
  const work = works.find((item) => normalizeSearchValue(item.slug) === normalizedSlug || item.id === slug);

  if (!work) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Work detail lookup failed", {
        slug,
        availableSlugs: works.slice(0, 30).map((item) => item.slug),
      });
    }
    return null;
  }

  return {
    ...work,
    author: work.author?.name ?? "უცნობი ავტორი",
    authorSlug: work.author?.slug ?? "",
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
  const [authors, works, siteSettings] = await Promise.all([getAuthorsWithWorks(), getWorkProfiles(), getSiteSettings()]);
  const featuredAuthor =
    siteSettings?.featured_author_id
      ? authors.find((author) => author.id === siteSettings.featured_author_id) ?? null
      : null;

  if (process.env.NODE_ENV !== "production" && siteSettings?.featured_author_id && !featuredAuthor) {
    console.error("Featured author setting points to missing author", {
      featuredAuthorId: siteSettings.featured_author_id,
    });
  }

  return {
    authors,
    works,
    featuredAuthor,
    featuredAuthorId: siteSettings?.featured_author_id ?? null,
  };
}

export function getAuthorPeriodOptions() {
  return Object.entries(literaryPeriods).map(([value, label]) => ({ value, label }));
}

export function getGenreOptions() {
  return Object.entries(genres).map(([value, label]) => ({ value, label }));
}

export { ADMIN_EMAIL };
