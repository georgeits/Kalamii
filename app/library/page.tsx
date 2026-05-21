import { AppShell } from "@/components/app-shell";
import { LibraryPage } from "@/components/library-page";
import { ADMIN_EMAIL, getCurrentProfile, getLibraryData } from "@/src/lib/content";

export default async function Library() {
  const [data, profile] = await Promise.all([getLibraryData(), getCurrentProfile()]);

  return (
    <AppShell currentPath="/library">
      <LibraryPage data={data} isAdmin={profile?.email?.toLowerCase() === ADMIN_EMAIL} />
    </AppShell>
  );
}
