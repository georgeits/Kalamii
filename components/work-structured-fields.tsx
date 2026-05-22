"use client";

import { useEffect, useMemo, useState } from "react";
import type { SummaryChapter } from "@/src/lib/content";
import {
  createEmptyExerciseSet,
  createEmptyMultipleChoiceQuestion,
  extractLegacyQuizData,
  getExerciseTypeLabel,
  validateExerciseSets,
  type ExerciseSet,
  type ExerciseType,
  type ReadingQuestion,
} from "@/src/lib/exercises";

export function WorkStructuredFields({
  chapterFieldName,
  quizFieldName,
  exerciseFieldName,
  initialChapters,
  initialExercises,
}: {
  chapterFieldName: string;
  quizFieldName: string;
  exerciseFieldName: string;
  initialChapters: SummaryChapter[];
  initialExercises: ExerciseSet[];
}) {
  const [chapters, setChapters] = useState<SummaryChapter[]>(() => initialChapters);
  const [exercises, setExercises] = useState<ExerciseSet[]>(() => initialExercises);
  const errors = useMemo(() => validateExerciseSets(exercises), [exercises]);
  const safeExercises = errors.length > 0 ? [] : exercises;
  const [nextType, setNextType] = useState<ExerciseType>("multiple_choice");

  useEffect(() => {
    setChapters(initialChapters);
  }, [initialChapters]);

  useEffect(() => {
    setExercises(initialExercises);
  }, [initialExercises]);

  return (
    <div className="space-y-4">
      <input type="hidden" name={chapterFieldName} value={JSON.stringify(chapters)} readOnly />
      <input type="hidden" name={exerciseFieldName} value={JSON.stringify(safeExercises)} readOnly />
      <input type="hidden" name={quizFieldName} value={JSON.stringify(extractLegacyQuizData(safeExercises))} readOnly />

      <BuilderSection title="შინაარსის თავები">
        <button
          type="button"
          onClick={() => setChapters((items) => [...items, { id: crypto.randomUUID(), title: `თავი ${items.length + 1}`, body: "" }])}
          className="rounded-full border border-[color:var(--line)] px-3 py-1.5 text-xs text-[color:var(--gold-soft)]"
        >
          თავის დამატება
        </button>
        {chapters.length > 0 ? (
          chapters.map((chapter, index) => (
            <EditorCard key={chapter.id}>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={chapter.title}
                  onChange={(event) => setChapters((items) => items.map((item) => (item.id === chapter.id ? { ...item, title: event.target.value } : item)))}
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
                onChange={(event) => setChapters((items) => items.map((item) => (item.id === chapter.id ? { ...item, body: event.target.value } : item)))}
                rows={5}
                className="mt-3 w-full rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none"
              />
            </EditorCard>
          ))
        ) : (
          <EmptyCopy text="შინაარსი ჯერ არ არის დამატებული." />
        )}
      </BuilderSection>

      <BuilderSection title="სავარჯიშოები">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={nextType}
            onChange={(event) => setNextType(event.target.value as ExerciseType)}
            className="h-10 rounded-[14px] border border-[color:var(--line)] bg-[#0d1625] px-3 text-sm text-white outline-none"
          >
            <option value="multiple_choice">არჩევითი</option>
            <option value="text_correction">ტექსტის რედაქტირება</option>
            <option value="reading_comprehension">წაკითხულის გააზრება</option>
          </select>
          <button
            type="button"
            onClick={() => setExercises((items) => [...items, createEmptyExerciseSet(items.length + 1, nextType)])}
            className="rounded-full border border-[color:var(--line)] px-3 py-1.5 text-xs text-[color:var(--gold-soft)]"
          >
            ახალი სავარჯიშო
          </button>
        </div>

        {exercises.length > 0 ? (
          exercises.map((exercise, index) => (
            <EditorCard key={exercise.id}>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={exercise.title}
                  onChange={(event) => setExercises((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, title: event.target.value } : item)))}
                  className="h-10 min-w-0 flex-1 rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-3 text-sm text-white outline-none"
                />
                <span className="rounded-full border border-[rgba(244,177,93,0.24)] bg-[rgba(244,177,93,0.12)] px-3 py-1 text-xs text-[color:var(--gold-soft)]">
                  {getExerciseTypeLabel(exercise.type)}
                </span>
                <MiniControls
                  onUp={() => setExercises((items) => moveItem(items, index, -1))}
                  onDown={() => setExercises((items) => moveItem(items, index, 1))}
                  onDelete={() => setExercises((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                  disableUp={index === 0}
                  disableDown={index === exercises.length - 1}
                />
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <input
                  value={exercise.description ?? ""}
                  onChange={(event) => setExercises((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, description: event.target.value } : item)))}
                  placeholder="მოკლე აღწერა"
                  className="h-10 rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-3 text-sm text-white outline-none"
                />
                <select
                  value={exercise.difficulty}
                  onChange={(event) => setExercises((items) => items.map((item, itemIndex) => (itemIndex === index ? { ...item, difficulty: event.target.value as ExerciseSet["difficulty"] } : item)))}
                  className="h-10 rounded-[14px] border border-[color:var(--line)] bg-[#0d1625] px-3 text-sm text-white outline-none"
                >
                  <option value="easy">მარტივი</option>
                  <option value="medium">საშუალო</option>
                  <option value="hard">რთული</option>
                </select>
              </div>

              {exercise.type === "multiple_choice" ? (
                <MultipleChoiceBuilder
                  exercise={exercise}
                  onChange={(nextExercise) => setExercises((items) => items.map((item, itemIndex) => (itemIndex === index ? nextExercise : item)))}
                />
              ) : null}

              {exercise.type === "text_correction" ? (
                <TextCorrectionBuilder
                  exercise={exercise}
                  onChange={(nextExercise) => setExercises((items) => items.map((item, itemIndex) => (itemIndex === index ? nextExercise : item)))}
                />
              ) : null}

              {exercise.type === "reading_comprehension" ? (
                <ReadingBuilder
                  exercise={exercise}
                  onChange={(nextExercise) => setExercises((items) => items.map((item, itemIndex) => (itemIndex === index ? nextExercise : item)))}
                />
              ) : null}
            </EditorCard>
          ))
        ) : (
          <EmptyCopy text="სავარჯიშო ჯერ არ არის დამატებული." />
        )}
        {errors.length > 0 ? (
          <div className="rounded-[14px] border border-[rgba(255,156,140,0.24)] bg-[rgba(255,156,140,0.08)] px-4 py-3">
            <p className="text-sm font-medium text-[color:var(--danger)]">სავარჯიშოების ვალიდაცია ვერ გავიდა</p>
            <div className="mt-2 space-y-1">
              {errors.map((error) => (
                <p key={error} className="text-sm text-[color:var(--danger)]">{error}</p>
              ))}
            </div>
          </div>
        ) : null}
      </BuilderSection>
    </div>
  );
}

function MultipleChoiceBuilder({
  exercise,
  onChange,
}: {
  exercise: Extract<ExerciseSet, { type: "multiple_choice" }>;
  onChange: (exercise: Extract<ExerciseSet, { type: "multiple_choice" }>) => void;
}) {
  return (
    <div className="mt-4 space-y-3">
      <button
        type="button"
        onClick={() => onChange({ ...exercise, content: { questions: [...exercise.content.questions, createEmptyMultipleChoiceQuestion(exercise.content.questions.length + 1)] } })}
        className="rounded-full border border-[color:var(--line)] px-3 py-1.5 text-xs text-[color:var(--gold-soft)]"
      >
        კითხვის დამატება
      </button>
      {exercise.content.questions.map((question, index) => (
        <EditorCard key={question.id}>
          <input
            value={question.prompt}
            onChange={(event) =>
              onChange({
                ...exercise,
                content: {
                  questions: exercise.content.questions.map((item, itemIndex) => (itemIndex === index ? { ...item, prompt: event.target.value } : item)),
                },
              })
            }
            className="h-10 w-full rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-3 text-sm text-white outline-none"
          />
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {question.options.map((option, optionIndex) => (
              <label key={option.id} className="rounded-[14px] border border-[color:var(--line)] bg-white/[0.04] p-3">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`exercise-${exercise.id}-question-${question.id}`}
                    checked={option.isCorrect}
                    onChange={() =>
                      onChange({
                        ...exercise,
                        content: {
                          questions: exercise.content.questions.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  options: item.options.map((itemOption, itemOptionIndex) => ({
                                    ...itemOption,
                                    isCorrect: itemOptionIndex === optionIndex,
                                  })),
                                }
                              : item,
                          ),
                        },
                      })
                    }
                  />
                  <span className="text-xs text-[color:var(--muted)]">{`პასუხი ${optionIndex + 1}`}</span>
                </div>
                <input
                  value={option.text}
                  onChange={(event) =>
                    onChange({
                      ...exercise,
                      content: {
                        questions: exercise.content.questions.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                options: item.options.map((itemOption, itemOptionIndex) =>
                                  itemOptionIndex === optionIndex ? { ...itemOption, text: event.target.value } : itemOption,
                                ),
                              }
                            : item,
                        ),
                      },
                    })
                  }
                  className="mt-2 h-10 w-full rounded-[12px] border border-[color:var(--line)] bg-white/[0.045] px-3 text-sm text-white outline-none"
                />
              </label>
            ))}
          </div>
          <textarea
            value={question.explanation ?? ""}
            onChange={(event) =>
              onChange({
                ...exercise,
                content: {
                  questions: exercise.content.questions.map((item, itemIndex) => (itemIndex === index ? { ...item, explanation: event.target.value } : item)),
                },
              })
            }
            rows={3}
            placeholder="ახსნა submit-ის შემდეგ"
            className="mt-3 w-full rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none"
          />
        </EditorCard>
      ))}
    </div>
  );
}

function TextCorrectionBuilder({
  exercise,
  onChange,
}: {
  exercise: Extract<ExerciseSet, { type: "text_correction" }>;
  onChange: (exercise: Extract<ExerciseSet, { type: "text_correction" }>) => void;
}) {
  return (
    <div className="mt-4 grid gap-3">
      <textarea
        value={exercise.content.incorrectText}
        onChange={(event) => onChange({ ...exercise, content: { ...exercise.content, incorrectText: event.target.value } })}
        rows={6}
        placeholder="არასწორი ტექსტი"
        className="w-full rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none"
      />
      <textarea
        value={exercise.content.correctText}
        onChange={(event) => onChange({ ...exercise, content: { ...exercise.content, correctText: event.target.value } })}
        rows={6}
        placeholder="სწორი ვერსია"
        className="w-full rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none"
      />
      <textarea
        value={exercise.content.explanation ?? ""}
        onChange={(event) => onChange({ ...exercise, content: { ...exercise.content, explanation: event.target.value } })}
        rows={4}
        placeholder="ახსნა"
        className="w-full rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none"
      />
    </div>
  );
}

function ReadingBuilder({
  exercise,
  onChange,
}: {
  exercise: Extract<ExerciseSet, { type: "reading_comprehension" }>;
  onChange: (exercise: Extract<ExerciseSet, { type: "reading_comprehension" }>) => void;
}) {
  return (
    <div className="mt-4 space-y-3">
      <textarea
        value={exercise.content.passage}
        onChange={(event) => onChange({ ...exercise, content: { ...exercise.content, passage: event.target.value } })}
        rows={8}
        placeholder="წასაკითხი ტექსტი ან პასაჟი"
        className="w-full rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none"
      />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            onChange({
              ...exercise,
              content: {
                ...exercise.content,
                questions: [
                  ...exercise.content.questions,
                  { id: crypto.randomUUID(), type: "multiple_choice", prompt: "კითხვა", options: createEmptyMultipleChoiceQuestion(1).options, explanation: "" },
                ],
              },
            })
          }
          className="rounded-full border border-[color:var(--line)] px-3 py-1.5 text-xs text-[color:var(--gold-soft)]"
        >
          არჩევითი კითხვა
        </button>
        <button
          type="button"
          onClick={() =>
            onChange({
              ...exercise,
              content: {
                ...exercise.content,
                questions: [...exercise.content.questions, { id: crypto.randomUUID(), type: "short_answer", prompt: "კითხვა", acceptedAnswers: [""], explanation: "" }],
              },
            })
          }
          className="rounded-full border border-[color:var(--line)] px-3 py-1.5 text-xs text-[color:var(--gold-soft)]"
        >
          მოკლე პასუხი
        </button>
        <button
          type="button"
          onClick={() =>
            onChange({
              ...exercise,
              content: {
                ...exercise.content,
                questions: [...exercise.content.questions, { id: crypto.randomUUID(), type: "true_false", prompt: "კითხვა", correctAnswer: true, explanation: "" }],
              },
            })
          }
          className="rounded-full border border-[color:var(--line)] px-3 py-1.5 text-xs text-[color:var(--gold-soft)]"
        >
          მართალი/მცდარი
        </button>
      </div>
      {exercise.content.questions.map((question, index) => (
        <ReadingQuestionBuilder
          key={question.id}
          question={question}
          onChange={(nextQuestion) =>
            onChange({
              ...exercise,
              content: {
                ...exercise.content,
                questions: exercise.content.questions.map((item, itemIndex) => (itemIndex === index ? nextQuestion : item)),
              },
            })
          }
        />
      ))}
    </div>
  );
}

function ReadingQuestionBuilder({
  question,
  onChange,
}: {
  question: ReadingQuestion;
  onChange: (question: ReadingQuestion) => void;
}) {
  return (
    <EditorCard>
      <div className="grid gap-3 md:grid-cols-[200px_1fr]">
        <select
          value={question.type}
          onChange={(event) => onChange({ ...question, type: event.target.value as ReadingQuestion["type"] })}
          className="h-10 rounded-[14px] border border-[color:var(--line)] bg-[#0d1625] px-3 text-sm text-white outline-none"
        >
          <option value="multiple_choice">არჩევითი</option>
          <option value="short_answer">მოკლე პასუხი</option>
          <option value="true_false">მართალი/მცდარი</option>
        </select>
        <input
          value={question.prompt}
          onChange={(event) => onChange({ ...question, prompt: event.target.value })}
          className="h-10 rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-3 text-sm text-white outline-none"
        />
      </div>
      {question.type === "multiple_choice" ? (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {(question.options ?? createEmptyMultipleChoiceQuestion(1).options).map((option, optionIndex) => (
            <label key={option.id} className="rounded-[14px] border border-[color:var(--line)] bg-white/[0.04] p-3">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`reading-correct-${question.id}`}
                  checked={option.isCorrect}
                  onChange={() =>
                    onChange({
                      ...question,
                      options: (question.options ?? []).map((itemOption, itemOptionIndex) => ({
                        ...itemOption,
                        isCorrect: itemOptionIndex === optionIndex,
                      })),
                    })
                  }
                />
                <span className="text-xs text-[color:var(--muted)]">{`პასუხი ${optionIndex + 1}`}</span>
              </div>
              <input
                value={option.text}
                onChange={(event) =>
                  onChange({
                    ...question,
                    options: (question.options ?? []).map((itemOption, itemOptionIndex) =>
                      itemOptionIndex === optionIndex ? { ...itemOption, text: event.target.value } : itemOption,
                    ),
                  })
                }
                className="mt-2 h-10 w-full rounded-[12px] border border-[color:var(--line)] bg-white/[0.045] px-3 text-sm text-white outline-none"
              />
            </label>
          ))}
        </div>
      ) : null}
      {question.type === "short_answer" ? (
        <textarea
          value={(question.acceptedAnswers ?? []).join("\n")}
          onChange={(event) => onChange({ ...question, acceptedAnswers: event.target.value.split("\n") })}
          rows={4}
          placeholder="ერთი სწორი პასუხი თითო ხაზზე"
          className="mt-3 w-full rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none"
        />
      ) : null}
      {question.type === "true_false" ? (
        <select
          value={question.correctAnswer ? "true" : "false"}
          onChange={(event) => onChange({ ...question, correctAnswer: event.target.value === "true" })}
          className="mt-3 h-10 rounded-[14px] border border-[color:var(--line)] bg-[#0d1625] px-3 text-sm text-white outline-none"
        >
          <option value="true">მართალია</option>
          <option value="false">მცდარია</option>
        </select>
      ) : null}
    </EditorCard>
  );
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const clone = [...items];
  const [item] = clone.splice(index, 1);
  clone.splice(nextIndex, 0, item);
  return clone;
}

function BuilderSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{title}</p>
      </div>
      {children}
    </div>
  );
}

function EditorCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[16px] border border-[color:var(--line)] bg-white/[0.035] p-4">{children}</div>;
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
