"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { ADMIN_EMAIL } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/client";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("შეიყვანეთ ელფოსტა და პაროლი.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("პაროლი უნდა შედგებოდეს მინიმუმ 6 სიმბოლოსგან.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const result = await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        setErrorMessage(getAuthErrorMessage(result.error.message));
        return;
      }

      const profileResponse = await fetch("/api/auth/register-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: result.data.user.id,
          full_name: result.data.user.user_metadata.full_name ?? null,
          email: result.data.user.email ?? email.trim().toLowerCase(),
        }),
      });

      if (!profileResponse.ok) {
        console.error("Profile sync failed after sign-in");
      }

      const redirectedFrom = searchParams.get("redirectedFrom");
      const { data: profileResult } = await supabase
        .from("profiles")
        .select("role, email")
        .eq("id", result.data.user.id)
        .maybeSingle();

      const isAdmin =
        profileResult?.role === "admin" ||
        profileResult?.email?.toLowerCase() === ADMIN_EMAIL ||
        result.data.user.email?.toLowerCase() === ADMIN_EMAIL;

      router.replace(redirectedFrom || (isAdmin ? "/admin" : "/dashboard"));
      router.refresh();
    } catch {
      setErrorMessage("ავტორიზაციის სერვისთან დაკავშირება ვერ მოხერხდა. სცადეთ თავიდან.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-sm text-[color:var(--muted)]">ელფოსტა</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
          className="mt-2 h-12 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 text-sm text-white outline-none transition placeholder:text-[color:var(--muted)] focus:border-[rgba(244,177,93,0.45)]"
        />
      </label>

      <label className="block">
        <span className="text-sm text-[color:var(--muted)]">პაროლი</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          placeholder="მინიმუმ 6 სიმბოლო"
          className="mt-2 h-12 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 text-sm text-white outline-none transition placeholder:text-[color:var(--muted)] focus:border-[rgba(244,177,93,0.45)]"
        />
      </label>

      {errorMessage ? (
        <p className="rounded-[16px] border border-[rgba(255,156,140,0.24)] bg-[rgba(255,156,140,0.1)] px-4 py-3 text-sm leading-6 text-[color:var(--danger)]">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="premium-button inline-flex h-12 w-full items-center justify-center rounded-full px-5 text-sm font-bold text-[#160f08] transition disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "იტვირთება..." : "ავტორიზაცია"}
      </button>

      <p className="text-center text-sm text-[color:var(--muted)]">
        ჯერ არ გაქვთ ანგარიში?{" "}
        <Link href="/register" className="text-[color:var(--gold-soft)] transition hover:text-white">
          რეგისტრაცია
        </Link>
      </p>
    </form>
  );
}

function getAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "ელფოსტა ან პაროლი არასწორია.";
  }

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
