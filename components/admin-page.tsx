"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getAccessLevelLabel } from "@/src/lib/access";
import { AuthorPortrait } from "@/components/author-portrait";
import { assignSubscriptionAction, reviewPaymentRequestAction, updateFeaturedAuthorAction, updateSubscriptionAction } from "@/app/admin/actions";
import { DeleteAuthorButton, DeleteWorkButton, RemoveSubscriptionButton, SaveButton } from "@/components/admin-server-buttons";
import { EmptyState, GlassCard, Pill, PremiumButton, SectionTitle, Tabs } from "@/components/ui";
import { getPlanLabel } from "@/src/lib/plans";
import type { AuthorRecord, PaymentRequestRecord, SubscriptionRecord, WorkRecord } from "@/src/lib/content";

type WorkWithAuthorName = WorkRecord & { author: { id: string; name: string } | null };

export function AdminPage({
  authors,
  works,
  subscriptions,
  paymentRequests,
  initialPaymentStatus,
  paymentMessage,
  featuredAuthorId,
}: {
  authors: AuthorRecord[];
  works: WorkWithAuthorName[];
  subscriptions: SubscriptionRecord[];
  paymentRequests: PaymentRequestRecord[];
  initialPaymentStatus?: string;
  paymentMessage?: string;
  featuredAuthorId: string | null;
}) {
  const [paymentTab, setPaymentTab] = useState<"pending" | "approved" | "rejected">(
    initialPaymentStatus === "approved" || initialPaymentStatus === "rejected" ? initialPaymentStatus : "pending",
  );
  const filteredPaymentRequests = useMemo(
    () => paymentRequests.filter((item) => item.status === paymentTab),
    [paymentRequests, paymentTab],
  );

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
            <h3 className="font-serif text-2xl text-white">გადახდის მოთხოვნები</h3>
            <p className="mt-2 text-sm text-[color:var(--muted)]">ქვითრების დადასტურების შემდეგ პაკეტი ავტომატურად გააქტიურდება არჩეული ვადით.</p>
          </div>
          <Pill tone="gold">{paymentRequests.filter((item) => item.status === "pending").length} მოლოდინში</Pill>
        </div>

        {paymentMessage ? (
          <p className={`mt-5 rounded-[16px] px-4 py-3 text-sm ${paymentTab === "rejected" ? "border border-[rgba(255,156,140,0.22)] bg-[rgba(255,156,140,0.1)] text-[color:var(--danger)]" : "border border-[rgba(114,212,164,0.22)] bg-[rgba(114,212,164,0.1)] text-[color:var(--success)]"}`}>
            {paymentMessage}
          </p>
        ) : null}

        <div className="mt-5">
          <Tabs
            tabs={["მოლოდინში", "დადასტურებული", "უარყოფილი"]}
            active={paymentTab === "pending" ? "მოლოდინში" : paymentTab === "approved" ? "დადასტურებული" : "უარყოფილი"}
            onChange={(tab) => setPaymentTab(tab === "დადასტურებული" ? "approved" : tab === "უარყოფილი" ? "rejected" : "pending")}
          />
        </div>

        <div className="mt-6 grid gap-4">
          {filteredPaymentRequests.length > 0 ? filteredPaymentRequests.map((request) => (
            <GlassCard key={request.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-white">{request.full_name || request.email}</h4>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{request.email}</p>
                  <p className="mt-2 text-xs text-[color:var(--muted)]">
                    {new Date(request.created_at).toLocaleString("ka-GE")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone={request.plan === "premium" ? "gold" : "sky"}>{getPlanLabel(request.plan)}</Pill>
                  <Pill tone="rose">{`${request.amount}₾`}</Pill>
                  <Pill tone={request.status === "pending" ? "gold" : request.status === "approved" ? "success" : "danger"}>{request.status}</Pill>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr]">
                <div className="overflow-hidden rounded-[18px] border border-[color:var(--line)] bg-black/20">
                  {request.receipt_signed_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={request.receipt_signed_url} alt="Receipt" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex min-h-52 items-center justify-center text-sm text-[color:var(--muted)]">{request.receipt_preview_error ?? "ქვითრის ნახვა ვერ მოხერხდა."}</div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="rounded-[18px] border border-[color:var(--line)] bg-white/[0.04] p-4">
                    <p className="text-sm text-[color:var(--muted)]">კომენტარი</p>
                    <p className="mt-2 text-sm leading-6 text-white">{request.comment?.trim() || "კომენტარი არ დაუტოვებია."}</p>
                  </div>
                  {request.status === "pending" ? (
                    <form action={reviewPaymentRequestAction} className="grid gap-3 rounded-[18px] border border-[color:var(--line)] bg-white/[0.04] p-4 md:grid-cols-4">
                      <input type="hidden" name="request_id" value={request.id} />
                      <label className="block">
                        <span className="text-sm text-[color:var(--muted)]">პაკეტი</span>
                        <select name="plan" defaultValue={request.plan} className="mt-2 h-11 w-full rounded-[16px] border border-[color:var(--line)] bg-[#0d1625] px-4 text-sm text-white outline-none">
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
                      <div className="flex flex-wrap items-end gap-2">
                        <button type="submit" name="decision" value="approve" className="premium-button inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-bold text-[#160f08]">
                          დადასტურება
                        </button>
                        <button type="submit" name="decision" value="reject" className="rounded-full border border-[rgba(255,156,140,0.24)] px-4 py-2 text-sm text-[color:var(--danger)] transition hover:bg-[rgba(255,156,140,0.08)]">
                          უარყოფა
                        </button>
                      </div>
                    </form>
                  ) : null}
                </div>
              </div>
            </GlassCard>
          )) : (
            <EmptyState
              title={paymentTab === "pending" ? "მოლოდინში მოთხოვნები არ არის" : paymentTab === "approved" ? "დადასტურებული მოთხოვნები არ არის" : "უარყოფილი მოთხოვნები არ არის"}
              description="გადახდის მოთხოვნები აქ სტატუსების მიხედვით გამოჩნდება."
            />
          )}
        </div>
      </GlassCard>

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
              <form action={updateSubscriptionAction} className="mt-4 grid gap-3 md:grid-cols-4">
                <input type="hidden" name="id" value={subscription.id} />
                <label className="block">
                  <span className="text-sm text-[color:var(--muted)]">პაკეტი</span>
                  <select name="plan" defaultValue={subscription.plan} className="mt-2 h-11 w-full rounded-[16px] border border-[color:var(--line)] bg-[#0d1625] px-4 text-sm text-white outline-none">
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
                <div className="flex items-end">
                  <SaveButton label="განახლება" />
                </div>
              </form>
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
