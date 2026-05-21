import { NextResponse } from "next/server";
import { getRoleForEmail } from "@/src/lib/auth";
import { createAdminClient } from "@/src/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      full_name?: string;
      email?: string;
    };

    const id = body.id?.trim();
    const fullName = body.full_name?.trim();
    const email = body.email?.trim().toLowerCase();

    if (!id || !fullName || !email) {
      return NextResponse.json({ error: "პროფილის მონაცემები არასრულია." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("profiles").upsert({
      id,
      full_name: fullName,
      email,
      role: getRoleForEmail(email),
    });

    if (error) {
      return NextResponse.json({ error: `პროფილის შენახვა ვერ მოხერხდა: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? `რეგისტრაციის შეცდომა: ${error.message}` : "უცნობი შეცდომა." },
      { status: 500 },
    );
  }
}
