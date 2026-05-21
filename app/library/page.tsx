import { AppShell } from "@/components/app-shell";
import { LibraryPage } from "@/components/library-page";

export default function Library() {
  return (
    <AppShell currentPath="/library">
      <LibraryPage />
    </AppShell>
  );
}
