import { AppShell } from "@/components/app-shell";
import { AdminAuthorEditor } from "@/components/admin-editor-forms";
import { createAuthorAction } from "@/app/admin/actions";
import { redirect } from "next/navigation";
import { ADMIN_EMAIL, getAccessLevelOptions, getAuthorPeriodOptions, getCurrentProfile } from "@/src/lib/content";

export default async function NewAuthorAdminPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin" && profile.email.toLowerCase() !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  return (
    <AppShell currentPath="/admin">
      <AdminAuthorEditor
        action={createAuthorAction}
        authorPeriodOptions={getAuthorPeriodOptions()}
        accessLevelOptions={getAccessLevelOptions()}
        mode="create"
      />
    </AppShell>
  );
}
