import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-warning-banner',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './warning-banner.component.html',
  styleUrl: './warning-banner.component.css'
})
export class WarningBannerComponent {
  @Input() isVisible: boolean = false;
  @Input() message: string = '';
  @Input() heartRate: number | null = null;
  @Output() onDismiss = new EventEmitter<void>();

  dismiss() {
    try {
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
    } catch {}
    this.onDismiss.emit();
  }
}
