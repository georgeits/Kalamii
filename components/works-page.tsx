import Link from "next/link";
import { WorkInlineEditor } from "@/components/public-inline-editors";
import { GlassCard, Pill, SectionTitle } from "@/components/ui";
import { DEMO_RECORD_MESSAGE } from "@/src/lib/demo-record";
import type { getWorkProfiles } from "@/src/lib/content";

type WorkProfiles = Awaited<ReturnType<typeof getWorkProfiles>>;

export function WorksPage({ works, isAdmin }: { works: WorkProfiles; isAdmin: boolean }) {
  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="ნაწარმოებები"
        title="საგამოცდო ტექსტების კატალოგი"
        description="თითოეულ ტექსტს აქვს ჟანრი, ავტორი, მოკლე შეჯამება და საგამოცდო თემები. პირადი სტატუსი დაემატება მომხმარებლის აქტივობის შემდეგ."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        {works.map((work) => (
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
                  {work.is_demo ? <Pill tone="sky">დემო • მხოლოდ სანახავად</Pill> : null}
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">{work.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {work.themes.slice(0, 3).map((theme) => (
                  <Pill key={theme} tone="sky">{theme}</Pill>
                ))}
              </div>
            </Link>
            {isAdmin && !work.is_demo ? <div className="mt-4"><WorkInlineEditor work={work} compact /></div> : null}
            {isAdmin && work.is_demo ? <p className="mt-4 text-sm text-[color:var(--muted)]">{DEMO_RECORD_MESSAGE}</p> : null}
          </GlassCard>
        ))}
      </div>
    </main>
  );
}
