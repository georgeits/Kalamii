import type { QuizQuestion } from "@/src/lib/content";

export function normalizeQuestion(question: QuizQuestion): QuizQuestion {
  const options = question.options?.length === 4 ? question.options : createDefaultOptions();
  const correctIndex = options.findIndex((option) => option.isCorrect);

  return {
    id: question.id ?? crypto.randomUUID(),
    question: question.question ?? "",
    options: options.map((option, index) => ({
      ...option,
      isCorrect: correctIndex === -1 ? false : index === correctIndex,
    })),
  };
}

export function createEmptyQuestion(index: number): QuizQuestion {
  return {
    id: crypto.randomUUID(),
    question: `კითხვა ${index}`,
    options: createDefaultOptions(),
  };
}

export function createDefaultOptions() {
  return [
    { id: "a", text: "", isCorrect: false },
    { id: "b", text: "", isCorrect: false },
    { id: "c", text: "", isCorrect: false },
    { id: "d", text: "", isCorrect: false },
  ];
}

export function validateQuestions(questions: QuizQuestion[]) {
  const errors: string[] = [];

  questions.forEach((question, index) => {
    if (!question.question?.trim()) {
      errors.push(`კითხვა ${index + 1}: შეკითხვა სავალდებულოა.`);
    }

    const options = question.options ?? [];
    if (options.length !== 4) {
      errors.push(`კითხვა ${index + 1}: ზუსტად 4 პასუხი უნდა ჰქონდეს.`);
      return;
    }

    options.forEach((option, optionIndex) => {
      if (!option.text.trim()) {
        errors.push(`კითხვა ${index + 1}: პასუხი ${optionIndex + 1} სავალდებულოა.`);
      }
    });

    const correctCount = options.filter((option) => option.isCorrect).length;
    if (correctCount !== 1) {
      errors.push(`კითხვა ${index + 1}: უნდა იყოს მონიშნული ზუსტად 1 სწორი პასუხი.`);
    }
  });

  return errors;
}

export function parseBulkQuizImport(value: string):
  | { ok: true; questions: QuizQuestion[] }
  | { ok: false; error: string } {
  const blocks = value
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return { ok: false, error: "იმპორტისთვის ტექსტი ცარიელია." };
  }

  const questions: QuizQuestion[] = [];

  for (const [index, block] of blocks.entries()) {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const questionLine = lines.find((line) => /^Question:/i.test(line));
    const answerLines = ["A", "B", "C", "D"].map((letter) => lines.find((line) => new RegExp(`^${letter}\\)`, "i").test(line)));
    const correctLine = lines.find((line) => /^Correct:/i.test(line));

    if (!questionLine || answerLines.some((line) => !line) || !correctLine) {
      return { ok: false, error: `ბლოკი ${index + 1} არასწორი ფორმატისაა.` };
    }

    const questionText = questionLine.replace(/^Question:\s*/i, "").trim();
    const correctLetter = correctLine.replace(/^Correct:\s*/i, "").trim().toUpperCase();

    if (!["A", "B", "C", "D"].includes(correctLetter)) {
      return { ok: false, error: `ბლოკი ${index + 1}: Correct უნდა იყოს A, B, C ან D.` };
    }

    questions.push({
      id: crypto.randomUUID(),
      question: questionText,
      options: answerLines.map((line, optionIndex) => {
        const letter = ["A", "B", "C", "D"][optionIndex];
        return {
          id: letter.toLowerCase(),
          text: (line ?? "").replace(new RegExp(`^${letter}\\)\\s*`, "i"), "").trim(),
          isCorrect: letter === correctLetter,
        };
      }),
    });
  }

  const errors = validateQuestions(questions);
  if (errors.length > 0) {
    return { ok: false, error: errors[0] };
  }

  return { ok: true, questions };
}
