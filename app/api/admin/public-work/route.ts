import { NextResponse } from "next/server";
import { ADMIN_EMAIL } from "@/src/lib/auth";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

function parseJsonArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "წვდომა აკრძალულია." }, { status: 403 });
  }

  const body = (await request.json()) as {
    id?: string;
    plan?: string;
    summary?: string;
    summary_chapters?: unknown;
    analysis?: string;
    quiz_data?: unknown;
  };

  const id = body.id?.trim();
  if (!id) {
    return NextResponse.json({ error: "ნაწარმოები ვერ მოიძებნა." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("works")
    .update({
      plan: (body.plan ?? "").trim() || null,
      summary: (body.summary ?? "").trim(),
      summary_chapters: parseJsonArray(body.summary_chapters),
      analysis: (body.analysis ?? "").trim() || null,
      quiz_data: parseJsonArray(body.quiz_data),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: `შენახვა ვერ მოხერხდა: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
