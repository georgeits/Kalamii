import { genres, literaryPeriods } from "@/data/taxonomy";
import { getAccessLevelLabel, type AccessLevel } from "@/src/lib/access";
import { ADMIN_EMAIL, isAdminEmail } from "@/src/lib/auth";
import { normalizeExerciseSets, type ExerciseProgressRecord, type ExerciseSet } from "@/src/lib/exercises";
import { PLAN_PRICES, type PaidPlan } from "@/src/lib/plans";
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

export type PaymentRequestRecord = {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  plan: PaidPlan;
  amount: number;
  receipt_url: string;
  receipt_signed_url?: string | null;
  comment: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
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
  exercise_data?: ExerciseSet[] | null;
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

function parseJsonArray<T>(value: unknown): T[] | null {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : null;
    } catch {
      return null;
    }
  }

  return null;
}

function normalizeSummaryChapters(value: unknown): SummaryChapter[] {
  return parseJsonArray<SummaryChapter>(value) ?? [];
}

function normalizeQuizData(value: unknown): QuizQuestion[] {
  return parseJsonArray<QuizQuestion>(value) ?? [];
}

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
    .select("id, slug, title, author_id, genre, summary, summary_chapters, plan, analysis, quiz_data, exercise_data, themes, characters, symbols, exam_tips, access_level, created_at, updated_at, author:authors(id, slug, name, period, movement, image_url)")
    .order("title");

  if (!fullResult.error) {
    return normalizeWorks((fullResult.data ?? []) as Record<string, unknown>[]);
  }

  const fallbackColumns = [
    "works.summary_chapters",
    "works.plan",
    "works.analysis",
    "works.quiz_data",
    "works.exercise_data",
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
    exercise_data: [],
    author: work.author ? { ...work.author, image_url: null } : null,
  }));
}

function normalizeWorks(rows: Record<string, unknown>[]) {
  return rows.map((work) => {
    const authorValue = work.author;
    const authorRecord = Array.isArray(authorValue) ? authorValue[0] : authorValue;
    const summaryChapters = normalizeSummaryChapters(work.summary_chapters);
    const quizData = normalizeQuizData(work.quiz_data);
    const exerciseData = normalizeExerciseSets(work.exercise_data, quizData);

    return {
      ...work,
      slug: ensureSlug(String(work.slug ?? work.title ?? ""), `work-${String(work.id ?? "").slice(0, 8)}`),
      summary_chapters: summaryChapters,
      quiz_data: quizData,
      exercise_data: exerciseData,
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

export async function getPaymentRequests() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payment_requests")
    .select("id, user_id, full_name, email, plan, amount, receipt_url, comment, status, created_at, reviewed_at, reviewed_by")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Payment requests query failed: ${error.message}`);
  }

  const requests = ((data ?? []) as Array<Record<string, unknown>>).map((item) => ({
    id: String(item.id ?? ""),
    user_id: String(item.user_id ?? ""),
    full_name: (item.full_name as string | null | undefined) ?? null,
    email: String(item.email ?? ""),
    plan: String(item.plan ?? "standard") as PaidPlan,
    amount: Number(item.amount ?? PLAN_PRICES.standard),
    receipt_url: String(item.receipt_url ?? ""),
    comment: (item.comment as string | null | undefined) ?? null,
    status: String(item.status ?? "pending") as PaymentRequestRecord["status"],
    created_at: String(item.created_at ?? ""),
    reviewed_at: (item.reviewed_at as string | null | undefined) ?? null,
    reviewed_by: (item.reviewed_by as string | null | undefined) ?? null,
  })) as PaymentRequestRecord[];

  if (requests.length === 0) {
    return requests;
  }

  const signedUrls = await Promise.all(
    requests.map(async (request) => {
      const { data: signedData } = await supabase.storage.from("payment-receipts").createSignedUrl(request.receipt_url, 60 * 60);
      return [request.id, signedData?.signedUrl ?? null] as const;
    }),
  );

  const signedUrlMap = new Map(signedUrls);
  return requests.map((request) => ({
    ...request,
    receipt_signed_url: signedUrlMap.get(request.id) ?? null,
  }));
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
    exercises: normalizeExerciseSets(work.exercise_data, work.quiz_data ?? []),
  }));
}

export async function getWorkDetail(slug: string) {
  const normalizedSlug = normalizeSearchValue(slug);
  const supabase = await createClient();
  let directResult = await supabase
    .from("works")
    .select("id, slug, title, author_id, genre, summary, summary_chapters, plan, analysis, quiz_data, exercise_data, themes, characters, symbols, exam_tips, access_level, created_at, updated_at, author:authors(id, slug, name, period, movement, image_url)")
    .eq("slug", slug)
    .maybeSingle();

  if (directResult.error && isMissingColumnError(directResult.error.message, "works.exercise_data")) {
    directResult = await supabase
      .from("works")
      .select("id, slug, title, author_id, genre, summary, summary_chapters, plan, analysis, quiz_data, themes, characters, symbols, exam_tips, access_level, created_at, updated_at, author:authors(id, slug, name, period, movement, image_url)")
      .eq("slug", slug)
      .maybeSingle();
  }

  if (directResult.error && process.env.NODE_ENV !== "production") {
    console.error("Direct work slug query failed", {
      slug,
      error: directResult.error.message,
    });
  }

  if (directResult.data) {
    const [work] = normalizeWorks([directResult.data as Record<string, unknown>]);
    return {
      ...work,
      author: work.author?.name ?? "უცნობი ავტორი",
      authorSlug: work.author?.slug ?? "",
      authorImageUrl: work.author?.image_url ?? null,
      genreLabel: genres[work.genre],
      periodLabel: work.author ? literaryPeriods[work.author.period] : "",
      movement: work.author?.movement ?? "",
      accessLevelLabel: getAccessLevelLabel(work.access_level),
      exercises: normalizeExerciseSets(work.exercise_data, work.quiz_data ?? []),
    };
  }

  const works = await getWorks();
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
    exercises: normalizeExerciseSets(work.exercise_data, work.quiz_data ?? []),
  };
}

export async function getExerciseProgress(userId: string, totalExercises: number): Promise<ExerciseProgressRecord> {
  if (!userId || totalExercises === 0) {
    return { completedExercises: 0, correctAnswers: 0, streak: 0, progressPercentage: 0 };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("exercise_attempts")
      .select("exercise_id, correct_answers, completed_at")
      .eq("user_id", userId);

    if (error) {
      return { completedExercises: 0, correctAnswers: 0, streak: 0, progressPercentage: 0 };
    }

    const attempts = (data ?? []) as Array<{ exercise_id: string; correct_answers: number; completed_at: string }>;
    const completedIds = new Set(attempts.map((attempt) => attempt.exercise_id));
    const correctAnswers = attempts.reduce((sum, attempt) => sum + Number(attempt.correct_answers ?? 0), 0);
    const progressPercentage = Math.round((completedIds.size / totalExercises) * 100);

    return {
      completedExercises: completedIds.size,
      correctAnswers,
      streak: calculateStreak(attempts.map((attempt) => attempt.completed_at)),
      progressPercentage,
    };
  } catch {
    return { completedExercises: 0, correctAnswers: 0, streak: 0, progressPercentage: 0 };
  }
}

function calculateStreak(values: string[]) {
  const uniqueDays = [...new Set(values.map((value) => new Date(value).toISOString().slice(0, 10)))].sort().reverse();
  if (uniqueDays.length === 0) {
    return 0;
  }

  let streak = 0;
  let current = new Date(uniqueDays[0]);

  for (const day of uniqueDays) {
    const normalizedDay = new Date(day);
    const diff = Math.round((current.getTime() - normalizedDay.getTime()) / 86400000);

    if (streak === 0 || diff === 0) {
      streak += streak === 0 ? 1 : 0;
      current = normalizedDay;
      continue;
    }

    if (diff === 1) {
      streak += 1;
      current = normalizedDay;
      continue;
    }

    break;
  }

  return streak;
}

export async function getWorkById(id: string) {
  const supabase = await createClient();
  let directResult = await supabase
    .from("works")
    .select("id, slug, title, author_id, genre, summary, summary_chapters, plan, analysis, quiz_data, exercise_data, themes, characters, symbols, exam_tips, access_level, created_at, updated_at, author:authors(id, slug, name, period, movement, image_url)")
    .eq("id", id)
    .maybeSingle();

  if (directResult.error && isMissingColumnError(directResult.error.message, "works.exercise_data")) {
    directResult = await supabase
      .from("works")
      .select("id, slug, title, author_id, genre, summary, summary_chapters, plan, analysis, quiz_data, themes, characters, symbols, exam_tips, access_level, created_at, updated_at, author:authors(id, slug, name, period, movement, image_url)")
      .eq("id", id)
      .maybeSingle();
  }

  if (directResult.error && process.env.NODE_ENV !== "production") {
    console.error("Direct work id query failed", {
      id,
      error: directResult.error.message,
    });
  }

  if (directResult.data) {
    const [work] = normalizeWorks([directResult.data as Record<string, unknown>]);
    return work ?? null;
  }

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

export async function getDashboardData() {
  const [authors, works] = await Promise.all([getAuthorsWithWorks(), getWorkProfiles()]);

  const popularAuthors = [...authors]
    .sort((left, right) => {
      if (right.works.length !== left.works.length) {
        return right.works.length - left.works.length;
      }

      return (right.updated_at ?? right.created_at ?? "").localeCompare(left.updated_at ?? left.created_at ?? "");
    })
    .slice(0, 4);

  const popularWorks = [...works]
    .sort((left, right) => {
      const leftQuizCount = left.quiz_data?.length ?? 0;
      const rightQuizCount = right.quiz_data?.length ?? 0;

      if (rightQuizCount !== leftQuizCount) {
        return rightQuizCount - leftQuizCount;
      }

      return (right.updated_at ?? right.created_at ?? "").localeCompare(left.updated_at ?? left.created_at ?? "");
    })
    .slice(0, 6);

  const newTests = works
    .filter((work) => (work.quiz_data?.length ?? 0) > 0)
    .sort((left, right) => (right.updated_at ?? right.created_at ?? "").localeCompare(left.updated_at ?? left.created_at ?? ""))
    .slice(0, 4);

  return {
    popularAuthors,
    popularWorks,
    newTests,
  };
}

export function getAuthorPeriodOptions() {
  return Object.entries(literaryPeriods).map(([value, label]) => ({ value, label }));
}

export function getGenreOptions() {
  return Object.entries(genres).map(([value, label]) => ({ value, label }));
}

export { ADMIN_EMAIL };
