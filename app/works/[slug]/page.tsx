import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { WorkDetailPage } from "@/components/work-detail-page";
import { getWorkBySlug, workProfiles } from "@/data/library";

export function generateStaticParams() {
  return workProfiles.map((work) => ({ slug: work.slug }));
}

export default async function WorkDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = getWorkBySlug(slug);
  if (!work) notFound();

  return (
    <AppShell currentPath="/works">
      <WorkDetailPage work={work} />
    </AppShell>
  );
}
