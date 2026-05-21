import { AuthorPortrait } from "@/components/author-portrait";
import { WorkInlineEditor } from "@/components/public-inline-editors";
import { GlassCard, Pill, PremiumButton, SectionTitle, Surface } from "@/components/ui";
import type { getWorkDetail } from "@/src/lib/content";

type WorkDetail = NonNullable<Awaited<ReturnType<typeof getWorkDetail>>>;

export function WorkDetailPage({ work, isAdmin }: { work: WorkDetail; isAdmin: boolean }) {
  return (
    <main className="space-y-6 pb-8">
      <GlassCard className="p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[120px_1fr]">
          <AuthorPortrait name={work.author} imageUrl={work.authorImageUrl} className="aspect-[4/5]" />
          <div>
            <SectionTitle
              eyebrow={`${work.author} • ${work.genreLabel}`}
              title={work.title}
              description={work.summary}
              action={
                <div className="flex flex-wrap gap-2">
                  <Pill tone="gold">{work.periodLabel}</Pill>
                  <Pill tone="rose">{work.accessLevelLabel}</Pill>
                </div>
              }
            />
            {isAdmin ? <WorkInlineEditor work={work} /> : null}
          </div>
        </div>
      </GlassCard>

      <ContentSection title="1. გეგმა" body={work.plan} />
      <ContentSection title="2. შინაარსი" body={work.summary} />
      <ContentSection title="3. ანალიზი" body={work.analysis} />
      <GlassCard className="p-6">
        <h3 className="font-serif text-2xl text-white">4. ტესტი</h3>
        {work.quiz_data?.length ? (
          <div className="mt-5 space-y-3">
            {work.quiz_data.map((item, index) => (
              <Surface key={`${item.question}-${index}`} className="p-4">
                <p className="text-sm leading-7 text-white">{index + 1}. {item.question}</p>
              </Surface>
            ))}
          </div>
        ) : (
          <EmptyCopy />
        )}
        <div className="mt-5">
          <PremiumButton href="/quiz" variant="secondary">ტესტების გვერდი</PremiumButton>
        </div>
      </GlassCard>
    </main>
  );
}

function ContentSection({ title, body }: { title: string; body?: string | null }) {
  return (
    <GlassCard className="p-6">
      <h3 className="font-serif text-2xl text-white">{title}</h3>
      {body?.trim() ? (
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] whitespace-pre-wrap">{body}</p>
      ) : (
        <EmptyCopy />
      )}
    </GlassCard>
  );
}

function EmptyCopy() {
  return <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">მასალა ჯერ არ არის დამატებული.</p>;
}
