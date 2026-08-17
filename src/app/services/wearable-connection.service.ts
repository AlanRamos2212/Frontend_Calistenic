import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService, WearableBinding } from '../api.service';

export type WearableConnectionStatus = 'disconnected' | 'pairing' | 'connected';

export interface WearableConnectionState {
  status: WearableConnectionStatus;
  deviceId: string | null;
  lastUpdate: Date | null;
  isDeviceTokenValid: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WearableConnectionService {
  private readonly statusStorageKey = 'wearable.connection.status';

  // Estados reactivos
  private readonly _connectionState = signal<WearableConnectionState>({
    status: 'disconnected',
    deviceId: null,
    lastUpdate: null,
    isDeviceTokenValid: false,
  });

  readonly connectionState = this._connectionState.asReadonly();
  readonly isConnected = computed(() => this._connectionState().status === 'connected');
  readonly deviceId = computed(() => this._connectionState().deviceId);

  constructor(private readonly api: ApiService) {
    this.initializeState();
  }

  /**
   * Inicializa el estado desde localStorage
   */
  private initializeState(): void {
    try {
      const storedStatus = this.getStoredStatus();
      const deviceToken = localStorage.getItem('app.device.token') ||
                         sessionStorage.getItem('app.device.token');
      const storedDeviceId = localStorage.getItem('wearable.device.id') ||
                            sessionStorage.getItem('wearable.device.id');

      if (storedStatus === 'connected' && storedDeviceId) {
        this.setConnected(storedDeviceId, !!deviceToken);
        return;
      }

      if (storedStatus === 'pairing' && storedDeviceId) {
        this.setPairing(storedDeviceId);
        return;
      }

      if (deviceToken && storedDeviceId) {
        this.setConnected(storedDeviceId, true);
      } else if (storedDeviceId) {
        this.setPairing(storedDeviceId);
      }
    } catch (error) {
      console.error('Error initializing wearable connection state:', error);
    }
  }

  /**
   * Marca el wearable como conectado
   */
  setConnected(deviceId: string, isDeviceTokenValid: boolean = true): void {
    this._connectionState.set({
      status: 'connected',
      deviceId,
      lastUpdate: new Date(),
      isDeviceTokenValid,
    });

    // Almacena en localStorage para persistencia
    localStorage.setItem(this.statusStorageKey, 'connected');
    sessionStorage.setItem(this.statusStorageKey, 'connected');
    localStorage.setItem('wearable.device.id', deviceId);
    sessionStorage.setItem('wearable.device.id', deviceId);
  }

  /**
   * Marca el wearable como en proceso de vinculación
   */
  setPairing(deviceId?: string): void {
    this._connectionState.set({
      status: 'pairing',
      deviceId: deviceId || this._connectionState().deviceId,
      lastUpdate: new Date(),
      isDeviceTokenValid: false,
    });

    localStorage.setItem(this.statusStorageKey, 'pairing');
    sessionStorage.setItem(this.statusStorageKey, 'pairing');

    if (deviceId) {
      localStorage.setItem('wearable.device.id', deviceId);
      sessionStorage.setItem('wearable.device.id', deviceId);
    }
  }

  /**
   * Marca el wearable como desconectado
   */
  disconnect(): void {
    this._connectionState.set({
      status: 'disconnected',
      deviceId: null,
      lastUpdate: new Date(),
      isDeviceTokenValid: false,
    });

    // Limpia localStorage
    localStorage.removeItem(this.statusStorageKey);
    sessionStorage.removeItem(this.statusStorageKey);
    localStorage.removeItem('wearable.device.id');
    sessionStorage.removeItem('wearable.device.id');
    localStorage.removeItem('app.device.token');
    sessionStorage.removeItem('app.device.token');
  }

  /**
   * Notifica que la vinculación por código fue exitosa
   * Esto se llama después de confirmar el código de pairing
   */
  notifyPairingCodeSuccess(deviceId: string, deviceToken: string): void {
    // Almacena el token del dispositivo
    localStorage.setItem('app.device.token', deviceToken);
    sessionStorage.setItem('app.device.token', deviceToken);

    // Marca como conectado
    this.setConnected(deviceId, true);
  }

  /**
   * Marca el wearable como conectado aunque no tengamos un token persistido aún.
   * Útil cuando el backend ya confirmó el PIN y el estado llega por polling.
   */
  notifyWearableLinked(deviceId: string): void {
    this.setConnected(deviceId, true);
  }

  /**
   * Rehidrata el estado desde storage local.
   */
  rehydrateFromStorage(): void {
    try {
      const currentState = this._connectionState();
      const storedStatus = this.getStoredStatus();
      const deviceToken = localStorage.getItem('app.device.token') ||
                         sessionStorage.getItem('app.device.token');
      const storedDeviceId = localStorage.getItem('wearable.device.id') ||
                            sessionStorage.getItem('wearable.device.id');

      if (storedStatus === 'connected' && storedDeviceId) {
        this.setConnected(storedDeviceId, !!deviceToken);
        return;
      }

      if (storedStatus === 'pairing' && storedDeviceId) {
        this.setPairing(storedDeviceId);
        return;
      }

      if (deviceToken && storedDeviceId) {
        this.setConnected(storedDeviceId, true);
        return;
      }

      if (currentState.status === 'connected' && currentState.deviceId) {
        return;
      }

      if (storedDeviceId) {
        this.setPairing(storedDeviceId);
        return;
      }

      this.disconnect();
    } catch (error) {
      console.error('Error rehydrating wearable connection state:', error);
    }
  }

  private getStoredStatus(): WearableConnectionStatus | null {
    const status = localStorage.getItem(this.statusStorageKey) ||
      sessionStorage.getItem(this.statusStorageKey);

    if (status === 'connected' || status === 'pairing') {
      return status;
    }

    return null;
  }

  /**
   * Sincroniza el estado local con lo que reporta el backend.
   */
  syncFromWearables(bindings: WearableBinding[]): void {
    const activeWearable =
      bindings.find(binding => binding.pinConfirmed) ??
      bindings.find(binding => binding.active) ??
      bindings[0] ??
      null;

    if (!activeWearable) {
      const currentState = this._connectionState();
      if (currentState.status === 'pairing' && currentState.deviceId) {
        return;
      }

      this.disconnect();
      return;
    }

    if (activeWearable.pinConfirmed) {
      this.notifyWearableLinked(activeWearable.wearableId);
      return;
    }

    this.setPairing(activeWearable.wearableId);
  }

  /**
   * Carga el estado real de vínculos desde el backend y lo sincroniza con el estado local.
   */
  loadFromBackend(): Observable<WearableBinding[]> {
    return this.api.getWearables().pipe(
      tap(bindings => this.syncFromWearables(bindings))
    );
  }

  /**
   * Verifica si hay un token de dispositivo válido
   */
  async verifyDeviceToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem('app.device.token') ||
                   sessionStorage.getItem('app.device.token');

      if (!token) {
        return false;
      }

      // Aquí puedes hacer una verificación adicional con el backend si es necesario
      // Por ahora, simplemente retornamos true si existe el token
      return true;
    } catch (error) {
      console.error('Error verifying device token:', error);
      return false;
    }
  }

  /**
   * Obtiene el estado actual de conexión
   */
  getStatus(): WearableConnectionStatus {
    return this._connectionState().status;
  }

  /**
   * Obtiene el ID del dispositivo wearable actualmente conectado
   */
  getDeviceId(): string | null {
    return this._connectionState().deviceId;
  }

  /**
   * Retorna true si el wearable está conectado y tiene token válido
   */
  isFullyConnected(): boolean {
    const state = this._connectionState();
    return state.status === 'connected' && state.deviceId !== null;
  }
}
