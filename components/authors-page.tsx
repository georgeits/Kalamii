import Link from "next/link";
import { AuthorPortrait } from "@/components/author-portrait";
import { GlassCard, Pill, SectionTitle } from "@/components/ui";
import type { getAuthorsWithWorks } from "@/src/lib/content";

type AuthorList = Awaited<ReturnType<typeof getAuthorsWithWorks>>;

export function AuthorsPage({ authors }: { authors: AuthorList }) {
  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="ავტორები"
        title="საგამოცდო პროგრამის ავტორები"
        description="ავტორები წარმოდგენილია ბიოგრაფიული მოკლე აღწერით, ლიტერატურული პერიოდით, მიმდინარეობით და პროგრამაში შესული ნაწარმოებებით."
      />
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {authors.map((author) => (
          <Link key={author.slug} href={`/authors/${author.slug}`}>
            <GlassCard className="h-full p-5 transition hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <AuthorPortrait name={author.name} imageUrl={author.image_url} className="h-16 w-16 shrink-0 rounded-[20px]" />
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-white">{author.name}</h3>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">{author.periodLabel} • {author.movement}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[color:var(--muted)]">{author.biography}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Pill tone="gold">{author.works.length} ნაწარმოები</Pill>
                    <Pill tone="rose">{author.accessLevelLabel}</Pill>
                    {author.themes.slice(0, 2).map((theme) => (
                      <Pill key={theme} tone="sky">{theme}</Pill>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </main>
  );
}
