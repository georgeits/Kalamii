import Link from "next/link";
import type { ReactNode } from "react";
import { navigationItems } from "@/data/navigation";
import { LogoutButton } from "@/components/logout-button";
import { PremiumButton, SearchBar } from "@/components/ui";

type AppShellProps = {
  children: ReactNode;
  currentPath: string;
};

export function AppShell({ children, currentPath }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="mx-auto flex min-h-screen max-w-[1680px] gap-4 px-3 py-3 sm:px-4 lg:px-5">
        <aside className="sidebar-shell sticky top-3 hidden h-[calc(100vh-1.5rem)] w-[286px] shrink-0 overflow-hidden rounded-[24px] p-4 lg:flex lg:flex-col">
          <BrandBlock />
          <nav className="mt-7 flex flex-1 flex-col gap-1.5">
            {navigationItems.map((item, index) => {
              const isActive =
                currentPath === item.href ||
                (item.href !== "/" && currentPath.startsWith(item.href.split("#")[0]));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`nav-link group ${isActive ? "nav-link-active" : ""}`}
                  style={{ animationDelay: `${index * 35}ms` }}
                >
                  <span className="min-w-0 truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="rounded-[20px] border border-[color:var(--line)] bg-white/[0.045] p-4">
            <p className="text-sm font-semibold text-white">სწავლის სივრცე</p>
            <p className="mt-2 text-xs leading-5 text-[color:var(--muted)]">
              აირჩიეთ ავტორი ან ნაწარმოები. პირადი პროგრესი გამოჩნდება სწავლის დაწყების შემდეგ.
            </p>
          </div>
        </aside>

        <div className="relative z-10 flex min-w-0 flex-1 flex-col">
          <header className="sticky top-3 z-30 mb-5 rounded-[22px] border border-[color:var(--line)] bg-[rgba(7,17,31,0.72)] px-3 py-3 shadow-[0_24px_70px_rgba(0,0,0,0.26)] backdrop-blur-2xl sm:px-4">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <BrandMark />
              </div>
              <div className="hidden min-w-0 flex-1 md:block">
                <SearchBar placeholder="მოძებნე ავტორი, ნაწარმოები, ტერმინი ან ტესტი" value="" />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Link
                  href="/quiz"
                  className="hidden h-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-white/5 px-4 text-sm text-white transition hover:border-[rgba(244,177,93,0.35)] hover:bg-white/9 sm:inline-flex"
                >
                  ტესტი
                </Link>
                <LogoutButton />
                <PremiumButton href="/profile">პროფილი</PremiumButton>
              </div>
            </div>
            <div className="mt-3 md:hidden">
              <SearchBar placeholder="ძებნა Kalami-ში" value="" />
            </div>
          </header>

          <div className="lg:hidden">
            <nav className="mb-5 flex gap-2 overflow-x-auto pb-1">
              {navigationItems.slice(0, 8).map((item) => {
                const isActive =
                  currentPath === item.href ||
                  (item.href !== "/" && currentPath.startsWith(item.href.split("#")[0]));
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
                      isActive
                        ? "border-[rgba(244,177,93,0.38)] bg-[rgba(244,177,93,0.13)] text-[color:var(--gold-soft)]"
                        : "border-[color:var(--line)] bg-white/5 text-[color:var(--muted)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

function BrandBlock() {
  return (
    <Link href="/dashboard" className="group flex items-center gap-3">
      <BrandMark />
      <div className="min-w-0">
        <p className="font-display text-3xl leading-none text-[color:var(--gold-soft)]">Kalami</p>
        <p className="mt-1 text-xs leading-5 text-[color:var(--muted)]">ქართული გამოცდის აკადემია</p>
      </div>
    </Link>
  );
}

function BrandMark() {
  return (
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-[rgba(244,177,93,0.25)] bg-[radial-gradient(circle_at_30%_20%,_rgba(255,225,183,0.34),_rgba(244,177,93,0.13)_42%,_rgba(255,255,255,0.05))] font-display text-2xl text-[color:var(--gold-soft)] shadow-[0_0_34px_rgba(244,177,93,0.16)]">
      K
    </div>
  );
}
