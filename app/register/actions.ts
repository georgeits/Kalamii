"use server";

import { redirect } from "next/navigation";
import { getRoleForEmail } from "@/src/lib/auth";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

export async function registerUser(_: string | null, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return "შეიყვანეთ ელფოსტა და პაროლი.";
  }

  if (password.length < 6) {
    return "პაროლი უნდა შედგებოდეს მინიმუმ 6 სიმბოლოსგან.";
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/dashboard`,
      },
    });

    if (error) {
      return getAuthErrorMessage(error.message);
    }

    if (!user) {
      return "რეგისტრაცია ვერ დასრულდა. სცადეთ თავიდან.";
    }

    const adminClient = createAdminClient();
    const role = getRoleForEmail(email);

    const { error: profileError } = await adminClient.from("profiles").upsert({
      id: user.id,
      email,
      role,
    });

    if (profileError) {
      return "ანგარიში შეიქმნა, მაგრამ როლის მინიჭება ვერ დასრულდა. გადაამოწმეთ Supabase-ის ცხრილები.";
    }
  } catch {
    return "ავტორიზაციის სერვისთან დაკავშირება ვერ მოხერხდა. სცადეთ თავიდან.";
  }

  redirect("/dashboard");
}

function getAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("user already registered") || normalized.includes("already registered")) {
    return "ამ ელფოსტით ანგარიში უკვე არსებობს.";
  }

  if (normalized.includes("password")) {
    return "პაროლი არ აკმაყოფილებს მოთხოვნებს.";
  }

  if (normalized.includes("email")) {
    return "შეიყვანეთ სწორი ელფოსტა.";
  }

  if (normalized.includes("rate limit")) {
    return "ძალიან ბევრი მცდელობაა. ცოტა ხანში სცადეთ თავიდან.";
  }

  return "მოთხოვნის შესრულება ვერ მოხერხდა. გადაამოწმეთ მონაცემები და სცადეთ თავიდან.";
}
