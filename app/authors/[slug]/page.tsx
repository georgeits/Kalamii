import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AuthorDetailPage } from "@/components/author-detail-page";
import { ADMIN_EMAIL, getAuthorDetail, getCurrentProfile } from "@/src/lib/content";

export default async function AuthorDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [author, profile] = await Promise.all([getAuthorDetail(slug), getCurrentProfile()]);
  if (!author) notFound();

  return (
    <AppShell currentPath="/authors">
      <AuthorDetailPage author={author} isAdmin={profile?.email?.toLowerCase() === ADMIN_EMAIL} />
    </AppShell>
  );
}
