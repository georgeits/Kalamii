import { LogoutButton } from "@/components/logout-button";
import { GlassCard, Pill, PremiumButton, SectionTitle, Surface } from "@/components/ui";
import type { ProfileRecord } from "@/src/lib/content";

export function ProfilePage({ profile }: { profile: ProfileRecord }) {
  const displayName = profile.full_name?.trim() || profile.email;

  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="პროფილი"
        title={displayName}
        description="ეს არის თქვენი რეალური Supabase პროფილი. სახელი და როლი იტვირთება `profiles` ცხრილიდან."
        action={<LogoutButton />}
      />

      <GlassCard className="p-6">
        <h3 className="font-serif text-2xl text-white">ანგარიშის მონაცემები</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <Surface className="p-4">
            <p className="font-semibold text-white">სრული სახელი</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{displayName}</p>
          </Surface>
          <Surface className="p-4">
            <p className="font-semibold text-white">ელფოსტა</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{profile.email}</p>
          </Surface>
          <Surface className="p-4">
            <p className="font-semibold text-white">როლი</p>
            <div className="mt-2">
              <Pill tone={profile.role === "admin" ? "gold" : "sky"}>
                {profile.role === "admin" ? "ადმინისტრატორი" : "მომხმარებელი"}
              </Pill>
            </div>
          </Surface>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="font-serif text-2xl text-white">მოქმედებები</h3>
        <div className="mt-5 flex flex-wrap gap-3">
          <PremiumButton href="/dashboard" variant="secondary">დეშბორდი</PremiumButton>
          <PremiumButton href="/library">ბიბლიოთეკა</PremiumButton>
        </div>
      </GlassCard>
    </main>
  );
}
