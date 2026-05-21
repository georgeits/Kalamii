"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isRegister = mode === "register";

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
      const redirectTo = `${window.location.origin}/dashboard`;
      const result = isRegister
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: redirectTo },
          })
        : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        setErrorMessage(getAuthErrorMessage(result.error.message));
        return;
      }

      const redirectedFrom = searchParams.get("redirectedFrom");
      router.replace(redirectedFrom || "/dashboard");
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
          autoComplete={isRegister ? "new-password" : "current-password"}
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
        {isLoading ? "იტვირთება..." : isRegister ? "რეგისტრაცია" : "ავტორიზაცია"}
      </button>

      <p className="text-center text-sm text-[color:var(--muted)]">
        {isRegister ? "უკვე გაქვთ ანგარიში?" : "ჯერ არ გაქვთ ანგარიში?"}{" "}
        <Link href={isRegister ? "/login" : "/register"} className="text-[color:var(--gold-soft)] transition hover:text-white">
          {isRegister ? "ავტორიზაცია" : "რეგისტრაცია"}
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
