import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css'
})
export class EmptyStateComponent {
  @Input() icon: string = '💪';
  @Input() title: string = 'No hay datos';
  @Input() description: string = '';
  @Input() actionText: string = '';
  @Input() actionIcon: string = '';
  @Output() onAction = new EventEmitter<void>();

  handleAction() {
    this.onAction.emit();
  }
}
