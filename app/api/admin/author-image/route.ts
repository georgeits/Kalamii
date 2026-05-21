import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { ADMIN_EMAIL } from "@/src/lib/auth";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabaseUser = await createClient();
    const {
      data: { user },
    } = await supabaseUser.auth.getUser();

    if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "წვდომა აკრძალულია." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const authorId = String(formData.get("authorId") ?? "draft").trim() || "draft";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "სურათი ვერ მოიძებნა." }, { status: 400 });
    }

    const supabase = createAdminClient();
    await supabase.storage.createBucket("author-images", { public: true }).catch(() => undefined);

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${authorId}/${randomUUID()}.${extension}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage.from("author-images").upload(path, bytes, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });

    if (error) {
      return NextResponse.json({ error: `სურათის ატვირთვა ვერ მოხერხდა: ${error.message}` }, { status: 500 });
    }

    const { data } = supabase.storage.from("author-images").getPublicUrl(path);
    return NextResponse.json({ imageUrl: data.publicUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? `სურათის ატვირთვის შეცდომა: ${error.message}` : "უცნობი შეცდომა." },
      { status: 500 },
    );
  }
}
