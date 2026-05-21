import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DashboardPage } from "@/components/dashboard-page";
import { getCurrentProfile } from "@/src/lib/content";

export default async function Dashboard() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  return (
    <AppShell currentPath="/dashboard">
      <DashboardPage profile={profile} />
    </AppShell>
  );
}
