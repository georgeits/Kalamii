import { AppShell } from "@/components/app-shell";
import { AuthorsPage } from "@/components/authors-page";
import { ADMIN_EMAIL, getAuthorsWithWorks, getCurrentProfile } from "@/src/lib/content";

export default async function Authors({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [authors, profile] = await Promise.all([getAuthorsWithWorks(), getCurrentProfile()]);
  const { q } = await searchParams;

  return (
    <AppShell currentPath="/authors">
      <AuthorsPage
        authors={authors}
        isAdmin={profile?.email?.toLowerCase() === ADMIN_EMAIL}
        initialQuery={q ?? ""}
        userPlan={profile?.subscription_plan ?? "free"}
      />
    </AppShell>
  );
}
