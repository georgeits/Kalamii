import Link from "next/link";
import type { ChangeEvent, ReactNode } from "react";

type Tone = "default" | "gold" | "success" | "danger" | "sky" | "rose";

export function SectionTitle({
  eyebrow,
  title,
  description,
  action,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase text-[color:var(--gold)]">{eyebrow}</p>
        ) : null}
        <h2
          className={`mt-2 max-w-4xl font-serif text-white ${
            compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-5xl"
          }`}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function GlassCard({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`glass-card glow-edge rounded-[22px] ${className}`}>
      {children}
    </section>
  );
}

export function Surface({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[18px] border border-[color:var(--line)] bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

export function Pill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  const toneClass = {
    default: "border-white/10 bg-white/6 text-[color:var(--muted)]",
    gold: "border-[rgba(244,177,93,0.24)] bg-[rgba(244,177,93,0.13)] text-[color:var(--gold-soft)]",
    success: "border-[rgba(114,212,164,0.22)] bg-[rgba(114,212,164,0.12)] text-[color:var(--success)]",
    danger: "border-[rgba(255,156,140,0.22)] bg-[rgba(255,156,140,0.12)] text-[color:var(--danger)]",
    sky: "border-[rgba(115,190,255,0.22)] bg-[rgba(115,190,255,0.11)] text-[#b9ddff]",
    rose: "border-[rgba(255,160,190,0.22)] bg-[rgba(255,160,190,0.11)] text-[#ffc5d8]",
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${toneClass}`}>
      {children}
    </span>
  );
}

export function PremiumButton({
  children,
  href,
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const classes =
    variant === "primary"
      ? "premium-button text-[#160f08]"
      : "border border-[color:var(--line)] bg-white/5 text-[color:var(--gold-soft)] hover:bg-white/9";
  const content = (
    <span className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2 text-sm font-bold transition duration-300 ${classes} ${className}`}>
      {children}
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : <button className="contents">{content}</button>;
}

export function ProgressBar({ value, animated = true }: { value: number; animated?: boolean }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/8">
      <div
        className={`h-full rounded-full bg-[linear-gradient(90deg,_#f4b15d,_#ffe1b7,_#86d5ff)] ${
          animated ? "progress-fill" : ""
        }`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function StatCard({
  label,
  value,
  detail,
  tone = "gold",
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: Tone;
}) {
  return (
    <Surface className="group p-4 hover:-translate-y-1 hover:border-[rgba(244,177,93,0.28)] hover:bg-white/[0.07]">
      <p className="text-xs text-[color:var(--muted)]">{label}</p>
      <p className="mt-2 font-display text-3xl text-white counter-pop">{value}</p>
      {detail ? (
        <div className="mt-3">
          <Pill tone={tone}>{detail}</Pill>
        </div>
      ) : null}
    </Surface>
  );
}

export function SearchBar({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange?: (value: string) => void;
}) {
  const inputProps = onChange
    ? { onChange: (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value) }
    : { readOnly: true };

  return (
    <label className="group flex min-h-14 items-center gap-3 rounded-[18px] border border-[color:var(--line)] bg-white/[0.055] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition duration-300 focus-within:border-[rgba(244,177,93,0.45)] hover:bg-white/[0.075]">
      <span className="text-lg text-[color:var(--gold-soft)]">⌕</span>
      <input
        value={value}
        {...inputProps}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[color:var(--muted)]"
      />
    </label>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange?: (tab: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto rounded-[18px] border border-[color:var(--line)] bg-black/20 p-1">
      {tabs.map((tab) => {
        const selected = tab === active;
        return (
          <button
            key={tab}
            onClick={() => onChange?.(tab)}
            className={`shrink-0 rounded-[14px] px-4 py-2 text-sm transition duration-300 ${
              selected
                ? "bg-white/10 text-white shadow-[0_0_24px_rgba(244,177,93,0.12)]"
                : "text-[color:var(--muted)] hover:bg-white/6 hover:text-white"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}

export function LoadingRibbon() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="shimmer h-28 rounded-[18px] border border-[color:var(--line)] bg-white/[0.045]" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <GlassCard className="p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] border border-[color:var(--line)] bg-white/6 text-2xl text-[color:var(--gold-soft)]">
        ✦
      </div>
      <h3 className="mt-5 font-serif text-2xl text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[color:var(--muted)]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </GlassCard>
  );
}

export function LockedOverlay({ label = "Premium" }: { label?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-start justify-end rounded-[18px] bg-[linear-gradient(135deg,_transparent_45%,_rgba(244,177,93,0.13))] p-4">
      <Pill tone="gold">{label}</Pill>
    </div>
  );
}
