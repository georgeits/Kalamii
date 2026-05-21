import Link from "next/link";
import { AuthorPortrait } from "@/components/author-portrait";
import { DeleteAuthorButton, DeleteWorkButton } from "@/components/admin-server-buttons";
import { EmptyState, GlassCard, Pill, PremiumButton, SectionTitle } from "@/components/ui";
import type { AuthorRecord, WorkRecord } from "@/src/lib/content";

type WorkWithAuthorName = WorkRecord & { author: { id: string; name: string } | null };

export function AdminPage({
  authors,
  works,
}: {
  authors: AuthorRecord[];
  works: WorkWithAuthorName[];
}) {
  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="CMS"
        title="კონტენტის მართვა"
        description="აირჩიეთ კონკრეტული ავტორი ან ნაწარმოები და გახსენით სუფთა რედაქტირების გვერდი. public გვერდები პირდაპირ იმავე მონაცემს აჩვენებს, რასაც აქ ინახავთ."
        action={<PremiumButton href="/admin/authors/new">ახალი ავტორის დამატება</PremiumButton>}
      />

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <CatalogSection
          title="ავტორები"
          count={`${authors.length} ჩანაწერი`}
          actionHref="/admin/authors/new"
          actionLabel="ავტორის დამატება"
          emptyTitle="ავტორები ჯერ არ არის დამატებული"
          emptyDescription="გაუშვით seed ფაილი ან შექმენით პირველი ავტორი."
        >
          {authors.map((author) => (
            <GlassCard key={author.id} className="p-4 transition hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <AuthorPortrait name={author.name} imageUrl={author.image_url} className="h-16 w-16 shrink-0 rounded-[18px]" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{author.name}</h3>
                      <p className="mt-1 text-xs text-[color:var(--muted)]">{author.period} • {author.movement}</p>
                    </div>
                    <Pill tone="rose">{author.access_level}</Pill>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{author.biography}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link href={`/authors/${author.slug}`} className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-white transition hover:bg-white/8">
                      საჯარო გვერდი
                    </Link>
                    <Link href={`/admin/authors/${author.id}`} className="rounded-full border border-[rgba(244,177,93,0.24)] bg-[rgba(244,177,93,0.12)] px-4 py-2 text-sm text-[color:var(--gold-soft)] transition hover:bg-[rgba(244,177,93,0.18)]">
                      რედაქტირება
                    </Link>
                    <DeleteAuthorButton id={author.id} />
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </CatalogSection>

        <CatalogSection
          title="ნაწარმოებები"
          count={`${works.length} ჩანაწერი`}
          actionHref="/admin/works/new"
          actionLabel="ნაწარმოების დამატება"
          emptyTitle="ნაწარმოებები ჯერ არ არის დამატებული"
          emptyDescription="ჯერ დაამატეთ ავტორები, შემდეგ შექმენით პირველი ნაწარმოები."
        >
          {works.map((work) => (
            <GlassCard key={work.id} className="p-4 transition hover:-translate-y-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-white">{work.title}</h3>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">
                    {work.author?.name ?? "ავტორი არ არის მიბმული"} • {work.genre}
                  </p>
                </div>
                <Pill tone="rose">{work.access_level}</Pill>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[color:var(--muted)]">{work.summary}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link href={`/works/${work.slug}`} className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-white transition hover:bg-white/8">
                  საჯარო გვერდი
                </Link>
                <Link href={`/admin/works/${work.id}`} className="rounded-full border border-[rgba(244,177,93,0.24)] bg-[rgba(244,177,93,0.12)] px-4 py-2 text-sm text-[color:var(--gold-soft)] transition hover:bg-[rgba(244,177,93,0.18)]">
                  რედაქტირება
                </Link>
                <DeleteWorkButton id={work.id} />
              </div>
            </GlassCard>
          ))}
        </CatalogSection>
      </div>
    </main>
  );
}

function CatalogSection({
  title,
  count,
  actionHref,
  actionLabel,
  emptyTitle,
  emptyDescription,
  children,
}: {
  title: string;
  count: string;
  actionHref: string;
  actionLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  children: React.ReactNode;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <GlassCard className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-2xl text-white">{title}</h3>
          <p className="mt-2 text-sm text-[color:var(--muted)]">{count}</p>
        </div>
        <PremiumButton href={actionHref} variant="secondary">{actionLabel}</PremiumButton>
      </div>
      <div className="mt-5 grid gap-4">
        {hasChildren ? children : <EmptyState title={emptyTitle} description={emptyDescription} />}
      </div>
    </GlassCard>
  );
}
