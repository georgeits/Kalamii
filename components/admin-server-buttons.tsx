"use client";

import { useFormStatus } from "react-dom";
import { deleteAuthorAction, deleteWorkAction } from "@/app/admin/actions";

export function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="premium-button inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-bold text-[#160f08] disabled:opacity-70"
    >
      {pending ? "ინახება..." : label}
    </button>
  );
}

export function DeleteAuthorButton({ id }: { id: string }) {
  return (
    <form action={deleteAuthorAction}>
      <input type="hidden" name="id" value={id} />
      <DeleteButton label="წაშლა" />
    </form>
  );
}

export function DeleteWorkButton({ id }: { id: string }) {
  return (
    <form action={deleteWorkAction}>
      <input type="hidden" name="id" value={id} />
      <DeleteButton label="წაშლა" />
    </form>
  );
}

function DeleteButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-[rgba(255,156,140,0.24)] px-4 py-2 text-sm text-[color:var(--danger)] transition hover:bg-[rgba(255,156,140,0.08)] disabled:opacity-70"
    >
      {pending ? "ინახება..." : label}
    </button>
  );
}
