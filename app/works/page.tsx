import { AppShell } from "@/components/app-shell";
import { WorksPage } from "@/components/works-page";
import { ADMIN_EMAIL, getCurrentProfile, getWorkProfiles } from "@/src/lib/content";

export default async function Works() {
  const [works, profile] = await Promise.all([getWorkProfiles(), getCurrentProfile()]);

  return (
    <AppShell currentPath="/works">
      <WorksPage works={works} isAdmin={profile?.email?.toLowerCase() === ADMIN_EMAIL} />
    </AppShell>
  );
}
