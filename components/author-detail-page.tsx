"use client";

import { useState } from "react";
import Link from "next/link";
import { AccessBadge, LockedContent } from "@/components/access-helpers";
import { AuthorPortrait } from "@/components/author-portrait";
import { AuthorInlineEditor, WorkInlineEditor } from "@/components/public-inline-editors";
import { GlassCard, Pill, PremiumButton, SectionTitle } from "@/components/ui";
import { hasAccessToLevel, type AccessLevel } from "@/src/lib/access";
import type { getAuthorDetail } from "@/src/lib/content";

type AuthorDetail = NonNullable<Awaited<ReturnType<typeof getAuthorDetail>>>;

export function AuthorDetailPage({ author, isAdmin, userPlan }: { author: AuthorDetail; isAdmin: boolean; userPlan: AccessLevel }) {
  const canAccess = isAdmin || hasAccessToLevel(userPlan, author.access_level);
  return (
    <main className="space-y-6 pb-8">
      <GlassCard className="p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <AuthorPortrait name={author.name} imageUrl={author.image_url} className="aspect-[4/5] min-h-[320px]" large />
          <div>
            <SectionTitle
              eyebrow={`${author.periodLabel} • ${author.movement}`}
              title={author.name}
              description="ავტორის სრული ბიოგრაფია და პროგრამაში შესული ნაწარმოებები."
            />
            <div className="mt-5 flex flex-wrap gap-2">
              <Pill tone="gold">{author.periodLabel}</Pill>
              <Pill tone="sky">{author.movement}</Pill>
              <Pill tone="rose">{author.works.length} ნაწარმოები</Pill>
              <AccessBadge userPlan={userPlan} requiredLevel={author.access_level} />
            </div>
            {canAccess ? (
              <BiographyCard biography={author.biography} />
            ) : (
              <div className="mt-6">
                <LockedContent requiredLevel={author.access_level} />
              </div>
            )}
            {isAdmin ? <AuthorInlineEditor author={author} /> : null}
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard className="p-6">
          <h3 className="font-serif text-2xl text-white">ძირითადი თემები</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {canAccess ? author.themes.map((theme) => <Pill key={theme} tone="sky">{theme}</Pill>) : null}
            <Pill tone="rose">{author.accessLevelLabel}</Pill>
          </div>
          <div className="mt-6">
            <PremiumButton href="/quiz" variant="secondary">ტესტები ჯერ არ გაქვთ გავლილი</PremiumButton>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="font-serif text-2xl text-white">პროგრამაში შესული ნაწარმოებები</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {author.works.map((work) => (
              <div key={work.id} className="rounded-[18px] border border-[color:var(--line)] bg-white/[0.045] p-4 transition hover:-translate-y-1 hover:bg-white/[0.075]">
                <Link href={`/works/${work.slug || work.id}`}>
                  <p className="font-semibold text-white">{work.title}</p>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    {hasAccessToLevel(userPlan, work.access_level) || isAdmin ? work.summary : "ეს მასალა ჩაკეტილია თქვენი პაკეტისთვის."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2"><Pill>{work.genreLabel}</Pill></div>
                </Link>
                {isAdmin ? <WorkInlineEditor work={work} compact /> : null}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

    </main>
  );
}

function BiographyCard({ biography }: { biography: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldCollapse = biography.trim().length > 420;

  return (
    <div className="mt-6 rounded-[20px] border border-[color:var(--line)] bg-white/[0.04] p-5">
      <div className="relative">
        <div
          className={`overflow-hidden transition-[max-height] duration-500 ease-out ${isExpanded || !shouldCollapse ? "max-h-[120rem]" : "max-h-[12.5rem]"}`}
        >
          <p
            className={`whitespace-pre-wrap text-sm leading-7 text-[color:var(--muted)] ${isExpanded || !shouldCollapse ? "" : "line-clamp-6"}`}
          >
            {biography}
          </p>
        </div>
        {!isExpanded && shouldCollapse ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,rgba(11,20,35,0),rgba(11,20,35,0.92))]" />
        ) : null}
      </div>

      {shouldCollapse ? (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            className="rounded-full border border-[color:var(--line)] bg-white/[0.04] px-4 py-2 text-sm text-[color:var(--gold-soft)] transition hover:bg-white/[0.08]"
          >
            {isExpanded ? "დაკეცვა" : "მეტის ნახვა"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
