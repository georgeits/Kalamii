import { EmptyState, GlassCard, PremiumButton, SectionTitle, Surface } from "@/components/ui";

export function ProfilePage() {
  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="პროფილი"
        title="მომხმარებლის სივრცე"
        description="პროფილის მონაცემები გამოჩნდება რეგისტრაციისა და ავტორიზაციის შემდეგ."
      />

      <EmptyState
        title="პროფილი ჯერ არ არის შევსებული"
        description="სახელი, გეგმა, პროგრესი და პარამეტრები დაემატება მას შემდეგ, რაც მომხმარებელი ანგარიშში შევა."
        action={<PremiumButton href="/" variant="secondary">მთავარზე დაბრუნება</PremiumButton>}
      />

      <GlassCard className="p-6">
        <h3 className="font-serif text-2xl text-white">მომავალი პარამეტრები</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {["ანგარიშის მონაცემები", "გამოწერის გეგმა", "სწავლის პარამეტრები"].map((item) => (
            <Surface key={item} className="p-4">
              <p className="font-semibold text-white">{item}</p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">ხელმისაწვდომი იქნება ავტორიზაციის შემდეგ.</p>
            </Surface>
          ))}
        </div>
      </GlassCard>
    </main>
  );
}
