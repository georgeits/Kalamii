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
  getMaterialTypeOptions,
  getStudyMaterials,
  getSummaries,
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

  const [authors, works, summaries, studyMaterials] = await Promise.all([
    getAuthors(),
    getWorks(),
    getSummaries(),
    getStudyMaterials(),
  ]);

  return (
    <AppShell currentPath="/admin">
      <AdminPage
        authors={authors}
        works={works}
        summaries={summaries}
        studyMaterials={studyMaterials}
        authorPeriodOptions={getAuthorPeriodOptions()}
        genreOptions={getGenreOptions()}
        accessLevelOptions={getAccessLevelOptions()}
        materialTypeOptions={getMaterialTypeOptions()}
      />
    </AppShell>
  );
}
