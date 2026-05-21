import { AppShell } from "@/components/app-shell";
import { AdminPage } from "@/components/admin-page";
import { redirect } from "next/navigation";
import {
  ADMIN_EMAIL,
  getAuthors,
  getCurrentProfile,
  getLibraryData,
  getSubscriptions,
  getWorks,
} from "@/src/lib/content";

export default async function Admin() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin" && profile.email.toLowerCase() !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  const [authors, works, subscriptions, libraryData] = await Promise.all([
    getAuthors(),
    getWorks(),
    getSubscriptions(),
    getLibraryData(),
  ]);

  return (
    <AppShell currentPath="/admin">
      <AdminPage
        authors={authors}
        works={works}
        subscriptions={subscriptions}
        featuredAuthorId={libraryData.featuredAuthorId}
      />
    </AppShell>
  );
}
