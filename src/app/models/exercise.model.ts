export type ExerciseCategory = 'upper_body' | 'core' | 'lower_body' | 'full_body';
export type ExerciseLevel = 'principiante' | 'intermedio' | 'avanzado';

export interface Exercise {
  id: number;
  name: string;
  description: string;
  category: ExerciseCategory;
  level: ExerciseLevel;
  durationMin: number;
  estimatedCalories: number;
  targetHrMin: number;
  targetHrMax: number;
  icon: string;
  exerciseCount: number;
  muscles: string[];
}
