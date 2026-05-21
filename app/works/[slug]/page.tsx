import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { WorkDetailPage } from "@/components/work-detail-page";
import { ADMIN_EMAIL, getCurrentProfile, getWorkDetail } from "@/src/lib/content";

export default async function WorkDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [work, profile] = await Promise.all([getWorkDetail(slug), getCurrentProfile()]);
  if (!work) notFound();

  return (
    <AppShell currentPath="/works">
      <WorkDetailPage work={work} isAdmin={profile?.email?.toLowerCase() === ADMIN_EMAIL} />
    </AppShell>
  );
}
