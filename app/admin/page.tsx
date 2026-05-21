import { AppShell } from "@/components/app-shell";
import { AdminPage } from "@/components/admin-page";
import { getAuthors, getCurrentProfile, getGenreOptions, getWorks, getAuthorPeriodOptions } from "@/src/lib/content";
import { redirect } from "next/navigation";

export default async function Admin() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  const [authors, works] = await Promise.all([getAuthors(), getWorks()]);

  return (
    <AppShell currentPath="/admin">
      <AdminPage
        authors={authors}
        works={works}
        authorPeriodOptions={getAuthorPeriodOptions()}
        genreOptions={getGenreOptions()}
      />
    </AppShell>
  );
}
