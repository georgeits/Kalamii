import Link from "next/link";
import { GlassCard, Pill, SectionTitle } from "@/components/ui";
import type { getWorkProfiles } from "@/src/lib/content";

type WorkProfiles = Awaited<ReturnType<typeof getWorkProfiles>>;

export function WorksPage({ works }: { works: WorkProfiles }) {
  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="ნაწარმოებები"
        title="საგამოცდო ტექსტების კატალოგი"
        description="თითოეულ ტექსტს აქვს ჟანრი, ავტორი, მოკლე შეჯამება და საგამოცდო თემები. პირადი სტატუსი დაემატება მომხმარებლის აქტივობის შემდეგ."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        {works.map((work) => (
          <Link key={work.slug} href={`/works/${work.slug}`}>
            <GlassCard className="h-full p-5 transition hover:-translate-y-1">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-serif text-2xl text-white">{work.title}</h3>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{work.author}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Pill>{work.genreLabel}</Pill>
                  <Pill tone="rose">{work.accessLevelLabel}</Pill>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">{work.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {work.themes.slice(0, 3).map((theme) => (
                  <Pill key={theme} tone="sky">{theme}</Pill>
                ))}
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </main>
  );
}
