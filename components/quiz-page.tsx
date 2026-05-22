"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState, GlassCard, Pill, PremiumButton, ProgressBar, SectionTitle, Surface } from "@/components/ui";
import {
  getDifficultyLabel,
  getExerciseTypeLabel,
  type ExerciseProgressRecord,
  type ExerciseSet,
  type ReadingQuestion,
} from "@/src/lib/exercises";
import type { getWorkProfiles } from "@/src/lib/content";

type WorkProfiles = Awaited<ReturnType<typeof getWorkProfiles>>;
type ExerciseEntry = {
  key: string;
  workId: string;
  workTitle: string;
  author: string;
  genreLabel: string;
  exercise: ExerciseSet;
};

export function QuizPage({
  works,
  progress,
  totalExercises,
  totalQuestions,
}: {
  works: WorkProfiles;
  progress: ExerciseProgressRecord;
  totalExercises: number;
  totalQuestions: number;
}) {
  const exerciseEntries = useMemo<ExerciseEntry[]>(
    () =>
      works.flatMap((work) =>
        work.exercises.map((exercise) => ({
          key: `${work.id}:${exercise.id}`,
          workId: work.id,
          workTitle: work.title,
          author: work.author,
          genreLabel: work.genreLabel,
          exercise,
        })),
      ),
    [works],
  );

  const [selectedKey, setSelectedKey] = useState(exerciseEntries[0]?.key ?? "");
  const [attempt, setAttempt] = useState(0);
  const effectiveSelectedKey = exerciseEntries.some((entry) => entry.key === selectedKey)
    ? selectedKey
    : (exerciseEntries[0]?.key ?? "");
  const selectedEntry = exerciseEntries.find((entry) => entry.key === effectiveSelectedKey) ?? null;

  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="სავარჯიშოები"
        title="გასააზრებელი და სავარჯიშოები"
        description="არჩევითი კითხვები, ტექსტის რედაქტირება და წაკითხულის გააზრება ახლა ერთ სასწავლო სივრცეშია გაერთიანებული."
        action={<PremiumButton href="/works">ნაწარმოებების გახსნა</PremiumButton>}
      />

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <GlassCard className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[color:var(--gold-soft)]">სწავლის პროგრესი</p>
              <h3 className="mt-2 font-serif text-3xl text-white">სწორი რიტმით ივარჯიშე</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
                აირჩიე სავარჯიშო, დაასრულე attempt-ი და სისტემა დაითვლის დასრულებულ სავარჯიშოებს, სწორ პასუხებს და სტრიქს.
              </p>
            </div>
            <Pill tone="gold">{totalExercises} სავარჯიშო</Pill>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="დასრულებული" value={String(progress.completedExercises)} detail="completed" />
            <Stat label="სწორი პასუხები" value={String(progress.correctAnswers)} detail="answers" />
            <Stat label="სტრიქი" value={`${progress.streak}`} detail="days" />
            <Stat label="პროგრესი" value={`${progress.progressPercentage}%`} detail={`${totalQuestions} კითხვა`} />
          </div>
          <div className="mt-5">
            <ProgressBar value={progress.progressPercentage} />
          </div>
        </GlassCard>

        <GlassCard className="p-5 sm:p-6">
          <p className="text-sm text-[color:var(--gold-soft)]">ფორმატები</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <FormatCard title="არჩევითი" description="4 პასუხი, არეული ვარიანტები, ახსნა და სირთულე." />
            <FormatCard title="რედაქტირება" description="არასწორი ტექსტის შესწორება და შეცდომების ნახვა." />
            <FormatCard title="გააზრება" description="პასაჟი, მოკლე პასუხი, true/false და არჩევითი." />
          </div>
        </GlassCard>
      </div>

      {exerciseEntries.length === 0 ? (
        <EmptyState
          title="სავარჯიშოები ჯერ არ არის დამატებული"
          description="ადმინის პანელიდან დაამატეთ პირველი არჩევითი, ტექსტის რედაქტირების ან წაკითხულის გააზრების სავარჯიშო."
          action={<PremiumButton href="/admin" variant="secondary">ადმინის პანელი</PremiumButton>}
        />
      ) : (
        <div className="grid gap-6 2xl:grid-cols-[0.92fr_1.08fr]">
          <GlassCard className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-serif text-2xl text-white">სავარჯიშოების კატალოგი</h3>
              <Pill tone="sky">{exerciseEntries.length} ბარათი</Pill>
            </div>
            <div className="mt-5 grid gap-3">
              {exerciseEntries.map((entry) => {
                const isActive = entry.key === effectiveSelectedKey;
                return (
                  <button
                    key={entry.key}
                    type="button"
                    onClick={() => {
                      setSelectedKey(entry.key);
                      setAttempt((value) => value + 1);
                    }}
                    className={`rounded-[18px] border p-4 text-left transition ${
                      isActive
                        ? "border-[rgba(244,177,93,0.34)] bg-[rgba(244,177,93,0.12)]"
                        : "border-[color:var(--line)] bg-white/[0.045] hover:bg-white/[0.07]"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{entry.exercise.title}</p>
                        <p className="mt-1 text-sm text-[color:var(--muted)]">{entry.workTitle}</p>
                        <p className="mt-1 text-xs text-[color:var(--muted)]">{entry.author}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Pill tone="gold">{getExerciseTypeLabel(entry.exercise.type)}</Pill>
                        <Pill tone="rose">{getDifficultyLabel(entry.exercise.difficulty)}</Pill>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                      {entry.exercise.description?.trim() || "კომპაქტური სასწავლო ბარათი სწრაფი პრაქტიკისთვის."}
                    </p>
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {selectedEntry ? <ExercisePanel key={`${selectedEntry.key}:${attempt}`} entry={selectedEntry} /> : null}
        </div>
      )}
    </main>
  );
}

function ExercisePanel({ entry }: { entry: ExerciseEntry }) {
  if (entry.exercise.type === "text_correction") {
    return <TextCorrectionPanel entry={entry} />;
  }

  if (entry.exercise.type === "reading_comprehension") {
    return <ReadingComprehensionPanel entry={entry} />;
  }

  return <MultipleChoicePanel entry={entry} />;
}

function MultipleChoicePanel({ entry }: { entry: ExerciseEntry }) {
  const questions = useMemo(
    () =>
      shuffleArray(
        entry.exercise.content.questions.map((question, index) => ({
          ...question,
          options: shuffleArray(question.options, `${entry.key}:${question.id}:${index}`),
        })),
        `${entry.key}:questions`,
      ),
    [entry],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const currentQuestion = questions[currentIndex];
  const finished = questions.length > 0 && Object.keys(answers).length === questions.length;
  const score = Object.values(answers).filter(Boolean).length;
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  useProgressPersistence({ finished, workId: entry.workId, exerciseId: entry.exercise.id, correctAnswers: score, totalQuestions: questions.length });

  return (
    <GlassCard className="p-5 sm:p-6">
      <ExerciseHeader entry={entry} progressValue={((currentIndex + (selectedOptionId ? 1 : 0)) / Math.max(questions.length, 1)) * 100} counter={`${currentIndex + 1} / ${questions.length}`} />
      {questions.length === 0 ? (
        <EmptyState title="კითხვები არ მოიძებნა" description="ადმინმა ჯერ არ დაამატა ამ ბარათში კითხვები." />
      ) : finished ? (
        <ExerciseResult score={score} total={questions.length} percentage={percentage} />
      ) : (
        <div className="mt-5 space-y-4">
          <Surface className="p-5">
            <p className="text-lg font-semibold text-white">{currentQuestion.prompt}</p>
          </Surface>
          <div className="grid gap-3">
            {currentQuestion.options.map((option, optionIndex) => {
              const isAnswered = selectedOptionId !== null;
              const isSelected = selectedOptionId === option.id;
              const stateClass = isAnswered
                ? option.isCorrect
                  ? "border-[rgba(114,212,164,0.34)] bg-[rgba(114,212,164,0.12)] text-white"
                  : isSelected
                    ? "border-[rgba(255,156,140,0.34)] bg-[rgba(255,156,140,0.12)] text-white"
                    : "border-[color:var(--line)] bg-white/[0.035] text-[color:var(--muted)]"
                : "border-[color:var(--line)] bg-white/[0.035] text-white hover:bg-white/[0.06]";

              return (
                <button
                  key={`${option.id}-${optionIndex}`}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => {
                    setSelectedOptionId(option.id);
                    setAnswers((items) => ({ ...items, [currentIndex]: option.isCorrect }));
                  }}
                  className={`rounded-[16px] border px-4 py-3 text-left text-sm transition ${stateClass}`}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
          {selectedOptionId ? (
            <div className="space-y-3 rounded-[18px] border border-[color:var(--line)] bg-white/[0.04] p-4">
              <p className="text-sm text-white">{answers[currentIndex] ? "სწორი პასუხია." : "არასწორია."}</p>
              {currentQuestion.explanation?.trim() ? <p className="text-sm leading-6 text-[color:var(--muted)]">{currentQuestion.explanation}</p> : null}
              <button
                type="button"
                onClick={() => {
                  setSelectedOptionId(null);
                  setCurrentIndex((value) => Math.min(value + 1, questions.length - 1));
                }}
                className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--gold-soft)] transition hover:bg-white/8"
              >
                {currentIndex === questions.length - 1 ? "შედეგის ნახვა" : "შემდეგი კითხვა"}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </GlassCard>
  );
}

function TextCorrectionPanel({ entry }: { entry: ExerciseEntry }) {
  const [userText, setUserText] = useState(entry.exercise.content.incorrectText);
  const [checked, setChecked] = useState(false);
  const comparison = checked ? compareTexts(userText, entry.exercise.content.correctText) : null;

  useProgressPersistence({
    finished: checked,
    workId: entry.workId,
    exerciseId: entry.exercise.id,
    correctAnswers: comparison?.isExactMatch ? 1 : 0,
    totalQuestions: 1,
  });

  return (
    <GlassCard className="p-5 sm:p-6">
      <ExerciseHeader entry={entry} progressValue={checked ? 100 : 50} counter="რედაქტირება" />
      <div className="mt-5 grid gap-4">
        <Surface className="p-5">
          <p className="text-sm text-[color:var(--gold-soft)]">დაარედაქტირე ტექსტი</p>
          <textarea
            value={userText}
            onChange={(event) => {
              setUserText(event.target.value);
              setChecked(false);
            }}
            rows={10}
            className="mt-4 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm leading-7 text-white outline-none"
          />
        </Surface>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setChecked(true)}
            className="premium-button rounded-full px-5 py-2 text-sm font-bold text-[#160f08]"
          >
            შეამოწმე
          </button>
          <button
            type="button"
            onClick={() => {
              setUserText(entry.exercise.content.incorrectText);
              setChecked(false);
            }}
            className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-white transition hover:bg-white/8"
          >
            თავიდან
          </button>
        </div>
        {comparison ? (
          <div className="grid gap-4 xl:grid-cols-2">
            <Surface className="p-5">
              <p className="text-sm text-[color:var(--gold-soft)]">შენი ვერსია</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {comparison.userWords.map((word, index) => (
                  <span
                    key={`${word}-${index}`}
                    className={`rounded-md px-2 py-1 text-sm ${
                      comparison.mistakeIndexes.has(index)
                        ? "bg-[rgba(255,156,140,0.14)] text-[color:var(--danger)]"
                        : "bg-white/[0.05] text-white"
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </Surface>
            <Surface className="p-5">
              <p className="text-sm text-[color:var(--gold-soft)]">სწორი ვერსია</p>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white">{entry.exercise.content.correctText}</p>
              {entry.exercise.content.explanation?.trim() ? (
                <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">{entry.exercise.content.explanation}</p>
              ) : null}
            </Surface>
          </div>
        ) : null}
      </div>
    </GlassCard>
  );
}

function ReadingComprehensionPanel({ entry }: { entry: ExerciseEntry }) {
  const questions = entry.exercise.content.questions;
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const evaluation = submitted ? evaluateReadingQuestions(questions, answers) : null;

  useProgressPersistence({
    finished: submitted,
    workId: entry.workId,
    exerciseId: entry.exercise.id,
    correctAnswers: evaluation?.correctAnswers ?? 0,
    totalQuestions: questions.length,
  });

  return (
    <GlassCard className="p-5 sm:p-6">
      <ExerciseHeader entry={entry} progressValue={submitted ? 100 : 45} counter={`${questions.length} კითხვა`} />
      <Surface className="mt-5 p-5">
        <p className="whitespace-pre-wrap text-sm leading-7 text-white">{entry.exercise.content.passage}</p>
      </Surface>
      <div className="mt-5 grid gap-4">
        {questions.map((question, index) => (
          <Surface key={question.id} className="p-5">
            <p className="text-sm text-[color:var(--gold-soft)]">{`კითხვა ${index + 1}`}</p>
            <p className="mt-2 text-base font-semibold text-white">{question.prompt}</p>
            <ReadingQuestionInput question={question} value={answers[question.id]} onChange={(value) => setAnswers((items) => ({ ...items, [question.id]: value }))} />
            {submitted ? <ReadingFeedback question={question} result={evaluation?.results.find((item) => item.id === question.id) ?? null} /> : null}
          </Surface>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          className="premium-button rounded-full px-5 py-2 text-sm font-bold text-[#160f08]"
        >
          შემოწმება
        </button>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setAnswers({});
          }}
          className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-white transition hover:bg-white/8"
        >
          თავიდან
        </button>
      </div>
      {evaluation ? <ExerciseResult score={evaluation.correctAnswers} total={questions.length} percentage={evaluation.percentage} className="mt-5" /> : null}
    </GlassCard>
  );
}

function ExerciseHeader({ entry, progressValue, counter }: { entry: ExerciseEntry; progressValue: number; counter: string }) {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-[color:var(--gold-soft)]">{entry.workTitle}</p>
          <h3 className="mt-1 font-serif text-2xl text-white">{entry.exercise.title}</h3>
          <p className="mt-2 text-sm text-[color:var(--muted)]">{entry.author}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill tone="gold">{getExerciseTypeLabel(entry.exercise.type)}</Pill>
          <Pill tone="rose">{getDifficultyLabel(entry.exercise.difficulty)}</Pill>
          <Pill>{counter}</Pill>
        </div>
      </div>
      <div className="mt-5">
        <ProgressBar value={progressValue} />
      </div>
    </>
  );
}

function ExerciseResult({
  score,
  total,
  percentage,
  className = "mt-5",
}: {
  score: number;
  total: number;
  percentage: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="სწორი პასუხები" value={`${score}/${total}`} detail="result" />
        <Stat label="სიზუსტე" value={`${percentage}%`} detail="accuracy" />
        <Stat label="სტატუსი" value={percentage >= 70 ? "ძლიერი" : "მუშაობა"} detail="status" />
      </div>
    </div>
  );
}

function ReadingQuestionInput({
  question,
  value,
  onChange,
}: {
  question: ReadingQuestion;
  value: string | boolean | undefined;
  onChange: (value: string | boolean) => void;
}) {
  if (question.type === "true_false") {
    return (
      <div className="mt-4 flex gap-3">
        {[
          { label: "მართალია", value: true },
          { label: "მცდარია", value: false },
        ].map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              value === option.value
                ? "border-[rgba(244,177,93,0.34)] bg-[rgba(244,177,93,0.12)] text-white"
                : "border-[color:var(--line)] text-[color:var(--muted)] hover:bg-white/8"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  if (question.type === "short_answer") {
    return (
      <textarea
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="mt-4 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none"
      />
    );
  }

  return (
    <div className="mt-4 grid gap-3">
      {(question.options ?? []).map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`rounded-[14px] border px-4 py-3 text-left text-sm transition ${
            value === option.id
              ? "border-[rgba(244,177,93,0.34)] bg-[rgba(244,177,93,0.12)] text-white"
              : "border-[color:var(--line)] bg-white/[0.035] text-white hover:bg-white/[0.06]"
          }`}
        >
          {option.text}
        </button>
      ))}
    </div>
  );
}

function ReadingFeedback({
  question,
  result,
}: {
  question: ReadingQuestion;
  result: { correct: boolean; expected: string } | null;
}) {
  if (!result) {
    return null;
  }

  return (
    <div className="mt-4 rounded-[14px] border border-[color:var(--line)] bg-white/[0.035] p-4">
      <p className={`text-sm ${result.correct ? "text-[color:var(--success)]" : "text-[color:var(--danger)]"}`}>
        {result.correct ? "სწორია." : `სწორი პასუხი: ${result.expected}`}
      </p>
      {question.explanation?.trim() ? <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{question.explanation}</p> : null}
    </div>
  );
}

function FormatCard({ title, description }: { title: string; description: string }) {
  return (
    <Surface className="p-4">
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{description}</p>
    </Surface>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Surface className="p-4">
      <p className="text-xs text-[color:var(--muted)]">{label}</p>
      <p className="mt-2 font-display text-3xl text-white">{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[color:var(--gold-soft)]">{detail}</p>
    </Surface>
  );
}

function evaluateReadingQuestions(questions: ReadingQuestion[], answers: Record<string, string | boolean>) {
  const results = questions.map((question) => {
    if (question.type === "true_false") {
      const correct = answers[question.id] === question.correctAnswer;
      return { id: question.id, correct, expected: question.correctAnswer ? "მართალია" : "მცდარია" };
    }

    if (question.type === "short_answer") {
      const userAnswer = String(answers[question.id] ?? "").trim().toLowerCase();
      const accepted = (question.acceptedAnswers ?? []).map((item) => item.trim().toLowerCase()).filter(Boolean);
      const correct = accepted.includes(userAnswer);
      return { id: question.id, correct, expected: accepted.join(" / ") };
    }

    const correctOption = (question.options ?? []).find((option) => option.isCorrect);
    const correct = answers[question.id] === correctOption?.id;
    return { id: question.id, correct, expected: correctOption?.text ?? "" };
  });

  const correctAnswers = results.filter((result) => result.correct).length;
  return {
    results,
    correctAnswers,
    percentage: questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0,
  };
}

function compareTexts(userText: string, correctText: string) {
  const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
  const userWords = normalize(userText).split(" ").filter(Boolean);
  const correctWords = normalize(correctText).split(" ").filter(Boolean);
  const max = Math.max(userWords.length, correctWords.length);
  const mistakeIndexes = new Set<number>();

  for (let index = 0; index < max; index += 1) {
    if ((userWords[index] ?? "") !== (correctWords[index] ?? "")) {
      mistakeIndexes.add(index);
    }
  }

  return {
    userWords,
    mistakeIndexes,
    isExactMatch: normalize(userText) === normalize(correctText),
  };
}

function shuffleArray<T>(items: T[], seed: string) {
  const clone = [...items];
  let state = hashSeed(seed) + clone.length * 17 + 7;
  for (let index = clone.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) % 4294967296;
    const swapIndex = Math.floor((state / 4294967296) * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
}

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function useProgressPersistence({
  finished,
  workId,
  exerciseId,
  correctAnswers,
  totalQuestions,
}: {
  finished: boolean;
  workId: string;
  exerciseId: string;
  correctAnswers: number;
  totalQuestions: number;
}) {
  useEffect(() => {
    if (!finished) {
      return;
    }

    void fetch("/api/exercises/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workId,
        exerciseId,
        correctAnswers,
        totalQuestions,
      }),
    }).catch(() => undefined);
  }, [correctAnswers, exerciseId, finished, totalQuestions, workId]);
}
