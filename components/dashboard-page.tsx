import { emptyStudentState } from "@/data/dashboard";
import { libraryCategories } from "@/data/library";
import { EmptyState, GlassCard, PremiumButton, SectionTitle, Surface } from "@/components/ui";

export function DashboardPage() {
  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="სამუშაო სივრცე"
        title="მთავარი პანელი"
        description="აქ გამოჩნდება თქვენი სასწავლო პროგრესი, ბოლო აქტივობა და ტესტების შედეგები მას შემდეგ, რაც პლატფორმაზე მუშაობას დაიწყებთ."
        action={<PremiumButton href="/library">ბიბლიოთეკის გახსნა</PremiumButton>}
      />

      <EmptyState
        title={emptyStudentState.title}
        description={emptyStudentState.description}
        action={<PremiumButton href="/authors" variant="secondary">აირჩიეთ ავტორი</PremiumButton>}
      />

      <GlassCard className="p-6">
        <h3 className="font-serif text-2xl text-white">სწავლის მიმართულებები</h3>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {libraryCategories.slice(0, 4).map((category) => (
            <Surface key={category.title} className="p-4">
              <p className="font-semibold text-white">{category.title}</p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{category.description}</p>
            </Surface>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <EmptyState title="ტესტები ჯერ არ გაქვთ გავლილი" description="პირველი ტესტის დასრულების შემდეგ აქ გამოჩნდება შედეგები და რეკომენდაციები." />
        <EmptyState title="პროგრესი ჯერ არ არის" description="პროგრესის ზოლი შეივსება მაშინ, როცა ავტორებს ან ნაწარმოებებს მონიშნავთ შესწავლილად." />
        <EmptyState title="აქტივობა ცარიელია" description="ბოლო გახსნილი მასალები და შენიშვნები გამოჩნდება რეალური გამოყენების შემდეგ." />
      </div>
    </main>
  );
}
