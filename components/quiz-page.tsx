"use client";

import { useMemo, useState } from "react";
import { EmptyState, GlassCard, Pill, PremiumButton, ProgressBar, SectionTitle, Surface } from "@/components/ui";
import type { getWorkProfiles } from "@/src/lib/content";

type WorkProfiles = Awaited<ReturnType<typeof getWorkProfiles>>;

export function QuizPage({ works }: { works: WorkProfiles }) {
  const [selectedWorkId, setSelectedWorkId] = useState(works[0]?.id ?? "");
  const [attempt, setAttempt] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});

  const selectedWork = works.find((work) => work.id === selectedWorkId) ?? null;
  const normalizedQuestions = useMemo(() => {
    const quizData = selectedWork?.quiz_data ?? [];

    return shuffleArray(
      quizData
        .filter((question) => question.question?.trim() && question.options?.length === 4)
        .map((question, index) => ({
          ...question,
          options: shuffleArray(question.options ?? [], `${selectedWork?.id ?? "work"}-${question.id ?? index}-${attempt}`),
        })),
      `${selectedWork?.id ?? "work"}-questions-${attempt}`,
    );
  }, [attempt, selectedWork]);

  const currentQuestion = normalizedQuestions[currentIndex];
  const finished = normalizedQuestions.length > 0 && Object.keys(answers).length === normalizedQuestions.length;
  const score = Object.values(answers).filter(Boolean).length;
  const percentage = normalizedQuestions.length > 0 ? Math.round((score / normalizedQuestions.length) * 100) : 0;

  function choose(optionId: string, isCorrect: boolean) {
    if (selectedOptionId) return;
    setSelectedOptionId(optionId);
    setAnswers((items) => ({ ...items, [currentIndex]: isCorrect }));
  }

  function restartQuiz(nextWorkId?: string) {
    if (nextWorkId !== undefined) {
      setSelectedWorkId(nextWorkId);
    }
    setSelectedOptionId(null);
    setCurrentIndex(0);
    setAnswers({});
    setAttempt((value) => value + 1);
  }

  function nextQuestion() {
    setSelectedOptionId(null);
    setCurrentIndex((index) => Math.min(index + 1, normalizedQuestions.length - 1));
  }

  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="ტესტები"
        title="ტესტები და გამოცდის სიმულაცია"
        description="აირჩიეთ ნაწარმოები, გაუშვით ტესტი და ყოველ დაწყებაზე მიიღეთ შემთხვევითად არეული კითხვები და პასუხები."
        action={<PremiumButton href="/works">ნაწარმოებების ნახვა</PremiumButton>}
      />

      <GlassCard className="p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="block">
            <span className="text-sm font-medium text-[color:var(--muted)]">აირჩიეთ ნაწარმოები</span>
            <select
              value={selectedWorkId}
              onChange={(event) => restartQuiz(event.target.value)}
              className="mt-2 h-12 w-full rounded-[18px] border border-[color:var(--line)] bg-[#0d1625] px-4 text-sm text-white outline-none transition focus:border-[rgba(244,177,93,0.45)]"
            >
              {works.map((work) => (
                <option key={work.id} value={work.id}>
                  {work.title}
                </option>
              ))}
            </select>
          </label>
          {selectedWork ? (
            <div className="flex flex-wrap gap-2">
              <Pill tone="gold">{selectedWork.author}</Pill>
              <Pill>{selectedWork.genreLabel}</Pill>
            </div>
          ) : null}
        </div>
      </GlassCard>

      {works.length === 0 ? (
        <EmptyState
          title="ნაწარმოებები ჯერ არ არის დამატებული"
          description="ჯერ დაამატეთ ნაწარმოებები Supabase-დან ან ადმინისტრირების პანელიდან."
          action={<PremiumButton href="/admin" variant="secondary">ადმინის პანელი</PremiumButton>}
        />
      ) : !selectedWork ? (
        <EmptyState
          title="ნაწარმოები ვერ მოიძებნა"
          description="აირჩიეთ ნაწარმოები სიიდან ტესტის დასაწყებად."
        />
      ) : normalizedQuestions.length === 0 ? (
        <EmptyState
          title="ამ ნაწარმოებისთვის ტესტი ჯერ არ არის დამატებული."
          description="აირჩიეთ სხვა ნაწარმოები ან დაამატეთ ტესტი ადმინისტრირების პანელიდან."
          action={<PremiumButton href="/works" variant="secondary">ნაწარმოებების ნახვა</PremiumButton>}
        />
      ) : finished ? (
        <GlassCard className="p-6">
          <h3 className="font-serif text-2xl text-white">{selectedWork.title}</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Surface className="p-4">
              <p className="text-xs text-[color:var(--muted)]">შედეგი</p>
              <p className="mt-2 text-2xl font-semibold text-white">{`${score} / ${normalizedQuestions.length}`}</p>
            </Surface>
            <Surface className="p-4">
              <p className="text-xs text-[color:var(--muted)]">სიზუსტე</p>
              <p className="mt-2 text-2xl font-semibold text-white">{`${percentage}%`}</p>
            </Surface>
            <Surface className="p-4">
              <p className="text-xs text-[color:var(--muted)]">ნაწარმოები</p>
              <p className="mt-2 text-base font-semibold text-white">{selectedWork.author}</p>
            </Surface>
          </div>
          <div className="mt-5">
            <ProgressBar value={percentage} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => restartQuiz()}
              className="premium-button rounded-full px-5 py-2 text-sm font-bold text-[#160f08]"
            >
              თავიდან დაწყება
            </button>
            <PremiumButton href={`/works/${selectedWork.slug || selectedWork.id}`} variant="secondary">
              ნაწარმოების გახსნა
            </PremiumButton>
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-[color:var(--gold-soft)]">{selectedWork.title}</p>
              <h3 className="mt-1 font-serif text-2xl text-white">ტესტი</h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">{selectedWork.author}</p>
            </div>
            <button
              type="button"
              onClick={() => restartQuiz()}
              className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--gold-soft)] transition hover:bg-white/8"
            >
              თავიდან დაწყება
            </button>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3 text-xs text-[color:var(--muted)]">
              <span>{`კითხვა ${currentIndex + 1} / ${normalizedQuestions.length}`}</span>
              <span>{`სწორი პასუხები: ${Object.values(answers).filter(Boolean).length}`}</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={((currentIndex + (selectedOptionId ? 1 : 0)) / normalizedQuestions.length) * 100} />
            </div>
          </div>

          <Surface className="mt-5 p-5">
            <p className="text-lg font-semibold text-white">{currentQuestion.question}</p>
          </Surface>

          <div className="mt-4 grid gap-3">
            {currentQuestion.options?.map((option, optionIndex) => {
              const isAnswered = selectedOptionId !== null;
              const isSelected = selectedOptionId === option.id;
              const isCorrect = option.isCorrect;
              const stateClass = isAnswered
                ? isCorrect
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
                  onClick={() => choose(option.id, Boolean(option.isCorrect))}
                  className={`rounded-[16px] border px-4 py-3 text-left text-sm transition ${stateClass}`}
                >
                  {option.text || `პასუხი ${optionIndex + 1}`}
                </button>
              );
            })}
          </div>

          {selectedOptionId ? (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[color:var(--muted)]">
                {answers[currentIndex] ? "სწორია." : "არასწორია."}
              </p>
              <button
                type="button"
                onClick={nextQuestion}
                className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--gold-soft)] transition hover:bg-white/8"
              >
                {currentIndex === normalizedQuestions.length - 1 ? "შედეგის ნახვა" : "შემდეგი კითხვა"}
              </button>
            </div>
          ) : null}
        </GlassCard>
      )}
    </main>
  );
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
