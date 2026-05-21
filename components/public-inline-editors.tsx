"use client";

import { useState } from "react";
import { AdminAuthorImageInput } from "@/components/admin-author-image-input";

export function AuthorInlineEditor({
  author,
  compact = false,
}: {
  author: { id: string; biography: string; image_url?: string | null };
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [biography, setBiography] = useState(author.biography);
  const [imageUrl, setImageUrl] = useState(author.image_url ?? "");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    setIsSaving(true);
    setStatus("");
    const response = await fetch("/api/admin/public-author", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: author.id,
        biography,
        image_url: imageUrl,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      setStatus(payload?.error ?? "შენახვა ვერ მოხერხდა.");
      setIsSaving(false);
      return;
    }

    setStatus("შენახულია");
    setIsSaving(false);
    setIsOpen(false);
    window.location.reload();
  }

  return (
    <div className={compact ? "" : "mt-4"}>
      <div className="flex gap-2">
        <button type="button" onClick={() => setIsOpen((value) => !value)} className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--gold-soft)]">
          რედაქტირება
        </button>
        {status ? <span className="self-center text-xs text-[color:var(--gold-soft)]">{status}</span> : null}
      </div>
      {isOpen ? (
        <div className="mt-3 space-y-3 rounded-[18px] border border-[color:var(--line)] bg-white/[0.04] p-4">
          <AdminAuthorImageInput authorId={author.id} currentImageUrl={imageUrl} onUploaded={setImageUrl} />
          <label className="block">
            <span className="text-sm text-[color:var(--muted)]">ბიოგრაფია</span>
            <textarea value={biography} onChange={(event) => setBiography(event.target.value)} rows={5} className="mt-2 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none" />
          </label>
          <div className="flex gap-2">
            <button type="button" disabled={isSaving} onClick={save} className="premium-button rounded-full px-4 py-2 text-sm font-bold text-[#160f08] disabled:opacity-70">
              {isSaving ? "იტვირთება..." : "შენახვა"}
            </button>
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-white">
              გაუქმება
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function WorkInlineEditor({
  work,
  compact = false,
}: {
  work: { id: string; plan?: string | null; summary: string; analysis?: string | null; quiz_data?: { question: string }[] | null };
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [plan, setPlan] = useState(work.plan ?? "");
  const [summary, setSummary] = useState(work.summary);
  const [analysis, setAnalysis] = useState(work.analysis ?? "");
  const [quizQuestions, setQuizQuestions] = useState(work.quiz_data?.map((item) => item.question).join("\n") ?? "");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    setIsSaving(true);
    setStatus("");
    const response = await fetch("/api/admin/public-work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: work.id, plan, summary, analysis, quiz_questions: quizQuestions }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      setStatus(payload?.error ?? "შენახვა ვერ მოხერხდა.");
      setIsSaving(false);
      return;
    }
    setStatus("შენახულია");
    setIsSaving(false);
    setIsOpen(false);
    window.location.reload();
  }

  return (
    <div className={compact ? "" : "mt-4"}>
      <div className="flex gap-2">
        <button type="button" onClick={() => setIsOpen((value) => !value)} className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--gold-soft)]">
          რედაქტირება
        </button>
        {status ? <span className="self-center text-xs text-[color:var(--gold-soft)]">{status}</span> : null}
      </div>
      {isOpen ? (
        <div className="mt-3 space-y-3 rounded-[18px] border border-[color:var(--line)] bg-white/[0.04] p-4">
          <EditorArea label="გეგმა" value={plan} onChange={setPlan} rows={4} />
          <EditorArea label="შინაარსი" value={summary} onChange={setSummary} rows={4} />
          <EditorArea label="ანალიზი" value={analysis} onChange={setAnalysis} rows={6} />
          <EditorArea label="ტესტი" value={quizQuestions} onChange={setQuizQuestions} rows={5} helper="თითო კითხვა ახალ ხაზზე" />
          <div className="flex gap-2">
            <button type="button" disabled={isSaving} onClick={save} className="premium-button rounded-full px-4 py-2 text-sm font-bold text-[#160f08] disabled:opacity-70">
              {isSaving ? "იტვირთება..." : "შენახვა"}
            </button>
            <button type="button" onClick={() => setIsOpen(false)} className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-white">
              გაუქმება
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EditorArea({
  label,
  value,
  onChange,
  rows,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
  helper?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-[color:var(--muted)]">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} className="mt-2 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none" />
      {helper ? <p className="mt-2 text-xs text-[color:var(--muted)]">{helper}</p> : null}
    </label>
  );
}
