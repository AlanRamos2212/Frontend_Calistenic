import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

interface IconExample {
  name: string;
  fontAwesome: string;
  tabler: string;
  category: string;
}

@Component({
  selector: 'app-icon-gallery',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="p-6 bg-gradient-to-br from-slate-900 to-slate-800">
      <h1 class="text-3xl font-bold text-white mb-2">Icon Gallery</h1>
      <p class="text-slate-300 mb-8">Mezcla de Font Awesome + Tabler Icons</p>

      <!-- Categories -->
      <div class="space-y-8">
        <ng-container *ngFor="let category of iconCategories">
          <div>
            <h2 class="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span class="w-1 h-6 bg-indigo-500 rounded"></span>
              {{ category.category }}
            </h2>
            
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <ng-container *ngFor="let icon of category.icons">
                <div class="bg-slate-700 p-4 rounded-lg hover:bg-slate-600 transition cursor-pointer group">
                  <!-- Font Awesome Icon -->
                  <div class="text-center mb-3">
                    <app-icon 
                      [iconName]="icon.fontAwesome" 
                      [size]="'2rem'"
                      [customClasses]="'text-indigo-400 group-hover:text-indigo-300'"
                    ></app-icon>
                  </div>
                  
                  <p class="text-sm text-slate-300 text-center font-mono">
                    {{ icon.fontAwesome }}
                  </p>
                  <p class="text-xs text-slate-500 text-center mt-1">
                    FontAwesome
                  </p>
                  
                  <!-- Tabler Icon (if available) -->
                  <hr class="my-3 border-slate-600" />
                  <div class="text-center mb-2">
                    <app-icon 
                      [iconName]="icon.tabler" 
                      [size]="'2rem'"
                      [customClasses]="'text-blue-400 group-hover:text-blue-300'"
                    ></app-icon>
                  </div>
                  <p class="text-sm text-slate-300 text-center font-mono">
                    {{ icon.tabler }}
                  </p>
                  <p class="text-xs text-slate-500 text-center mt-1">
                    Tabler
                  </p>
                </div>
              </ng-container>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class IconGalleryComponent {
  iconCategories = [
    {
      category: 'Ejercicios Superiores',
      icons: [
        { name: 'Push-ups', fontAwesome: 'fa-dumbbell', tabler: 'tb-barbell' },
        { name: 'Pull-ups', fontAwesome: 'fa-weight-hanging', tabler: 'tb-barbell' },
        { name: 'Dips', fontAwesome: 'fa-bolt', tabler: 'tb-barbell' },
      ]
    },
    {
      category: 'Ejercicios Inferiores',
      icons: [
        { name: 'Squats', fontAwesome: 'fa-person-running', tabler: 'tb-run' },
        { name: 'Lunges', fontAwesome: 'fa-person-hiking', tabler: 'tb-run' },
      ]
    },
    {
      category: 'Core & Acrobacias',
      icons: [
        { name: 'Plank', fontAwesome: 'fa-fire', tabler: 'tb-flame' },
        { name: 'Handstand', fontAwesome: 'fa-person-biking', tabler: 'tb-yoga' },
        { name: 'L-Sit', fontAwesome: 'fa-spa', tabler: 'tb-yoga' },
      ]
    },
    {
      category: 'Full Body',
      icons: [
        { name: 'Burpees', fontAwesome: 'fa-rocket', tabler: 'tb-rocket' },
        { name: 'Muscle-up', fontAwesome: 'fa-crown', tabler: 'tb-crown' },
      ]
    },
    {
      category: 'Navegación',
      icons: [
        { name: 'Dashboard', fontAwesome: 'fa-chart-line', tabler: 'tb-chart-bar' },
        { name: 'Progreso', fontAwesome: 'fa-chart-line', tabler: 'tb-trend-up' },
        { name: 'Comunidad', fontAwesome: 'fa-globe', tabler: 'tb-world' },
        { name: 'Tema', fontAwesome: 'fa-sun', tabler: 'tb-moon' },
      ]
    },
    {
      category: 'Utilidad',
      icons: [
        { name: 'Trofeo', fontAwesome: 'fa-trophy', tabler: 'tb-trophy' },
        { name: 'Corona', fontAwesome: 'fa-crown', tabler: 'tb-crown' },
      ]
    }
  ];
}
