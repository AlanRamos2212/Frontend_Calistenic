import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Workout } from '../../api.service';

@Component({
  selector: 'app-workout-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workout-card.component.html',
  styleUrl: './workout-card.component.css'
})
export class WorkoutCardComponent {
  @Input() workout!: Workout;
  @Output() onClick = new EventEmitter<Workout>();
  @Output() onDelete = new EventEmitter<number>();

  selectWorkout() {
    this.onClick.emit(this.workout);
  }

  deleteWorkout(event: Event) {
    event.stopPropagation();
    this.onDelete.emit(this.workout.id);
  }

  formatDuration(seconds?: number): string {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
