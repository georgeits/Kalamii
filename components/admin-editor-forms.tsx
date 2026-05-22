"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import type { WorkFormState } from "@/app/admin/work-form-state";
import { initialWorkFormState } from "@/app/admin/work-form-state";
import { AdminAuthorImageInput } from "@/components/admin-author-image-input";
import { SaveButton } from "@/components/admin-server-buttons";
import { WorkContentFields } from "@/components/work-content-fields";
import { GlassCard, Pill, SectionTitle } from "@/components/ui";
import type { AuthorRecord, WorkRecord } from "@/src/lib/content";
import { slugifyGeorgian } from "@/src/lib/slug";

type Option = { value: string; label: string };
type WorkWithAuthorName = WorkRecord & { author: { id: string; name: string } | null };

export function AdminAuthorEditor({
  action,
  author,
  authorPeriodOptions,
  accessLevelOptions,
  mode,
}: {
  action: (formData: FormData) => void | Promise<void>;
  author?: AuthorRecord;
  authorPeriodOptions: Option[];
  accessLevelOptions: readonly Option[];
  mode: "create" | "edit";
}) {
  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="CMS • ავტორი"
        title={mode === "create" ? "ახალი ავტორი" : author?.name ?? "ავტორის რედაქტირება"}
        description={
          mode === "create"
            ? "ჯერ შეინახეთ ძირითადი მონაცემები, შემდეგ სურვილის შემთხვევაში დაამატეთ ფოტო."
            : "რედაქტირება სრულდება ერთ სუფთა ფორმაში და ცვლილებები პირდაპირ ცოცხალ გვერდებზე აისახება."
        }
        action={<Link href="/admin" className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-white transition hover:bg-white/8">უკან</Link>}
      />

      <GlassCard className="p-6">
        <form action={action} className="space-y-5">
          {author ? <input type="hidden" name="id" value={author.id} /> : null}
          <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-start">
            <div className="min-w-0">
              <AdminAuthorImageInput authorId={author?.id} currentImageUrl={author?.image_url} />
            </div>
            <div className="grid min-w-0 gap-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Field label="სახელი" name="name" defaultValue={author?.name} />
                <Field label="Slug" name="slug" defaultValue={author?.slug} helper="თუ ცარიელია, ავტომატურად დაგენერირდება სახელიდან." />
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <SelectField label="პერიოდი" name="period" defaultValue={author?.period} options={authorPeriodOptions} />
                <Field label="მიმდინარეობა" name="movement" defaultValue={author?.movement} />
                <SelectField label="წვდომა" name="access_level" defaultValue={author?.access_level ?? "free"} options={accessLevelOptions} />
              </div>
            </div>
          </div>
          <TextAreaField label="ბიოგრაფია" name="biography" defaultValue={author?.biography} rows={8} />
          <Field label="თემები" name="themes" defaultValue={author?.themes.join(", ")} helper="მძიმით გამოყავით თემები." />
          <div className="flex flex-wrap items-center gap-3">
            <SaveButton label="შენახვა" />
            {author ? <Pill tone="gold">public გვერდზე ცვლილება გამოჩნდება შენახვისთანავე</Pill> : null}
          </div>
        </form>
      </GlassCard>
    </main>
  );
}

export function AdminWorkEditor({
  action,
  stateAction,
  work,
  authors,
  genreOptions,
  accessLevelOptions,
  mode,
}: {
  action: (formData: FormData) => void | Promise<void>;
  stateAction?: (state: WorkFormState, formData: FormData) => Promise<WorkFormState>;
  work?: WorkWithAuthorName;
  authors: AuthorRecord[];
  genreOptions: Option[];
  accessLevelOptions: readonly Option[];
  mode: "create" | "edit";
}) {
  const initialWorkState = useMemo(
    () => ({
      title: work?.title ?? "",
      slug: work?.slug ?? slugifyGeorgian(work?.title ?? ""),
      authorId: work?.author_id ?? authors[0]?.id ?? "",
      genre: work?.genre ?? genreOptions[0]?.value ?? "",
      accessLevel: work?.access_level ?? "free",
      summary: work?.summary ?? "",
      plan: work?.plan ?? "",
      chapters: work?.summary_chapters ?? [],
      quizQuestions: work?.quiz_data ?? [],
      analysis: work?.analysis ?? "",
      themes: work?.themes?.join(", ") ?? "",
      characters: work?.characters?.join(", ") ?? "",
      symbols: work?.symbols?.join(", ") ?? "",
      examTips: work?.exam_tips?.join(", ") ?? "",
    }),
    [authors, genreOptions, work],
  );
  const [isHydrating, setIsHydrating] = useState(mode === "edit" && !work);
  const [title, setTitle] = useState(initialWorkState.title);
  const [slug, setSlug] = useState(initialWorkState.slug);
  const [authorId, setAuthorId] = useState(initialWorkState.authorId);
  const [genre, setGenre] = useState(initialWorkState.genre);
  const [accessLevel, setAccessLevel] = useState(initialWorkState.accessLevel);
  const [summary, setSummary] = useState(initialWorkState.summary);
  const [plan, setPlan] = useState(initialWorkState.plan);
  const [analysis, setAnalysis] = useState(initialWorkState.analysis);
  const [themes, setThemes] = useState(initialWorkState.themes);
  const [characters, setCharacters] = useState(initialWorkState.characters);
  const [symbols, setSymbols] = useState(initialWorkState.symbols);
  const [examTips, setExamTips] = useState(initialWorkState.examTips);
  const [structuredKey, setStructuredKey] = useState(work?.id ?? "create");
  const [chapters, setChapters] = useState(initialWorkState.chapters);
  const [quizQuestions, setQuizQuestions] = useState(initialWorkState.quizQuestions);
  const [formState, formAction] = useActionState(stateAction ?? passthroughWorkFormAction, initialWorkFormState);

  useEffect(() => {
    if (mode !== "edit") {
      return;
    }

    if (!work) {
      setIsHydrating(true);
      return;
    }

    setTitle(initialWorkState.title);
    setSlug(initialWorkState.slug);
    setAuthorId(initialWorkState.authorId);
    setGenre(initialWorkState.genre);
    setAccessLevel(initialWorkState.accessLevel);
    setSummary(initialWorkState.summary);
    setPlan(initialWorkState.plan);
    setAnalysis(initialWorkState.analysis);
    setThemes(initialWorkState.themes);
    setCharacters(initialWorkState.characters);
    setSymbols(initialWorkState.symbols);
    setExamTips(initialWorkState.examTips);
    setChapters(initialWorkState.chapters);
    setQuizQuestions(initialWorkState.quizQuestions);
    setStructuredKey(work.id);
    setIsHydrating(false);
  }, [initialWorkState, mode, work]);

  if (mode === "edit" && (isHydrating || !work)) {
    return (
      <main className="space-y-6 pb-8">
        <SectionTitle
          eyebrow="CMS • ნაწარმოები"
          title="ნაწარმოების რედაქტირება"
          description="მონაცემები იტვირთება. დაელოდეთ, სანამ არსებული შინაარსი, თავები და სავარჯიშოები გამოჩნდება."
          action={<Link href="/admin" className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-white transition hover:bg-white/8">უკან</Link>}
        />
        <GlassCard className="p-6">
          <p className="text-sm text-[color:var(--muted)]">იტვირთება...</p>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="CMS • ნაწარმოები"
        title={mode === "create" ? "ახალი ნაწარმოები" : work?.title ?? "ნაწარმოების რედაქტირება"}
        description="აქედან შეგიძლიათ ერთ ჩანაწერში მართოთ გეგმა, შინაარსის თავები, ანალიზი და სავარჯიშოები."
        action={<Link href="/admin" className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-white transition hover:bg-white/8">უკან</Link>}
      />

      <GlassCard className="p-6">
        <form action={mode === "edit" && stateAction ? formAction : action} className="space-y-5">
          {work ? <input type="hidden" name="id" value={work.id} /> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="სათაური" name="title" value={title} onValueChange={(nextValue) => {
              setTitle(nextValue);
              setSlug(slugifyGeorgian(nextValue));
            }} />
            <div className="block min-w-0">
              <span className="text-sm font-medium text-[color:var(--muted)]">Slug</span>
              <div className="mt-2 flex gap-2">
                <input type="text" name="slug" readOnly value={slug} className="h-11 w-full min-w-0 rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 text-sm text-white outline-none" />
                <button
                  type="button"
                  onClick={() => setSlug(slugifyGeorgian(title))}
                  className="shrink-0 rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-white transition hover:bg-white/8"
                >
                  slug-ის განახლება
                </button>
              </div>
              <p className="mt-2 text-xs text-[color:var(--muted)]">slug ავტომატურად შეიქმნება სათაურიდან.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <SelectField
              label="ავტორი"
              name="author_id"
              value={authorId}
              onValueChange={(nextValue) => setAuthorId(nextValue)}
              options={authors.map((author) => ({ value: author.id, label: author.name }))}
            />
            <SelectField label="ჟანრი" name="genre" value={genre} onValueChange={(nextValue) => setGenre(nextValue as WorkRecord["genre"])} options={genreOptions} />
            <SelectField
              label="წვდომა"
              name="access_level"
              value={accessLevel}
              onValueChange={(nextValue) => setAccessLevel(nextValue as WorkRecord["access_level"])}
              options={accessLevelOptions}
            />
          </div>
          <TextAreaField label="მოკლე აღწერა" name="summary" value={summary} onValueChange={setSummary} rows={4} />
          <TextAreaField label="გეგმა" name="plan" value={plan} onValueChange={setPlan} rows={5} />
          <WorkContentFields
            key={structuredKey}
            chapterFieldName="summary_chapters"
            quizFieldName="quiz_data"
            initialChapters={chapters}
            initialQuestions={quizQuestions}
          />
          <TextAreaField label="ანალიზი" name="analysis" value={analysis} onValueChange={setAnalysis} rows={8} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="თემები" name="themes" value={themes} onValueChange={setThemes} helper="მძიმით გამოყავით თემები." />
            <Field label="პერსონაჟები" name="characters" value={characters} onValueChange={setCharacters} helper="მძიმით გამოყავით პერსონაჟები." />
            <Field label="სიმბოლოები" name="symbols" value={symbols} onValueChange={setSymbols} helper="მძიმით გამოყავით სიმბოლოები." />
            <Field label="გამოცდის რჩევები" name="exam_tips" value={examTips} onValueChange={setExamTips} helper="მძიმით გამოყავით რჩევები." />
          </div>
          {formState.status !== "idle" ? (
            <div className={`rounded-[16px] px-4 py-3 text-sm ${formState.status === "error" ? "border border-[rgba(255,156,140,0.22)] bg-[rgba(255,156,140,0.1)] text-[color:var(--danger)]" : "border border-[rgba(114,212,164,0.22)] bg-[rgba(114,212,164,0.1)] text-[color:var(--success)]"}`}>
              <p>{formState.message}</p>
              {process.env.NODE_ENV !== "production" && formState.status === "error" && formState.debugMessage ? (
                <p className="mt-2 text-xs leading-5 opacity-90">{formState.debugMessage}</p>
              ) : null}
            </div>
          ) : null}
          <SaveButton label="შენახვა" successLabel={formState.status === "success" ? "შენახულია" : undefined} />
        </form>
      </GlassCard>
    </main>
  );
}

async function passthroughWorkFormAction(state: WorkFormState) {
  return state;
}

function Field({
  label,
  name,
  defaultValue,
  helper,
  value,
  onValueChange,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  helper?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-medium text-[color:var(--muted)]">{label}</span>
      <input
        type="text"
        name={name}
        {...(value !== undefined ? { value } : { defaultValue })}
        onChange={onValueChange ? (event) => onValueChange(event.target.value) : undefined}
        className="mt-2 h-11 w-full min-w-0 rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 text-sm text-white outline-none transition focus:border-[rgba(244,177,93,0.45)]"
      />
      {helper ? <p className="mt-2 text-xs text-[color:var(--muted)]">{helper}</p> : null}
    </label>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
  value,
  onValueChange,
  rows,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-medium text-[color:var(--muted)]">{label}</span>
      <textarea
        name={name}
        {...(value !== undefined ? { value } : { defaultValue })}
        onChange={onValueChange ? (event) => onValueChange(event.target.value) : undefined}
        rows={rows}
        className="mt-2 w-full min-w-0 rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition focus:border-[rgba(244,177,93,0.45)]"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  value,
  onValueChange,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: readonly Option[];
}) {
  return (
    <label className="block min-w-0">
      <span className="text-sm font-medium text-[color:var(--muted)]">{label}</span>
      <select
        name={name}
        {...(value !== undefined ? { value } : { defaultValue })}
        onChange={onValueChange ? (event) => onValueChange(event.target.value) : undefined}
        className="mt-2 h-11 w-full min-w-0 rounded-[16px] border border-[color:var(--line)] bg-[#0d1625] px-4 text-sm text-white outline-none transition focus:border-[rgba(244,177,93,0.45)]"
      >
        {options.map((option) => (
          <option key={`${name}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
