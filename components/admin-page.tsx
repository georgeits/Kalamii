import {
  createAuthorAction,
  createWorkAction,
  deleteAuthorAction,
  deleteWorkAction,
  updateAuthorAction,
  updateWorkAction,
} from "@/app/admin/actions";
import { AdminAuthorImageInput } from "@/components/admin-author-image-input";
import { WorkStructuredFields } from "@/components/work-structured-fields";
import { GlassCard, Pill, SectionTitle } from "@/components/ui";
import type { AuthorRecord, WorkRecord } from "@/src/lib/content";

type Option = { value: string; label: string };
type WorkWithAuthorName = WorkRecord & { author: { id: string; name: string } | null };

export function AdminPage({
  authors,
  works,
  authorPeriodOptions,
  genreOptions,
  accessLevelOptions,
}: {
  authors: AuthorRecord[];
  works: WorkWithAuthorName[];
  authorPeriodOptions: Option[];
  genreOptions: Option[];
  accessLevelOptions: readonly Option[];
}) {
  return (
    <main className="space-y-6 pb-8">
      <SectionTitle eyebrow="ადმინის პანელი" title="ავტორები და ნაწარმოებები" description="აქედან შეგიძლიათ შეცვალოთ ავტორის ფოტო და ბიოგრაფია, ასევე ნაწარმოების გეგმა, შინაარსი, ანალიზი და ტესტი." />

      <EditableSection title="ავტორები">
        <GlassCard className="p-5">
          <AdminAuthorForm action={createAuthorAction} authorPeriodOptions={authorPeriodOptions} accessLevelOptions={accessLevelOptions} submitLabel="ავტორის დამატება" />
        </GlassCard>
        {authors.map((author) => (
          <GlassCard key={author.id} className="p-5">
            <AdminAuthorForm action={updateAuthorAction} author={author} authorPeriodOptions={authorPeriodOptions} accessLevelOptions={accessLevelOptions} submitLabel="შენახვა" />
            <DeleteForm action={deleteAuthorAction} id={author.id} label="ავტორის წაშლა" />
          </GlassCard>
        ))}
      </EditableSection>

      <EditableSection title="ნაწარმოებები">
        <GlassCard className="p-5">
          <AdminWorkForm action={createWorkAction} authors={authors} genreOptions={genreOptions} accessLevelOptions={accessLevelOptions} submitLabel="ნაწარმოების დამატება" />
        </GlassCard>
        {works.map((work) => (
          <GlassCard key={work.id} className="p-5">
            <AdminWorkForm action={updateWorkAction} work={work} authors={authors} genreOptions={genreOptions} accessLevelOptions={accessLevelOptions} submitLabel="შენახვა" />
            <DeleteForm action={deleteWorkAction} id={work.id} label="ნაწარმოების წაშლა" />
          </GlassCard>
        ))}
      </EditableSection>
    </main>
  );
}

function EditableSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-serif text-2xl text-white">{title}</h3>
        <Pill tone="gold">ცოცხალი რედაქტირება</Pill>
      </div>
      <div className="mt-6 grid gap-4">{children}</div>
    </GlassCard>
  );
}

function DeleteForm({ action, id, label }: { action: (formData: FormData) => void | Promise<void>; id: string; label: string }) {
  return (
    <form action={action} className="mt-3">
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="rounded-full border border-[rgba(255,156,140,0.24)] px-4 py-2 text-sm text-[color:var(--danger)] transition hover:bg-[rgba(255,156,140,0.08)]">
        {label}
      </button>
    </form>
  );
}

function AdminAuthorForm({
  action,
  author,
  authorPeriodOptions,
  accessLevelOptions,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  author?: AuthorRecord;
  authorPeriodOptions: Option[];
  accessLevelOptions: readonly Option[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-3">
      {author ? <input type="hidden" name="id" value={author.id} /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="სახელი" name="name" defaultValue={author?.name} />
        <Field label="Slug" name="slug" defaultValue={author?.slug} />
      </div>
      <AdminAuthorImageInput authorId={author?.id} currentImageUrl={author?.image_url} />
      <div className="grid gap-3 md:grid-cols-3">
        <SelectField label="პერიოდი" name="period" defaultValue={author?.period} options={authorPeriodOptions} />
        <Field label="მიმდინარეობა" name="movement" defaultValue={author?.movement} />
        <SelectField label="წვდომა" name="access_level" defaultValue={author?.access_level ?? "free"} options={accessLevelOptions} />
      </div>
      <TextAreaField label="ბიოგრაფია" name="biography" defaultValue={author?.biography} rows={5} />
      <Field label="თემები" name="themes" defaultValue={author?.themes.join(", ")} helper="მძიმით გამოყოფილი სია" />
      <SubmitButton label={submitLabel} />
    </form>
  );
}

function AdminWorkForm({
  action,
  work,
  authors,
  genreOptions,
  accessLevelOptions,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  work?: WorkWithAuthorName;
  authors: AuthorRecord[];
  genreOptions: Option[];
  accessLevelOptions: readonly Option[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-3">
      {work ? <input type="hidden" name="id" value={work.id} /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="სათაური" name="title" defaultValue={work?.title} />
        <Field label="Slug" name="slug" defaultValue={work?.slug} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <SelectField label="ავტორი" name="author_id" defaultValue={work?.author_id} options={authors.map((author) => ({ value: author.id, label: author.name }))} />
        <SelectField label="ჟანრი" name="genre" defaultValue={work?.genre} options={genreOptions} />
        <SelectField label="წვდომა" name="access_level" defaultValue={work?.access_level ?? "free"} options={accessLevelOptions} />
      </div>
      <TextAreaField label="გეგმა" name="plan" defaultValue={work?.plan ?? ""} rows={4} />
      <TextAreaField label="მოკლე აღწერა" name="summary" defaultValue={work?.summary} rows={4} />
      <WorkStructuredFields chapterFieldName="summary_chapters" quizFieldName="quiz_questions" initialChapters={work?.summary_chapters ?? []} initialQuestions={work?.quiz_data ?? []} />
      <TextAreaField label="ანალიზი" name="analysis" defaultValue={work?.analysis ?? ""} rows={6} />
      <Field label="თემები" name="themes" defaultValue={work?.themes.join(", ")} helper="მძიმით გამოყოფილი სია" />
      <Field label="პერსონაჟები" name="characters" defaultValue={work?.characters.join(", ")} helper="მძიმით გამოყოფილი სია" />
      <Field label="სიმბოლოები" name="symbols" defaultValue={work?.symbols.join(", ")} helper="მძიმით გამოყოფილი სია" />
      <Field label="გამოცდის რჩევები" name="exam_tips" defaultValue={work?.exam_tips.join(", ")} helper="მძიმით გამოყოფილი სია" />
      <SubmitButton label={submitLabel} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  return <button type="submit" className="premium-button inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-bold text-[#160f08]">{label}</button>;
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

function TextAreaField({ label, name, defaultValue, rows, helper }: { label: string; name: string; defaultValue?: string; rows: number; helper?: string }) {
  return (
    <label className="block">
      <span className="text-sm text-[color:var(--muted)]">{label}</span>
      <textarea name={name} defaultValue={defaultValue} rows={rows} className="mt-2 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition focus:border-[rgba(244,177,93,0.45)]" />
      {helper ? <p className="mt-2 text-xs text-[color:var(--muted)]">{helper}</p> : null}
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
