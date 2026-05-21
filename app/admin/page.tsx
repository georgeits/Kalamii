import { AppShell } from "@/components/app-shell";
import { AdminPage } from "@/components/admin-page";

export default function Admin() {
  return (
    <AppShell currentPath="/admin">
      <AdminPage />
    </AppShell>
  );
}
