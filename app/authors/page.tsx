import { AppShell } from "@/components/app-shell";
import { AuthorsPage } from "@/components/authors-page";
import { ADMIN_EMAIL, getAuthorsWithWorks, getCurrentProfile } from "@/src/lib/content";

export default async function Authors() {
  const [authors, profile] = await Promise.all([getAuthorsWithWorks(), getCurrentProfile()]);

  return (
    <AppShell currentPath="/authors">
      <AuthorsPage authors={authors} isAdmin={profile?.email?.toLowerCase() === ADMIN_EMAIL} />
    </AppShell>
  );
}
