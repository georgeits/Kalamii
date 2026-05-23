import { createEmptyExerciseSet, type ExerciseType } from "@/src/lib/exercises";

export function createInitialStandaloneExercise(type: ExerciseType = "text_correction") {
  return createEmptyExerciseSet(1, type);
}
