import { Component, EventEmitter, OnDestroy, OnInit, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { ApiService, WearableBinding, WearablePairingCodeResponse, WearablePairingStatusResponse } from '../../api.service';
import { WearableConnectionService } from '../../services/wearable-connection.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-wearable-pairing',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, MessageModule],
  templateUrl: './wearable-pairing.component.html',
  styleUrl: './wearable-pairing.component.css'
})
export class WearablePairingComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly wearableConnection = inject(WearableConnectionService);
  private pairingPollHandle: ReturnType<typeof setInterval> | null = null;

  readonly isPairingCodeLoading = signal(false);
  readonly pairingCode = signal<WearablePairingCodeResponse | null>(null);
  readonly pairingCodeError = signal<string | null>(null);
  readonly showGuide = signal(false);
  readonly isCheckingPairing = signal(false);

  readonly pairingCodeReady = computed(() => !!this.pairingCode());
  readonly wearableState = this.wearableConnection.connectionState;

  @Output() wearableLinked = new EventEmitter<WearableBinding>();

  ngOnInit(): void {
    this.refreshWearableState();
  }

  ngOnDestroy(): void {
    this.stopPairingPoll();
  }

  async requestPairingCode(): Promise<void> {
    this.isPairingCodeLoading.set(true);
    this.pairingCodeError.set(null);

    try {
      const response = await firstValueFrom(this.api.requestPairingCode());
      this.pairingCode.set(response);
      this.wearableConnection.setPairing();
      this.startPairingPoll();
    } catch (error) {
      this.pairingCodeError.set('No fue posible generar el código de vinculación. Intenta nuevamente.');
      this.pairingCode.set(null);
    } finally {
      this.isPairingCodeLoading.set(false);
    }
  }

  async refreshPairingStatus(): Promise<void> {
    await this.checkPairingStatus();
  }

  clearPairingCode(): void {
    this.pairingCode.set(null);
    this.pairingCodeError.set(null);
    this.stopPairingPoll();
  }

  toggleGuide(): void {
    this.showGuide.update(val => !val);
  }

  /**
   * Esta función confirma el vínculo cuando el backend ya marcó el PIN
   * como aceptado.
   */
  notifyPairingSuccess(deviceId: string): void {
    this.wearableConnection.notifyWearableLinked(deviceId);
    const binding: WearableBinding = {
      id: Date.now(),
      wearableId: deviceId,
      active: true,
      pinConfirmed: true,
      confirmedAt: new Date().toISOString(),
      pairedAt: new Date().toISOString()
    };
    this.wearableLinked.emit(binding);
    this.clearPairingCode();
  }

  unlinkWearable(): void {
    const deviceId = this.wearableConnection.deviceId();
    if (deviceId) {
      this.api.unbindWearable(deviceId).subscribe({
        next: () => {
          this.wearableConnection.disconnect();
          this.refreshWearableState();
        },
        error: () => {
          this.wearableConnection.disconnect();
          this.refreshWearableState();
        }
      });
    } else {
      this.wearableConnection.disconnect();
      this.refreshWearableState();
    }
  }

  private startPairingPoll(): void {
    this.stopPairingPoll();
    void this.checkPairingStatus();
    this.pairingPollHandle = setInterval(() => {
      void this.checkPairingStatus();
    }, 2500);
  }

  private stopPairingPoll(): void {
    if (this.pairingPollHandle) {
      clearInterval(this.pairingPollHandle);
      this.pairingPollHandle = null;
    }
  }

  private refreshWearableState(): void {
    this.wearableConnection.rehydrateFromStorage();
    this.wearableConnection.loadFromBackend().subscribe({
      error: error => {
        console.error('Error loading wearable bindings from backend:', error);
      }
    });
  }

  private async checkPairingStatus(): Promise<void> {
    if (this.isCheckingPairing()) return;
    const currentCode = this.pairingCode();
    if (!currentCode) return;

    this.isCheckingPairing.set(true);

    try {
      const status = await firstValueFrom(this.api.getPairingStatus(currentCode.code));
      this.applyPairingStatus(status);
      if (status.status === 'CONFIRMED' && status.wearableId) {
        this.notifyPairingSuccess(status.wearableId);
      }
    } catch {
      // No bloqueamos la UI si el backend todavía no respondió.
    } finally {
      this.isCheckingPairing.set(false);
    }
  }

  private applyPairingStatus(status: WearablePairingStatusResponse): void {
    if (status.status === 'CONFIRMED' && status.wearableId) {
      this.wearableConnection.notifyWearableLinked(status.wearableId);
      return;
    }

    if (status.status === 'BOUND_WAITING_PIN' && status.wearableId) {
      this.wearableConnection.setPairing(status.wearableId);
      return;
    }

    if (status.status === 'PENDING') {
      this.wearableConnection.setPairing(this.wearableConnection.deviceId() ?? undefined);
      return;
    }

    if (status.status === 'EXPIRED' || status.status === 'INVALID') {
      this.pairingCodeError.set('El código de vinculación expiró o ya no es válido. Genera uno nuevo.');
      this.stopPairingPoll();
    }
  }
}
