import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';

import { Workout } from '../../api.service';

const DEFAULT_WORKOUT_NAME = 'Entrenamiento de Calistenia';
const DEFAULT_WORKOUT_DESCRIPTION = 'Rutina de fuerza (Dominadas, Fondos, Flexiones)';

@Component({
  selector: 'app-workout-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TextareaModule, FloatLabelModule, TagModule],
  templateUrl: './workout-form.component.html',
  styleUrl: './workout-form.component.css'
})
export class WorkoutFormComponent {
  @Input() isActive = false;
  @Input() currentWorkout: Workout | null = null;
  @Input() deviceConnected = false;
  @Input() isSimulated = false;
  @Input() formattedTime = '00:00';
  private _initialWorkoutName = DEFAULT_WORKOUT_NAME;
  private _initialWorkoutDescription = DEFAULT_WORKOUT_DESCRIPTION;

  @Input()
  set initialWorkoutName(value: string) {
    this._initialWorkoutName = value?.trim() || DEFAULT_WORKOUT_NAME;
    this.syncDraft();
  }
  get initialWorkoutName() {
    return this._initialWorkoutName;
  }

  @Input()
  set initialWorkoutDescription(value: string) {
    this._initialWorkoutDescription = value?.trim() || DEFAULT_WORKOUT_DESCRIPTION;
    this.syncDraft();
  }
  get initialWorkoutDescription() {
    return this._initialWorkoutDescription;
  }

  @Output() onStart = new EventEmitter<{ name: string; description: string }>();
  @Output() onEnd = new EventEmitter<void>();

  workoutName = DEFAULT_WORKOUT_NAME;
  workoutDescription = DEFAULT_WORKOUT_DESCRIPTION;
  nameTouched = false;

  startWorkout() {
    if (!this.workoutName.trim()) {
      this.nameTouched = true;
      return;
    }

    this.onStart.emit({
      name: this.workoutName.trim(),
      description: this.workoutDescription.trim()
    });
  }

  endWorkout() {
    this.onEnd.emit();
    this.resetForm();
  }

  private syncDraft() {
    this.workoutName = this._initialWorkoutName;
    this.workoutDescription = this._initialWorkoutDescription;
    this.nameTouched = false;
  }

  private resetForm() {
    this.syncDraft();
  }
}
