import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DashboardPage } from "@/components/dashboard-page";
import { createClient } from "@/src/lib/supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell currentPath="/dashboard">
      <DashboardPage />
    </AppShell>
  );
}
