import { LibraryExperience } from "@/components/library-experience";
import type { AccessLevel } from "@/src/lib/access";
import type { getLibraryData } from "@/src/lib/content";

export function LibraryPage({
  data,
  isAdmin,
  initialQuery = "",
  userPlan,
}: {
  data: Awaited<ReturnType<typeof getLibraryData>>;
  isAdmin: boolean;
  initialQuery?: string;
  userPlan: AccessLevel;
}) {
  return <LibraryExperience data={data} isAdmin={isAdmin} initialQuery={initialQuery} userPlan={userPlan} />;
}
