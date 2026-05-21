import { AppShell } from "@/components/app-shell";
import { WorksPage } from "@/components/works-page";

export default function Works() {
  return (
    <AppShell currentPath="/works">
      <WorksPage />
    </AppShell>
  );
}
