"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createEmptyMultipleChoiceQuestion,
  getExerciseTypeLabel,
  validateExerciseSets,
  type ExerciseSet,
} from "@/src/lib/exercises";
import { createInitialStandaloneExercise } from "@/src/lib/exercises/defaults";

export function StandaloneExerciseFields({
  initialExercise,
  accessLevel = "premium",
}: {
  initialExercise: ExerciseSet;
  accessLevel?: "free" | "standard" | "premium";
}) {
  const [exercise, setExercise] = useState<ExerciseSet>(initialExercise);
  const errors = useMemo(() => validateExerciseSets([exercise]), [exercise]);

  useEffect(() => {
    setExercise(initialExercise);
  }, [initialExercise]);

  return (
    <div className="space-y-4">
      <input type="hidden" name="exercise_type" value={exercise.type} readOnly />
      <input type="hidden" name="exercise_title" value={exercise.title} readOnly />
      <input type="hidden" name="exercise_difficulty" value={exercise.difficulty} readOnly />
      <input type="hidden" name="exercise_description" value={exercise.description ?? ""} readOnly />
      <input type="hidden" name="exercise_content" value={JSON.stringify(exercise.content)} readOnly />
      <input type="hidden" name="access_level" value={accessLevel} readOnly />

      <div className="rounded-[18px] border border-[color:var(--line)] bg-white/[0.03] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white">სავარჯიშოს მონაცემები</p>
          <span className="rounded-full border border-[rgba(244,177,93,0.24)] bg-[rgba(244,177,93,0.12)] px-3 py-1 text-xs text-[color:var(--gold-soft)]">
            {getExerciseTypeLabel(exercise.type)}
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            value={exercise.title}
            onChange={(event) => setExercise((current) => ({ ...current, title: event.target.value }))}
            placeholder="სათაური"
            className="h-10 rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-3 text-sm text-white outline-none"
          />
          <select
            value={exercise.difficulty}
            onChange={(event) => setExercise((current) => ({ ...current, difficulty: event.target.value as ExerciseSet["difficulty"] }))}
            className="h-10 rounded-[14px] border border-[color:var(--line)] bg-[#0d1625] px-3 text-sm text-white outline-none"
          >
            <option value="easy">მარტივი</option>
            <option value="medium">საშუალო</option>
            <option value="hard">რთული</option>
          </select>
        </div>
        <textarea
          value={exercise.description ?? ""}
          onChange={(event) => setExercise((current) => ({ ...current, description: event.target.value }))}
          rows={3}
          placeholder="მოკლე აღწერა"
          className="mt-3 w-full rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none"
        />
      </div>

      {exercise.type === "multiple_choice" ? <MultipleChoiceExerciseEditor exercise={exercise} onChange={setExercise} /> : null}
      {exercise.type === "text_correction" ? <TextCorrectionExerciseEditor exercise={exercise} onChange={setExercise} /> : null}
      {exercise.type === "reading_comprehension" ? <ReadingExerciseEditor exercise={exercise} onChange={setExercise} /> : null}

      {errors.length > 0 ? (
        <div className="rounded-[14px] border border-[rgba(255,156,140,0.24)] bg-[rgba(255,156,140,0.08)] px-4 py-3">
          <p className="text-sm font-medium text-[color:var(--danger)]">სავარჯიშოს ვალიდაცია ვერ გავიდა</p>
          <div className="mt-2 space-y-1">
            {errors.map((error) => (
              <p key={error} className="text-sm text-[color:var(--danger)]">{error}</p>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MultipleChoiceExerciseEditor({
  exercise,
  onChange,
}: {
  exercise: Extract<ExerciseSet, { type: "multiple_choice" }>;
  onChange: (exercise: Extract<ExerciseSet, { type: "multiple_choice" }>) => void;
}) {
  return (
    <div className="rounded-[18px] border border-[color:var(--line)] bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">შემოსახაზი კითხვები</p>
        <button
          type="button"
          onClick={() => onChange({ ...exercise, content: { questions: [...exercise.content.questions, createEmptyMultipleChoiceQuestion(exercise.content.questions.length + 1)] } })}
          className="rounded-full border border-[color:var(--line)] px-3 py-1.5 text-xs text-[color:var(--gold-soft)]"
        >
          კითხვის დამატება
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {exercise.content.questions.map((question, index) => (
          <div key={question.id} className="rounded-[16px] border border-[color:var(--line)] bg-white/[0.035] p-4">
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
                      name={`standalone-exercise-${exercise.id}-question-${question.id}`}
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
          </div>
        ))}
      </div>
    </div>
  );
}

function TextCorrectionExerciseEditor({
  exercise,
  onChange,
}: {
  exercise: Extract<ExerciseSet, { type: "text_correction" }>;
  onChange: (exercise: Extract<ExerciseSet, { type: "text_correction" }>) => void;
}) {
  return (
    <div className="rounded-[18px] border border-[color:var(--line)] bg-white/[0.03] p-4">
      <p className="text-sm font-semibold text-white">ტექსტის რედაქტირება</p>
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
      </div>
    </div>
  );
}

function ReadingExerciseEditor({
  exercise,
  onChange,
}: {
  exercise: Extract<ExerciseSet, { type: "reading_comprehension" }>;
  onChange: (exercise: Extract<ExerciseSet, { type: "reading_comprehension" }>) => void;
}) {
  return (
    <div className="rounded-[18px] border border-[color:var(--line)] bg-white/[0.03] p-4">
      <p className="text-sm font-semibold text-white">წაკითხულის გააზრება</p>
      <textarea
        value={exercise.content.passage}
        onChange={(event) => onChange({ ...exercise, content: { ...exercise.content, passage: event.target.value } })}
        rows={8}
        placeholder="პასაჟი"
        className="mt-4 w-full rounded-[14px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none"
      />
    </div>
  );
}
