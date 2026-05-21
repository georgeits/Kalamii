import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { ADMIN_EMAIL } from "@/src/lib/auth";
import { DEMO_RECORD_MESSAGE } from "@/src/lib/demo-record";
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

    if (authorId === "draft" || authorId.startsWith("fallback-")) {
      return NextResponse.json({ error: DEMO_RECORD_MESSAGE }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: author, error: authorError } = await supabase
      .from("authors")
      .select("id")
      .eq("id", authorId)
      .maybeSingle();

    if (authorError) {
      return NextResponse.json(
        { error: `ავტორის შემოწმება ვერ მოხერხდა: ${authorError.message}` },
        { status: 500 },
      );
    }

    if (!author) {
      return NextResponse.json({ error: DEMO_RECORD_MESSAGE }, { status: 400 });
    }

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
    if (process.env.NODE_ENV !== "production") {
      console.error("Author image upload failed", error);
    }
    return NextResponse.json(
      { error: error instanceof Error ? `სურათის ატვირთვის შეცდომა: ${error.message}` : "უცნობი შეცდომა." },
      { status: 500 },
    );
  }
}
