"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { getCurrentProfile } from "@/src/lib/content";

async function requireAdmin() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }
}

function parseList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    period: String(formData.get("period") ?? "").trim(),
    movement: String(formData.get("movement") ?? "").trim(),
    biography: String(formData.get("biography") ?? "").trim(),
    themes: parseList(formData.get("themes")),
  });

  revalidateContentRoutes();
}

export async function updateAuthorAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "").trim();

  await supabase
    .from("authors")
    .update({
      slug,
      name: String(formData.get("name") ?? "").trim(),
      period: String(formData.get("period") ?? "").trim(),
      movement: String(formData.get("movement") ?? "").trim(),
      biography: String(formData.get("biography") ?? "").trim(),
      themes: parseList(formData.get("themes")),
    })
    .eq("id", id);

  revalidateContentRoutes();
  revalidatePath(`/authors/${slug}`);
}

export async function deleteAuthorAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id") ?? "");

  await supabase.from("authors").delete().eq("id", id);
  revalidateContentRoutes();
}

export async function createWorkAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  await supabase.from("works").insert({
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    author_id: String(formData.get("author_id") ?? "").trim(),
    genre: String(formData.get("genre") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim(),
    themes: parseList(formData.get("themes")),
    characters: parseList(formData.get("characters")),
    symbols: parseList(formData.get("symbols")),
    exam_tips: parseList(formData.get("exam_tips")),
  });

  revalidateContentRoutes();
}

export async function updateWorkAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "").trim();

  await supabase
    .from("works")
    .update({
      slug,
      title: String(formData.get("title") ?? "").trim(),
      author_id: String(formData.get("author_id") ?? "").trim(),
      genre: String(formData.get("genre") ?? "").trim(),
      summary: String(formData.get("summary") ?? "").trim(),
      themes: parseList(formData.get("themes")),
      characters: parseList(formData.get("characters")),
      symbols: parseList(formData.get("symbols")),
      exam_tips: parseList(formData.get("exam_tips")),
    })
    .eq("id", id);

  revalidateContentRoutes();
  revalidatePath(`/works/${slug}`);
}

export async function deleteWorkAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id") ?? "");

  await supabase.from("works").delete().eq("id", id);
  revalidateContentRoutes();
}
