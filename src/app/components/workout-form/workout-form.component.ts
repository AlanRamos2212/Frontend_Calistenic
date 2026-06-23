import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Workout } from '../../api.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-workout-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TextareaModule, FloatLabelModule, TagModule],
  templateUrl: './workout-form.component.html',
  styleUrl: './workout-form.component.css'
})
export class WorkoutFormComponent {
  @Input() isActive: boolean = false;
  @Input() currentWorkout: Workout | null = null;
  @Input() deviceConnected: boolean = false;
  @Input() formattedTime = '';
  @Output() onStart = new EventEmitter<{ name: string; description: string }>();
  @Output() onEnd = new EventEmitter<void>();

  workoutName = 'Entrenamiento de Calistenia';
  workoutDescription = 'Rutina de fuerza (Dominadas, Fondos, Flexiones)';

  startWorkout() {
    this.onStart.emit({ name: this.workoutName, description: this.workoutDescription });
  }

  endWorkout() { this.onEnd.emit(); }
}
