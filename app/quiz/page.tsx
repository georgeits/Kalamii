import { AppShell } from "@/components/app-shell";
import { LockedContent } from "@/components/access-helpers";
import { QuizPage } from "@/components/quiz-page";
import { countExerciseQuestions } from "@/src/lib/exercises";
import { getCurrentProfile, getExerciseProgress, getWorkProfiles } from "@/src/lib/content";

export default async function Quiz() {
  const works = await getWorkProfiles();
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === "admin";
  const totalExercises = works.reduce((sum, work) => sum + work.exercises.length, 0);
  const totalQuestions = works.reduce(
    (sum, work) => sum + work.exercises.reduce((exerciseSum, exercise) => exerciseSum + countExerciseQuestions(exercise), 0),
    0,
  );
  const progress = profile ? await getExerciseProgress(profile.id, totalExercises) : { completedExercises: 0, correctAnswers: 0, streak: 0, progressPercentage: 0 };

  return (
    <AppShell currentPath="/quiz">
      {isAdmin || profile?.subscription_plan === "premium" ? (
        <QuizPage works={works} progress={progress} totalExercises={totalExercises} totalQuestions={totalQuestions} isAdmin={isAdmin} />
      ) : (
        <main className="pb-8">
          <LockedContent requiredLevel="premium" />
        </main>
      )}
    </AppShell>
  );
}
