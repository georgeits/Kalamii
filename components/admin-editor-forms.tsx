import Link from "next/link";
import { AdminAuthorImageInput } from "@/components/admin-author-image-input";
import { SaveButton } from "@/components/admin-server-buttons";
import { WorkStructuredFields } from "@/components/work-structured-fields";
import { GlassCard, Pill, SectionTitle } from "@/components/ui";
import type { AuthorRecord, WorkRecord } from "@/src/lib/content";

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
          <div className="grid gap-4 md:grid-cols-[160px_1fr]">
            <AdminAuthorImageInput authorId={author?.id} currentImageUrl={author?.image_url} />
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="სახელი" name="name" defaultValue={author?.name} />
                <Field label="Slug" name="slug" defaultValue={author?.slug} helper="თუ ცარიელია, ავტომატურად დაგენერირდება სახელიდან." />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
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
  work,
  authors,
  genreOptions,
  accessLevelOptions,
  mode,
}: {
  action: (formData: FormData) => void | Promise<void>;
  work?: WorkWithAuthorName;
  authors: AuthorRecord[];
  genreOptions: Option[];
  accessLevelOptions: readonly Option[];
  mode: "create" | "edit";
}) {
  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="CMS • ნაწარმოები"
        title={mode === "create" ? "ახალი ნაწარმოები" : work?.title ?? "ნაწარმოების რედაქტირება"}
        description="აქედან შეგიძლიათ ერთ ჩანაწერში მართოთ გეგმა, შინაარსის თავები, ანალიზი და ტესტები."
        action={<Link href="/admin" className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-white transition hover:bg-white/8">უკან</Link>}
      />

      <GlassCard className="p-6">
        <form action={action} className="space-y-5">
          {work ? <input type="hidden" name="id" value={work.id} /> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="სათაური" name="title" defaultValue={work?.title} />
            <Field label="Slug" name="slug" defaultValue={work?.slug} helper="თუ ცარიელია, ავტომატურად დაგენერირდება სათაურიდან." />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <SelectField
              label="ავტორი"
              name="author_id"
              defaultValue={work?.author_id}
              options={authors.map((author) => ({ value: author.id, label: author.name }))}
            />
            <SelectField label="ჟანრი" name="genre" defaultValue={work?.genre} options={genreOptions} />
            <SelectField label="წვდომა" name="access_level" defaultValue={work?.access_level ?? "free"} options={accessLevelOptions} />
          </div>
          <TextAreaField label="მოკლე აღწერა" name="summary" defaultValue={work?.summary} rows={4} />
          <TextAreaField label="გეგმა" name="plan" defaultValue={work?.plan ?? ""} rows={5} />
          <WorkStructuredFields
            chapterFieldName="summary_chapters"
            quizFieldName="quiz_questions"
            initialChapters={work?.summary_chapters ?? []}
            initialQuestions={work?.quiz_data ?? []}
          />
          <TextAreaField label="ანალიზი" name="analysis" defaultValue={work?.analysis ?? ""} rows={8} />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="თემები" name="themes" defaultValue={work?.themes.join(", ")} helper="მძიმით გამოყავით თემები." />
            <Field label="პერსონაჟები" name="characters" defaultValue={work?.characters.join(", ")} helper="მძიმით გამოყავით პერსონაჟები." />
            <Field label="სიმბოლოები" name="symbols" defaultValue={work?.symbols.join(", ")} helper="მძიმით გამოყავით სიმბოლოები." />
            <Field label="გამოცდის რჩევები" name="exam_tips" defaultValue={work?.exam_tips.join(", ")} helper="მძიმით გამოყავით რჩევები." />
          </div>
          <SaveButton label="შენახვა" />
        </form>
      </GlassCard>
    </main>
  );
}

function Field({ label, name, defaultValue, helper }: { label: string; name: string; defaultValue?: string; helper?: string }) {
  return (
    <label className="block">
      <span className="text-sm text-[color:var(--muted)]">{label}</span>
      <input type="text" name={name} defaultValue={defaultValue} className="mt-2 h-11 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 text-sm text-white outline-none transition focus:border-[rgba(244,177,93,0.45)]" />
      {helper ? <p className="mt-2 text-xs text-[color:var(--muted)]">{helper}</p> : null}
    </label>
  );
}

function TextAreaField({ label, name, defaultValue, rows }: { label: string; name: string; defaultValue?: string; rows: number }) {
  return (
    <label className="block">
      <span className="text-sm text-[color:var(--muted)]">{label}</span>
      <textarea name={name} defaultValue={defaultValue} rows={rows} className="mt-2 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition focus:border-[rgba(244,177,93,0.45)]" />
    </label>
  );
}

function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue?: string; options: readonly Option[] }) {
  return (
    <label className="block">
      <span className="text-sm text-[color:var(--muted)]">{label}</span>
      <select name={name} defaultValue={defaultValue} className="mt-2 h-11 w-full rounded-[16px] border border-[color:var(--line)] bg-[#0d1625] px-4 text-sm text-white outline-none transition focus:border-[rgba(244,177,93,0.45)]">
        {options.map((option) => (
          <option key={`${name}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
