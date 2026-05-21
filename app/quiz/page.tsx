import { AppShell } from "@/components/app-shell";
import { QuizPage } from "@/components/quiz-page";

export default function Quiz() {
  return (
    <AppShell currentPath="/quiz">
      <QuizPage />
    </AppShell>
  );
}
