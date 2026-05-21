"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AccessBadge } from "@/components/access-helpers";
import { AuthorPortrait } from "@/components/author-portrait";
import { AuthorInlineEditor, WorkInlineEditor } from "@/components/public-inline-editors";
import { genreTabs, libraryCategories, periodTabs } from "@/data/library";
import { EmptyState, GlassCard, Pill, PremiumButton, SearchBar, SectionTitle, Surface, Tabs } from "@/components/ui";
import type { AccessLevel } from "@/src/lib/access";
import type { getLibraryData } from "@/src/lib/content";
import { matchesSearch } from "@/src/lib/search";

type LibraryData = Awaited<ReturnType<typeof getLibraryData>>;

export function LibraryExperience({ data, isAdmin, initialQuery = "", userPlan }: { data: LibraryData; isAdmin: boolean; initialQuery?: string; userPlan: AccessLevel }) {
  const [query, setQuery] = useState(initialQuery);
  const [period, setPeriod] = useState("ყველა");
  const [genre, setGenre] = useState("ყველა");

  const filteredAuthors = useMemo(() => {
    return data.authors.filter((author) => {
      const matchesQuery =
        matchesSearch(author.name, query) ||
        matchesSearch(author.periodLabel, query) ||
        matchesSearch(author.movement, query) ||
        matchesSearch(author.biography, query) ||
        author.themes.some((theme) => matchesSearch(theme, query)) ||
        author.works.some((work) => matchesSearch(work.title, query) || matchesSearch(work.genreLabel, query));
      const matchesPeriod = period === "ყველა" || author.periodLabel === period;
      return matchesQuery && matchesPeriod;
    });
  }, [data.authors, period, query]);

  const filteredWorks = useMemo(() => {
    return data.works.filter((work) => {
      const matchesQuery =
        matchesSearch(work.title, query) ||
        matchesSearch(work.author, query) ||
        matchesSearch(work.genreLabel, query) ||
        matchesSearch(work.periodLabel, query) ||
        matchesSearch(work.summary, query) ||
        work.themes.some((theme) => matchesSearch(theme, query)) ||
        work.characters.some((character) => matchesSearch(character, query)) ||
        work.symbols.some((symbol) => matchesSearch(symbol, query));
      const matchesGenre = genre === "ყველა" || work.genreLabel === genre;
      return matchesQuery && matchesGenre;
    });
  }, [data.works, genre, query]);

  if (process.env.NODE_ENV !== "production") {
    data.authors.forEach((author) => {
      if (!author.slug?.trim()) {
        console.error("Missing author slug in library data", { authorId: author.id, name: author.name });
      }
    });
    data.works.forEach((work) => {
      if (!work.slug?.trim()) {
        console.error("Missing work slug in library data", { workId: work.id, title: work.title });
      }
    });
  }

  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="ბიბლიოთეკა"
        title="ქართული ენისა და ლიტერატურის პროგრამა"
        description="ავტორები და ნაწარმოებები ახლა პირდაპირ ცოცხალი ბაზიდან იტვირთება."
        action={<PremiumButton href="/authors">ავტორების ნახვა</PremiumButton>}
      />

      <GlassCard className="p-4 sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <SearchBar placeholder="მოძებნე ავტორი, ნაწარმოები ან ჟანრი" value={query} onChange={setQuery} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Tabs tabs={periodTabs} active={period} onChange={setPeriod} />
            <Tabs tabs={genreTabs} active={genre} onChange={setGenre} />
          </div>
        </div>
      </GlassCard>

      {data.featuredAuthor ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <GlassCard className="p-5 sm:p-6">
            <Pill tone="gold">რჩეული ავტორი</Pill>
            <h3 className="mt-3 font-serif text-3xl text-white">{data.featuredAuthor.name}</h3>
            <p className="mt-2 text-sm text-[color:var(--gold-soft)]">
              {data.featuredAuthor.periodLabel} • {data.featuredAuthor.movement}
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">{data.featuredAuthor.biography}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {data.featuredAuthor.themes.map((theme) => (
                <Pill key={theme} tone="sky">{theme}</Pill>
              ))}
              <Pill tone="rose">{data.featuredAuthor.accessLevelLabel}</Pill>
            </div>
            <div className="mt-6">
              {data.featuredAuthor.slug?.trim() ? (
                <PremiumButton href={`/authors/${data.featuredAuthor.slug}`} variant="secondary">დეტალურად</PremiumButton>
              ) : (
                <span className="inline-flex min-h-11 items-center rounded-full border border-[color:var(--line)] px-5 py-2 text-sm text-[color:var(--muted)]">
                  slug არ არის
                </span>
              )}
            </div>
          </GlassCard>

          <EmptyState
            title="მასალები ახლდება რეალურ დროში"
            description="ადმინის მიერ დამატებული ახალი მასალები და შეჯამებები ამ სივრცეში ავტომატურად გამოჩნდება."
            action={<PremiumButton href="/works" variant="secondary">აირჩიეთ ნაწარმოები</PremiumButton>}
          />
        </div>
      ) : null}

      <GlassCard className="p-5 sm:p-6">
        <h3 className="font-serif text-2xl text-white">კატეგორიები</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {libraryCategories.map((category) => (
            <Surface key={category.title} className="p-4 hover:-translate-y-1 hover:border-[rgba(244,177,93,0.24)]">
              <p className="font-semibold text-white">{category.title}</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{category.description}</p>
            </Surface>
          ))}
        </div>
      </GlassCard>

      {data.authors.length === 0 && data.works.length === 0 ? (
        <EmptyState
          title="ბიბლიოთეკა ჯერ ცარიელია"
          description="გაუშვით Supabase seed ფაილი ან შექმენით პირველი ავტორი და ნაწარმოები ადმინისტრირების პანელიდან."
          action={<PremiumButton href="/admin">ადმინის პანელი</PremiumButton>}
        />
      ) : null}

      <GlassCard id="authors" className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif text-2xl text-white">ავტორები</h3>
          <Pill tone="gold">{filteredAuthors.length} ავტორი</Pill>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredAuthors.map((author) => {
            const authorHref = author.slug?.trim() ? `/authors/${author.slug}` : null;
            return (
              <article key={author.id} className="rounded-[20px] border border-[color:var(--line)] bg-white/[0.045] p-4 transition hover:-translate-y-1 hover:border-[rgba(244,177,93,0.24)] hover:bg-white/[0.07]">
                <div className="flex h-full flex-col">
                  <Link
                    href={authorHref ?? "#"}
                    className={`block ${authorHref ? "cursor-pointer" : "cursor-not-allowed"}`}
                    onClick={(event) => {
                      if (!authorHref) {
                        event.preventDefault();
                        if (process.env.NODE_ENV !== "production") {
                          console.error("Missing author slug in library card", { authorId: author.id, name: author.name });
                        }
                      }
                    }}
                  >
                    <div className="flex items-start gap-4">
                    <AuthorPortrait name={author.name} imageUrl={author.image_url} className="h-14 w-14 shrink-0 rounded-[18px]" />
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-white">{author.name}</p>
                      <p className="mt-1 text-xs text-[color:var(--muted)]">{author.periodLabel} • {author.movement}</p>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{author.biography}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
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
              </article>
            );
          })}
        </div>
        {filteredAuthors.length === 0 ? (
          <div className="mt-5">
            <EmptyState title="შედეგი ვერ მოიძებნა." description="სცადეთ სხვა საკვანძო სიტყვა, ავტორი, პერიოდი ან ნაწარმოები." />
          </div>
        ) : null}
      </GlassCard>

      <GlassCard id="works" className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif text-2xl text-white">ნაწარმოებები</h3>
          <Pill tone="success">{filteredWorks.length} ტექსტი</Pill>
        </div>
        <div className="mt-5 grid gap-3 xl:grid-cols-2">
          {filteredWorks.map((work) => {
            const workHref = work.slug?.trim() ? `/works/${work.slug}` : null;
            return (
            <div key={work.id} className="rounded-[18px] border border-[color:var(--line)] bg-white/[0.045] p-4 transition hover:-translate-y-1 hover:border-[rgba(244,177,93,0.24)] hover:bg-white/[0.07]">
              <Link
                href={workHref ?? "#"}
                className={workHref ? "block cursor-pointer" : "block cursor-not-allowed"}
                onClick={(event) => {
                  if (!workHref) {
                    event.preventDefault();
                    if (process.env.NODE_ENV !== "production") {
                      console.error("Missing work slug in library card", { workId: work.id, title: work.title });
                    }
                  }
                }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-white">{work.title}</p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">{work.author}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Pill>{work.genreLabel}</Pill>
                    <Pill tone="rose">{work.accessLevelLabel}</Pill>
                    <AccessBadge userPlan={userPlan} requiredLevel={work.access_level} />
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{work.summary}</p>
              </Link>
              <div className="mt-4 flex items-center justify-between gap-3">
                {workHref ? (
                  <Link href={workHref} className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-white transition hover:bg-white/8">
                    გახსნა
                  </Link>
                ) : (
                  <span className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--muted)]">
                    slug არ არის
                  </span>
                )}
                {isAdmin ? <WorkInlineEditor work={work} compact /> : null}
              </div>
            </div>
          )})}
        </div>
        {filteredWorks.length === 0 ? (
          <div className="mt-5">
            <EmptyState title="შედეგი ვერ მოიძებნა." description="სცადეთ სხვა სათაური, ჟანრი, ავტორი ან საკვანძო სიტყვა." />
          </div>
        ) : null}
      </GlassCard>
    </main>
  );
}
