import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AuthorDetailPage } from "@/components/author-detail-page";
import { authorProfiles, getAuthorBySlug } from "@/data/library";

export function generateStaticParams() {
  return authorProfiles.map((author) => ({ slug: author.slug }));
}

export default async function AuthorDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) notFound();

  return (
    <AppShell currentPath="/authors">
      <AuthorDetailPage author={author} />
    </AppShell>
  );
}
