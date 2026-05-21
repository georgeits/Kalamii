import { AppShell } from "@/components/app-shell";
import { ProfilePage } from "@/components/profile-page";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/src/lib/content";

export default async function Profile() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <AppShell currentPath="/profile">
      <ProfilePage profile={profile} />
    </AppShell>
  );
}
