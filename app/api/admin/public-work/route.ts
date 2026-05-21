import { NextResponse } from "next/server";
import { ADMIN_EMAIL } from "@/src/lib/auth";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

function parseJsonArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function normalizeSummaryChapters(value: unknown) {
  return parseJsonArray(value)
    .map((item) => {
      const chapter = item as { id?: unknown; title?: unknown; body?: unknown };
      return {
        id: String(chapter.id ?? "").trim(),
        title: String(chapter.title ?? "").trim(),
        body: String(chapter.body ?? "").trim(),
      };
    })
    .filter((item) => item.id && item.title && item.body);
}

function normalizeQuizData(value: unknown) {
  return parseJsonArray(value)
    .map((item) => {
      const question = item as {
        id?: unknown;
        question?: unknown;
        options?: unknown;
      };

      const options = parseJsonArray(question.options)
        .map((option) => {
          const normalized = option as { id?: unknown; text?: unknown; isCorrect?: unknown };
          return {
            id: String(normalized.id ?? "").trim(),
            text: String(normalized.text ?? "").trim(),
            isCorrect: Boolean(normalized.isCorrect),
          };
        })
        .filter((option) => option.id);

      return {
        id: String(question.id ?? "").trim(),
        question: String(question.question ?? "").trim(),
        options,
      };
    })
    .filter((question) => question.id && question.question && question.options.length === 4 && question.options.some((option) => option.isCorrect));
}

function toGeorgianSupabaseError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("column") && normalized.includes("summary_chapters")) {
    return "შენახვა ვერ მოხერხდა: `summary_chapters` სვეტი არ არსებობს Supabase-ის `works` ცხრილში. გაუშვით ბოლო SQL migration.";
  }

  if (normalized.includes("column") && normalized.includes("quiz_data")) {
    return "შენახვა ვერ მოხერხდა: `quiz_data` სვეტი არ არსებობს Supabase-ის `works` ცხრილში. გაუშვით ბოლო SQL migration.";
  }

  if (normalized.includes("permission") || normalized.includes("policy")) {
    return "შენახვა ვერ მოხერხდა: Supabase პოლიტიკა ან წვდომა ბლოკავს განახლებას.";
  }

  return `შენახვა ვერ მოხერხდა: ${message}`;
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

  const updatePayload = {
    plan: (body.plan ?? "").trim() || null,
    summary: (body.summary ?? "").trim(),
    summary_chapters: normalizeSummaryChapters(body.summary_chapters),
    analysis: (body.analysis ?? "").trim() || null,
    quiz_data: normalizeQuizData(body.quiz_data),
  };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("works")
    .update(updatePayload)
    .eq("id", id)
    .select("id, slug, plan, summary, summary_chapters, analysis, quiz_data")
    .single();

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Work save failed", {
        workId: id,
        updatePayload,
        error,
      });
    }

    return NextResponse.json({ error: toGeorgianSupabaseError(error.message) }, { status: 500 });
  }

  if (!data?.id) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Work save returned no row", {
        workId: id,
        updatePayload,
      });
    }

    return NextResponse.json({ error: "შენახვა ვერ დადასტურდა: განახლებული ჩანაწერი არ დაბრუნდა." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, work: data });
}
