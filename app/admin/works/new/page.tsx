import { redirect } from "next/navigation";
import { createWorkAction } from "@/app/admin/actions";
import { AppShell } from "@/components/app-shell";
import { AdminWorkEditor } from "@/components/admin-editor-forms";
import {
  ADMIN_EMAIL,
  getAccessLevelOptions,
  getAuthors,
  getCurrentProfile,
  getGenreOptions,
} from "@/src/lib/content";

export default async function NewWorkAdminPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin" && profile.email.toLowerCase() !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  const authors = await getAuthors();

  return (
    <AppShell currentPath="/admin">
      <AdminWorkEditor
        action={createWorkAction}
        authors={authors}
        genreOptions={getGenreOptions()}
        accessLevelOptions={getAccessLevelOptions()}
        mode="create"
      />
    </AppShell>
  );
}
