"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminAuthorImageInput } from "@/components/admin-author-image-input";
import type { QuizQuestion, SummaryChapter } from "@/src/lib/content";

export function AuthorInlineEditor({
  author,
  compact = false,
}: {
  author: { id: string; biography: string; image_url?: string | null };
  compact?: boolean;
}) {
  return <EditableAuthorInlineEditor author={author} compact={compact} />;
}

export function WorkInlineEditor({
  work,
  compact = false,
}: {
  work: {
    id: string;
    plan?: string | null;
    summary: string;
    summary_chapters?: SummaryChapter[] | null;
    analysis?: string | null;
    quiz_data?: QuizQuestion[] | null;
  };
  compact?: boolean;
}) {
  return <EditableWorkInlineEditor work={work} compact={compact} />;
}

function EditableAuthorInlineEditor({
  author,
  compact,
}: {
  author: { id: string; biography: string; image_url?: string | null };
  compact: boolean;
}) {
  const router = useRouter();
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
      if (process.env.NODE_ENV !== "production") {
        console.error("Author save failed", {
          authorId: author.id,
          biography,
          imageUrl,
          payload,
        });
      }
      setStatus(payload?.error ?? "შენახვა ვერ მოხერხდა.");
      setIsSaving(false);
      return;
    }

    setStatus("შენახულია");
    setIsSaving(false);
    setIsOpen(false);
    router.refresh();
  }

  return (
    <div className={compact ? "" : "mt-4"}>
      <ActionBar
        isOpen={isOpen}
        onToggle={() => setIsOpen((value) => !value)}
        status={status}
        label="რედაქტირება"
      />
      {isOpen ? (
        <div className="mt-3 space-y-3 rounded-[18px] border border-[color:var(--line)] bg-white/[0.04] p-4">
          <AdminAuthorImageInput authorId={author.id} currentImageUrl={imageUrl} onUploaded={setImageUrl} />
          <label className="block">
            <span className="text-sm text-[color:var(--muted)]">ბიოგრაფია</span>
            <textarea value={biography} onChange={(event) => setBiography(event.target.value)} rows={5} className="mt-2 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none" />
          </label>
          <SaveRow isSaving={isSaving} onSave={save} onCancel={() => setIsOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}

function EditableWorkInlineEditor({
  work,
  compact,
}: {
  work: {
    id: string;
    plan?: string | null;
    summary: string;
    summary_chapters?: SummaryChapter[] | null;
    analysis?: string | null;
    quiz_data?: QuizQuestion[] | null;
  };
  compact: boolean;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [plan, setPlan] = useState(work.plan ?? "");
  const [summary, setSummary] = useState(work.summary);
  const [analysis, setAnalysis] = useState(work.analysis ?? "");
  const [chapters, setChapters] = useState<SummaryChapter[]>(work.summary_chapters ?? []);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(
    work.quiz_data?.map(normalizeQuestion) ?? [],
  );
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    setIsSaving(true);
    setStatus("");

    const response = await fetch("/api/admin/public-work", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: work.id,
        plan,
        summary,
        summary_chapters: chapters,
        analysis,
        quiz_data: quizQuestions,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string; work?: unknown } | null;
    if (!response.ok) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Work save failed", {
          workId: work.id,
          plan,
          summary,
          chapters,
          analysis,
          quizQuestions,
          payload,
        });
      }
      setStatus(payload?.error ?? "შენახვა ვერ მოხერხდა.");
      setIsSaving(false);
      return;
    }

    setStatus("შენახულია");
    setIsSaving(false);
    setIsOpen(false);
    router.refresh();
  }

  function addChapter() {
    setChapters((items) => [
      ...items,
      {
        id: crypto.randomUUID(),
        title: `თავი ${items.length + 1}`,
        body: "",
      },
    ]);
  }

  function moveChapter(index: number, direction: -1 | 1) {
    setChapters((items) => moveItem(items, index, direction));
  }

  function addQuestion() {
    setQuizQuestions((items) => [
      ...items,
      createEmptyQuestion(items.length + 1),
    ]);
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    setQuizQuestions((items) => moveItem(items, index, direction));
  }

  return (
    <div className={compact ? "" : "mt-4"}>
      <ActionBar
        isOpen={isOpen}
        onToggle={() => setIsOpen((value) => !value)}
        status={status}
        label="რედაქტირება"
      />
      {isOpen ? (
        <div className="mt-3 space-y-4 rounded-[18px] border border-[color:var(--line)] bg-white/[0.04] p-4">
          <EditorArea label="გეგმა" value={plan} onChange={setPlan} rows={4} />
          <EditorArea label="მოკლე აღწერა" value={summary} onChange={setSummary} rows={4} />

          <BuilderSection title="შინაარსის თავები" actionLabel="თავის დამატება" onAdd={addChapter}>
            {chapters.length > 0 ? (
              chapters.map((chapter, index) => (
                <div key={chapter.id} className="space-y-3 rounded-[16px] border border-[color:var(--line)] bg-white/[0.035] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={chapter.title}
                      onChange={(event) =>
                        setChapters((items) =>
                          items.map((item) => (item.id === chapter.id ? { ...item, title: event.target.value } : item)),
                        )
                      }
                      className="h-10 min-w-0 flex-1 rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-3 text-sm text-white outline-none"
                    />
                    <MiniControls
                      onUp={() => moveChapter(index, -1)}
                      onDown={() => moveChapter(index, 1)}
                      onDelete={() => setChapters((items) => items.filter((item) => item.id !== chapter.id))}
                      disableUp={index === 0}
                      disableDown={index === chapters.length - 1}
                    />
                  </div>
                  <textarea
                    value={chapter.body}
                    onChange={(event) =>
                      setChapters((items) =>
                        items.map((item) => (item.id === chapter.id ? { ...item, body: event.target.value } : item)),
                      )
                    }
                    rows={5}
                    className="w-full rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none"
                  />
                </div>
              ))
            ) : (
              <EmptyBuilderCopy text="შინაარსი ჯერ არ არის დამატებული." />
            )}
          </BuilderSection>

          <EditorArea label="ანალიზი" value={analysis} onChange={setAnalysis} rows={6} />

          <BuilderSection title="ტესტის კითხვები" actionLabel="კითხვის დამატება" onAdd={addQuestion}>
            {quizQuestions.length > 0 ? (
              quizQuestions.map((question, index) => (
                <div key={question.id ?? index} className="space-y-3 rounded-[16px] border border-[color:var(--line)] bg-white/[0.035] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={question.question}
                      onChange={(event) =>
                        setQuizQuestions((items) =>
                          items.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, question: event.target.value } : item,
                          ),
                        )
                      }
                      placeholder={`კითხვა ${index + 1}`}
                      className="h-10 min-w-0 flex-1 rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-3 text-sm text-white outline-none"
                    />
                    <MiniControls
                      onUp={() => moveQuestion(index, -1)}
                      onDown={() => moveQuestion(index, 1)}
                      onDelete={() => setQuizQuestions((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                      disableUp={index === 0}
                      disableDown={index === quizQuestions.length - 1}
                    />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {question.options?.map((option, optionIndex) => (
                      <label key={option.id} className="rounded-[14px] border border-[color:var(--line)] bg-white/[0.04] p-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${question.id ?? index}`}
                            checked={Boolean(option.isCorrect)}
                            onChange={() =>
                              setQuizQuestions((items) =>
                                items.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        options: item.options?.map((itemOption, itemOptionIndex) => ({
                                          ...itemOption,
                                          isCorrect: itemOptionIndex === optionIndex,
                                        })),
                                      }
                                    : item,
                                ),
                              )
                            }
                          />
                          <span className="text-xs text-[color:var(--muted)]">სწორი პასუხი</span>
                        </div>
                        <input
                          value={option.text}
                          onChange={(event) =>
                            setQuizQuestions((items) =>
                              items.map((item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      options: item.options?.map((itemOption, itemOptionIndex) =>
                                        itemOptionIndex === optionIndex
                                          ? { ...itemOption, text: event.target.value }
                                          : itemOption,
                                      ),
                                    }
                                  : item,
                              ),
                            )
                          }
                          placeholder={`პასუხი ${optionIndex + 1}`}
                          className="mt-2 h-10 w-full rounded-[12px] border border-[color:var(--line)] bg-white/[0.045] px-3 text-sm text-white outline-none"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <EmptyBuilderCopy text="ტესტი ჯერ არ არის დამატებული." />
            )}
          </BuilderSection>

          <SaveRow isSaving={isSaving} onSave={save} onCancel={() => setIsOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}

function normalizeQuestion(question: QuizQuestion): QuizQuestion {
  return {
    id: question.id ?? crypto.randomUUID(),
    question: question.question ?? "",
    options:
      question.options?.length === 4
        ? question.options
        : createDefaultOptions(),
  };
}

function createEmptyQuestion(index: number): QuizQuestion {
  return {
    id: crypto.randomUUID(),
    question: `კითხვა ${index}`,
    options: createDefaultOptions(),
  };
}

function createDefaultOptions() {
  return [
    { id: "a", text: "", isCorrect: true },
    { id: "b", text: "", isCorrect: false },
    { id: "c", text: "", isCorrect: false },
    { id: "d", text: "", isCorrect: false },
  ];
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }
  const clone = [...items];
  const [item] = clone.splice(index, 1);
  clone.splice(nextIndex, 0, item);
  return clone;
}

function ActionBar({
  isOpen,
  onToggle,
  status,
  label,
}: {
  isOpen: boolean;
  onToggle: () => void;
  status: string;
  label: string;
}) {
  return (
    <div className="flex gap-2">
      <button type="button" onClick={onToggle} className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--gold-soft)]">
        {isOpen ? "გაუქმება" : label}
      </button>
      {status ? <span className="self-center text-xs text-[color:var(--gold-soft)]">{status}</span> : null}
    </div>
  );
}

function SaveRow({
  isSaving,
  onSave,
  onCancel,
}: {
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex gap-2">
      <button type="button" disabled={isSaving} onClick={onSave} className="premium-button rounded-full px-4 py-2 text-sm font-bold text-[#160f08] disabled:opacity-70">
        {isSaving ? "ინახება..." : "შენახვა"}
      </button>
      <button type="button" onClick={onCancel} className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-white">
        გაუქმება
      </button>
    </div>
  );
}

function BuilderSection({
  title,
  actionLabel,
  onAdd,
  children,
}: {
  title: string;
  actionLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{title}</p>
        <button type="button" onClick={onAdd} className="rounded-full border border-[color:var(--line)] px-3 py-1.5 text-xs text-[color:var(--gold-soft)]">
          {actionLabel}
        </button>
      </div>
      {children}
    </div>
  );
}

function MiniControls({
  onUp,
  onDown,
  onDelete,
  disableUp,
  disableDown,
}: {
  onUp: () => void;
  onDown: () => void;
  onDelete: () => void;
  disableUp: boolean;
  disableDown: boolean;
}) {
  return (
    <div className="flex gap-2">
      <button type="button" disabled={disableUp} onClick={onUp} className="rounded-full border border-[color:var(--line)] px-3 py-1 text-xs text-white disabled:opacity-40">
        ↑
      </button>
      <button type="button" disabled={disableDown} onClick={onDown} className="rounded-full border border-[color:var(--line)] px-3 py-1 text-xs text-white disabled:opacity-40">
        ↓
      </button>
      <button type="button" onClick={onDelete} className="rounded-full border border-[rgba(255,156,140,0.24)] px-3 py-1 text-xs text-[color:var(--danger)]">
        წაშლა
      </button>
    </div>
  );
}

function EmptyBuilderCopy({ text }: { text: string }) {
  return <p className="rounded-[14px] border border-[color:var(--line)] bg-white/[0.035] px-4 py-3 text-sm text-[color:var(--muted)]">{text}</p>;
}

function EditorArea({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="block">
      <span className="text-sm text-[color:var(--muted)]">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} className="mt-2 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none" />
    </label>
  );
}
