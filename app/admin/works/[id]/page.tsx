import { notFound, redirect } from "next/navigation";
import { updateWorkAction } from "@/app/admin/actions";
import { AppShell } from "@/components/app-shell";
import { AdminWorkEditor } from "@/components/admin-editor-forms";
import {
  ADMIN_EMAIL,
  getAccessLevelOptions,
  getAuthors,
  getCurrentProfile,
  getGenreOptions,
  getWorkById,
} from "@/src/lib/content";

export default async function EditWorkAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin" && profile.email.toLowerCase() !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const [work, authors] = await Promise.all([getWorkById(id), getAuthors()]);

  if (!work) {
    notFound();
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("Admin edit work payload", work);
  }

  return (
    <AppShell currentPath="/admin">
      <AdminWorkEditor
        action={updateWorkAction}
        work={work}
        authors={authors}
        genreOptions={getGenreOptions()}
        accessLevelOptions={getAccessLevelOptions()}
        mode="edit"
      />
    </AppShell>
  );
}
