import { Component, EventEmitter, Output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BleService } from '../../ble.service';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageModule } from 'primeng/message';
import { WearableConnectionService } from '../../services/wearable-connection.service';

@Component({
  selector: 'app-ble-panel',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, ProgressBarModule, MessageModule],
  templateUrl: './ble-panel.component.html',
  styleUrl: './ble-panel.component.css'
})
export class BlePanelComponent {
  public readonly ble = inject(BleService);
  private readonly wearableConnection = inject(WearableConnectionService);

  readonly connectionState = this.wearableConnection.connectionState;
  readonly hasWearable = computed(() => this.connectionState().status !== 'disconnected');
  readonly activeWearable = computed(() => this.connectionState().deviceId);

  readonly panelTitle = computed(() => {
    const status = this.connectionState().status;
    if (status === 'connected') return 'Wearable conectado';
    if (status === 'pairing') return 'Vinculación en proceso';
    return 'Simulación local';
  });

  readonly panelSubtitle = computed(() => {
    const status = this.connectionState().status;
    if (status === 'connected') return 'Sincronizado con el backend';
    if (status === 'pairing') return 'Completa el PIN en el wearable para finalizar';
    return 'Solo para pruebas del monitor';
  });

  readonly wearableStatusLabel = computed(() => {
    const status = this.connectionState().status;
    if (status === 'connected') return 'Conectado';
    if (status === 'pairing') return 'Emparejando';
    return 'Offline';
  });

  readonly wearableStatusSeverity = computed(() => {
    const status = this.connectionState().status;
    if (status === 'connected') return 'success';
    if (status === 'pairing') return 'warn';
    return 'danger';
  });

  @Output() onConnect = new EventEmitter<void>();
  @Output() onDisconnect = new EventEmitter<void>();
  @Output() onSimulateStart = new EventEmitter<void>();
  @Output() onSimulateExert = new EventEmitter<'rest' | 'moderate' | 'intense'>();

  refreshWearableStatus(): void {
    this.wearableConnection.rehydrateFromStorage();
    this.wearableConnection.loadFromBackend().subscribe({
      error: error => {
        console.error('Error loading wearable bindings from backend:', error);
      }
    });
  }

  connect() {
    this.ble.connect();
    this.onConnect.emit();
  }

  disconnect() {
    this.ble.disconnect();
    this.onDisconnect.emit();
  }

  startSimulation() {
    this.ble.startSimulation();
    this.onSimulateStart.emit();
  }

  exertSimulated(level: 'rest' | 'moderate' | 'intense') {
    this.ble.exertSimulated(level);
    this.onSimulateExert.emit(level);
  }
}
