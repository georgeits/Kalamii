import { notFound, redirect } from "next/navigation";
import { updateStandaloneExerciseAction } from "@/app/admin/actions";
import { AppShell } from "@/components/app-shell";
import { AdminStandaloneExerciseEditor } from "@/components/admin-exercises-page";
import { ADMIN_EMAIL, getCurrentProfile, getStandaloneExerciseById } from "@/src/lib/content";

export default async function EditStandaloneExerciseAliasPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin" && profile.email.toLowerCase() !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const exercise = await getStandaloneExerciseById(id);

  if (!exercise) {
    notFound();
  }

  return (
    <AppShell currentPath="/admin/exercises">
      <AdminStandaloneExerciseEditor action={updateStandaloneExerciseAction} exercise={exercise} mode="edit" />
    </AppShell>
  );
}
