import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const body = (await request.json()) as {
      workId?: string;
      exerciseId?: string;
      correctAnswers?: number;
      totalQuestions?: number;
    };

    if (!body.workId || !body.exerciseId) {
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }

    const { error } = await supabase.from("exercise_attempts").insert({
      user_id: user.id,
      work_id: body.workId,
      exercise_id: body.exerciseId,
      correct_answers: Number(body.correctAnswers ?? 0),
      total_questions: Number(body.totalQuestions ?? 0),
    });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
