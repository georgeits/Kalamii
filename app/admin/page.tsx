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
  getWorkContents,
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

  const [authors, works, studyMaterials, workContents] = await Promise.all([
    getAuthors(),
    getWorks(),
    getStudyMaterials(),
    getWorkContents(),
  ]);

  return (
    <AppShell currentPath="/admin">
      <AdminPage
        authors={authors}
        works={works}
        studyMaterials={studyMaterials}
        workContents={workContents}
        authorPeriodOptions={getAuthorPeriodOptions()}
        genreOptions={getGenreOptions()}
        accessLevelOptions={getAccessLevelOptions()}
        materialTypeOptions={getMaterialTypeOptions()}
      />
    </AppShell>
  );
}
