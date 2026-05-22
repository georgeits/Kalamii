import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PaymentPage } from "@/components/payment-page";
import { getCurrentProfile } from "@/src/lib/content";
import { isPaidPlan } from "@/src/lib/plans";

export default async function Payment({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const [{ plan }, profile] = await Promise.all([searchParams, getCurrentProfile()]);

  if (!profile) {
    redirect(`/login?redirectedFrom=/payment?plan=${encodeURIComponent(plan ?? "standard")}`);
  }

  if (!plan || !isPaidPlan(plan)) {
    redirect("/profile");
  }

  return (
    <AppShell currentPath="/profile">
      <PaymentPage profile={profile} plan={plan} />
    </AppShell>
  );
}
