import Link from "next/link";
import { AuthorPortrait } from "@/components/author-portrait";
import { GlassCard, Pill, PremiumButton, SectionTitle, Surface } from "@/components/ui";
import type { getAuthorDetail } from "@/src/lib/content";

type AuthorDetail = NonNullable<Awaited<ReturnType<typeof getAuthorDetail>>>;

export function AuthorDetailPage({ author }: { author: AuthorDetail }) {
  return (
    <main className="space-y-6 pb-8">
      <GlassCard className="p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <AuthorPortrait name={author.name} imageUrl={author.image_url} className="aspect-[4/5]" large />
          <SectionTitle eyebrow={`${author.periodLabel} • ${author.movement}`} title={author.name} description={author.biography} />
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard className="p-6">
          <h3 className="font-serif text-2xl text-white">ძირითადი თემები</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {author.themes.map((theme) => <Pill key={theme} tone="sky">{theme}</Pill>)}
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
              <Link key={work.slug} href={`/works/${work.slug}`} className="rounded-[18px] border border-[color:var(--line)] bg-white/[0.045] p-4 transition hover:-translate-y-1 hover:bg-white/[0.075]">
                <p className="font-semibold text-white">{work.title}</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{work.summary}</p>
                <div className="mt-4"><Pill>{work.genreLabel}</Pill></div>
              </Link>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h3 className="font-serif text-2xl text-white">სასწავლო მასალები</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {author.materials.length > 0 ? (
            author.materials.map((item) => (
              <Surface key={item.id} className="p-4">
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill tone="gold">{item.material_type}</Pill>
                  <Pill tone="rose">{item.access_level}</Pill>
                </div>
                <a href={item.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm text-[color:var(--gold-soft)]">
                  გახსნა
                </a>
              </Surface>
            ))
          ) : (
            ["ბიოგრაფია", "თემები", "ნაწარმოებები"].map((item) => (
              <Surface key={item} className="p-4">
                <p className="font-semibold text-white">{item}</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">დამატებითი კონსპექტები გამოჩნდება კონტენტის დამატების შემდეგ.</p>
              </Surface>
            ))
          )}
        </div>
      </GlassCard>
    </main>
  );
}
