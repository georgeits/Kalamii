"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AccessBadge } from "@/components/access-helpers";
import { WorkInlineEditor } from "@/components/public-inline-editors";
import { EmptyState, GlassCard, Pill, SearchBar, SectionTitle } from "@/components/ui";
import type { AccessLevel } from "@/src/lib/access";
import type { getWorkProfiles } from "@/src/lib/content";
import { matchesSearch } from "@/src/lib/search";

type WorkProfiles = Awaited<ReturnType<typeof getWorkProfiles>>;

export function WorksPage({ works, isAdmin, initialQuery = "", userPlan }: { works: WorkProfiles; isAdmin: boolean; initialQuery?: string; userPlan: AccessLevel }) {
  const [query, setQuery] = useState(initialQuery);
  const filteredWorks = useMemo(
    () =>
      works.filter((work) =>
        matchesSearch(work.title, query) ||
        matchesSearch(work.author, query) ||
        matchesSearch(work.genreLabel, query) ||
        matchesSearch(work.periodLabel, query) ||
        matchesSearch(work.summary, query) ||
        work.themes.some((theme) => matchesSearch(theme, query)) ||
        work.characters.some((character) => matchesSearch(character, query)) ||
        work.symbols.some((symbol) => matchesSearch(symbol, query)),
      ),
    [works, query],
  );

  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="ნაწარმოებები"
        title="საგამოცდო ტექსტების კატალოგი"
        description="თითოეულ ტექსტს აქვს ჟანრი, ავტორი, მოკლე შეჯამება და საგამოცდო თემები. პირადი სტატუსი დაემატება მომხმარებლის აქტივობის შემდეგ."
      />
      {works.length === 0 ? (
        <EmptyState
          title="ნაწარმოებები ჯერ არ არის დამატებული"
          description="გაუშვით Supabase seed ფაილი ან შექმენით პირველი ნაწარმოები ადმინისტრირების პანელიდან."
        />
      ) : null}
      <GlassCard className="p-4 sm:p-5">
        <SearchBar placeholder="მოძებნე ნაწარმოები, ავტორი, ჟანრი ან საკვანძო სიტყვა" value={query} onChange={setQuery} />
      </GlassCard>
      <div className="grid gap-4 xl:grid-cols-2">
        {filteredWorks.map((work) => (
          <GlassCard key={work.slug} className="h-full p-5 transition hover:-translate-y-1">
            <Link href={`/works/${work.slug}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-white">{work.title}</h3>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{work.author}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Pill>{work.genreLabel}</Pill>
                  <Pill tone="rose">{work.accessLevelLabel}</Pill>
                  <AccessBadge userPlan={userPlan} requiredLevel={work.access_level} />
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">{work.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {work.themes.slice(0, 3).map((theme) => (
                  <Pill key={theme} tone="sky">{theme}</Pill>
                ))}
              </div>
            </Link>
            {isAdmin ? <div className="mt-4"><WorkInlineEditor work={work} compact /></div> : null}
          </GlassCard>
        ))}
      </div>
      {works.length > 0 && filteredWorks.length === 0 ? (
        <EmptyState title="შედეგი ვერ მოიძებნა." description="სცადეთ სხვა სათაური, ავტორი, ჟანრი ან საკვანძო სიტყვა." />
      ) : null}
    </main>
  );
}
