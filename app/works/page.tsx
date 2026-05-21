import { AppShell } from "@/components/app-shell";
import { WorksPage } from "@/components/works-page";
import { ADMIN_EMAIL, getCurrentProfile, getWorkProfiles } from "@/src/lib/content";

export default async function Works({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [works, profile] = await Promise.all([getWorkProfiles(), getCurrentProfile()]);
  const { q } = await searchParams;

  return (
    <AppShell currentPath="/works">
      <WorksPage
        works={works}
        isAdmin={profile?.email?.toLowerCase() === ADMIN_EMAIL}
        initialQuery={q ?? ""}
        userPlan={profile?.subscription_plan ?? "free"}
      />
    </AppShell>
  );
}
