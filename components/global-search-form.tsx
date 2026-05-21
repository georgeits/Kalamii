"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { SearchBar } from "@/components/ui";

export function GlobalSearchForm({
  initialValue = "",
  targetPath = "/library",
}: {
  initialValue?: string;
  targetPath?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = value.trim();
    router.push(query ? `${targetPath}?q=${encodeURIComponent(query)}` : targetPath);
  }

  return (
    <form onSubmit={handleSubmit}>
      <SearchBar placeholder="მოძებნე ავტორი, ნაწარმოები, პერიოდი ან ჟანრი" value={value} onChange={setValue} />
    </form>
  );
}
