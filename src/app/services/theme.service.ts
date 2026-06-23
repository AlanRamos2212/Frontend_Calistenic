import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'ct_theme';

  readonly isDark = signal<boolean>(false);

  constructor() {
    // Read from localStorage (already applied to <html> via inline script in index.html)
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved === 'dark' || (!saved && prefersDark);
    this.isDark.set(dark);

    // Keep <html> class in sync with the signal
    effect(() => {
      const dark = this.isDark();
      document.documentElement.classList.toggle('app-dark', dark);
      localStorage.setItem(this.STORAGE_KEY, dark ? 'dark' : 'light');
    });
  }

  toggle() {
    this.isDark.update(v => !v);
  }

  setDark(dark: boolean) {
    this.isDark.set(dark);
  }
}
