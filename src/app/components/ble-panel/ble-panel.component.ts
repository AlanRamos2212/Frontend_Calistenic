import { Component, EventEmitter, OnInit, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BleService } from '../../ble.service';
import { ApiService, WearableBinding } from '../../api.service';
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
export class BlePanelComponent implements OnInit {
  public readonly ble = inject(BleService);
  private readonly api = inject(ApiService);

  readonly wearableBindings = signal<WearableBinding[]>([]);
  readonly isWearableLoading = signal(true);
  readonly activeWearable = computed(() => this.wearableBindings().find(w => w.active) ?? this.wearableBindings()[0] ?? null);
  readonly panelTitle = computed(() => {
    const wearable = this.activeWearable();
    if (!wearable) return 'Modo local';
    return wearable.pinConfirmed ? 'Wearable vinculado' : 'Vinculación pendiente';
  });
  readonly panelSubtitle = computed(() => {
    const wearable = this.activeWearable();
    if (!wearable) return 'Pruebas del monitor';
    return wearable.pinConfirmed ? 'Sincronizado con el backend' : 'Completa el PIN para activar la sincronización';
  });
  readonly wearableStatusLabel = computed(() => {
    const wearable = this.activeWearable();
    if (!wearable) return 'Offline';
    if (!wearable.active) return 'Inactivo';
    return wearable.pinConfirmed ? 'Vinculado' : 'Pendiente PIN';
  });
  readonly wearableStatusSeverity = computed(() => {
    const wearable = this.activeWearable();
    if (!wearable) return 'danger';
    if (!wearable.active) return 'danger';
    return wearable.pinConfirmed ? 'success' : 'warn';
  });

  @Output() onConnect = new EventEmitter<void>();
  @Output() onDisconnect = new EventEmitter<void>();
  @Output() onSimulateStart = new EventEmitter<void>();
  @Output() onSimulateExert = new EventEmitter<'rest' | 'moderate' | 'intense'>();

  ngOnInit(): void {
    this.loadWearableStatus();
  }

  refreshWearableStatus(): void {
    this.loadWearableStatus();
  }

  private loadWearableStatus(): void {
    this.isWearableLoading.set(true);
    this.api.getWearables().subscribe({
      next: bindings => {
        this.wearableBindings.set(bindings ?? []);
        this.isWearableLoading.set(false);
      },
      error: () => {
        this.wearableBindings.set([]);
        this.isWearableLoading.set(false);
      }
    });
  }

  connect() { this.ble.connect(); this.onConnect.emit(); }
  disconnect() { this.ble.disconnect(); this.onDisconnect.emit(); }
  startSimulation() { this.ble.startSimulation(); this.onSimulateStart.emit(); }
  exertSimulated(level: 'rest' | 'moderate' | 'intense') {
    this.ble.exertSimulated(level);
    this.onSimulateExert.emit(level);
  }
}
