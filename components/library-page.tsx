import { LibraryExperience } from "@/components/library-experience";
import type { getLibraryData } from "@/src/lib/content";

export function LibraryPage({ data, isAdmin }: { data: Awaited<ReturnType<typeof getLibraryData>>; isAdmin: boolean }) {
  return <LibraryExperience data={data} isAdmin={isAdmin} />;
}
