import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AdminExercisesPage } from "@/components/admin-exercises-page";
import { ADMIN_EMAIL, getCurrentProfile, getStandaloneExercises } from "@/src/lib/content";

export default async function AdminExercisesIndexPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin" && profile.email.toLowerCase() !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  const exercises = await getStandaloneExercises();

  return (
    <AppShell currentPath="/admin/exercises">
      <AdminExercisesPage exercises={exercises} />
    </AppShell>
  );
}
