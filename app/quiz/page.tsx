import { AppShell } from "@/components/app-shell";
import { QuizPage } from "@/components/quiz-page";
import { getWorkProfiles } from "@/src/lib/content";

export default async function Quiz() {
  const works = await getWorkProfiles();

  return (
    <AppShell currentPath="/quiz">
      <QuizPage works={works} />
    </AppShell>
  );
}
