import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import Fuse from 'fuse.js';
import { Exercise } from '../models/exercise.model';
import { ExercisesService } from './exercises.service';

export interface SearchResult {
  title: string;
  description: string;
  category: string;
  icon?: string;
  routerLink?: string[];
  action?: () => void;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly exercisesService = inject(ExercisesService);

  private createFuse(): Fuse<Exercise> {
    return new Fuse<Exercise>(this.exercisesService.exercises(), {
      keys: [
        { name: 'name',        weight: 0.5 },
        { name: 'description', weight: 0.3 },
        { name: 'category',    weight: 0.1 },
        { name: 'level',       weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true
    });
  }

  private readonly staticItems: SearchResult[] = [
    { title: 'Dashboard',           description: 'Monitor en tiempo real',                category: 'Navegación', icon: '📊', routerLink: ['/dashboard'] },
    { title: 'Ejercicios',          description: 'Librería de rutinas de calistenia',     category: 'Navegación', icon: '💪', routerLink: ['/ejercicios'] },
    { title: 'Progreso',            description: 'Historial y gráficas de sesiones',      category: 'Navegación', icon: '📈', routerLink: ['/progreso'] },
    { title: 'Comunidad',           description: 'Feed social — próximamente',            category: 'Navegación', icon: '🌐', routerLink: ['/comunidad'] },
    { title: 'Lagartijas Clásicas', description: 'Pecho, tríceps y hombros',             category: 'Ejercicio',  icon: '💪', routerLink: ['/ejercicios'] },
    { title: 'Pull-ups / Barras',   description: 'Espalda y bíceps en barra',            category: 'Ejercicio',  icon: '🏋️', routerLink: ['/ejercicios'] },
    { title: 'Burpees',             description: 'Full body de alta intensidad',          category: 'Ejercicio',  icon: '🚀', routerLink: ['/ejercicios'] },
    { title: 'Plank Isométrico',    description: 'Core y estabilizadores',               category: 'Ejercicio',  icon: '🔥', routerLink: ['/ejercicios'] },
    { title: 'Muscle-up',           description: 'Pull-up + Dip en un movimiento',       category: 'Ejercicio',  icon: '👑', routerLink: ['/ejercicios'] },
  ];

  search(query: string): Observable<SearchResult[]> {
    if (!query || query.trim().length < 2) return of([]);

    return of(this.localSearch(query));
  }

  localSearch(query: string): SearchResult[] {
    const q = query.toLowerCase().trim();

    const fuse = this.createFuse();
    const exerciseResults: SearchResult[] = fuse
      .search(query, { limit: 5 })
      .map(r => ({
        title:       r.item.name,
        description: r.item.description,
        category:    'Ejercicio',
        icon:        r.item.icon,
        routerLink:  ['/ejercicios']
      }));

    const staticResults = this.staticItems.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );

    const seen = new Set<string>();
    const merged: SearchResult[] = [];
    for (const r of [...exerciseResults, ...staticResults]) {
      if (!seen.has(r.title)) {
        seen.add(r.title);
        merged.push(r);
      }
    }

    return merged.slice(0, 8);
  }
}
