"use server";

import { redirect } from "next/navigation";
import { getRoleForEmail } from "@/src/lib/auth";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { createClient } from "@/src/lib/supabase/server";

export async function registerUser(_: string | null, formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");
  const role = getRoleForEmail(email);

  if (!fullName || !email || !password || !confirmPassword) {
    return "შეავსეთ ყველა სავალდებულო ველი.";
  }

  if (fullName.length < 2) {
    return "სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს.";
  }

  if (password.length < 6) {
    return "პაროლი უნდა შედგებოდეს მინიმუმ 6 სიმბოლოსგან.";
  }

  if (password !== confirmPassword) {
    return "პაროლები ერთმანეთს არ ემთხვევა.";
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/dashboard`,
      },
    });

    if (error) {
      return getAuthErrorMessage(error.message);
    }

    if (!data.user) {
      return "რეგისტრაცია ვერ დასრულდა: Supabase-მა მომხმარებელი არ დააბრუნა.";
    }

    const adminClient = createAdminClient();
    const { error: profileError } = await adminClient.from("profiles").upsert({
      id: data.user.id,
      full_name: fullName,
      email,
      role,
    });

    if (profileError) {
      return `ანგარიში შეიქმნა, მაგრამ პროფილის შენახვა ვერ დასრულდა: ${profileError.message}`;
    }
  } catch (error) {
    if (error instanceof Error) {
      return `რეგისტრაციის შეცდომა: ${error.message}`;
    }

    return "ავტორიზაციის სერვისთან დაკავშირება ვერ მოხერხდა. სცადეთ თავიდან.";
  }

  redirect(role === "admin" ? "/admin" : "/dashboard");
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
