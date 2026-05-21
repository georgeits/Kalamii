import { EmptyState, GlassCard, PremiumButton, SectionTitle, Surface } from "@/components/ui";

export function QuizPage() {
  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="ტესტები"
        title="ტესტები და გამოცდის სიმულაცია"
        description="ტესტების რეალური შედეგები, შეფასებები და ისტორია გამოჩნდება მხოლოდ მას შემდეგ, რაც მომხმარებელი ტესტს გაივლის."
        action={<PremiumButton href="/library">მასალების ნახვა</PremiumButton>}
      />

      <EmptyState
        title="ტესტები ჯერ არ გაქვთ გავლილი"
        description="აირჩიეთ ავტორი ან ნაწარმოები ბიბლიოთეკიდან. ტესტის დასრულების შემდეგ აქ გამოჩნდება შედეგი, შეცდომები და რეკომენდაცია."
        action={<PremiumButton href="/authors" variant="secondary">აირჩიეთ ავტორი</PremiumButton>}
      />

      <GlassCard id="simulation" className="p-6">
        <h3 className="font-serif text-2xl text-white">გამოცდის სიმულაცია</h3>
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
          სიმულაციის მოდული ჯერ არ არის დაწყებული. როდესაც ტესტების ბაზა დაემატება, აქ გამოჩნდება დროიანი საგამოცდო რეჟიმი.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {["ტექსტის გააზრება", "ლიტერატურული კითხვა", "წერითი დავალება"].map((item) => (
            <Surface key={item} className="p-4">
              <p className="font-semibold text-white">{item}</p>
              <p className="mt-2 text-xs text-[color:var(--muted)]">მოდული დაემატება ადმინისტრირებიდან.</p>
            </Surface>
          ))}
        </div>
      </GlassCard>
    </main>
  );
}
