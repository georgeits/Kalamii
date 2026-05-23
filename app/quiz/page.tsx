import { AppShell } from "@/components/app-shell";
import { LockedContent } from "@/components/access-helpers";
import { QuizPage } from "@/components/quiz-page";
import { countExerciseQuestions, normalizeExerciseSets } from "@/src/lib/exercises";
import { getCurrentProfile, getExerciseProgress, getStandaloneExercises, getWorkProfiles } from "@/src/lib/content";

export default async function Quiz() {
  const [works, standaloneExerciseRecords] = await Promise.all([getWorkProfiles(), getStandaloneExercises()]);
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === "admin";
  const standaloneExercises = standaloneExerciseRecords
    .map((exercise) =>
      normalizeExerciseSets([
        {
          id: exercise.id,
          title: exercise.title,
          exercise_type: exercise.exercise_type,
          difficulty: exercise.difficulty,
          description: exercise.description ?? "",
          content: exercise.content,
        },
      ])[0],
    )
    .filter(Boolean);
  const totalExercises = works.reduce((sum, work) => sum + work.exercises.length, 0);
  const totalStandaloneExercises = standaloneExercises.length;
  const totalQuestions = works.reduce(
    (sum, work) => sum + work.exercises.reduce((exerciseSum, exercise) => exerciseSum + countExerciseQuestions(exercise), 0),
    0,
  ) + standaloneExercises.reduce((sum, exercise) => sum + countExerciseQuestions(exercise), 0);
  const progress = profile ? await getExerciseProgress(profile.id, totalExercises + totalStandaloneExercises) : { completedExercises: 0, correctAnswers: 0, streak: 0, progressPercentage: 0 };

  return (
    <AppShell currentPath="/quiz">
      {isAdmin || profile?.subscription_plan === "premium" ? (
        <QuizPage works={works} standaloneExercises={standaloneExercises} progress={progress} totalExercises={totalExercises + totalStandaloneExercises} totalQuestions={totalQuestions} isAdmin={isAdmin} />
      ) : (
        <main className="pb-8">
          <LockedContent requiredLevel="premium" />
        </main>
      )}
    </AppShell>
  );
}
