import { AppShell } from "@/components/app-shell";
import { QuizPage } from "@/components/quiz-page";
import { countExerciseQuestions } from "@/src/lib/exercises";
import { getCurrentProfile, getExerciseProgress, getWorkProfiles } from "@/src/lib/content";

export default async function Quiz() {
  const works = await getWorkProfiles();
  const profile = await getCurrentProfile();
  const totalExercises = works.reduce((sum, work) => sum + work.exercises.length, 0);
  const totalQuestions = works.reduce(
    (sum, work) => sum + work.exercises.reduce((exerciseSum, exercise) => exerciseSum + countExerciseQuestions(exercise), 0),
    0,
  );
  const progress = profile ? await getExerciseProgress(profile.id, totalExercises) : { completedExercises: 0, correctAnswers: 0, streak: 0, progressPercentage: 0 };

  return (
    <AppShell currentPath="/quiz">
      <QuizPage works={works} progress={progress} totalExercises={totalExercises} totalQuestions={totalQuestions} />
    </AppShell>
  );
}
