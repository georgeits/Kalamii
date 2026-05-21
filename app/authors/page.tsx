import { AppShell } from "@/components/app-shell";
import { AuthorsPage } from "@/components/authors-page";

export default function Authors() {
  return (
    <AppShell currentPath="/authors">
      <AuthorsPage />
    </AppShell>
  );
}
