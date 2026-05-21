"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerUser } from "@/app/register/actions";

export function RegisterForm() {
  const [errorMessage, action, isPending] = useActionState(registerUser, null);

  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-sm text-[color:var(--muted)]">ელფოსტა</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          className="mt-2 h-12 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 text-sm text-white outline-none transition placeholder:text-[color:var(--muted)] focus:border-[rgba(244,177,93,0.45)]"
        />
      </label>

      <label className="block">
        <span className="text-sm text-[color:var(--muted)]">პაროლი</span>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
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
        disabled={isPending}
        className="premium-button inline-flex h-12 w-full items-center justify-center rounded-full px-5 text-sm font-bold text-[#160f08] transition disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "იტვირთება..." : "რეგისტრაცია"}
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
