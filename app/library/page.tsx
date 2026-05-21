import { AppShell } from "@/components/app-shell";
import { LibraryPage } from "@/components/library-page";
import { getLibraryData } from "@/src/lib/content";

export default async function Library() {
  const data = await getLibraryData();

  return (
    <AppShell currentPath="/library">
      <LibraryPage data={data} />
    </AppShell>
  );
}
