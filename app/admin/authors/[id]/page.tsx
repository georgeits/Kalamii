import { notFound, redirect } from "next/navigation";
import { updateAuthorAction } from "@/app/admin/actions";
import { AppShell } from "@/components/app-shell";
import { AdminAuthorEditor } from "@/components/admin-editor-forms";
import {
  ADMIN_EMAIL,
  getAccessLevelOptions,
  getAuthorById,
  getAuthorPeriodOptions,
  getCurrentProfile,
} from "@/src/lib/content";

export default async function EditAuthorAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin" && profile.email.toLowerCase() !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const author = await getAuthorById(id);

  if (!author) {
    notFound();
  }

  return (
    <AppShell currentPath="/admin">
      <AdminAuthorEditor
        action={updateAuthorAction}
        author={author}
        authorPeriodOptions={getAuthorPeriodOptions()}
        accessLevelOptions={getAccessLevelOptions()}
        mode="edit"
      />
    </AppShell>
  );
}
