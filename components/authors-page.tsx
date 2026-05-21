"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AccessBadge } from "@/components/access-helpers";
import { AuthorPortrait } from "@/components/author-portrait";
import { AuthorInlineEditor } from "@/components/public-inline-editors";
import { EmptyState, GlassCard, Pill, SearchBar, SectionTitle } from "@/components/ui";
import type { AccessLevel } from "@/src/lib/access";
import type { getAuthorsWithWorks } from "@/src/lib/content";
import { matchesSearch } from "@/src/lib/search";

type AuthorList = Awaited<ReturnType<typeof getAuthorsWithWorks>>;

export function AuthorsPage({ authors, isAdmin, initialQuery = "", userPlan }: { authors: AuthorList; isAdmin: boolean; initialQuery?: string; userPlan: AccessLevel }) {
  const [query, setQuery] = useState(initialQuery);
  const filteredAuthors = useMemo(
    () =>
      authors.filter((author) =>
        matchesSearch(author.name, query) ||
        matchesSearch(author.periodLabel, query) ||
        matchesSearch(author.movement, query) ||
        matchesSearch(author.biography, query) ||
        author.themes.some((theme) => matchesSearch(theme, query)) ||
        author.works.some((work) => matchesSearch(work.title, query) || matchesSearch(work.genreLabel, query)),
      ),
    [authors, query],
  );

  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="ავტორები"
        title="საგამოცდო პროგრამის ავტორები"
        description="კომპაქტური ბარათებიდან სწრაფად გახსენით ავტორი, ხოლო სრული ბიოგრაფია და ნაწარმოებები დეტალურ გვერდზე იხილეთ."
      />
      {authors.length === 0 ? (
        <EmptyState
          title="ავტორები ჯერ არ არის დამატებული"
          description="გაუშვით Supabase seed ფაილი ან დაამატეთ პირველი ავტორი ადმინისტრირების პანელიდან."
        />
      ) : null}
      <GlassCard className="p-4 sm:p-5">
        <SearchBar placeholder="მოძებნე ავტორი, პერიოდი, მიმდინარეობა ან ნაწარმოები" value={query} onChange={setQuery} />
      </GlassCard>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {filteredAuthors.map((author) => {
          const authorHref = author.slug?.trim() ? `/authors/${author.slug}` : null;

          if (!authorHref && process.env.NODE_ENV !== "production") {
            console.error("Missing author slug in authors page", { authorId: author.id, name: author.name });
          }

          return (
          <GlassCard key={author.id} className="h-full cursor-pointer p-5 transition hover:-translate-y-1 hover:border-[rgba(244,177,93,0.24)] hover:bg-white/[0.07]">
            <div className="flex h-full flex-col">
              <Link
                href={authorHref ?? "#"}
                className={authorHref ? "block" : "block cursor-not-allowed"}
                onClick={(event) => {
                  if (!authorHref) {
                    event.preventDefault();
                  }
                }}
              >
                <div className="flex items-start gap-4">
                <AuthorPortrait name={author.name} imageUrl={author.image_url} className="h-16 w-16 shrink-0 rounded-[20px]" />
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-white">{author.name}</h3>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{author.periodLabel} • {author.movement}</p>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{author.biography}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Pill tone="gold">{author.works.length} ნაწარმოები</Pill>
                    <Pill tone="rose">{author.accessLevelLabel}</Pill>
                    <AccessBadge userPlan={userPlan} requiredLevel={author.access_level} />
                  </div>
                </div>
                </div>
              </Link>
              <div className="mt-4 flex items-center justify-between gap-3">
                {authorHref ? (
                  <Link href={authorHref} className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-white transition hover:bg-white/8">
                    დეტალურად
                  </Link>
                ) : (
                  <span className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--muted)]">
                    slug არ არის
                  </span>
                )}
                {isAdmin ? <AuthorInlineEditor author={author} compact /> : null}
              </div>
            </div>
          </GlassCard>
        )})}
      </div>
      {authors.length > 0 && filteredAuthors.length === 0 ? (
        <EmptyState title="შედეგი ვერ მოიძებნა." description="სცადეთ სხვა სახელი, პერიოდი, მიმდინარეობა ან ნაწარმოები." />
      ) : null}
    </main>
  );
}
