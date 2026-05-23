import Link from "next/link";
import { DeleteStandaloneExerciseButton, SaveButton } from "@/components/admin-server-buttons";
import { GlassCard, Pill, PremiumButton, SectionTitle } from "@/components/ui";
import { StandaloneExerciseFields } from "@/components/standalone-exercise-fields";
import { getExerciseTypeLabel, normalizeExerciseSets, type ExerciseType } from "@/src/lib/exercises";
import type { StandaloneExerciseRecord } from "@/src/lib/content";
import { createInitialStandaloneExercise } from "@/src/lib/exercises/defaults";

export function AdminExercisesPage({ exercises }: { exercises: StandaloneExerciseRecord[] }) {
  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="CMS • სავარჯიშოები"
        title="დამოუკიდებელი სავარჯიშოები"
        description="აქედან მართავთ ტექსტის რედაქტირებას, წაკითხულის გააზრებას და სხვა საჯარო სავარჯიშოებს, რომლებიც ნაწარმოების შინაარსისგან განცალკევებით არსებობს."
        action={<PremiumButton href="/admin/exercises/new">ახალი სავარჯიშო</PremiumButton>}
      />

      <GlassCard className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-2xl text-white">სავარჯიშოების სია</h3>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{exercises.length} ჩანაწერი</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4">
          {exercises.map((exercise) => (
            <GlassCard key={exercise.id} className="p-4 transition hover:-translate-y-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">{exercise.title}</h3>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{exercise.description?.trim() || "დამოუკიდებელი სავარჯიშო"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Pill tone="gold">{getExerciseTypeLabel(exercise.exercise_type)}</Pill>
                  <Pill tone="rose">{exercise.difficulty}</Pill>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link href={`/admin/exercises/${exercise.id}/edit`} className="rounded-full border border-[rgba(244,177,93,0.24)] bg-[rgba(244,177,93,0.12)] px-4 py-2 text-sm text-[color:var(--gold-soft)] transition hover:bg-[rgba(244,177,93,0.18)]">
                  რედაქტირება
                </Link>
                <DeleteStandaloneExerciseButton id={exercise.id} />
              </div>
            </GlassCard>
          ))}
        </div>
      </GlassCard>
    </main>
  );
}

export function AdminStandaloneExerciseEditor({
  action,
  exercise,
  initialType = "text_correction",
  mode,
}: {
  action: (formData: FormData) => void | Promise<void>;
  exercise?: StandaloneExerciseRecord | null;
  initialType?: ExerciseType;
  mode: "create" | "edit";
}) {
  const initialExercise =
    exercise
      ? normalizeExerciseSets([
          {
            id: exercise.id,
            title: exercise.title,
            exercise_type: exercise.exercise_type,
            difficulty: exercise.difficulty,
            description: exercise.description ?? "",
            content: exercise.content,
          },
        ])[0] ?? createInitialStandaloneExercise(initialType)
      : createInitialStandaloneExercise(initialType);

  return (
    <main className="space-y-6 pb-8">
      <SectionTitle
        eyebrow="CMS • სავარჯიშო"
        title={mode === "create" ? "ახალი სავარჯიშო" : exercise?.title ?? "სავარჯიშოს რედაქტირება"}
        description="ეს გვერდი განკუთვნილია ნაწარმოებისგან განცალკევებული სავარჯიშოებისთვის. გამოცდის რეჟიმი მათ ავტომატურად აერთიანებს."
        action={<Link href="/admin/exercises" className="rounded-full border border-[color:var(--line)] px-4 py-2 text-sm text-white transition hover:bg-white/8">უკან</Link>}
      />

      <GlassCard className="p-6">
        <form action={action} className="space-y-5">
          {exercise ? <input type="hidden" name="id" value={exercise.id} /> : null}
          <StandaloneExerciseFields initialExercise={initialExercise} />
          <SaveButton label={mode === "create" ? "დამატება" : "შენახვა"} />
        </form>
      </GlassCard>
    </main>
  );
}
