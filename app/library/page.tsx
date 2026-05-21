import { AppShell } from "@/components/app-shell";
import { LibraryPage } from "@/components/library-page";
import { ADMIN_EMAIL, getCurrentProfile, getLibraryData } from "@/src/lib/content";

export default async function Library({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [data, profile] = await Promise.all([getLibraryData(), getCurrentProfile()]);
  const { q } = await searchParams;

  return (
    <AppShell currentPath="/library">
      <LibraryPage
        data={data}
        isAdmin={profile?.email?.toLowerCase() === ADMIN_EMAIL}
        initialQuery={q ?? ""}
        userPlan={profile?.subscription_plan ?? "free"}
      />
    </AppShell>
  );
}
