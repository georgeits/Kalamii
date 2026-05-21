import {
  createAuthorAction,
  createWorkAction,
  deleteAuthorAction,
  deleteWorkAction,
  updateAuthorAction,
  updateWorkAction,
} from "@/app/admin/actions";
import { GlassCard, Pill, SectionTitle } from "@/components/ui";
import type { AuthorRecord, WorkRecord } from "@/src/lib/content";

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

type AdminPageProps = {
  authors: AuthorRecord[];
  works: WorkWithAuthorName[];
  authorPeriodOptions: Option[];
  genreOptions: Option[];
};

export function AdminPage({
  authors,
  works,
  authorPeriodOptions,
  genreOptions,
}: AdminPageProps) {
  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="ადმინის პანელი"
        title="ცოცხალი კონტენტის მართვა"
        description="აქედან დამატებული ან განახლებული ავტორები, ბიოგრაფიები და ნაწარმოებები დაუყოვნებლივ აისახება საჯარო გვერდებზე ყველა მომხმარებლისთვის."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-serif text-2xl text-white">ახალი ავტორი</h3>
            <Pill tone="gold">ბიოგრაფიები</Pill>
          </div>
          <AdminAuthorForm action={createAuthorAction} authorPeriodOptions={authorPeriodOptions} submitLabel="ავტორის დამატება" />
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-serif text-2xl text-white">ახალი ნაწარმოები</h3>
            <Pill tone="sky">შეჯამებები</Pill>
          </div>
          <AdminWorkForm
            action={createWorkAction}
            authors={authors}
            genreOptions={genreOptions}
            submitLabel="ნაწარმოების დამატება"
          />
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <SectionTitle
          eyebrow="ავტორები"
          title="რედაქტირება და წაშლა"
          description="შეცვლილი ბიოგრაფიები და თემები ავტორების საჯარო გვერდებზე მაშინვე განახლდება."
          compact
        />
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {authors.map((author) => (
            <GlassCard key={author.id} className="p-5">
              <AdminAuthorForm
                action={updateAuthorAction}
                author={author}
                authorPeriodOptions={authorPeriodOptions}
                submitLabel="შენახვა"
              />
              <form action={deleteAuthorAction} className="mt-3">
                <input type="hidden" name="id" value={author.id} />
                <button
                  type="submit"
                  className="rounded-full border border-[rgba(255,156,140,0.24)] px-4 py-2 text-sm text-[color:var(--danger)] transition hover:bg-[rgba(255,156,140,0.08)]"
                >
                  ავტორის წაშლა
                </button>
              </form>
            </GlassCard>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <SectionTitle
          eyebrow="ნაწარმოებები"
          title="რედაქტირება და წაშლა"
          description="აქ შეცვლილი შინაარსები, თემები და საგამოცდო რჩევები ყველა საჯარო გვერდზე ავტომატურად აისახება."
          compact
        />
        <div className="mt-6 grid gap-4">
          {works.map((work) => (
            <GlassCard key={work.id} className="p-5">
              <AdminWorkForm
                action={updateWorkAction}
                work={work}
                authors={authors}
                genreOptions={genreOptions}
                submitLabel="შენახვა"
              />
              <form action={deleteWorkAction} className="mt-3">
                <input type="hidden" name="id" value={work.id} />
                <button
                  type="submit"
                  className="rounded-full border border-[rgba(255,156,140,0.24)] px-4 py-2 text-sm text-[color:var(--danger)] transition hover:bg-[rgba(255,156,140,0.08)]"
                >
                  ნაწარმოების წაშლა
                </button>
              </form>
            </GlassCard>
          ))}
        </div>
      </GlassCard>
    </main>
  );
}

function AdminAuthorForm({
  action,
  author,
  authorPeriodOptions,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  author?: AuthorRecord;
  authorPeriodOptions: Option[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="mt-5 space-y-3">
      {author ? <input type="hidden" name="id" value={author.id} /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="სახელი" name="name" defaultValue={author?.name} />
        <Field label="Slug" name="slug" defaultValue={author?.slug} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <SelectField label="პერიოდი" name="period" defaultValue={author?.period} options={authorPeriodOptions} />
        <Field label="მიმდინარეობა" name="movement" defaultValue={author?.movement} />
      </div>
      <TextAreaField label="ბიოგრაფია" name="biography" defaultValue={author?.biography} rows={5} />
      <Field
        label="თემები"
        name="themes"
        defaultValue={author?.themes.join(", ")}
        helper="მიუთითეთ მძიმით გამოყოფილი მნიშვნელობები"
      />
      <button type="submit" className="premium-button inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-bold text-[#160f08]">
        {submitLabel}
      </button>
    </form>
  );
}

function AdminWorkForm({
  action,
  work,
  authors,
  genreOptions,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  work?: WorkWithAuthorName;
  authors: AuthorRecord[];
  genreOptions: Option[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="mt-5 space-y-3">
      {work ? <input type="hidden" name="id" value={work.id} /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="სათაური" name="title" defaultValue={work?.title} />
        <Field label="Slug" name="slug" defaultValue={work?.slug} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <SelectField
          label="ავტორი"
          name="author_id"
          defaultValue={work?.author_id}
          options={authors.map((author) => ({ value: author.id, label: author.name }))}
        />
        <SelectField label="ჟანრი" name="genre" defaultValue={work?.genre} options={genreOptions} />
      </div>
      <TextAreaField label="შეჯამება" name="summary" defaultValue={work?.summary} rows={4} />
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="თემები" name="themes" defaultValue={work?.themes.join(", ")} helper="მძიმით გამოყოფილი სია" />
        <Field
          label="პერსონაჟები"
          name="characters"
          defaultValue={work?.characters.join(", ")}
          helper="მძიმით გამოყოფილი სია"
        />
        <Field label="სიმბოლოები" name="symbols" defaultValue={work?.symbols.join(", ")} helper="მძიმით გამოყოფილი სია" />
        <Field
          label="საგამოცდო რჩევები"
          name="exam_tips"
          defaultValue={work?.exam_tips.join(", ")}
          helper="მძიმით გამოყოფილი სია"
        />
      </div>
      <button type="submit" className="premium-button inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-bold text-[#160f08]">
        {submitLabel}
      </button>
    </form>
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
  options: Option[];
}) {
  return (
    <label className="block">
      <span className="text-sm text-[color:var(--muted)]">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-2 h-11 w-full rounded-[16px] border border-[color:var(--line)] bg-[#0d1625] px-4 text-sm text-white outline-none transition focus:border-[rgba(244,177,93,0.45)]"
      >
        <option value="">აირჩიეთ</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
