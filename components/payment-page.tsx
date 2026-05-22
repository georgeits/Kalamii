"use client";

import { useState } from "react";
import { GlassCard, PremiumButton, SectionTitle, Surface } from "@/components/ui";
import type { ProfileRecord } from "@/src/lib/content";
import { getPlanLabel, getPlanPriceLabel, PLAN_FEATURES, type PaidPlan } from "@/src/lib/plans";

export function PaymentPage({ profile, plan }: { profile: ProfileRecord; plan: PaidPlan }) {
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [comment, setComment] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setStatus("");

    try {
      const response = await fetch("/api/payment-requests", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as { error?: string; success?: boolean } | null;
      if (!response.ok || !payload?.success) {
        setStatus(payload?.error ?? "მოთხოვნის გაგზავნა ვერ მოხერხდა.");
        return;
      }

      setStatus("მოთხოვნა გაიგზავნა. დადასტურების შემდეგ პაკეტი გააქტიურდება.");
      setReceipt(null);
      setComment("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="გადახდა"
        title={`${getPlanLabel(plan)} პაკეტის გააქტიურება`}
        description="გადმორიცხეთ თანხა საბანკო ანგარიშზე, ატვირთეთ ქვითრის screenshot და დაელოდეთ ადმინისტრატორის დადასტურებას."
        action={<PremiumButton href="/profile" variant="secondary">პროფილი</PremiumButton>}
      />

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <GlassCard className="p-5 sm:p-6">
          <p className="text-sm text-[color:var(--gold-soft)]">არჩეული პაკეტი</p>
          <h3 className="mt-2 font-serif text-3xl text-white">{getPlanLabel(plan)}</h3>
          <p className="mt-3 text-base text-white">{getPlanPriceLabel(plan)}</p>
          <div className="mt-5 rounded-[18px] border border-[color:var(--line)] bg-white/[0.04] p-4">
            <p className="text-sm text-[color:var(--muted)]">ანგარიში</p>
            <p className="mt-2 text-lg font-semibold text-white">GE92BG0000000612371503</p>
            <p className="mt-4 text-sm text-[color:var(--muted)]">მიმღები</p>
            <p className="mt-2 text-lg font-semibold text-white">ნ.ვ</p>
          </div>
          <Surface className="mt-5 p-4">
            <p className="text-sm leading-6 text-white">
              გადმორიცხეთ არჩეული პაკეტის შესაბამისი თანხა მითითებულ ანგარიშზე და ატვირთეთ გადახდის ქვითრის screenshot. დადასტურების შემდეგ პაკეტი გააქტიურდება.
            </p>
          </Surface>
          <div className="mt-5 space-y-2">
            {PLAN_FEATURES[plan].map((feature) => (
              <div key={feature} className="flex items-start gap-3 text-sm text-[color:var(--muted)]">
                <span className="mt-1 text-[color:var(--gold-soft)]">✦</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <form
            action={handleSubmit}
            className="grid gap-4"
          >
            <input type="hidden" name="plan" value={plan} />
            <input type="hidden" name="amount" value={String(plan === "standard" ? 5 : 10)} />

            <label className="block">
              <span className="text-sm text-[color:var(--muted)]">სრული სახელი</span>
              <input
                name="full_name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-2 h-12 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 text-sm text-white outline-none"
              />
            </label>

            <label className="block">
              <span className="text-sm text-[color:var(--muted)]">ელფოსტა</span>
              <input
                name="email"
                value={profile.email}
                readOnly
                className="mt-2 h-12 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.03] px-4 text-sm text-[color:var(--muted)] outline-none"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm text-[color:var(--muted)]">პაკეტი</span>
                <input
                  value={getPlanLabel(plan)}
                  readOnly
                  className="mt-2 h-12 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.03] px-4 text-sm text-[color:var(--muted)] outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm text-[color:var(--muted)]">თანხა</span>
                <input
                  value={getPlanPriceLabel(plan)}
                  readOnly
                  className="mt-2 h-12 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.03] px-4 text-sm text-[color:var(--muted)] outline-none"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm text-[color:var(--muted)]">ქვითრის screenshot</span>
              <input
                type="file"
                name="receipt"
                accept="image/*"
                required
                onChange={(event) => setReceipt(event.target.files?.[0] ?? null)}
                className="mt-2 block w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white"
              />
              {receipt ? <p className="mt-2 text-xs text-[color:var(--gold-soft)]">{receipt.name}</p> : null}
            </label>

            <label className="block">
              <span className="text-sm text-[color:var(--muted)]">კომენტარი</span>
              <textarea
                name="comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none"
              />
            </label>

            {status ? (
              <p className={`rounded-[16px] px-4 py-3 text-sm ${status.includes("გაიგზავნა") ? "border border-[rgba(114,212,164,0.22)] bg-[rgba(114,212,164,0.1)] text-[color:var(--success)]" : "border border-[rgba(255,156,140,0.22)] bg-[rgba(255,156,140,0.1)] text-[color:var(--danger)]"}`}>
                {status}
              </p>
            ) : null}

            <button type="submit" disabled={submitting} className="premium-button inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-bold text-[#160f08] disabled:opacity-70">
              {submitting ? "იგზავნება..." : "მოთხოვნის გაგზავნა"}
            </button>
          </form>
        </GlassCard>
      </div>
    </main>
  );
}
