import type { workProfiles } from "@/data/library";
import { EmptyState, GlassCard, Pill, PremiumButton, SectionTitle, Surface } from "@/components/ui";

type WorkDetail = (typeof workProfiles)[number];

export function WorkDetailPage({ work }: { work: WorkDetail }) {
  return (
    <main className="space-y-6 pb-8">
      <GlassCard className="p-6 sm:p-8">
        <SectionTitle
          eyebrow={`${work.author} • ${work.genreLabel}`}
          title={work.title}
          description={work.summary}
          action={<Pill tone="gold">{work.periodLabel}</Pill>}
        />
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="p-6">
          <h3 className="font-serif text-2xl text-white">სასწავლო სტრუქტურა</h3>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <DetailList title="თემები" items={work.themes} />
            <DetailList title="პერსონაჟები / მხარეები" items={work.characters} />
            <DetailList title="სიმბოლოები" items={work.symbols} />
            <DetailList title="გამოცდის რჩევები" items={work.examTips} />
          </div>
        </GlassCard>

        <EmptyState
          title="ტესტები ჯერ არ გაქვთ გავლილი"
          description="ამ ნაწარმოებზე ტესტის შედეგები და შეცდომების ანალიზი გამოჩნდება რეალური ტესტის დასრულების შემდეგ."
          action={<PremiumButton href="/quiz" variant="secondary">ტესტების გვერდი</PremiumButton>}
        />
      </div>

      <GlassCard className="p-6">
        <h3 className="font-serif text-2xl text-white">დეტალური ანალიზი</h3>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
          დეტალური ანალიზის სრული ტექსტი დაემატება ადმინისტრატორის მიერ. ამ ეტაპზე გვერდი აჩვენებს მხოლოდ საგამოცდო პროგრამის სტრუქტურულ ინფორმაციას: ავტორს, ჟანრს, მოკლე შინაარსს, თემებს და ანალიზის საყრდენ საკითხებს.
        </p>
      </GlassCard>
    </main>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <Surface className="p-4">
      <p className="font-semibold text-white">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => <Pill key={item} tone="sky">{item}</Pill>)}
      </div>
    </Surface>
  );
}
