import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AuthorDetailPage } from "@/components/author-detail-page";
import { getAuthorDetail } from "@/src/lib/content";

export default async function AuthorDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = await getAuthorDetail(slug);
  if (!author) notFound();

  return (
    <AppShell currentPath="/authors">
      <AuthorDetailPage author={author} />
    </AppShell>
  );
}
