import { NextResponse } from "next/server";
import { PLAN_PRICES, isPaidPlan } from "@/src/lib/plans";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "გთხოვთ, გაიაროთ ავტორიზაცია." }, { status: 401 });
  }

  const formData = await request.formData();
  const planValue = String(formData.get("plan") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? user.email ?? "").trim().toLowerCase();
  const comment = String(formData.get("comment") ?? "").trim();
  const receipt = formData.get("receipt");

  if (!isPaidPlan(planValue)) {
    return NextResponse.json({ error: "აირჩიეთ სწორი პაკეტი." }, { status: 400 });
  }

  if (!(receipt instanceof File) || receipt.size === 0) {
    return NextResponse.json({ error: "ატვირთეთ ქვითრის screenshot." }, { status: 400 });
  }

  const extension = receipt.name.split(".").pop()?.toLowerCase() || "png";
  const filePath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const adminClient = createAdminClient();

  const uploadResult = await adminClient.storage.from("payment-receipts").upload(filePath, receipt, {
    contentType: receipt.type || "image/png",
    upsert: false,
  });

  if (uploadResult.error) {
    return NextResponse.json({ error: `ქვითრის ატვირთვა ვერ მოხერხდა: ${uploadResult.error.message}` }, { status: 500 });
  }

  const insertResult = await adminClient.from("payment_requests").insert({
    user_id: user.id,
    full_name: fullName || user.user_metadata.full_name || null,
    email,
    plan: planValue,
    amount: PLAN_PRICES[planValue],
    receipt_url: filePath,
    comment: comment || null,
    status: "pending",
  });

  if (insertResult.error) {
    return NextResponse.json({ error: `მოთხოვნის შენახვა ვერ მოხერხდა: ${insertResult.error.message}` }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
