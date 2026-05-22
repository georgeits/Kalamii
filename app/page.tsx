import Link from "next/link";
import { getCurrentProfile } from "@/src/lib/content";

export default async function Home() {
  const profile = await getCurrentProfile();
  const ctaHref = {
    free: profile ? "/dashboard" : "/login?redirectedFrom=/dashboard",
    standard: profile ? "/payment?plan=standard" : "/login?redirectedFrom=/payment?plan=standard",
    premium: profile ? "/payment?plan=premium" : "/login?redirectedFrom=/payment?plan=premium",
  };

  const pricingPlans = [
    {
      title: "უფასო",
      price: "0₾",
      period: "",
      description: "პირველი ნაბიჯისთვის",
      features: ["უფასო წვდომა", "ავტორების სია", "ბიბლიოთეკის დათვალიერება"],
      ctaLabel: "დაწყება",
      href: ctaHref.free,
      tone: "free",
    },
    {
      title: "სტანდარტი",
      price: "5₾",
      period: "/ თვე",
      description: "სტაბილური მეცადინეობისთვის",
      features: ["ავტორები", "ნაწარმოებები", "შინაარსები", "ანალიზები", "გეგმები"],
      ctaLabel: "შეძენა",
      href: ctaHref.standard,
      tone: "standard",
    },
    {
      title: "პრემიუმი",
      price: "10₾",
      period: "/ თვე",
      description: "სრული საგამოცდო მზადებისთვის",
      features: ["სრული ბიბლიოთეკა", "ტესტები", "სავარჯიშოები", "გამოცდის რეჟიმი", "ტექსტის რედაქტირება", "წაკითხულის გააზრება"],
      ctaLabel: "შეძენა",
      href: ctaHref.premium,
      tone: "premium",
    },
  ] as const;

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
            href={profile ? "/dashboard" : "/login"}
            className="rounded-full border border-[color:var(--line)] bg-white/[0.04] px-4 py-2 text-sm text-[color:var(--muted)] transition hover:border-[rgba(244,177,93,0.35)] hover:bg-white/[0.075] hover:text-white"
          >
            პლატფორმა
          </Link>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center pb-16 pt-20 text-center sm:pt-24">
          <p className="fade-up text-sm text-[color:var(--gold-soft)]">ეროვნული გამოცდებისთვის მზადება მარტივად</p>
          <h1 className="fade-up mt-6 max-w-5xl font-serif text-4xl leading-tight text-white [animation-delay:80ms] sm:text-6xl lg:text-7xl">
            ქართული ენისა და ლიტერატურის სამეცადინო პლატფორმა
          </h1>
          <p className="fade-up mt-6 max-w-2xl text-base leading-7 text-[color:var(--muted)] [animation-delay:160ms] sm:text-lg">
            შინაარსები, ავტორები, ნაწარმოებები და სავარჯიშოები ერთ სუფთა სასწავლო სივრცეში.
          </p>
          <div className="fade-up mt-9 flex w-full flex-col justify-center gap-3 [animation-delay:240ms] sm:w-auto sm:flex-row">
            <Link href={profile ? "/dashboard" : "/login"} className="premium-button inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3 text-sm font-bold text-[#160f08] transition">
              {profile ? "გაგრძელება" : "ავტორიზაცია"}
            </Link>
            <Link
              href={profile ? "/payment?plan=premium" : "/login?redirectedFrom=/payment?plan=premium"}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[color:var(--line)] bg-white/[0.045] px-7 py-3 text-sm font-bold text-white transition hover:border-[rgba(244,177,93,0.35)] hover:bg-white/[0.08]"
            >
              პრემიუმის შეძენა
            </Link>
          </div>
        </section>

        <section className="pb-10">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <p className="text-sm text-[color:var(--gold-soft)]">გეგმები</p>
            <h2 className="mt-3 font-serif text-3xl text-white sm:text-4xl">აირჩიე სწავლის ტემპი</h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)] sm:text-base">
              ავტორიზაციის შემდეგ გადახდის გვერდზე ნახავ ანგარიშს, თანხას და ატვირთავ ქვითარს დადასტურებისთვის.
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

                <div className="relative z-10 mt-10">
                  <div className="flex items-end gap-2">
                    <span className="font-display text-5xl text-white">{plan.price}</span>
                    {plan.period ? <span className="pb-1 text-sm text-[color:var(--muted)]">{plan.period}</span> : null}
                  </div>
                </div>

                <ul className="relative z-10 mt-8 space-y-3 text-sm leading-6 text-[color:var(--muted)]">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-1 text-[color:var(--gold-soft)]">✦</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="relative z-10 mt-auto pt-8">
                  <Link
                    href={plan.href}
                    className={`inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-sm font-bold transition ${
                      plan.tone === "premium"
                        ? "premium-button text-[#160f08]"
                        : "border border-[color:var(--line)] bg-white/[0.05] text-white hover:border-[rgba(244,177,93,0.35)] hover:bg-white/[0.08]"
                    }`}
                  >
                    {plan.ctaLabel}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
