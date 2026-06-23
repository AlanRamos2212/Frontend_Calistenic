import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CardModule } from 'primeng/card';

import { Exercise, ExerciseCategory, ExerciseLevel } from '../../models/exercise.model';
import { EXERCISES_DATA } from '../../data/exercises.data';

type FilterCategory = 'all' | ExerciseCategory;
type FilterLevel    = 'all' | ExerciseLevel;

@Component({
  selector: 'app-ejercicios-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    TagModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    CardModule
  ],
  templateUrl: './ejercicios-page.component.html',
  styleUrl: './ejercicios-page.component.css'
})
export class EjerciciosPageComponent {
  searchQuery  = signal('');
  activeCategory = signal<FilterCategory>('all');
  activeLevel    = signal<FilterLevel>('all');

  readonly categories: { label: string; value: FilterCategory; icon: string }[] = [
    { label: 'Todos',       value: 'all',        icon: '🏆' },
    { label: 'Upper Body',  value: 'upper_body', icon: '💪' },
    { label: 'Core',        value: 'core',       icon: '🔥' },
    { label: 'Lower Body',  value: 'lower_body', icon: '🦵' },
    { label: 'Full Body',   value: 'full_body',  icon: '🚀' },
  ];

  readonly levels: { label: string; value: FilterLevel; severity: 'success'|'warn'|'danger' }[] = [
    { label: 'Principiante', value: 'principiante', severity: 'success' },
    { label: 'Intermedio',   value: 'intermedio',   severity: 'warn'    },
    { label: 'Avanzado',     value: 'avanzado',     severity: 'danger'  },
  ];

  readonly filteredExercises = computed(() => {
    const q    = this.searchQuery().toLowerCase().trim();
    const cat  = this.activeCategory();
    const lvl  = this.activeLevel();

    return EXERCISES_DATA.filter(e => {
      const matchesSearch = !q || e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.muscles.join(' ').toLowerCase().includes(q);
      const matchesCat    = cat === 'all' || e.category === cat;
      const matchesLevel  = lvl === 'all' || e.level === lvl;
      return matchesSearch && matchesCat && matchesLevel;
    });
  });

  getLevelSeverity(level: ExerciseLevel): 'success'|'warn'|'danger' {
    if (level === 'principiante') return 'success';
    if (level === 'intermedio')   return 'warn';
    return 'danger';
  }

  getCategoryLabel(cat: ExerciseCategory): string {
    const map: Record<ExerciseCategory, string> = {
      upper_body: 'Upper Body',
      core:       'Core',
      lower_body: 'Lower Body',
      full_body:  'Full Body'
    };
    return map[cat];
  }

  onSearchInput(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  setCategory(cat: FilterCategory) { this.activeCategory.set(cat); }
  toggleLevel(lvl: FilterLevel) {
    this.activeLevel.set(this.activeLevel() === lvl ? 'all' : lvl);
  }
}
