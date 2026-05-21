"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AccessBadge, LockedContent } from "@/components/access-helpers";
import { AuthorPortrait } from "@/components/author-portrait";
import { WorkInlineEditor } from "@/components/public-inline-editors";
import { GlassCard, Pill, PremiumButton, SectionTitle, Surface } from "@/components/ui";
import { hasAccessToLevel, type AccessLevel } from "@/src/lib/access";
import type { getWorkDetail, QuizQuestion } from "@/src/lib/content";

type WorkDetail = NonNullable<Awaited<ReturnType<typeof getWorkDetail>>>;

export function WorkDetailPage({ work, isAdmin, userPlan }: { work: WorkDetail; isAdmin: boolean; userPlan: AccessLevel }) {
  const canAccess = isAdmin || hasAccessToLevel(userPlan, work.access_level);
  const hasPlan = Boolean(work.plan?.trim());
  const hasChapters = Boolean((work.summary_chapters ?? []).length);
  const hasAnalysis = Boolean(work.analysis?.trim());
  const hasQuiz = Boolean((work.quiz_data ?? []).length);

  return (
    <main className="space-y-6 pb-8">
      <GlassCard className="p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[120px_1fr]">
          <AuthorPortrait name={work.author} imageUrl={work.authorImageUrl} className="aspect-[4/5]" />
          <div>
            <SectionTitle
              eyebrow={`${work.author} • ${work.genreLabel}`}
              title={work.title}
              description={work.summary}
              action={
                <div className="flex flex-wrap gap-2">
                  <Pill tone="gold">{work.periodLabel}</Pill>
                  <Pill tone="rose">{work.accessLevelLabel}</Pill>
                  <AccessBadge userPlan={userPlan} requiredLevel={work.access_level} />
                </div>
              }
            />
            {isAdmin ? <WorkInlineEditor work={work} /> : null}
            <div className="mt-4">
              <Link href={`/authors/${work.authorSlug || work.author_id || ""}`} className="text-sm text-[color:var(--gold-soft)] transition hover:text-white">
                ავტორი: {work.author}
              </Link>
            </div>
          </div>
        </div>
      </GlassCard>

      {canAccess ? (
        <>
          {(isAdmin || hasPlan) ? <ContentSection title="გეგმა" body={work.plan} /> : null}
          {(isAdmin || hasChapters) ? <ChapterSection chapters={work.summary_chapters ?? []} /> : null}
          {(isAdmin || hasAnalysis) ? <ContentSection title="ანალიზი" body={work.analysis} /> : null}
          {(isAdmin || hasQuiz) ? <QuizSection questions={work.quiz_data ?? []} /> : null}
        </>
      ) : (
        <LockedContent requiredLevel={work.access_level} />
      )}
    </main>
  );
}

function ContentSection({
  title,
  body,
}: {
  title: string;
  body?: string | null;
}) {
  return (
    <GlassCard className="p-6">
      <h3 className="font-serif text-2xl text-white">{title}</h3>
      {body?.trim() ? (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[color:var(--muted)]">{body}</p>
      ) : (
        <EmptyCopy text="მასალა ჯერ არ არის დამატებული" />
      )}
    </GlassCard>
  );
}

function ChapterSection({ chapters }: { chapters: WorkDetail["summary_chapters"] }) {
  const safeChapters = chapters ?? [];
  const [activeChapterId, setActiveChapterId] = useState(safeChapters[0]?.id ?? "");
  const activeChapter = safeChapters.find((item) => item.id === activeChapterId) ?? safeChapters[0];

  return (
    <GlassCard className="p-6">
      <h3 className="font-serif text-2xl text-white">შინაარსი</h3>
      {safeChapters.length > 0 ? (
          <>
            <div className="mt-5 flex flex-wrap gap-3">
            {safeChapters.map((chapter, index) => {
              const isActive = chapter.id === activeChapter?.id;
              const chapterLabel = chapter.title || `თავი ${index + 1}`;
              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => setActiveChapterId(chapter.id)}
                  className={`min-h-0 rounded-[14px] border px-3.5 py-2 text-left text-sm transition sm:px-4 ${
                    isActive
                      ? "border-[rgba(244,177,93,0.32)] bg-[rgba(244,177,93,0.12)] text-white"
                      : "border-[color:var(--line)] bg-white/[0.035] text-[color:var(--muted)] hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <span className="block font-semibold leading-5">{chapterLabel}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-5 overflow-hidden rounded-[18px] border border-[color:var(--line)] bg-white/[0.035] p-5 transition-all duration-300">
            <h4 className="font-semibold text-white">{activeChapter?.title}</h4>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[color:var(--muted)]">{activeChapter?.body}</p>
          </div>
        </>
      ) : (
        <EmptyCopy text="მასალა ჯერ არ არის დამატებული" />
      )}
    </GlassCard>
  );
}

function QuizSection({ questions }: { questions: QuizQuestion[] }) {
  const [attempt, setAttempt] = useState(0);
  const normalizedQuestions = useMemo(
    () =>
      questions
        .filter((question) => question.question?.trim() && question.options?.length === 4)
        .map((question, index) => ({
          ...question,
          options: shuffleArray(question.options ?? [], `${question.id ?? index}-${attempt}`),
        })),
    [questions, attempt],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});

  const currentQuestion = normalizedQuestions[currentIndex];
  const finished = normalizedQuestions.length > 0 && Object.keys(answers).length === normalizedQuestions.length;
  const score = Object.values(answers).filter(Boolean).length;
  const percentage = normalizedQuestions.length > 0 ? Math.round((score / normalizedQuestions.length) * 100) : 0;

  function choose(optionId: string, isCorrect: boolean) {
    if (selectedOptionId) return;
    setSelectedOptionId(optionId);
    setAnswers((items) => ({ ...items, [currentIndex]: isCorrect }));
  }

  function nextQuestion() {
    setSelectedOptionId(null);
    setCurrentIndex((index) => Math.min(index + 1, normalizedQuestions.length - 1));
  }

  function resetQuiz() {
    setSelectedOptionId(null);
    setCurrentIndex(0);
    setAnswers({});
    setAttempt((value) => value + 1);
  }

  return (
    <GlassCard className="p-6">
      <h3 className="font-serif text-2xl text-white">ტესტი</h3>
      {normalizedQuestions.length === 0 ? (
        <EmptyCopy text="მასალა ჯერ არ არის დამატებული" />
      ) : finished ? (
        <div className="mt-5 space-y-4">
          <Surface className="p-5">
            <p className="text-lg font-semibold text-white">{`თქვენი შედეგი: ${score} / ${normalizedQuestions.length}`}</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{`სიზუსტე: ${percentage}%`}</p>
          </Surface>
          <button type="button" onClick={resetQuiz} className="premium-button rounded-full px-5 py-2 text-sm font-bold text-[#160f08]">
            თავიდან გავლა
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <Surface className="p-5">
            <p className="text-xs text-[color:var(--muted)]">{`კითხვა ${currentIndex + 1} / ${normalizedQuestions.length}`}</p>
            <p className="mt-2 text-lg font-semibold text-white">{currentQuestion.question}</p>
          </Surface>
          <div className="grid gap-3">
            {currentQuestion.options?.map((option) => {
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
                  key={option.id}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => choose(option.id, Boolean(option.isCorrect))}
                  className={`rounded-[16px] border px-4 py-3 text-left transition ${stateClass}`}
                >
                  {option.text || "უპასუხო ვარიანტი"}
                </button>
              );
            })}
          </div>
          {selectedOptionId ? (
            <div className="flex items-center gap-3">
              <p className="text-sm text-[color:var(--muted)]">
                {answers[currentIndex] ? "სწორია." : "არასწორია."}
              </p>
              <button type="button" onClick={nextQuestion} className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-[color:var(--gold-soft)]">
                {currentIndex === normalizedQuestions.length - 1 ? "შედეგის ნახვა" : "შემდეგი კითხვა"}
              </button>
            </div>
          ) : null}
        </div>
      )}
      {!finished ? (
        <div className="mt-5">
          <PremiumButton href="/quiz" variant="secondary">ტესტების გვერდი</PremiumButton>
        </div>
      ) : null}
    </GlassCard>
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

function EmptyCopy({ text }: { text: string }) {
  return <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{text}</p>;
}
