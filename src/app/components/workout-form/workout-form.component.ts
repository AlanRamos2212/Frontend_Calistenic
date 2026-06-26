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
  @Input() isSimulated: boolean = false;
  @Input() formattedTime = '00:00';
  
  @Output() onStart = new EventEmitter<{ name: string; description: string }>();
  @Output() onEnd = new EventEmitter<void>();

  // Placeholders editables por el usuario
  workoutName = 'Entrenamiento de Calistenia';
  workoutDescription = 'Rutina de fuerza (Dominadas, Fondos, Flexiones)';
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

  private resetForm() {
    // Restablece valores por defecto tras finalizar la sesión
    this.workoutName = 'Entrenamiento de Calistenia';
    this.workoutDescription = 'Rutina de fuerza (Dominadas, Fondos, Flexiones)';
    this.nameTouched = false;
  }
}