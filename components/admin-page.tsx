import Link from "next/link";
import { getAccessLevelLabel } from "@/src/lib/access";
import { AuthorPortrait } from "@/components/author-portrait";
import { assignSubscriptionAction, updateFeaturedAuthorAction } from "@/app/admin/actions";
import { DeleteAuthorButton, DeleteWorkButton, RemoveSubscriptionButton, SaveButton } from "@/components/admin-server-buttons";
import { EmptyState, GlassCard, Pill, PremiumButton, SectionTitle } from "@/components/ui";
import type { AuthorRecord, SubscriptionRecord, WorkRecord } from "@/src/lib/content";

type WorkWithAuthorName = WorkRecord & { author: { id: string; name: string } | null };

export function AdminPage({
  authors,
  works,
  subscriptions,
  featuredAuthorId,
}: {
  authors: AuthorRecord[];
  works: WorkWithAuthorName[];
  subscriptions: SubscriptionRecord[];
  featuredAuthorId: string | null;
}) {
  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="CMS"
        title="კონტენტის მართვა"
        description="აირჩიეთ კონკრეტული ავტორი ან ნაწარმოები და გახსენით სუფთა რედაქტირების გვერდი. public გვერდები პირდაპირ იმავე მონაცემს აჩვენებს, რასაც აქ ინახავთ."
        action={<PremiumButton href="/admin/authors/new">ახალი ავტორის დამატება</PremiumButton>}
      />

      <GlassCard className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-2xl text-white">დღის რჩეული ავტორი</h3>
            <p className="mt-2 text-sm text-[color:var(--muted)]">აირჩიეთ რომელი ავტორი გამოჩნდეს ბიბლიოთეკის ზედა ბლოკში. თუ არაფერი აირჩევა, ბლოკი საერთოდ დაიმალება.</p>
          </div>
          <Pill tone="gold">{featuredAuthorId ? "ჩართულია" : "დამალულია"}</Pill>
        </div>

        <form action={updateFeaturedAuthorAction} className="mt-6 grid gap-4 rounded-[20px] border border-[color:var(--line)] bg-white/[0.04] p-4 md:grid-cols-[1fr_auto] md:items-end">
          <label className="block">
            <span className="text-sm text-[color:var(--muted)]">რჩეული ავტორი</span>
            <select name="featured_author_id" defaultValue={featuredAuthorId ?? ""} className="mt-2 h-11 w-full rounded-[16px] border border-[color:var(--line)] bg-[#0d1625] px-4 text-sm text-white outline-none">
              <option value="">არ აჩვენო</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </label>
          <SaveButton label="შენახვა" />
        </form>
      </GlassCard>

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

      <GlassCard className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-2xl text-white">მომხმარებლების პაკეტები</h3>
            <p className="mt-2 text-sm text-[color:var(--muted)]">ხელით მიანიჭეთ უფასო, სტანდარტი ან პრემიუმი ელფოსტის მიხედვით. ეს დროებითია გადახდების ინტეგრაციამდე.</p>
          </div>
          <Pill tone="gold">{subscriptions.filter((item) => item.status === "active" && item.plan !== "free").length} აქტიური</Pill>
        </div>

        <form action={assignSubscriptionAction} className="mt-6 grid gap-4 rounded-[20px] border border-[color:var(--line)] bg-white/[0.04] p-4 md:grid-cols-5">
          <label className="block md:col-span-2">
            <span className="text-sm text-[color:var(--muted)]">მომხმარებლის ელფოსტა</span>
            <input type="email" name="email" required className="mt-2 h-11 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 text-sm text-white outline-none" />
          </label>
          <label className="block">
            <span className="text-sm text-[color:var(--muted)]">პაკეტი</span>
            <select name="plan" defaultValue="standard" className="mt-2 h-11 w-full rounded-[16px] border border-[color:var(--line)] bg-[#0d1625] px-4 text-sm text-white outline-none">
              <option value="free">უფასო</option>
              <option value="standard">სტანდარტი</option>
              <option value="premium">პრემიუმი</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-[color:var(--muted)]">ხანგრძლივობა</span>
            <select name="duration" defaultValue="30" className="mt-2 h-11 w-full rounded-[16px] border border-[color:var(--line)] bg-[#0d1625] px-4 text-sm text-white outline-none">
              <option value="7">7 დღე</option>
              <option value="30">30 დღე</option>
              <option value="90">90 დღე</option>
              <option value="custom">მითითებული თარიღი</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-[color:var(--muted)]">მითითებული თარიღი</span>
            <input type="date" name="custom_expires_at" className="mt-2 h-11 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 text-sm text-white outline-none" />
          </label>
          <div className="md:col-span-5">
            <SaveButton label="წვდომის მინიჭება" />
          </div>
        </form>

        <div className="mt-6 grid gap-4">
          {subscriptions.length > 0 ? subscriptions.map((subscription) => (
            <GlassCard key={subscription.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-white">{subscription.full_name || subscription.email}</h4>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{subscription.email}</p>
                  <p className="mt-2 text-xs text-[color:var(--muted)]">
                    {subscription.expires_at ? `ვადა: ${new Date(subscription.expires_at).toLocaleDateString("ka-GE")}` : "ვადა არ არის მითითებული"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={subscription.plan === "premium" ? "gold" : subscription.plan === "standard" ? "sky" : "default"}>
                    {getAccessLevelLabel(subscription.plan)}
                  </Pill>
                  <Pill tone={subscription.status === "active" ? "success" : "danger"}>{subscription.status}</Pill>
                  <RemoveSubscriptionButton id={subscription.id} />
                </div>
              </div>
            </GlassCard>
          )) : (
            <EmptyState title="აქტიური პაკეტები ჯერ არ არის" description="პირველი ტესტური სტანდარტი ან პრემიუმი აქ გამოჩნდება მინიჭების შემდეგ." />
          )}
        </div>
      </GlassCard>
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
