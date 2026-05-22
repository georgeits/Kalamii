import Link from "next/link";
import { AccessBadge } from "@/components/access-helpers";
import { AuthorPortrait } from "@/components/author-portrait";
import { GlassCard, Pill, PremiumButton, SectionTitle, Surface } from "@/components/ui";
import type { ProfileRecord, getDashboardData } from "@/src/lib/content";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

function getGreetingName(profile: ProfileRecord) {
  const fullName = profile.full_name?.trim();

  if (!fullName) {
    return profile.email;
  }

  return fullName.split(/\s+/)[0] ?? fullName;
}

export function DashboardPage({
  profile,
  data,
}: {
  profile: ProfileRecord;
  data: DashboardData;
}) {
  const displayName = getGreetingName(profile);

  return (
    <main className="space-y-6 pb-8">
      <GlassCard className="overflow-hidden p-6 sm:p-7">
        <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(244,177,93,0.22),_transparent_72%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--gold)]">სამუშაო სივრცე</p>
            <h1 className="mt-3 font-serif text-3xl text-white sm:text-4xl">{`მოგესალმებით, ${displayName}`}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">
              გააგრძელე სწავლა, გახსენი ბიბლიოთეკა ან დაიწყე სავარჯიშო.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <PremiumButton href="/library">ბიბლიოთეკის გახსნა</PremiumButton>
            <PremiumButton href="/quiz" variant="secondary">სავარჯიშოს დაწყება</PremiumButton>
            <PremiumButton href="/works" variant="secondary">ახალი ნაწარმოებები</PremiumButton>
          </div>
        </div>
      </GlassCard>

      {data.popularWorks.length > 0 ? (
        <section className="space-y-4">
          <SectionTitle
            eyebrow="ნაწარმოებები"
            title="პოპულარული ნაწარმოებები"
            description="სწრაფად გახსენი მიმდინარე ბიბლიოთეკის ყველაზე აქტიური და სასწავლოდ მზადყოფნაში მყოფი ტექსტები."
            compact
          />
          <div className="grid gap-4 xl:grid-cols-2">
            {data.popularWorks.map((work) => {
              const workPath = work.slug?.trim() || work.id;

              return (
                <GlassCard key={work.id} className="p-5">
                  <div className="flex h-full flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-serif text-2xl text-white">{work.title}</h3>
                        <p className="mt-1 text-sm text-[color:var(--muted)]">{work.author}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Pill tone="rose">{work.accessLevelLabel}</Pill>
                        <AccessBadge userPlan={profile.subscription_plan} requiredLevel={work.access_level} />
                      </div>
                    </div>
                    <p className="line-clamp-3 text-sm leading-6 text-[color:var(--muted)]">{work.summary}</p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        {work.themes.slice(0, 2).map((theme) => (
                          <Pill key={theme} tone="gold">{theme}</Pill>
                        ))}
                      </div>
                      <Link
                        href={`/works/${workPath}`}
                        className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-white transition hover:bg-white/8"
                      >
                        გახსნა
                      </Link>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </section>
      ) : null}

      {data.popularAuthors.length > 0 ? (
        <section className="space-y-4">
          <SectionTitle
            eyebrow="ავტორები"
            title="პოპულარული ავტორები"
            description="იხილე ყველაზე მდიდარი კატალოგის ავტორები და გადადი მათ ბიოგრაფიასა და ნაწარმოებებზე."
            compact
          />
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            {data.popularAuthors.map((author) => {
              const authorPath = author.slug?.trim() || author.id;

              return (
                <GlassCard key={author.id} className="p-5">
                  <div className="flex h-full flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <AuthorPortrait name={author.name} imageUrl={author.image_url} className="h-16 w-16 shrink-0 rounded-[20px]" />
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-white">{author.name}</h3>
                        <p className="mt-1 text-sm text-[color:var(--muted)]">{author.periodLabel}</p>
                        <p className="mt-1 text-xs text-[color:var(--muted)]">{author.movement}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Pill tone="gold">{author.works.length} ნაწარმოები</Pill>
                      <Pill tone="rose">{author.accessLevelLabel}</Pill>
                    </div>
                    <Link
                      href={`/authors/${authorPath}`}
                      className="mt-auto rounded-full border border-[color:var(--line)] px-4 py-2 text-center text-sm text-white transition hover:bg-white/8"
                    >
                      დეტალურად
                    </Link>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </section>
      ) : null}

      {data.newTests.length > 0 ? (
        <section className="space-y-4">
          <SectionTitle
            eyebrow="სავარჯიშოები"
            title="ახალი სავარჯიშოები"
            description="ეს სექცია ჩანს მხოლოდ მაშინ, როცა რეალურ ნაწარმოებებს დამატებული აქვთ სავარჯიშოები ან quiz data."
            compact
          />
          <div className="grid gap-4 lg:grid-cols-2">
            {data.newTests.map((work) => {
              const workPath = work.slug?.trim() || work.id;

              return (
                <Surface key={work.id} className="p-5">
                  <div className="flex h-full flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-serif text-xl text-white">{work.title}</h3>
                        <p className="mt-1 text-sm text-[color:var(--muted)]">{work.author}</p>
                      </div>
                      <Pill tone="sky">{work.quiz_data?.length ?? 0} კითხვა</Pill>
                    </div>
                    <p className="line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{work.summary}</p>
                    <div className="flex items-center justify-between gap-3">
                      <AccessBadge userPlan={profile.subscription_plan} requiredLevel={work.access_level} />
                      <Link
                        href={`/works/${workPath}`}
                        className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-white transition hover:bg-white/8"
                      >
                        გახსნა
                      </Link>
                    </div>
                  </div>
                </Surface>
              );
            })}
          </div>
        </section>
      ) : null}
    </main>
  );
}
