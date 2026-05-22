import Link from "next/link";

const pricingPlans = [
  {
    title: "უფასო",
    price: "0₾",
    description: "პირველი ნაბიჯისთვის",
    features: ["ავტორების სია", "ბიბლიოთეკის დათვალიერება"],
    ctaLabel: "დაწყება უფასოდ",
    href: "/register?plan=free",
    tone: "free",
  },
  {
    title: "სტანდარტი",
    price: "5₾",
    period: "/ თვე",
    description: "სტაბილური მეცადინეობისთვის",
    features: ["შინაარსები", "ავტორები და ნაწარმოებები", "ანალიზები", "პროგრესის ნახვა"],
    ctaLabel: "შეძენა — 5₾",
    href: "/register?plan=standard",
    tone: "standard",
  },
  {
    title: "პრემიუმი",
    price: "10₾",
    period: "/ თვე",
    description: "სრული საგამოცდო მზადებისთვის",
    features: [
      "სრული ბიბლიოთეკა",
      "სავარჯიშოები და გამოცდის რეჟიმი",
      "დეტალური ანალიზები",
      "პრიორიტეტული ახალი მასალები",
      "პროგრესის სრული ნახვა",
    ],
    ctaLabel: "შეძენა — 10₾",
    href: "/register?plan=premium",
    tone: "premium",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-6 text-white sm:px-8">
      <div className="landing-glow landing-glow-one" />
      <div className="landing-glow landing-glow-two" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Link href="/" className="font-display text-3xl text-[color:var(--gold-soft)]">
            Kalami
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-[color:var(--line)] bg-white/[0.04] px-4 py-2 text-sm text-[color:var(--muted)] transition hover:border-[rgba(244,177,93,0.35)] hover:bg-white/[0.075] hover:text-white"
          >
            პლატფორმა
          </Link>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center pb-16 pt-20 text-center sm:pt-24">
          <p className="fade-up text-sm text-[color:var(--gold-soft)]">
            ეროვნული გამოცდებისთვის მზადება მარტივად
          </p>
          <h1 className="fade-up mt-6 max-w-5xl font-serif text-4xl leading-tight text-white [animation-delay:80ms] sm:text-6xl lg:text-7xl">
            ქართული ენისა და ლიტერატურის სამეცადინო პლატფორმა
          </h1>
          <p className="fade-up mt-6 max-w-2xl text-base leading-7 text-[color:var(--muted)] [animation-delay:160ms] sm:text-lg">
            შინაარსები, ავტორები, ნაწარმოებები და სავარჯიშოები ერთ სუფთა სასწავლო სივრცეში.
          </p>
          <div className="fade-up mt-9 flex w-full flex-col justify-center gap-3 [animation-delay:240ms] sm:w-auto sm:flex-row">
            <Link
              href="/register"
              className="premium-button inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3 text-sm font-bold text-[#160f08] transition"
            >
              რეგისტრაცია
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[color:var(--line)] bg-white/[0.045] px-7 py-3 text-sm font-bold text-white transition hover:border-[rgba(244,177,93,0.35)] hover:bg-white/[0.08]"
            >
              ავტორიზაცია
            </Link>
          </div>
        </section>

        <section className="pb-10">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <p className="text-sm text-[color:var(--gold-soft)]">გეგმები</p>
            <h2 className="mt-3 font-serif text-3xl text-white sm:text-4xl">აირჩიე სწავლის ტემპი</h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)] sm:text-base">
              აირჩიე შენთვის შესაფერისი გეგმა და გადადი რეგისტრაციაზე. გადახდა ჯერ არ მუშავდება, მაგრამ
              ინტერფეისი მზად არის რეალური გაყიდვებისთვის.
            </p>
          </div>

          <div className="grid items-stretch gap-4 md:gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article
                key={plan.title}
                className={`pricing-card flex h-full min-h-[520px] flex-col rounded-[22px] border p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 sm:p-7 lg:min-h-[560px] ${
                  plan.tone === "premium"
                    ? "pricing-card-premium"
                    : plan.tone === "standard"
                      ? "pricing-card-standard"
                      : "pricing-card-free"
                }`}
              >
                <div className="relative z-10 flex min-h-[78px] items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-serif text-2xl leading-tight text-white">{plan.title}</h3>
                    <p className="mt-2 text-sm leading-5 text-[color:var(--muted)]">{plan.description}</p>
                  </div>
                  {plan.tone === "standard" ? (
                    <span className="shrink-0 rounded-full border border-[rgba(244,177,93,0.22)] bg-[rgba(244,177,93,0.1)] px-3 py-1 text-xs text-[color:var(--gold-soft)]">
                      პოპულარული
                    </span>
                  ) : null}
                  {plan.tone === "premium" ? (
                    <span className="shrink-0 rounded-full border border-[rgba(255,214,161,0.3)] bg-[rgba(255,214,161,0.12)] px-3 py-1 text-xs font-semibold text-[#fff2d7]">
                      სრული წვდომა
                    </span>
                  ) : null}
                </div>

                <div className="relative z-10 mt-7 flex min-h-[60px] items-end gap-2">
                  <span className="font-display text-5xl leading-none text-[color:var(--gold-soft)]">{plan.price}</span>
                  {plan.period ? <span className="pb-1 text-sm leading-5 text-[color:var(--muted)]">{plan.period}</span> : null}
                </div>

                <ul className="relative z-10 mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex min-h-6 gap-3 text-sm leading-6 text-[color:var(--muted)]">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--gold)]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="relative z-10 mt-auto pt-8">
                  <Link
                    href={plan.href}
                    className={`plan-cta inline-flex h-12 w-full items-center justify-center rounded-2xl px-5 text-sm font-bold transition ${
                      plan.tone === "premium"
                        ? "plan-cta-premium text-[#160f08]"
                        : plan.tone === "standard"
                          ? "plan-cta-standard text-white"
                          : "plan-cta-free text-white"
                    }`}
                  >
                    {plan.ctaLabel}
                  </Link>
                  <p className="mt-3 min-h-10 text-center text-xs leading-5 text-[color:var(--muted)]">
                    რეგისტრაციაზე გადასვლა {plan.title === "უფასო" ? "უფასო გეგმაზე" : `${plan.title} გეგმის`} არჩევით
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
