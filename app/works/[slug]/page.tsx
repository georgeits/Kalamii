import { AppShell } from "@/components/app-shell";
import { WorkDetailPage } from "@/components/work-detail-page";
import { EmptyState, PremiumButton } from "@/components/ui";
import { ADMIN_EMAIL, getCurrentProfile, getWorkDetail } from "@/src/lib/content";

export default async function WorkDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [work, profile] = await Promise.all([getWorkDetail(slug), getCurrentProfile()]);
  if (!work) {
    return (
      <AppShell currentPath="/works">
        <EmptyState
          title="ნაწარმოები ვერ მოიძებნა"
          description="ეს ბმული მოძველებულია ან slug ჯერ არ არის განახლებული. დაბრუნდით კატალოგში და სცადეთ ხელახლა."
          action={<PremiumButton href="/works">ნაწარმოებების ნახვა</PremiumButton>}
        />
      </AppShell>
    );
  }

  return (
    <AppShell currentPath="/works">
      <WorkDetailPage
        work={work}
        isAdmin={profile?.email?.toLowerCase() === ADMIN_EMAIL}
        userPlan={profile?.subscription_plan ?? "free"}
      />
    </AppShell>
  );
}
