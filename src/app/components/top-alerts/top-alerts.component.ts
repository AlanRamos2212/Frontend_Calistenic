import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Alert {
  id: string;
  icon: string;
  title: string;
  message: string;
  type: 'record' | 'scheduled' | 'warning' | 'info';
  dismissible: boolean;
}

@Component({
  selector: 'app-top-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-alerts.component.html',
  styleUrl: './top-alerts.component.css'
})
export class TopAlertsComponent {
  @Input() alerts: Alert[] = [];
  @Output() onDismiss = new EventEmitter<string>();

  dismissAlert(alertId: string) {
    this.onDismiss.emit(alertId);
  }
}
