import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { WorkDetailPage } from "@/components/work-detail-page";
import { getWorkDetail } from "@/src/lib/content";

export default async function WorkDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = await getWorkDetail(slug);
  if (!work) notFound();

  return (
    <AppShell currentPath="/works">
      <WorkDetailPage work={work} />
    </AppShell>
  );
}
