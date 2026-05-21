import Link from "next/link";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { RegisterForm } from "@/components/register-form";

type AuthPageProps = {
  mode: "login" | "register";
};

export function AuthPage({ mode }: AuthPageProps) {
  const isRegister = mode === "register";

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-6 text-white sm:px-8">
      <div className="landing-glow landing-glow-one" />
      <div className="landing-glow landing-glow-two" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Link href="/" className="font-display text-3xl text-[color:var(--gold-soft)]">
            Kalami
          </Link>
          <Link href="/" className="rounded-full border border-[color:var(--line)] bg-white/[0.04] px-4 py-2 text-sm text-[color:var(--muted)] transition hover:bg-white/[0.075] hover:text-white">
            მთავარი
          </Link>
        </header>

        <section className="flex flex-1 items-center justify-center py-16">
          <div className="w-full max-w-md rounded-[26px] border border-[color:var(--line)] bg-[rgba(8,14,28,0.72)] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:p-8">
            <p className="text-sm text-[color:var(--gold-soft)]">
              {isRegister ? "ახალი ანგარიში" : "ანგარიშში შესვლა"}
            </p>
            <h1 className="mt-3 font-serif text-4xl text-white">
              {isRegister ? "რეგისტრაცია" : "ავტორიზაცია"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              {isRegister
                ? "შექმენით ანგარიში და გააგრძელეთ სწავლა Kalami-ში."
                : "შედით ანგარიშში, რომ გახსნათ პირადი სამუშაო სივრცე."}
            </p>
            <Suspense fallback={<AuthFormFallback />}>
              {isRegister ? <RegisterForm /> : <AuthForm />}
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}

function AuthFormFallback() {
  return (
    <div className="mt-8 space-y-4">
      <div className="h-12 rounded-[16px] border border-[color:var(--line)] bg-white/[0.045]" />
      <div className="h-12 rounded-[16px] border border-[color:var(--line)] bg-white/[0.045]" />
      <div className="h-12 rounded-full bg-[rgba(244,177,93,0.22)]" />
    </div>
  );
}
