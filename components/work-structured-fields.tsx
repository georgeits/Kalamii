"use client";

import { useState } from "react";
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

  return (
    <div className="space-y-4">
      <input type="hidden" name={chapterFieldName} value={JSON.stringify(chapters)} readOnly />
      <input type="hidden" name={quizFieldName} value={JSON.stringify(questions)} readOnly />

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
                      <span className="text-xs text-[color:var(--muted)]">სწორი პასუხი</span>
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
    { id: "a", text: "", isCorrect: true },
    { id: "b", text: "", isCorrect: false },
    { id: "c", text: "", isCorrect: false },
    { id: "d", text: "", isCorrect: false },
  ];
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
