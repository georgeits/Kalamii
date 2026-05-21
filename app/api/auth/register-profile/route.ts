import { NextResponse } from "next/server";
import { getRoleForEmail } from "@/src/lib/auth";
import { createAdminClient } from "@/src/lib/supabase/admin";

type ProfilePayload = {
  id?: string;
  full_name?: string;
  email?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProfilePayload;
    const result = await upsertProfile(body);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? `რეგისტრაციის შეცდომა: ${error.message}` : "უცნობი შეცდომა." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as ProfilePayload;
    const result = await upsertProfile(body);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? `პროფილის შეცდომა: ${error.message}` : "უცნობი შეცდომა." },
      { status: 500 },
    );
  }
}

async function upsertProfile(body: ProfilePayload) {
  const id = body.id?.trim();
  const fullName = body.full_name?.trim() || null;
  const email = body.email?.trim().toLowerCase();

  if (!id || !email) {
    return { ok: false as const, error: "პროფილის მონაცემები არასრულია.", status: 400 };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("profiles").upsert({
    id,
    full_name: fullName,
    email,
    role: getRoleForEmail(email),
  });

  if (error) {
    return {
      ok: false as const,
      error: `პროფილის შენახვა ვერ მოხერხდა: ${error.message}`,
      status: 500,
    };
  }

  return { ok: true as const };
}
