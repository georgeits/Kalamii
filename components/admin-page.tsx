import { adminActions } from "@/data/library";
import { GlassCard, Pill, SectionTitle } from "@/components/ui";

export function AdminPage() {
  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="ადმინის პანელი"
        title="ბიბლიოთეკის მართვა"
        description="კონტენტის დამატება, რედაქტირება და მასალების ხელმისაწვდომობის მართვა ერთ სივრცეში."
      />

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {adminActions.map((action) => (
          <GlassCard key={action.title} className="p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-serif text-2xl text-white">{action.title}</h3>
              <Pill tone={action.premium ? "gold" : "default"}>
                {action.premium ? "ფასიანი მასალა" : "ძირითადი"}
              </Pill>
            </div>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{action.description}</p>
            <button className="mt-6 rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--gold-soft)]">
              გახსნა
            </button>
          </GlassCard>
        ))}
      </div>
    </main>
  );
}
