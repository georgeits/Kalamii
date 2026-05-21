import { AppShell } from "@/components/app-shell";
import { AdminPage } from "@/components/admin-page";
import { redirect } from "next/navigation";
import {
  ADMIN_EMAIL,
  getAccessLevelOptions,
  getAuthors,
  getAuthorPeriodOptions,
  getCurrentProfile,
  getGenreOptions,
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

  const [authors, works] = await Promise.all([
    getAuthors(),
    getWorks(),
  ]);

  return (
    <AppShell currentPath="/admin">
      <AdminPage
        authors={authors}
        works={works}
        authorPeriodOptions={getAuthorPeriodOptions()}
        genreOptions={getGenreOptions()}
        accessLevelOptions={getAccessLevelOptions()}
      />
    </AppShell>
  );
}
