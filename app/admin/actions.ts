"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_EMAIL } from "@/src/lib/auth";
import { getCurrentProfile } from "@/src/lib/content";
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

function revalidateContentRoutes() {
  revalidatePath("/admin");
  revalidatePath("/authors");
  revalidatePath("/works");
  revalidatePath("/library");
  revalidatePath("/profile");
  revalidatePath("/dashboard");
}

export async function createAuthorAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("authors")
    .insert({
      slug: requiredText(formData, "slug"),
      name: requiredText(formData, "name"),
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

  const { error } = await supabase
    .from("authors")
    .update({
      slug: requiredText(formData, "slug"),
      name: requiredText(formData, "name"),
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

  const { data, error } = await supabase
    .from("works")
    .insert({
      slug: requiredText(formData, "slug"),
      title: requiredText(formData, "title"),
      author_id: requiredText(formData, "author_id"),
      genre: requiredText(formData, "genre"),
      summary: requiredText(formData, "summary"),
      summary_chapters: parseSummaryChapters(formData.get("summary_chapters")),
      plan: requiredText(formData, "plan") || null,
      analysis: requiredText(formData, "analysis") || null,
      quiz_data: parseQuizQuestions(formData.get("quiz_questions")),
      themes: parseList(formData.get("themes")),
      characters: parseList(formData.get("characters")),
      symbols: parseList(formData.get("symbols")),
      exam_tips: parseList(formData.get("exam_tips")),
      access_level: requiredText(formData, "access_level") || "free",
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(`ნაწარმოების დამატება ვერ მოხერხდა: ${error?.message ?? "უცნობი შეცდომა"}`);
  }

  revalidateContentRoutes();
  redirect(`/admin/works/${data.id}`);
}

export async function updateWorkAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = requiredText(formData, "id");

  const { error } = await supabase
    .from("works")
    .update({
      slug: requiredText(formData, "slug"),
      title: requiredText(formData, "title"),
      author_id: requiredText(formData, "author_id"),
      genre: requiredText(formData, "genre"),
      summary: requiredText(formData, "summary"),
      summary_chapters: parseSummaryChapters(formData.get("summary_chapters")),
      plan: requiredText(formData, "plan") || null,
      analysis: requiredText(formData, "analysis") || null,
      quiz_data: parseQuizQuestions(formData.get("quiz_questions")),
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

function parseQuizQuestions(value: FormDataEntryValue | null) {
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
    if (duration === "custom") {
      expiresAt = customDate ? new Date(customDate).toISOString() : null;
    } else {
      const days = Number(duration || "30");
      const date = new Date();
      date.setDate(date.getDate() + days);
      expiresAt = date.toISOString();
    }
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
