import { NextResponse } from "next/server";
import { ADMIN_EMAIL } from "@/src/lib/auth";
import { ensureSlug } from "@/src/lib/slug";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

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
    name?: string;
    period?: string;
    movement?: string;
    biography?: string;
    image_url?: string | null;
  };

  const id = body.id?.trim();
  if (!id) {
    return NextResponse.json({ error: "ავტორი ვერ მოიძებნა." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("authors")
    .update({
      name: (body.name ?? "").trim(),
      slug: ensureSlug((body.name ?? "").trim(), `author-${id.slice(0, 8)}`),
      period: (body.period ?? "").trim(),
      movement: (body.movement ?? "").trim(),
      biography: (body.biography ?? "").trim(),
      image_url: body.image_url?.trim() || null,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: `შენახვა ვერ მოხერხდა: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
