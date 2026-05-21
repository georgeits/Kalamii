import { LibraryExperience } from "@/components/library-experience";
import type { getLibraryData } from "@/src/lib/content";

export function LibraryPage({ data }: { data: Awaited<ReturnType<typeof getLibraryData>> }) {
  return <LibraryExperience data={data} />;
}
