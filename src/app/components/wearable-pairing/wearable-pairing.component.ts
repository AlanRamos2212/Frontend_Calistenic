import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { ApiService, WearablePairingCodeResponse } from '../../api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-wearable-pairing',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, MessageModule],
  templateUrl: './wearable-pairing.component.html',
  styleUrl: './wearable-pairing.component.css'
})
export class WearablePairingComponent {
  private readonly api = inject(ApiService);

  readonly isPairingCodeLoading = signal(false);
  readonly pairingCode = signal<WearablePairingCodeResponse | null>(null);
  readonly pairingCodeError = signal<string | null>(null);
  readonly showGuide = signal(false);

  readonly pairingCodeReady = computed(() => !!this.pairingCode());

  async requestPairingCode(): Promise<void> {
    this.isPairingCodeLoading.set(true);
    this.pairingCodeError.set(null);

    try {
      const response = await firstValueFrom(this.api.requestPairingCode());
      this.pairingCode.set(response);
    } catch (error) {
      this.pairingCodeError.set('No fue posible generar el código de vinculación. Intenta nuevamente.');
      this.pairingCode.set(null);
    } finally {
      this.isPairingCodeLoading.set(false);
    }
  }

  clearPairingCode(): void {
    this.pairingCode.set(null);
    this.pairingCodeError.set(null);
  }

  toggleGuide(): void {
    this.showGuide.update(val => !val);
  }
}
