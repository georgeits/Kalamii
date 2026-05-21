import {
  createAuthorAction,
  createStudyMaterialAction,
  createSummaryAction,
  createWorkAction,
  deleteAuthorAction,
  deleteStudyMaterialAction,
  deleteSummaryAction,
  deleteWorkAction,
  updateAuthorAction,
  updateStudyMaterialAction,
  updateSummaryAction,
  updateWorkAction,
} from "@/app/admin/actions";
import { GlassCard, Pill, SectionTitle } from "@/components/ui";
import type {
  AuthorRecord,
  StudyMaterialRecord,
  SummaryRecord,
  WorkRecord,
} from "@/src/lib/content";

type Option = {
  value: string;
  label: string;
};

type WorkWithAuthorName = WorkRecord & {
  author: {
    id: string;
    name: string;
  } | null;
};

type MaterialWithRelations = StudyMaterialRecord & {
  author: {
    id: string;
    name: string;
  } | null;
  work: {
    id: string;
    title: string;
  } | null;
};

type AdminPageProps = {
  authors: AuthorRecord[];
  works: WorkWithAuthorName[];
  summaries: SummaryRecord[];
  studyMaterials: MaterialWithRelations[];
  authorPeriodOptions: Option[];
  genreOptions: Option[];
  accessLevelOptions: readonly Option[];
  materialTypeOptions: Option[];
};

export function AdminPage({
  authors,
  works,
  summaries,
  studyMaterials,
  authorPeriodOptions,
  genreOptions,
  accessLevelOptions,
  materialTypeOptions,
}: AdminPageProps) {
  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="ადმინის პანელი"
        title="ცოცხალი ბაზის მართვა"
        description="აქედან დამატებული ან შეცვლილი ავტორები, ნაწარმოებები, შეჯამებები და სასწავლო მასალები დაუყოვნებლივ აისახება საჯარო პლატფორმაზე."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard className="p-6">
          <Header title="ახალი ავტორი" tone="gold" label="ავტორი" />
          <AdminAuthorForm
            action={createAuthorAction}
            authorPeriodOptions={authorPeriodOptions}
            accessLevelOptions={accessLevelOptions}
            submitLabel="ავტორის დამატება"
          />
        </GlassCard>

        <GlassCard className="p-6">
          <Header title="ახალი ნაწარმოები" tone="sky" label="ნაწარმოები" />
          <AdminWorkForm
            action={createWorkAction}
            authors={authors}
            genreOptions={genreOptions}
            accessLevelOptions={accessLevelOptions}
            submitLabel="ნაწარმოების დამატება"
          />
        </GlassCard>

        <GlassCard className="p-6">
          <Header title="ახალი შეჯამება" tone="success" label="შეჯამება" />
          <AdminSummaryForm
            action={createSummaryAction}
            works={works}
            accessLevelOptions={accessLevelOptions}
            submitLabel="შეჯამების დამატება"
          />
        </GlassCard>

        <GlassCard className="p-6">
          <Header title="ახალი სასწავლო მასალა" tone="rose" label="მასალა" />
          <AdminStudyMaterialForm
            action={createStudyMaterialAction}
            authors={authors}
            works={works}
            accessLevelOptions={accessLevelOptions}
            materialTypeOptions={materialTypeOptions}
            submitLabel="მასალის დამატება"
          />
        </GlassCard>
      </div>

      <EditableSection title="ავტორები" description="ბიოგრაფიები, თემები და წვდომის დონეები.">
        {authors.map((author) => (
          <GlassCard key={author.id} className="p-5">
            <AdminAuthorForm
              action={updateAuthorAction}
              author={author}
              authorPeriodOptions={authorPeriodOptions}
              accessLevelOptions={accessLevelOptions}
              submitLabel="შენახვა"
            />
            <DeleteForm action={deleteAuthorAction} id={author.id} label="ავტორის წაშლა" />
          </GlassCard>
        ))}
      </EditableSection>

      <EditableSection title="ნაწარმოებები" description="შეჯამება, თემები, რჩევები და ფასიანი წვდომა.">
        {works.map((work) => (
          <GlassCard key={work.id} className="p-5">
            <AdminWorkForm
              action={updateWorkAction}
              work={work}
              authors={authors}
              genreOptions={genreOptions}
              accessLevelOptions={accessLevelOptions}
              submitLabel="შენახვა"
            />
            <DeleteForm action={deleteWorkAction} id={work.id} label="ნაწარმოების წაშლა" />
          </GlassCard>
        ))}
      </EditableSection>

      <EditableSection title="შეჯამებები" description="საჯარო დეტალური კონტენტი ნაწარმოებების გვერდებისთვის.">
        {summaries.map((summary) => (
          <GlassCard key={summary.id} className="p-5">
            <AdminSummaryForm
              action={updateSummaryAction}
              summary={summary}
              works={works}
              accessLevelOptions={accessLevelOptions}
              submitLabel="შენახვა"
            />
            <DeleteForm action={deleteSummaryAction} id={summary.id} label="შეჯამების წაშლა" />
          </GlassCard>
        ))}
      </EditableSection>

      <EditableSection title="სასწავლო მასალები" description="ბმულები, PDF-ები, გეგმები და დამატებითი მასალები.">
        {studyMaterials.map((material) => (
          <GlassCard key={material.id} className="p-5">
            <AdminStudyMaterialForm
              action={updateStudyMaterialAction}
              studyMaterial={material}
              authors={authors}
              works={works}
              accessLevelOptions={accessLevelOptions}
              materialTypeOptions={materialTypeOptions}
              submitLabel="შენახვა"
            />
            <DeleteForm action={deleteStudyMaterialAction} id={material.id} label="მასალის წაშლა" />
          </GlassCard>
        ))}
      </EditableSection>
    </main>
  );
}

function Header({
  title,
  label,
  tone,
}: {
  title: string;
  label: string;
  tone: "gold" | "sky" | "success" | "rose";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="font-serif text-2xl text-white">{title}</h3>
      <Pill tone={tone}>{label}</Pill>
    </div>
  );
}

function EditableSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <GlassCard className="p-6">
      <SectionTitle eyebrow={title} title="რედაქტირება და წაშლა" description={description} compact />
      <div className="mt-6 grid gap-4">{children}</div>
    </GlassCard>
  );
}

function DeleteForm({
  action,
  id,
  label,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label: string;
}) {
  return (
    <form action={action} className="mt-3">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-full border border-[rgba(255,156,140,0.24)] px-4 py-2 text-sm text-[color:var(--danger)] transition hover:bg-[rgba(255,156,140,0.08)]"
      >
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
    <form action={action} className="mt-5 space-y-3">
      {author ? <input type="hidden" name="id" value={author.id} /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="სახელი" name="name" defaultValue={author?.name} />
        <Field label="Slug" name="slug" defaultValue={author?.slug} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <SelectField label="პერიოდი" name="period" defaultValue={author?.period} options={authorPeriodOptions} />
        <Field label="მიმდინარეობა" name="movement" defaultValue={author?.movement} />
        <SelectField
          label="წვდომა"
          name="access_level"
          defaultValue={author?.access_level ?? "free"}
          options={accessLevelOptions}
        />
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
    <form action={action} className="mt-5 space-y-3">
      {work ? <input type="hidden" name="id" value={work.id} /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="სათაური" name="title" defaultValue={work?.title} />
        <Field label="Slug" name="slug" defaultValue={work?.slug} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <SelectField
          label="ავტორი"
          name="author_id"
          defaultValue={work?.author_id}
          options={authors.map((author) => ({ value: author.id, label: author.name }))}
        />
        <SelectField label="ჟანრი" name="genre" defaultValue={work?.genre} options={genreOptions} />
        <SelectField
          label="წვდომა"
          name="access_level"
          defaultValue={work?.access_level ?? "free"}
          options={accessLevelOptions}
        />
      </div>
      <TextAreaField label="მოკლე შინაარსი" name="summary" defaultValue={work?.summary} rows={4} />
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="თემები" name="themes" defaultValue={work?.themes.join(", ")} helper="მძიმით გამოყოფილი სია" />
        <Field label="პერსონაჟები" name="characters" defaultValue={work?.characters.join(", ")} helper="მძიმით გამოყოფილი სია" />
        <Field label="სიმბოლოები" name="symbols" defaultValue={work?.symbols.join(", ")} helper="მძიმით გამოყოფილი სია" />
        <Field label="საგამოცდო რჩევები" name="exam_tips" defaultValue={work?.exam_tips.join(", ")} helper="მძიმით გამოყოფილი სია" />
      </div>
      <SubmitButton label={submitLabel} />
    </form>
  );
}

function AdminSummaryForm({
  action,
  summary,
  works,
  accessLevelOptions,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  summary?: SummaryRecord;
  works: WorkWithAuthorName[];
  accessLevelOptions: readonly Option[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="mt-5 space-y-3">
      {summary ? <input type="hidden" name="id" value={summary.id} /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        <SelectField
          label="ნაწარმოები"
          name="work_id"
          defaultValue={summary?.work_id}
          options={works.map((work) => ({ value: work.id, label: work.title }))}
        />
        <SelectField
          label="წვდომა"
          name="access_level"
          defaultValue={summary?.access_level ?? "free"}
          options={accessLevelOptions}
        />
      </div>
      <Field label="სათაური" name="title" defaultValue={summary?.title} />
      <TextAreaField label="ტექსტი" name="body" defaultValue={summary?.body} rows={7} />
      <SubmitButton label={submitLabel} />
    </form>
  );
}

function AdminStudyMaterialForm({
  action,
  studyMaterial,
  authors,
  works,
  accessLevelOptions,
  materialTypeOptions,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  studyMaterial?: MaterialWithRelations;
  authors: AuthorRecord[];
  works: WorkWithAuthorName[];
  accessLevelOptions: readonly Option[];
  materialTypeOptions: Option[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="mt-5 space-y-3">
      {studyMaterial ? <input type="hidden" name="id" value={studyMaterial.id} /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="სათაური" name="title" defaultValue={studyMaterial?.title} />
        <SelectField
          label="ტიპი"
          name="material_type"
          defaultValue={studyMaterial?.material_type}
          options={materialTypeOptions}
        />
      </div>
      <TextAreaField label="აღწერა" name="description" defaultValue={studyMaterial?.description} rows={4} />
      <Field label="ბმული / URL" name="url" defaultValue={studyMaterial?.url} />
      <div className="grid gap-3 md:grid-cols-3">
        <SelectField
          label="ავტორი"
          name="author_id"
          defaultValue={studyMaterial?.author_id ?? ""}
          options={[{ value: "", label: "არჩევითი" }, ...authors.map((author) => ({ value: author.id, label: author.name }))]}
        />
        <SelectField
          label="ნაწარმოები"
          name="work_id"
          defaultValue={studyMaterial?.work_id ?? ""}
          options={[{ value: "", label: "არჩევითი" }, ...works.map((work) => ({ value: work.id, label: work.title }))]}
        />
        <SelectField
          label="წვდომა"
          name="access_level"
          defaultValue={studyMaterial?.access_level ?? "free"}
          options={accessLevelOptions}
        />
      </div>
      <SubmitButton label={submitLabel} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  return (
    <button type="submit" className="premium-button inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-bold text-[#160f08]">
      {label}
    </button>
  );
}

function Field({
  label,
  name,
  defaultValue,
  helper,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  helper?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-[color:var(--muted)]">{label}</span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        className="mt-2 h-11 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 text-sm text-white outline-none transition focus:border-[rgba(244,177,93,0.45)]"
      />
      {helper ? <p className="mt-2 text-xs text-[color:var(--muted)]">{helper}</p> : null}
    </label>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
  rows,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows: number;
}) {
  return (
    <label className="block">
      <span className="text-sm text-[color:var(--muted)]">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="mt-2 w-full rounded-[16px] border border-[color:var(--line)] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition focus:border-[rgba(244,177,93,0.45)]"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: readonly Option[];
}) {
  return (
    <label className="block">
      <span className="text-sm text-[color:var(--muted)]">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-2 h-11 w-full rounded-[16px] border border-[color:var(--line)] bg-[#0d1625] px-4 text-sm text-white outline-none transition focus:border-[rgba(244,177,93,0.45)]"
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
