"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/src/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-white/5 px-4 text-sm text-white transition hover:border-[rgba(244,177,93,0.35)] hover:bg-white/9 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? "გასვლა..." : "გასვლა"}
    </button>
  );
}
