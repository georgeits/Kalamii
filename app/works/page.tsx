import { AppShell } from "@/components/app-shell";
import { WorksPage } from "@/components/works-page";
import { getWorkProfiles } from "@/src/lib/content";

export default async function Works() {
  const works = await getWorkProfiles();

  return (
    <AppShell currentPath="/works">
      <WorksPage works={works} />
    </AppShell>
  );
}
