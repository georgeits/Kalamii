"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EmptyState, GlassCard, Pill, PremiumButton, ProgressBar, SectionTitle, Surface } from "@/components/ui";
import {
  getDifficultyLabel,
  getExerciseTypeLabel,
  type ExerciseProgressRecord,
  type ExerciseSet,
  type MultipleChoiceExerciseSet,
  type ReadingQuestion,
  type ReadingComprehensionExerciseSet,
  type TextCorrectionExerciseSet,
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

type ExerciseMode = ExerciseSet["type"] | "exam_mode";

type ExerciseEntryFor<TExercise extends ExerciseSet> = Omit<ExerciseEntry, "exercise"> & {
  exercise: TExercise;
};

function hasQuestionsExercise(
  exercise: ExerciseSet,
): exercise is MultipleChoiceExerciseSet | ReadingComprehensionExerciseSet {
  return exercise.type === "multiple_choice" || exercise.type === "reading_comprehension";
}

function isMultipleChoiceEntry(entry: ExerciseEntry): entry is ExerciseEntryFor<MultipleChoiceExerciseSet> {
  return entry.exercise.type === "multiple_choice";
}

function isTextCorrectionEntry(entry: ExerciseEntry): entry is ExerciseEntryFor<TextCorrectionExerciseSet> {
  return entry.exercise.type === "text_correction";
}

function isReadingComprehensionEntry(entry: ExerciseEntry): entry is ExerciseEntryFor<ReadingComprehensionExerciseSet> {
  return entry.exercise.type === "reading_comprehension";
}

export function QuizPage({
  works,
  progress,
  totalExercises,
  totalQuestions,
  isAdmin,
}: {
  works: WorkProfiles;
  progress: ExerciseProgressRecord;
  totalExercises: number;
  totalQuestions: number;
  isAdmin: boolean;
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

  const [activeMode, setActiveMode] = useState<ExerciseMode>("multiple_choice");
  const filteredEntries = useMemo(
    () => (activeMode === "exam_mode" ? exerciseEntries : exerciseEntries.filter((entry) => entry.exercise.type === activeMode)),
    [activeMode, exerciseEntries],
  );
  const [selectedKey, setSelectedKey] = useState(filteredEntries[0]?.key ?? exerciseEntries[0]?.key ?? "");
  const [attempt, setAttempt] = useState(0);
  const hasProgress =
    progress.completedExercises > 0 || progress.correctAnswers > 0 || progress.streak > 0 || progress.progressPercentage > 0;
  const effectiveSelectedKey = filteredEntries.some((entry) => entry.key === selectedKey)
    ? selectedKey
    : (filteredEntries[0]?.key ?? "");
  const selectedEntry = filteredEntries.find((entry) => entry.key === effectiveSelectedKey) ?? null;

  useEffect(() => {
    if (!filteredEntries.some((entry) => entry.key === selectedKey)) {
      setSelectedKey(filteredEntries[0]?.key ?? "");
      setAttempt(0);
    }
  }, [filteredEntries, selectedKey]);

  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="სავარჯიშოები"
        title="გასააზრებელი და სავარჯიშოები"
        description="არჩევითი ტესტები, ტექსტის რედაქტირება, წაკითხულის გააზრება და გამოცდის რეჟიმი ახლა ერთ სასწავლო სივრცეშია გაერთიანებული."
        action={<PremiumButton href="/works">ნაწარმოებების გახსნა</PremiumButton>}
      />

      <GlassCard className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm text-[color:var(--gold-soft)]">რეჟიმები</p>
            <h2 className="mt-2 font-serif text-2xl text-white">აირჩიე სასწავლო ფორმატი</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">
              ერთი გვერდიდან გადადი კონკრეტულ სავარჯიშოზე ან გახსენი შერეული გამოცდის რეჟიმი.
            </p>
          </div>
          {isAdmin ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-white/[0.045] px-4 text-sm text-white transition hover:bg-white/[0.08]"
              >
                რედაქტირება
              </Link>
              <Link
                href="/admin/works/new"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[rgba(244,177,93,0.3)] bg-[rgba(244,177,93,0.12)] px-4 text-sm font-semibold text-[color:var(--gold-soft)] transition hover:bg-[rgba(244,177,93,0.18)]"
              >
                ახალი სავარჯიშო
              </Link>
            </div>
          ) : null}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
          <ModeCard
            title="არჩევითი ტესტები"
            description="სწრაფი პრაქტიკა 4-პასუხიანი კითხვებით."
            active={activeMode === "multiple_choice"}
            onClick={() => setActiveMode("multiple_choice")}
          />
          <ModeCard
            title="ტექსტის რედაქტირება"
            description="იპოვე შეცდომები და შეადარე სწორ ვერსიას."
            active={activeMode === "text_correction"}
            onClick={() => setActiveMode("text_correction")}
          />
          <ModeCard
            title="წაკითხულის გააზრება"
            description="იმუშავე პასაჟებზე, მოკლე პასუხებზე და true/false-ზე."
            active={activeMode === "reading_comprehension"}
            onClick={() => setActiveMode("reading_comprehension")}
          />
          <ModeCard
            title="გამოცდის რეჟიმი"
            description="შერეული სესია ყველა ფორმატიდან ერთ ნაკადად."
            active={activeMode === "exam_mode"}
            onClick={() => setActiveMode("exam_mode")}
          />
        </div>
        {isAdmin ? (
          <div className="mt-5 flex flex-wrap gap-2">
            <AdminTypeLink label="არჩევითი ტესტი" href="/admin/works/new?exerciseType=multiple_choice" />
            <AdminTypeLink label="ტექსტის რედაქტირება" href="/admin/works/new?exerciseType=text_correction" />
            <AdminTypeLink label="წაკითხულის გააზრება" href="/admin/works/new?exerciseType=reading_comprehension" />
            <button
              type="button"
              onClick={() => setActiveMode("exam_mode")}
              className="rounded-full border border-[color:var(--line)] bg-white/[0.045] px-4 py-2 text-sm text-[color:var(--muted)] transition hover:bg-white/[0.08] hover:text-white"
            >
              გამოცდის რეჟიმი
            </button>
          </div>
        ) : null}
      </GlassCard>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <GlassCard className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[color:var(--gold-soft)]">სწავლის პროგრესი</p>
              <h3 className="mt-2 font-serif text-3xl text-white">სწორი რიტმით ივარჯიშე</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
                პროგრესი აისახება მხოლოდ რეალურად დასრულებული სავარჯიშოებიდან და შენახული მცდელობებიდან.
              </p>
            </div>
            <Pill tone="gold">{totalExercises} სავარჯიშო</Pill>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="დასრულებული" value={String(progress.completedExercises)} detail="სავარჯიშო" />
            <Stat label="პასუხები" value={String(progress.correctAnswers)} detail="სწორი" />
            <Stat label="დღე" value={`${progress.streak}`} detail="სტრიქი" />
            <Stat label="პროგრესი" value={`${progress.progressPercentage}%`} detail={`${totalQuestions} კითხვა`} />
          </div>
          {!hasProgress ? <p className="mt-5 text-center text-sm text-[color:var(--muted)]">პროგრესი ჯერ არ არის დაწყებული.</p> : null}
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
      ) : activeMode === "exam_mode" ? (
        <ExamModePanel entries={exerciseEntries} isAdmin={isAdmin} onEdit={(workId) => `/admin/works/${workId}`} />
      ) : filteredEntries.length === 0 ? (
        <EmptyState
          title="ამ ფორმატში სავარჯიშო ჯერ არ არის"
          description="აირჩიე სხვა რეჟიმი ან დაამატე ახალი მასალა ადმინის პანელიდან."
          action={isAdmin ? <PremiumButton href="/admin/works/new">ახალი სავარჯიშო</PremiumButton> : undefined}
        />
      ) : (
        <div className="grid gap-6 2xl:grid-cols-[0.92fr_1.08fr]">
          <GlassCard className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-serif text-2xl text-white">სავარჯიშოების კატალოგი</h3>
              <Pill tone="sky">{filteredEntries.length} ბარათი</Pill>
            </div>
            <div className="mt-5 grid gap-3">
              {filteredEntries.map((entry) => {
                const isActive = entry.key === effectiveSelectedKey;
                return (
                  <ExerciseCatalogCard
                    key={entry.key}
                    entry={entry}
                    isActive={isActive}
                    isAdmin={isAdmin}
                    onSelect={() => {
                      setSelectedKey(entry.key);
                      setAttempt((value) => value + 1);
                    }}
                  />
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
  if (isTextCorrectionEntry(entry)) {
    return <TextCorrectionPanel entry={entry} />;
  }

  if (isReadingComprehensionEntry(entry)) {
    return <ReadingComprehensionPanel entry={entry} />;
  }

  if (isMultipleChoiceEntry(entry)) {
    return <MultipleChoicePanel entry={entry} />;
  }

  return null;
}

function MultipleChoicePanel({ entry }: { entry: ExerciseEntryFor<MultipleChoiceExerciseSet> }) {
  const questions = useMemo(
    () =>
      hasQuestionsExercise(entry.exercise) && entry.exercise.type === "multiple_choice"
        ? shuffleArray(
            entry.exercise.content.questions.map((question, index) => ({
              ...question,
              options: shuffleArray(question.options, `${entry.key}:${question.id}:${index}`),
            })),
            `${entry.key}:questions`,
          )
        : [],
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

function TextCorrectionPanel({ entry }: { entry: ExerciseEntryFor<TextCorrectionExerciseSet> }) {
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

function ReadingComprehensionPanel({ entry }: { entry: ExerciseEntryFor<ReadingComprehensionExerciseSet> }) {
  const questions = hasQuestionsExercise(entry.exercise) ? entry.exercise.content.questions : [];
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

function ModeCard({
  title,
  description,
  active,
  onClick,
}: {
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[20px] border p-4 text-left transition ${
        active
          ? "border-[rgba(244,177,93,0.34)] bg-[rgba(244,177,93,0.12)]"
          : "border-[color:var(--line)] bg-white/[0.04] hover:bg-white/[0.07]"
      }`}
    >
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{description}</p>
    </button>
  );
}

function AdminTypeLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-[color:var(--line)] bg-white/[0.045] px-4 py-2 text-sm text-[color:var(--muted)] transition hover:bg-white/[0.08] hover:text-white"
    >
      {label}
    </Link>
  );
}

function ExerciseCatalogCard({
  entry,
  isActive,
  isAdmin,
  onSelect,
}: {
  entry: ExerciseEntry;
  isActive: boolean;
  isAdmin: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`rounded-[18px] border p-4 transition ${
        isActive
          ? "border-[rgba(244,177,93,0.34)] bg-[rgba(244,177,93,0.12)]"
          : "border-[color:var(--line)] bg-white/[0.045] hover:bg-white/[0.07]"
      }`}
    >
      <button type="button" onClick={onSelect} className="w-full text-left">
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
      {isAdmin ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/admin/works/${entry.workId}`}
            className="rounded-full border border-[color:var(--line)] bg-white/[0.045] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08]"
          >
            რედაქტირება
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function ExamModePanel({ entries, isAdmin, onEdit }: { entries: ExerciseEntry[]; isAdmin: boolean; onEdit: (workId: string) => string }) {
  const totalCards = entries.length;
  const byType = {
    multipleChoice: entries.filter((entry) => entry.exercise.type === "multiple_choice").length,
    textCorrection: entries.filter((entry) => entry.exercise.type === "text_correction").length,
    reading: entries.filter((entry) => entry.exercise.type === "reading_comprehension").length,
  };

  return (
    <div className="grid gap-6 2xl:grid-cols-[0.92fr_1.08fr]">
      <GlassCard className="p-5 sm:p-6">
        <p className="text-sm text-[color:var(--gold-soft)]">გამოცდის რეჟიმი</p>
        <h3 className="mt-2 font-serif text-3xl text-white">შერეული სავარჯიშო სესია</h3>
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
          ამ რეჟიმში ერთ სივრცეში აგროვებ არჩევით ტესტებს, ტექსტის რედაქტირებას და წაკითხულის გააზრებას.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Stat label="არჩევითი" value={String(byType.multipleChoice)} detail="ბარათი" />
          <Stat label="რედაქტირება" value={String(byType.textCorrection)} detail="ბარათი" />
          <Stat label="გააზრება" value={String(byType.reading)} detail="ბარათი" />
        </div>
        <div className="mt-5 rounded-[18px] border border-[color:var(--line)] bg-white/[0.04] p-4">
          <p className="text-sm text-[color:var(--muted)]">სულ ხელმისაწვდომია</p>
          <p className="mt-2 font-display text-4xl text-white">{totalCards}</p>
          <p className="mt-2 text-sm text-[color:var(--gold-soft)]">სავარჯიშო გამოცდის რეჟიმისთვის</p>
        </div>
      </GlassCard>

      <GlassCard className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif text-2xl text-white">გამოცდის რეჟიმში ჩასართავი მასალა</h3>
          <Pill tone="sky">{totalCards} ბარათი</Pill>
        </div>
        <div className="mt-5 grid gap-3">
          {entries.map((entry) => (
            <div key={entry.key} className="rounded-[18px] border border-[color:var(--line)] bg-white/[0.045] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{entry.exercise.title}</p>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{entry.workTitle}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Pill tone="gold">{getExerciseTypeLabel(entry.exercise.type)}</Pill>
                  <Pill tone="rose">{getDifficultyLabel(entry.exercise.difficulty)}</Pill>
                </div>
              </div>
              {isAdmin ? (
                <div className="mt-4">
                  <Link
                    href={onEdit(entry.workId)}
                    className="rounded-full border border-[color:var(--line)] bg-white/[0.045] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08]"
                  >
                    რედაქტირება
                  </Link>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Surface className="flex min-h-32 items-center justify-center p-4">
      <div className="flex w-full flex-col items-center justify-center text-center">
        <p className="font-display text-3xl text-white sm:text-[2rem]">{value}</p>
        <p className="mt-2 text-sm font-medium text-[color:var(--gold-soft)]">{label}</p>
        <p className="mt-1 text-xs tracking-[0.04em] text-[color:var(--muted)]">{detail}</p>
      </div>
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
