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
}

export async function createAuthorAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  await supabase.from("authors").insert({
    slug: requiredText(formData, "slug"),
    name: requiredText(formData, "name"),
    period: requiredText(formData, "period"),
    movement: requiredText(formData, "movement"),
    biography: requiredText(formData, "biography"),
    themes: parseList(formData.get("themes")),
    image_url: requiredText(formData, "image_url") || null,
    access_level: requiredText(formData, "access_level") || "free",
  });

  revalidateContentRoutes();
}

export async function updateAuthorAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = requiredText(formData, "id");
  const slug = requiredText(formData, "slug");

  await supabase
    .from("authors")
    .update({
      slug,
      name: requiredText(formData, "name"),
      period: requiredText(formData, "period"),
      movement: requiredText(formData, "movement"),
      biography: requiredText(formData, "biography"),
      themes: parseList(formData.get("themes")),
      image_url: requiredText(formData, "image_url") || null,
      access_level: requiredText(formData, "access_level") || "free",
    })
    .eq("id", id);

  revalidateContentRoutes();
  revalidatePath(`/authors/${slug}`);
}

export async function deleteAuthorAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("authors").delete().eq("id", requiredText(formData, "id"));
  revalidateContentRoutes();
}

export async function createWorkAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  await supabase.from("works").insert({
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
  });

  revalidateContentRoutes();
}

export async function updateWorkAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = requiredText(formData, "id");
  const slug = requiredText(formData, "slug");

  await supabase
    .from("works")
    .update({
      slug,
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

  revalidateContentRoutes();
  revalidatePath(`/works/${slug}`);
}

export async function deleteWorkAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("works").delete().eq("id", requiredText(formData, "id"));
  revalidateContentRoutes();
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
