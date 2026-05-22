type LegacyQuizQuestion = {
  id?: string;
  question: string;
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
};

export type ExerciseDifficulty = "easy" | "medium" | "hard";
export type ExerciseType = "multiple_choice" | "text_correction" | "reading_comprehension";
export type ReadingQuestionType = "multiple_choice" | "short_answer" | "true_false";

export type MultipleChoiceQuestion = {
  id: string;
  prompt: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string;
};

export type TextCorrectionExercise = {
  incorrectText: string;
  correctText: string;
  explanation?: string;
};

export type ReadingQuestion = {
  id: string;
  type: ReadingQuestionType;
  prompt: string;
  explanation?: string;
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  acceptedAnswers?: string[];
  correctAnswer?: boolean;
};

export type ReadingComprehensionExercise = {
  passage: string;
  questions: ReadingQuestion[];
};

type ExerciseBase = {
  id: string;
  title: string;
  type: ExerciseType;
  difficulty: ExerciseDifficulty;
  description?: string;
};

export type MultipleChoiceExerciseSet = ExerciseBase & {
  type: "multiple_choice";
  content: {
    questions: MultipleChoiceQuestion[];
  };
};

export type TextCorrectionExerciseSet = ExerciseBase & {
  type: "text_correction";
  content: TextCorrectionExercise;
};

export type ReadingComprehensionExerciseSet = ExerciseBase & {
  type: "reading_comprehension";
  content: ReadingComprehensionExercise;
};

export type ExerciseSet =
  | MultipleChoiceExerciseSet
  | TextCorrectionExerciseSet
  | ReadingComprehensionExerciseSet;

export type ExerciseProgressRecord = {
  completedExercises: number;
  correctAnswers: number;
  streak: number;
  progressPercentage: number;
};

export function getDifficultyLabel(value: ExerciseDifficulty) {
  return {
    easy: "მარტივი",
    medium: "საშუალო",
    hard: "რთული",
  }[value];
}

export function getExerciseTypeLabel(value: ExerciseType) {
  return {
    multiple_choice: "არჩევითი",
    text_correction: "ტექსტის რედაქტირება",
    reading_comprehension: "წაკითხულის გააზრება",
  }[value];
}

export function getExerciseLandingLabel() {
  return "სავარჯიშოები";
}

function createOption(id: string) {
  return { id, text: "", isCorrect: false };
}

export function createEmptyMultipleChoiceQuestion(index: number): MultipleChoiceQuestion {
  return {
    id: crypto.randomUUID(),
    prompt: `კითხვა ${index}`,
    options: [createOption("a"), createOption("b"), createOption("c"), createOption("d")],
    explanation: "",
  };
}

export function createEmptyExerciseSet(index: number, type: ExerciseType): ExerciseSet {
  const base = {
    id: crypto.randomUUID(),
    title:
      type === "multiple_choice"
        ? `არჩევითი სავარჯიშო ${index}`
        : type === "text_correction"
          ? `რედაქტირების სავარჯიშო ${index}`
          : `გააზრების სავარჯიშო ${index}`,
    type,
    difficulty: "medium" as ExerciseDifficulty,
    description: "",
  };

  if (type === "text_correction") {
    return {
      ...base,
      type,
      content: {
        incorrectText: "",
        correctText: "",
        explanation: "",
      },
    };
  }

  if (type === "reading_comprehension") {
    return {
      ...base,
      type,
      content: {
        passage: "",
        questions: [
          {
            id: crypto.randomUUID(),
            type: "multiple_choice",
            prompt: "კითხვა 1",
            options: [createOption("a"), createOption("b"), createOption("c"), createOption("d")],
            explanation: "",
          },
        ],
      },
    };
  }

  return {
    ...base,
    type,
    content: {
      questions: [createEmptyMultipleChoiceQuestion(1)],
    },
  };
}

export function normalizeExerciseSets(exerciseData: unknown, quizData: LegacyQuizQuestion[] = []): ExerciseSet[] {
  if (Array.isArray(exerciseData) && exerciseData.length > 0) {
    return exerciseData
      .map((item, index) => normalizeExerciseSet(item, index))
      .filter(Boolean) as ExerciseSet[];
  }

  return legacyQuizToExerciseSets(quizData);
}

function normalizeExerciseSet(item: unknown, index: number): ExerciseSet | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const record = item as Record<string, unknown>;
  const type = String(record.type ?? "");
  const difficulty = normalizeDifficulty(record.difficulty);
  const base = {
    id: String(record.id ?? crypto.randomUUID()),
    title: String(record.title ?? `სავარჯიშო ${index + 1}`),
    type,
    difficulty,
    description: String(record.description ?? ""),
  };

  if (type === "text_correction") {
    const content = (record.content as Record<string, unknown> | undefined) ?? {};
    return {
      ...base,
      type,
      content: {
        incorrectText: String(content.incorrectText ?? ""),
        correctText: String(content.correctText ?? ""),
        explanation: String(content.explanation ?? ""),
      },
    };
  }

  if (type === "reading_comprehension") {
    const content = (record.content as Record<string, unknown> | undefined) ?? {};
    return {
      ...base,
      type,
      content: {
        passage: String(content.passage ?? ""),
        questions: normalizeReadingQuestions(content.questions),
      },
    };
  }

  if (type === "multiple_choice") {
    const content = (record.content as Record<string, unknown> | undefined) ?? {};
    return {
      ...base,
      type,
      content: {
        questions: normalizeMultipleChoiceQuestions(content.questions),
      },
    };
  }

  return null;
}

function normalizeDifficulty(value: unknown): ExerciseDifficulty {
  if (value === "easy" || value === "medium" || value === "hard") {
    return value;
  }
  return "medium";
}

function normalizeMultipleChoiceQuestions(value: unknown): MultipleChoiceQuestion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const record = (item as Record<string, unknown>) ?? {};
    return {
      id: String(record.id ?? crypto.randomUUID()),
      prompt: String(record.prompt ?? record.question ?? `კითხვა ${index + 1}`),
      options: normalizeOptions(record.options),
      explanation: String(record.explanation ?? ""),
    };
  });
}

function normalizeReadingQuestions(value: unknown): ReadingQuestion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    const record = (item as Record<string, unknown>) ?? {};
    const type = record.type === "short_answer" || record.type === "true_false" ? record.type : "multiple_choice";
    return {
      id: String(record.id ?? crypto.randomUUID()),
      type,
      prompt: String(record.prompt ?? `კითხვა ${index + 1}`),
      explanation: String(record.explanation ?? ""),
      options: type === "multiple_choice" ? normalizeOptions(record.options) : undefined,
      acceptedAnswers:
        type === "short_answer"
          ? Array.isArray(record.acceptedAnswers)
            ? record.acceptedAnswers.map((answer) => String(answer))
            : String(record.acceptedAnswer ?? "")
                .split("\n")
                .map((answer) => answer.trim())
                .filter(Boolean)
          : undefined,
      correctAnswer: type === "true_false" ? Boolean(record.correctAnswer) : undefined,
    };
  });
}

function normalizeOptions(value: unknown) {
  if (!Array.isArray(value) || value.length !== 4) {
    return [createOption("a"), createOption("b"), createOption("c"), createOption("d")];
  }

  return value.map((option, index) => {
    const record = option as Record<string, unknown>;
    return {
      id: String(record.id ?? ["a", "b", "c", "d"][index]),
      text: String(record.text ?? ""),
      isCorrect: Boolean(record.isCorrect),
    };
  });
}

export function legacyQuizToExerciseSets(quizData: LegacyQuizQuestion[] = []): ExerciseSet[] {
  const validQuestions = quizData
    .filter((question) => question.question?.trim() && question.options?.length === 4)
    .map((question) => ({
      id: String(question.id ?? crypto.randomUUID()),
      prompt: question.question,
      options: (question.options ?? []).map((option) => ({
        id: option.id,
        text: option.text,
        isCorrect: Boolean(option.isCorrect),
      })),
      explanation: "",
    }));

  if (validQuestions.length === 0) {
    return [];
  }

  return [
    {
      id: "legacy-quiz",
      title: "არჩევითი სავარჯიშო",
      type: "multiple_choice",
      difficulty: "medium",
      description: "ძველი quiz სისტემიდან ავტომატურად გადმოტანილი სავარჯიშო.",
      content: {
        questions: validQuestions,
      },
    },
  ];
}

export function extractLegacyQuizData(exercises: ExerciseSet[]): LegacyQuizQuestion[] {
  const firstMultipleChoice = exercises.find((exercise) => exercise.type === "multiple_choice");
  if (!firstMultipleChoice || firstMultipleChoice.type !== "multiple_choice") {
    return [];
  }

  return firstMultipleChoice.content.questions.map((question) => ({
    id: question.id,
    question: question.prompt,
    options: question.options,
  }));
}

export function validateExerciseSets(exercises: ExerciseSet[]) {
  const errors: string[] = [];

  exercises.forEach((exercise, exerciseIndex) => {
    if (!exercise.title.trim()) {
      errors.push(`სავარჯიშო ${exerciseIndex + 1}: სათაური სავალდებულოა.`);
    }

    if (exercise.type === "multiple_choice") {
      validateMultipleChoiceQuestions(exercise.content.questions, errors, exerciseIndex);
    }

    if (exercise.type === "text_correction") {
      if (!exercise.content.incorrectText.trim()) {
        errors.push(`სავარჯიშო ${exerciseIndex + 1}: არასწორი ტექსტი სავალდებულოა.`);
      }
      if (!exercise.content.correctText.trim()) {
        errors.push(`სავარჯიშო ${exerciseIndex + 1}: სწორი ტექსტი სავალდებულოა.`);
      }
    }

    if (exercise.type === "reading_comprehension") {
      if (!exercise.content.passage.trim()) {
        errors.push(`სავარჯიშო ${exerciseIndex + 1}: ტექსტი/პასაჟი სავალდებულოა.`);
      }

      exercise.content.questions.forEach((question, questionIndex) => {
        if (!question.prompt.trim()) {
          errors.push(`სავარჯიშო ${exerciseIndex + 1}, კითხვა ${questionIndex + 1}: შეკითხვა სავალდებულოა.`);
        }

        if (question.type === "multiple_choice") {
          const options = question.options ?? [];
          if (options.length !== 4) {
            errors.push(`სავარჯიშო ${exerciseIndex + 1}, კითხვა ${questionIndex + 1}: საჭიროა 4 პასუხი.`);
            return;
          }
          const correctCount = options.filter((option) => option.isCorrect).length;
          if (correctCount !== 1) {
            errors.push(`სავარჯიშო ${exerciseIndex + 1}, კითხვა ${questionIndex + 1}: მონიშნეთ ზუსტად 1 სწორი პასუხი.`);
          }
        }

        if (question.type === "short_answer" && !(question.acceptedAnswers ?? []).some((answer) => answer.trim())) {
          errors.push(`სავარჯიშო ${exerciseIndex + 1}, კითხვა ${questionIndex + 1}: მიუთითეთ მინიმუმ 1 სწორი მოკლე პასუხი.`);
        }
      });
    }
  });

  return errors;
}

function validateMultipleChoiceQuestions(questions: MultipleChoiceQuestion[], errors: string[], exerciseIndex: number) {
  questions.forEach((question, questionIndex) => {
    if (!question.prompt.trim()) {
      errors.push(`სავარჯიშო ${exerciseIndex + 1}, კითხვა ${questionIndex + 1}: შეკითხვა სავალდებულოა.`);
    }

    if (question.options.length !== 4) {
      errors.push(`სავარჯიშო ${exerciseIndex + 1}, კითხვა ${questionIndex + 1}: საჭიროა 4 პასუხი.`);
      return;
    }

    const correctCount = question.options.filter((option) => option.isCorrect).length;
    if (correctCount !== 1) {
      errors.push(`სავარჯიშო ${exerciseIndex + 1}, კითხვა ${questionIndex + 1}: მონიშნეთ ზუსტად 1 სწორი პასუხი.`);
    }
  });
}

export function countExerciseQuestions(exercise: ExerciseSet) {
  if (exercise.type === "multiple_choice") {
    return exercise.content.questions.length;
  }
  if (exercise.type === "reading_comprehension") {
    return exercise.content.questions.length;
  }
  return 1;
}
