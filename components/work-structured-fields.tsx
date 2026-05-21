"use client";

import { useMemo, useState } from "react";
import type { QuizQuestion, SummaryChapter } from "@/src/lib/content";

export function WorkStructuredFields({
  chapterFieldName,
  quizFieldName,
  initialChapters,
  initialQuestions,
}: {
  chapterFieldName: string;
  quizFieldName: string;
  initialChapters: SummaryChapter[];
  initialQuestions: QuizQuestion[];
}) {
  const [chapters, setChapters] = useState<SummaryChapter[]>(initialChapters);
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions.map(normalizeQuestion));
  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const quizErrors = useMemo(() => validateQuestions(questions), [questions]);
  const hasQuizErrors = quizErrors.length > 0;
  const sanitizedQuestions = hasQuizErrors ? [] : questions;

  return (
    <div className="space-y-4">
      <input type="hidden" name={chapterFieldName} value={JSON.stringify(chapters)} readOnly />
      <input type="hidden" name={quizFieldName} value={JSON.stringify(sanitizedQuestions)} readOnly />

      <BuilderSection title="შინაარსის თავები" actionLabel="თავის დამატება" onAdd={() => setChapters((items) => [...items, { id: crypto.randomUUID(), title: `თავი ${items.length + 1}`, body: "" }])}>
        {chapters.length > 0 ? (
          chapters.map((chapter, index) => (
            <div key={chapter.id} className="space-y-3 rounded-[16px] border border-[color:var(--line)] bg-white/[0.035] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={chapter.title}
                  onChange={(event) =>
                    setChapters((items) => items.map((item) => (item.id === chapter.id ? { ...item, title: event.target.value } : item)))
                  }
                  className="h-10 min-w-0 flex-1 rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-3 text-sm text-white outline-none"
                />
                <MiniControls
                  onUp={() => setChapters((items) => moveItem(items, index, -1))}
                  onDown={() => setChapters((items) => moveItem(items, index, 1))}
                  onDelete={() => setChapters((items) => items.filter((item) => item.id !== chapter.id))}
                  disableUp={index === 0}
                  disableDown={index === chapters.length - 1}
                />
              </div>
              <textarea
                value={chapter.body}
                onChange={(event) =>
                  setChapters((items) => items.map((item) => (item.id === chapter.id ? { ...item, body: event.target.value } : item)))
                }
                rows={5}
                className="w-full rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none"
              />
            </div>
          ))
        ) : (
          <EmptyCopy text="შინაარსი ჯერ არ არის დამატებული." />
        )}
      </BuilderSection>

      <BuilderSection title="ტესტის კითხვები" actionLabel="კითხვის დამატება" onAdd={() => setQuestions((items) => [...items, createEmptyQuestion(items.length + 1)])}>
        <div className="space-y-3 rounded-[16px] border border-[color:var(--line)] bg-white/[0.035] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">ტესტების მასობრივი დამატება</p>
            <label className="rounded-full border border-[color:var(--line)] px-3 py-1.5 text-xs text-[color:var(--gold-soft)] transition hover:bg-white/8">
              .txt ატვირთვა
              <input
                type="file"
                accept=".txt,text/plain"
                className="sr-only"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const text = await file.text();
                  setImportText(text);
                }}
              />
            </label>
          </div>
          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            rows={10}
            placeholder={`Question: კითხვა აქ
A) პასუხი 1
B) პასუხი 2
C) პასუხი 3
D) პასუხი 4
Correct: B`}
            className="w-full rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const result = parseBulkQuizImport(importText);
                if (!result.ok) {
                  setImportStatus(result.error);
                  return;
                }
                setQuestions(result.questions);
                setImportStatus(`${result.questions.length} კითხვა წარმატებით ჩაიტვირთა.`);
              }}
              className="rounded-full border border-[rgba(244,177,93,0.24)] bg-[rgba(244,177,93,0.12)] px-4 py-2 text-sm text-[color:var(--gold-soft)] transition hover:bg-[rgba(244,177,93,0.18)]"
            >
              იმპორტი და გადახედვა
            </button>
            <button
              type="button"
              onClick={() => {
                setImportText("");
                setImportStatus("");
              }}
              className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-white transition hover:bg-white/8"
            >
              გასუფთავება
            </button>
          </div>
          {importStatus ? <p className={`text-sm ${importStatus.includes("წარმატებით") ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}`}>{importStatus}</p> : null}
        </div>

        {questions.length > 0 ? (
          questions.map((question, index) => (
            <div key={question.id ?? index} className="space-y-3 rounded-[16px] border border-[color:var(--line)] bg-white/[0.035] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={question.question}
                  onChange={(event) =>
                    setQuestions((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, question: event.target.value } : item)))
                  }
                  className="h-10 min-w-0 flex-1 rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-3 text-sm text-white outline-none"
                />
                <MiniControls
                  onUp={() => setQuestions((items) => moveItem(items, index, -1))}
                  onDown={() => setQuestions((items) => moveItem(items, index, 1))}
                  onDelete={() => setQuestions((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                  disableUp={index === 0}
                  disableDown={index === questions.length - 1}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-[color:var(--muted)]">სწორი პასუხი</p>
                </div>
                {question.options?.map((option, optionIndex) => (
                  <label key={option.id} className="rounded-[14px] border border-[color:var(--line)] bg-white/[0.04] p-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`admin-correct-${question.id ?? index}`}
                        checked={Boolean(option.isCorrect)}
                        onChange={() =>
                          setQuestions((items) =>
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
                      <span className="text-xs text-[color:var(--muted)]">{`ვარიანტი ${optionIndex + 1}`}</span>
                    </div>
                    <input
                      value={option.text}
                      onChange={(event) =>
                        setQuestions((items) =>
                          items.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  options: item.options?.map((itemOption, itemOptionIndex) =>
                                    itemOptionIndex === optionIndex ? { ...itemOption, text: event.target.value } : itemOption,
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
          <EmptyCopy text="ტესტი ჯერ არ არის დამატებული." />
        )}
        {hasQuizErrors ? (
          <div className="rounded-[14px] border border-[rgba(255,156,140,0.24)] bg-[rgba(255,156,140,0.08)] px-4 py-3">
            <p className="text-sm font-medium text-[color:var(--danger)]">ტესტის ვალიდაცია ვერ გავიდა</p>
            <div className="mt-2 space-y-1">
              {quizErrors.map((error) => (
                <p key={error} className="text-sm text-[color:var(--danger)]">{error}</p>
              ))}
            </div>
          </div>
        ) : null}
      </BuilderSection>
    </div>
  );
}

function normalizeQuestion(question: QuizQuestion): QuizQuestion {
  return {
    id: question.id ?? crypto.randomUUID(),
    question: question.question ?? "",
    options: question.options?.length === 4 ? question.options : createDefaultOptions(),
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
    { id: "a", text: "", isCorrect: false },
    { id: "b", text: "", isCorrect: false },
    { id: "c", text: "", isCorrect: false },
    { id: "d", text: "", isCorrect: false },
  ];
}

function validateQuestions(questions: QuizQuestion[]) {
  const errors: string[] = [];

  questions.forEach((question, index) => {
    if (!question.question?.trim()) {
      errors.push(`კითხვა ${index + 1}: შეკითხვა სავალდებულოა.`);
    }

    const options = question.options ?? [];
    if (options.length !== 4) {
      errors.push(`კითხვა ${index + 1}: ზუსტად 4 პასუხი უნდა ჰქონდეს.`);
      return;
    }

    options.forEach((option, optionIndex) => {
      if (!option.text.trim()) {
        errors.push(`კითხვა ${index + 1}: პასუხი ${optionIndex + 1} სავალდებულოა.`);
      }
    });

    const correctCount = options.filter((option) => option.isCorrect).length;
    if (correctCount !== 1) {
      errors.push(`კითხვა ${index + 1}: უნდა იყოს მონიშნული ზუსტად 1 სწორი პასუხი.`);
    }
  });

  return errors;
}

function parseBulkQuizImport(value: string):
  | { ok: true; questions: QuizQuestion[] }
  | { ok: false; error: string } {
  const blocks = value
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return { ok: false, error: "იმპორტისთვის ტექსტი ცარიელია." };
  }

  const questions: QuizQuestion[] = [];

  for (const [index, block] of blocks.entries()) {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const questionLine = lines.find((line) => /^Question:/i.test(line));
    const answerLines = ["A", "B", "C", "D"].map((letter) => lines.find((line) => new RegExp(`^${letter}\\)`, "i").test(line)));
    const correctLine = lines.find((line) => /^Correct:/i.test(line));

    if (!questionLine || answerLines.some((line) => !line) || !correctLine) {
      return { ok: false, error: `ბლოკი ${index + 1} არასწორი ფორმატისაა.` };
    }

    const questionText = questionLine.replace(/^Question:\s*/i, "").trim();
    const correctLetter = correctLine.replace(/^Correct:\s*/i, "").trim().toUpperCase();

    if (!["A", "B", "C", "D"].includes(correctLetter)) {
      return { ok: false, error: `ბლოკი ${index + 1}: Correct უნდა იყოს A, B, C ან D.` };
    }

    questions.push({
      id: crypto.randomUUID(),
      question: questionText,
      options: answerLines.map((line, optionIndex) => {
        const letter = ["A", "B", "C", "D"][optionIndex];
        return {
          id: letter.toLowerCase(),
          text: (line ?? "").replace(new RegExp(`^${letter}\\)\\s*`, "i"), "").trim(),
          isCorrect: letter === correctLetter,
        };
      }),
    });
  }

  const errors = validateQuestions(questions);
  if (errors.length > 0) {
    return { ok: false, error: errors[0] };
  }

  return { ok: true, questions };
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const clone = [...items];
  const [item] = clone.splice(index, 1);
  clone.splice(nextIndex, 0, item);
  return clone;
}

function BuilderSection({ title, actionLabel, onAdd, children }: { title: string; actionLabel: string; onAdd: () => void; children: React.ReactNode }) {
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
      <button type="button" disabled={disableUp} onClick={onUp} className="rounded-full border border-[color:var(--line)] px-3 py-1 text-xs text-white disabled:opacity-40">↑</button>
      <button type="button" disabled={disableDown} onClick={onDown} className="rounded-full border border-[color:var(--line)] px-3 py-1 text-xs text-white disabled:opacity-40">↓</button>
      <button type="button" onClick={onDelete} className="rounded-full border border-[rgba(255,156,140,0.24)] px-3 py-1 text-xs text-[color:var(--danger)]">წაშლა</button>
    </div>
  );
}

function EmptyCopy({ text }: { text: string }) {
  return <p className="rounded-[14px] border border-[color:var(--line)] bg-white/[0.035] px-4 py-3 text-sm text-[color:var(--muted)]">{text}</p>;
}
