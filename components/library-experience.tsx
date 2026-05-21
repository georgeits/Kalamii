"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { genreTabs, libraryCategories, periodTabs } from "@/data/library";
import { EmptyState, GlassCard, Pill, PremiumButton, SearchBar, SectionTitle, Surface, Tabs } from "@/components/ui";
import type { getLibraryData } from "@/src/lib/content";

type LibraryData = Awaited<ReturnType<typeof getLibraryData>>;

export function LibraryExperience({ data }: { data: LibraryData }) {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("ყველა");
  const [genre, setGenre] = useState("ყველა");
  const [openAuthor, setOpenAuthor] = useState(data.featuredAuthor?.slug ?? "");

  const filteredAuthors = useMemo(() => {
    const normalizedQuery = query.trim();
    return data.authors.filter((author) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        author.name.includes(normalizedQuery) ||
        author.periodLabel.includes(normalizedQuery) ||
        author.movement.includes(normalizedQuery) ||
        author.works.some((work) => work.title.includes(normalizedQuery));
      const matchesPeriod = period === "ყველა" || author.periodLabel === period;
      return matchesQuery && matchesPeriod;
    });
  }, [data.authors, period, query]);

  const filteredWorks = useMemo(() => {
    const normalizedQuery = query.trim();
    return data.works.filter((work) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        work.title.includes(normalizedQuery) ||
        work.author.includes(normalizedQuery) ||
        work.genreLabel.includes(normalizedQuery);
      const matchesGenre = genre === "ყველა" || work.genreLabel === genre;
      return matchesQuery && matchesGenre;
    });
  }, [data.works, genre, query]);

  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="ბიბლიოთეკა"
        title="ქართული ენისა და ლიტერატურის პროგრამა"
        description="ავტორები, ნაწარმოებები, შეჯამებები და სასწავლო მასალები ახლა პირდაპირ ცოცხალი ბაზიდან იტვირთება."
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
              <PremiumButton href={`/authors/${data.featuredAuthor.slug}`} variant="secondary">პროფილის გახსნა</PremiumButton>
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

      <GlassCard id="authors" className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif text-2xl text-white">ავტორები</h3>
          <Pill tone="gold">{filteredAuthors.length} ავტორი</Pill>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredAuthors.map((author) => {
            const expanded = openAuthor === author.slug;
            return (
              <article key={author.slug} className="rounded-[20px] border border-[color:var(--line)] bg-white/[0.045] p-4 transition hover:-translate-y-1 hover:bg-white/[0.07]">
                <button className="w-full text-left" onClick={() => setOpenAuthor(expanded ? "" : author.slug)}>
                  <div className="flex items-start gap-4">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] border border-[color:var(--line)] bg-white/[0.05] font-serif text-xl text-[color:var(--gold-soft)]">
                      {author.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-white">{author.name}</p>
                      <p className="mt-1 text-xs text-[color:var(--muted)]">{author.periodLabel} • {author.movement}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Pill tone="gold">{author.works.length} ნაწარმოები</Pill>
                        <Pill tone="rose">{author.accessLevelLabel}</Pill>
                      </div>
                    </div>
                  </div>
                </button>
                {expanded ? (
                  <div className="mt-4 border-t border-[color:var(--line)] pt-4">
                    <p className="text-sm leading-6 text-[color:var(--muted)]">{author.biography}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {author.works.map((work) => (
                        <Link key={work.slug} href={`/works/${work.slug}`} className="rounded-full border border-[color:var(--line)] px-3 py-1.5 text-xs text-white transition hover:bg-white/8">
                          {work.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard id="works" className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif text-2xl text-white">ნაწარმოებები</h3>
          <Pill tone="success">{filteredWorks.length} ტექსტი</Pill>
        </div>
        <div className="mt-5 grid gap-3 xl:grid-cols-2">
          {filteredWorks.map((work) => (
            <Link key={work.slug} href={`/works/${work.slug}`} className="rounded-[18px] border border-[color:var(--line)] bg-white/[0.045] p-4 transition hover:-translate-y-1 hover:bg-white/[0.07]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-white">{work.title}</p>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{work.author}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Pill>{work.genreLabel}</Pill>
                  <Pill tone="rose">{work.accessLevelLabel}</Pill>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{work.summary}</p>
            </Link>
          ))}
        </div>
      </GlassCard>
    </main>
  );
}
