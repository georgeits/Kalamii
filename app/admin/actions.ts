"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_EMAIL } from "@/src/lib/auth";
import { extractLegacyQuizData } from "@/src/lib/exercises";
import { getCurrentProfile } from "@/src/lib/content";
import { ensureSlug } from "@/src/lib/slug";
import { createAdminClient } from "@/src/lib/supabase/admin";

async function requireAdmin() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin" && profile.email.toLowerCase() !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  return profile;
}

function parseList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function requiredText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function calculateExpiration(duration: string, customDate: string) {
  if (duration === "custom") {
    return customDate ? new Date(customDate).toISOString() : null;
  }

  const days = Number(duration || "30");
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function revalidateContentRoutes() {
  revalidatePath("/admin");
  revalidatePath("/authors");
  revalidatePath("/works");
  revalidatePath("/library");
  revalidatePath("/quiz");
  revalidatePath("/profile");
  revalidatePath("/dashboard");
}

export async function createAuthorAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const name = requiredText(formData, "name");
  const slug = ensureSlug(requiredText(formData, "slug") || name, `author-${crypto.randomUUID().slice(0, 8)}`);

  const { data, error } = await supabase
    .from("authors")
    .insert({
      slug,
      name,
      period: requiredText(formData, "period"),
      movement: requiredText(formData, "movement"),
      biography: requiredText(formData, "biography"),
      themes: parseList(formData.get("themes")),
      image_url: requiredText(formData, "image_url") || null,
      access_level: requiredText(formData, "access_level") || "free",
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(`ავტორის დამატება ვერ მოხერხდა: ${error?.message ?? "უცნობი შეცდომა"}`);
  }

  revalidateContentRoutes();
  redirect(`/admin/authors/${data.id}`);
}

export async function updateAuthorAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = requiredText(formData, "id");
  const name = requiredText(formData, "name");
  const slug = ensureSlug(requiredText(formData, "slug") || name, `author-${id.slice(0, 8)}`);

  const { error } = await supabase
    .from("authors")
    .update({
      slug,
      name,
      period: requiredText(formData, "period"),
      movement: requiredText(formData, "movement"),
      biography: requiredText(formData, "biography"),
      themes: parseList(formData.get("themes")),
      image_url: requiredText(formData, "image_url") || null,
      access_level: requiredText(formData, "access_level") || "free",
    })
    .eq("id", id);

  if (error) {
    throw new Error(`ავტორის შენახვა ვერ მოხერხდა: ${error.message}`);
  }

  revalidateContentRoutes();
  redirect(`/admin/authors/${id}`);
}

export async function deleteAuthorAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("authors").delete().eq("id", requiredText(formData, "id"));
  if (error) {
    throw new Error(`ავტორის წაშლა ვერ მოხერხდა: ${error.message}`);
  }
  revalidateContentRoutes();
  redirect("/admin");
}

export async function createWorkAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const title = requiredText(formData, "title");
  const slug = ensureSlug(requiredText(formData, "slug") || title, `work-${crypto.randomUUID().slice(0, 8)}`);

  const exerciseData = parseExerciseData(formData.get("exercise_data"));

  const { data: createdWork, error: createError } = await supabase
    .from("works")
    .insert({
      slug,
      title,
      author_id: requiredText(formData, "author_id"),
      genre: requiredText(formData, "genre"),
      summary: requiredText(formData, "summary"),
      summary_chapters: parseSummaryChapters(formData.get("summary_chapters")),
      plan: requiredText(formData, "plan") || null,
      analysis: requiredText(formData, "analysis") || null,
      exercise_data: exerciseData,
      quiz_data: extractLegacyQuizData(exerciseData),
      themes: parseList(formData.get("themes")),
      characters: parseList(formData.get("characters")),
      symbols: parseList(formData.get("symbols")),
      exam_tips: parseList(formData.get("exam_tips")),
      access_level: requiredText(formData, "access_level") || "free",
    })
    .select("id")
    .single();

  if (createError || !createdWork?.id) {
    throw new Error(`ნაწარმოების დამატება ვერ მოხერხდა: ${createError?.message ?? "უცნობი შეცდომა"}`);
  }

  revalidateContentRoutes();
  redirect(`/admin/works/${createdWork.id}`);
}

export async function updateWorkAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = requiredText(formData, "id");
  const title = requiredText(formData, "title");
  const slug = ensureSlug(requiredText(formData, "slug") || title, `work-${id.slice(0, 8)}`);

  const exerciseData = parseExerciseData(formData.get("exercise_data"));

  const { error } = await supabase
    .from("works")
    .update({
      slug,
      title,
      author_id: requiredText(formData, "author_id"),
      genre: requiredText(formData, "genre"),
      summary: requiredText(formData, "summary"),
      summary_chapters: parseSummaryChapters(formData.get("summary_chapters")),
      plan: requiredText(formData, "plan") || null,
      analysis: requiredText(formData, "analysis") || null,
      exercise_data: exerciseData,
      quiz_data: extractLegacyQuizData(exerciseData),
      themes: parseList(formData.get("themes")),
      characters: parseList(formData.get("characters")),
      symbols: parseList(formData.get("symbols")),
      exam_tips: parseList(formData.get("exam_tips")),
      access_level: requiredText(formData, "access_level") || "free",
    })
    .eq("id", id);

  if (error) {
    throw new Error(`ნაწარმოების შენახვა ვერ მოხერხდა: ${error.message}`);
  }

  revalidateContentRoutes();
  redirect(`/admin/works/${id}`);
}

export async function deleteWorkAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("works").delete().eq("id", requiredText(formData, "id"));
  if (error) {
    throw new Error(`ნაწარმოების წაშლა ვერ მოხერხდა: ${error.message}`);
  }
  revalidateContentRoutes();
  redirect("/admin");
}

function parseExerciseData(value: FormDataEntryValue | null) {
  try {
    const parsed = JSON.parse(String(value ?? "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseSummaryChapters(value: FormDataEntryValue | null) {
  try {
    const parsed = JSON.parse(String(value ?? "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function assignSubscriptionAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const email = requiredText(formData, "email").toLowerCase();
  const plan = requiredText(formData, "plan") || "free";
  const duration = requiredText(formData, "duration");
  const customDate = requiredText(formData, "custom_expires_at");

  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    throw new Error(`მომხმარებლის მოძებნა ვერ მოხერხდა: ${userError.message}`);
  }

  const user = users.users.find((item) => item.email?.toLowerCase() === email);
  if (!user?.id) {
    throw new Error("მომხმარებელი ამ ელფოსტით ვერ მოიძებნა.");
  }

  let expiresAt: string | null = null;
  if (plan !== "free") {
    expiresAt = calculateExpiration(duration, customDate);
  }

  const status =
    plan === "free"
      ? "cancelled"
      : expiresAt && new Date(expiresAt).getTime() < Date.now()
        ? "expired"
        : "active";

  const { error } = await supabase.from("subscriptions").upsert({
    user_id: user.id,
    email,
    plan,
    status,
    starts_at: new Date().toISOString(),
    expires_at: expiresAt,
  });

  if (error) {
    throw new Error(`პაკეტის მინიჭება ვერ მოხერხდა: ${error.message}`);
  }

  revalidateContentRoutes();
  redirect("/admin");
}

export async function reviewPaymentRequestAction(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  const requestId = requiredText(formData, "request_id");
  const decision = requiredText(formData, "decision");
  const duration = requiredText(formData, "duration") || "30";
  const customDate = requiredText(formData, "custom_expires_at");
  const overridePlan = requiredText(formData, "plan");

  const { data: request, error: requestError } = await supabase
    .from("payment_requests")
    .select("id, user_id, email, plan")
    .eq("id", requestId)
    .maybeSingle();

  if (requestError || !request) {
    throw new Error(`გადახდის მოთხოვნა ვერ მოიძებნა: ${requestError?.message ?? "უცნობი შეცდომა"}`);
  }

  if (decision === "approve") {
    const plan = (overridePlan || request.plan) as "standard" | "premium";
    const expiresAt = calculateExpiration(duration, customDate);
    const status = expiresAt && new Date(expiresAt).getTime() < Date.now() ? "expired" : "active";

    const { error: subscriptionError } = await supabase.from("subscriptions").upsert({
      user_id: request.user_id,
      email: request.email,
      plan,
      status,
      starts_at: new Date().toISOString(),
      expires_at: expiresAt,
    });

    if (subscriptionError) {
      throw new Error(`პაკეტის გააქტიურება ვერ მოხერხდა: ${subscriptionError.message}`);
    }
  }

  const { error: reviewError } = await supabase
    .from("payment_requests")
    .update({
      status: decision === "approve" ? "approved" : "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: admin.id,
    })
    .eq("id", requestId);

  if (reviewError) {
    throw new Error(`გადახდის მოთხოვნის განახლება ვერ მოხერხდა: ${reviewError.message}`);
  }

  revalidateContentRoutes();
  redirect(`/admin?paymentStatus=${decision === "approve" ? "approved" : "rejected"}&paymentMessage=${encodeURIComponent(decision === "approve" ? "მოთხოვნა დადასტურებულია" : "მოთხოვნა უარყოფილია")}`);
}

export async function updateSubscriptionAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = requiredText(formData, "id");
  const plan = requiredText(formData, "plan") || "free";
  const duration = requiredText(formData, "duration") || "30";
  const customDate = requiredText(formData, "custom_expires_at");
  const expiresAt = plan === "free" ? null : calculateExpiration(duration, customDate);
  const status = plan === "free" ? "cancelled" : expiresAt && new Date(expiresAt).getTime() < Date.now() ? "expired" : "active";

  const { error } = await supabase
    .from("subscriptions")
    .update({
      plan,
      status,
      starts_at: new Date().toISOString(),
      expires_at: expiresAt,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`პაკეტის განახლება ვერ მოხერხდა: ${error.message}`);
  }

  revalidateContentRoutes();
  redirect("/admin");
}

export async function updateFeaturedAuthorAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const featuredAuthorId = requiredText(formData, "featured_author_id") || null;

  const { error } = await supabase.from("site_settings").upsert({
    id: 1,
    featured_author_id: featuredAuthorId,
  });

  if (error) {
    throw new Error(`რჩეული ავტორის შენახვა ვერ მოხერხდა: ${error.message}`);
  }

  revalidateContentRoutes();
  redirect("/admin");
}

export async function removeSubscriptionAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = requiredText(formData, "id");

  const { error } = await supabase
    .from("subscriptions")
    .update({
      plan: "free",
      status: "cancelled",
      expires_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`წვდომის მოხსნა ვერ მოხერხდა: ${error.message}`);
  }

  revalidateContentRoutes();
  redirect("/admin");
}
