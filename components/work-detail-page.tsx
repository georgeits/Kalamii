import { GlassCard, Pill, PremiumButton, SectionTitle, Surface } from "@/components/ui";
import type { getWorkDetail } from "@/src/lib/content";

type WorkDetail = NonNullable<Awaited<ReturnType<typeof getWorkDetail>>>;

export function WorkDetailPage({ work }: { work: WorkDetail }) {
  return (
    <main className="space-y-6 pb-8">
      <GlassCard className="p-6 sm:p-8">
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
      </GlassCard>

      <ContentSection title="1. სასწავლო მასალა" body={work.content?.study_material_body} />
      <ContentSection title="2. გეგმა" body={work.content?.plan_body} />
      <ContentSection title="3. შინაარსი" body={work.content?.summary_body} />
      <ContentSection title="4. ანალიზი" body={work.content?.analysis_body} />
      <GlassCard className="p-6">
        <h3 className="font-serif text-2xl text-white">5. ტესტი</h3>
        {work.content?.quiz_questions?.length ? (
          <div className="mt-5 space-y-3">
            {work.content.quiz_questions.map((item, index) => (
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
