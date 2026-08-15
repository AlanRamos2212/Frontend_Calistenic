import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Exercise } from '../models/exercise.model';

@Injectable({ providedIn: 'root' })
export class ExercisesService {
  private readonly http = inject(HttpClient);

  exercises = signal<Exercise[]>([]);

  constructor() {
    this.loadExercises();
  }

  private loadExercises(): void {
    this.http.get<any[]>('/api/exercises').subscribe({
      next: list => {
        if (Array.isArray(list) && list.length > 0) {
          this.exercises.set(list.map(this.mapApiExercise));
        }
      },
      error: () => {
        this.exercises.set([]);
      }
    });
  }

  private mapApiExercise(x: any): Exercise {
    return {
      id: x.id,
      name: x.name,
      description: x.description,
      category: x.category,
      level: x.level,
      durationMin: x.durationMin ?? x.duration_min ?? 0,
      estimatedCalories: x.estimatedCalories ?? x.estimated_calories ?? 0,
      targetHrMin: x.targetHrMin ?? x.target_hr_min ?? 0,
      targetHrMax: x.targetHrMax ?? x.target_hr_max ?? 0,
      icon: x.icon ?? '💪',
      exerciseCount: x.exerciseCount ?? x.exercise_count ?? 0,
      muscles: (x.muscles || '').split(',').map((s: string) => s.trim())
    };
  }
}
