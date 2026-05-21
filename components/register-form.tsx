"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ADMIN_EMAIL } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/client";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!fullName.trim() || !normalizedEmail || !password || !confirmPassword) {
      setErrorMessage("შეავსეთ ყველა სავალდებულო ველი.");
      return;
    }

    if (fullName.trim().length < 2) {
      setErrorMessage("სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("პაროლი უნდა შედგებოდეს მინიმუმ 6 სიმბოლოსგან.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("პაროლები ერთმანეთს არ ემთხვევა.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setErrorMessage(getAuthErrorMessage(error.message));
        return;
      }

      if (!data.user) {
        setErrorMessage("რეგისტრაცია ვერ დასრულდა: Supabase-მა მომხმარებელი არ დააბრუნა.");
        return;
      }

      const profileResponse = await fetch("/api/auth/register-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: data.user.id,
          full_name: fullName.trim(),
          email: normalizedEmail,
        }),
      });

      if (!profileResponse.ok) {
        const payload = (await profileResponse.json().catch(() => null)) as { error?: string } | null;
        setErrorMessage(payload?.error ?? "პროფილის შენახვა ვერ მოხერხდა.");
        return;
      }

      router.replace(normalizedEmail === ADMIN_EMAIL ? "/admin" : "/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? `რეგისტრაციის შეცდომა: ${error.message}` : "რეგისტრაცია ვერ შესრულდა.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-sm text-[color:var(--muted)]">სრული სახელი</span>
        <input
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          autoComplete="name"
          placeholder="გიორგი ჯავახიშვილი"
          className="mt-2 h-12 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 text-sm text-white outline-none transition placeholder:text-[color:var(--muted)] focus:border-[rgba(244,177,93,0.45)]"
        />
      </label>

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
          autoComplete="new-password"
          placeholder="მინიმუმ 6 სიმბოლო"
          className="mt-2 h-12 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 text-sm text-white outline-none transition placeholder:text-[color:var(--muted)] focus:border-[rgba(244,177,93,0.45)]"
        />
      </label>

      <label className="block">
        <span className="text-sm text-[color:var(--muted)]">გაიმეორეთ პაროლი</span>
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          placeholder="გაიმეორეთ პაროლი"
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
        {isLoading ? "იტვირთება..." : "რეგისტრაცია"}
      </button>

      <p className="text-center text-sm text-[color:var(--muted)]">
        უკვე გაქვთ ანგარიში?{" "}
        <Link href="/login" className="text-[color:var(--gold-soft)] transition hover:text-white">
          ავტორიზაცია
        </Link>
      </p>
    </form>
  );
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
