import { Injectable } from '@angular/core';

export interface IconConfig {
  fontAwesome: string;
  tabler: string;
  library: 'fontawesome' | 'tabler';
}

@Injectable({
  providedIn: 'root'
})
export class IconService {
  private useTabler = false;

  // Mapeo de emojis a iconos
  private iconMap: { [key: string]: IconConfig } = {
    '💪': { fontAwesome: 'fa-dumbbell', tabler: 'dumbbell', library: 'fontawesome' },
    '🏋️': { fontAwesome: 'fa-weight-hanging', tabler: 'barbell', library: 'fontawesome' },
    '⚡': { fontAwesome: 'fa-bolt', tabler: 'lightning-bolt', library: 'fontawesome' },
    '🔥': { fontAwesome: 'fa-fire', tabler: 'flame', library: 'fontawesome' },
    '🚀': { fontAwesome: 'fa-rocket', tabler: 'rocket', library: 'fontawesome' },
    '🦵': { fontAwesome: 'fa-person-running', tabler: 'run', library: 'fontawesome' },
    '🤸': { fontAwesome: 'fa-person-biking', tabler: 'gymnastics', library: 'fontawesome' },
    '🧘': { fontAwesome: 'fa-spa', tabler: 'yoga', library: 'fontawesome' },
    '👑': { fontAwesome: 'fa-crown', tabler: 'crown', library: 'fontawesome' },
    '🐉': { fontAwesome: 'fa-dragon', tabler: 'dragon', library: 'fontawesome' },
    '🏆': { fontAwesome: 'fa-trophy', tabler: 'trophy', library: 'fontawesome' },
    '☀️': { fontAwesome: 'fa-sun', tabler: 'sun', library: 'fontawesome' },
    '🌙': { fontAwesome: 'fa-moon', tabler: 'moon', library: 'fontawesome' },
    '📊': { fontAwesome: 'fa-chart-line', tabler: 'chart-bar', library: 'fontawesome' },
    '📈': { fontAwesome: 'fa-chart-line', tabler: 'trend-up', library: 'fontawesome' },
    '🌐': { fontAwesome: 'fa-globe', tabler: 'world', library: 'fontawesome' }
  };

  constructor() {
    this.setLibrary('fontawesome');
  }

  /**
   * Obtiene la clase/nombre del icono según la librería configurada
   */
  getIcon(emoji: string): string {
    const config = this.iconMap[emoji];
    if (!config) {
      console.warn(`No icon mapping found for emoji: ${emoji}`);
      return emoji;
    }

    return this.useTabler ? config.tabler : config.fontAwesome;
  }

  /**
   * Retorna el código HTML del icono (Font Awesome)
   */
  getIconHtml(emoji: string): string {
    const iconClass = this.getIcon(emoji);
    if (this.useTabler) {
      return `<svg class="icon icon-tabler" width="1em" height="1em" viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><!-- Icon SVG content would go here --></svg>`;
    }
    return `<i class="fas ${iconClass}"></i>`;
  }

  /**
   * Define cuál librería usar (por defecto Font Awesome)
   */
  setLibrary(library: 'fontawesome' | 'tabler'): void {
    this.useTabler = library === 'tabler';
  }

  /**
   * Retorna la librería actual
   */
  getCurrentLibrary(): string {
    return this.useTabler ? 'tabler' : 'fontawesome';
  }
}
