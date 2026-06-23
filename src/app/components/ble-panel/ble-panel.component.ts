import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BleService } from '../../ble.service';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-ble-panel',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, ProgressBarModule, MessageModule],
  templateUrl: './ble-panel.component.html',
  styleUrl: './ble-panel.component.css'
})
export class BlePanelComponent {
  public readonly ble = inject(BleService);

  @Output() onConnect = new EventEmitter<void>();
  @Output() onDisconnect = new EventEmitter<void>();
  @Output() onSimulateStart = new EventEmitter<void>();
  @Output() onSimulateExert = new EventEmitter<'rest' | 'moderate' | 'intense'>();

  connect() { this.ble.connect(); this.onConnect.emit(); }
  disconnect() { this.ble.disconnect(); this.onDisconnect.emit(); }
  startSimulation() { this.ble.startSimulation(); this.onSimulateStart.emit(); }
  exertSimulated(level: 'rest' | 'moderate' | 'intense') {
    this.ble.exertSimulated(level);
    this.onSimulateExert.emit(level);
  }
}
