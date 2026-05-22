import { AppShell } from "@/components/app-shell";
import { AdminPage } from "@/components/admin-page";
import { redirect } from "next/navigation";
import {
  ADMIN_EMAIL,
  getAuthors,
  getCurrentProfile,
  getLibraryData,
  getPaymentRequests,
  getSubscriptions,
  getWorks,
} from "@/src/lib/content";

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ paymentStatus?: string; paymentMessage?: string }>;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "admin" && profile.email.toLowerCase() !== ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  const [{ paymentStatus, paymentMessage }, authors, works, subscriptions, paymentRequests, libraryData] = await Promise.all([
    searchParams,
    getAuthors(),
    getWorks(),
    getSubscriptions(),
    getPaymentRequests(),
    getLibraryData(),
  ]);

  return (
    <AppShell currentPath="/admin">
      <AdminPage
        authors={authors}
        works={works}
        subscriptions={subscriptions}
        paymentRequests={paymentRequests}
        initialPaymentStatus={paymentStatus}
        paymentMessage={paymentMessage}
        featuredAuthorId={libraryData.featuredAuthorId}
      />
    </AppShell>
  );
}
