import { redirect } from "next/navigation";
import { createStandaloneExerciseAction } from "@/app/admin/actions";
import { AppShell } from "@/components/app-shell";
import { AdminStandaloneExerciseEditor } from "@/components/admin-exercises-page";
import { ADMIN_EMAIL, getCurrentProfile } from "@/src/lib/content";
import type { ExerciseType } from "@/src/lib/exercises";

export default async function NewStandaloneExercisePage({
  searchParams,
}: {
  searchParams: Promise<{ exerciseType?: string }>;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin" && profile.email.toLowerCase() !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  const { exerciseType } = await searchParams;
  const initialType = exerciseType === "multiple_choice" || exerciseType === "reading_comprehension" ? exerciseType : "text_correction";

  return (
    <AppShell currentPath="/admin/exercises">
      <AdminStandaloneExerciseEditor action={createStandaloneExerciseAction} mode="create" initialType={initialType as ExerciseType} />
    </AppShell>
  );
}
