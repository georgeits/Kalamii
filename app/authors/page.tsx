import { AppShell } from "@/components/app-shell";
import { AuthorsPage } from "@/components/authors-page";
import { getAuthorsWithWorks } from "@/src/lib/content";

export default async function Authors() {
  const authors = await getAuthorsWithWorks();

  return (
    <AppShell currentPath="/authors">
      <AuthorsPage authors={authors} />
    </AppShell>
  );
}
