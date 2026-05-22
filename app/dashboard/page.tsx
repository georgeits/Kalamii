import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DashboardPage } from "@/components/dashboard-page";
import { getCurrentProfile, getDashboardData } from "@/src/lib/content";

export default async function Dashboard() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  const data = await getDashboardData();

  return (
    <AppShell currentPath="/dashboard">
      <DashboardPage profile={profile} data={data} />
    </AppShell>
  );
}
