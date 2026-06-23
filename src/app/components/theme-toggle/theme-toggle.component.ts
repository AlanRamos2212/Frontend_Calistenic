import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [ToggleSwitchModule, FormsModule, TooltipModule],
  template: `
    <div class="flex items-center gap-2">
      <span class="text-lg select-none" aria-hidden="true">☀️</span>
      <p-toggleswitch
        id="theme-toggle-switch"
        [(ngModel)]="isDark"
        (onChange)="theme.toggle()"
        pTooltip="{{ isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro' }}"
        tooltipPosition="bottom"
      />
      <span class="text-lg select-none" aria-hidden="true">🌙</span>
    </div>
  `
})
export class ThemeToggleComponent {
  readonly theme = inject(ThemeService);

  get isDark(): boolean {
    return this.theme.isDark();
  }
  set isDark(_: boolean) {
    // toggle is called via (onChange)
  }
}
