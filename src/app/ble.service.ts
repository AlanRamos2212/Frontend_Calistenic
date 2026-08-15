import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BleService {
  // Signals for reactive state management
  readonly deviceConnected = signal<boolean>(false);
  readonly deviceName = signal<string>('');
  readonly heartRate = signal<number>(0);
  readonly isSimulated = signal<boolean>(false);
  readonly isScanning = signal<boolean>(false);
  readonly error = signal<string>('');

  private bluetoothDevice: any = null;
  private hrCharacteristic: any = null;
  private simulationIntervalId: any = null;
  private simBaseHr = 75;
  private simTime = 0;

  constructor() {}

  /**
   * Connect to an optional browser-accessible wearable source
   */
  async connect() {
    this.error.set('');
    this.isScanning.set(true);

    // Stop simulation if running
    if (this.isSimulated()) {
      this.stopSimulation();
    }

    if (!(navigator as any).bluetooth) {
      this.isScanning.set(false);
      this.error.set('La conexión directa no está disponible en este navegador. Usa el modo local.');
      return;
    }

    try {
      this.bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['generic_access']
      });

      this.deviceName.set(this.bluetoothDevice.name || 'Athletic Wearable');
      
      this.bluetoothDevice.addEventListener('gattserverdisconnected', () => {
        this.handleDisconnect();
      });

      const server = await this.bluetoothDevice.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      this.hrCharacteristic = await service.getCharacteristic('heart_rate_measurement');
      
      await this.hrCharacteristic.startNotifications();
      this.hrCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        this.parseHeartRate(event.target.value);
      });

      this.deviceConnected.set(true);
      this.isScanning.set(false);
    } catch (err: any) {
      this.isScanning.set(false);
      if (err.name === 'NotFoundError') {
        this.error.set('Selección de dispositivo cancelada.');
      } else {
        this.error.set(`La conexión falló: ${err.message || err}`);
      }
      this.handleDisconnect();
    }
  }

  /**
   * Disconnect from the browser source or stop simulation
   */
  disconnect() {
    if (this.isSimulated()) {
      this.stopSimulation();
    } else if (this.bluetoothDevice && this.bluetoothDevice.gatt.connected) {
      this.bluetoothDevice.gatt.disconnect();
    }
    this.handleDisconnect();
  }

  private handleDisconnect() {
    this.deviceConnected.set(false);
    this.deviceName.set('');
    this.heartRate.set(0);
    this.bluetoothDevice = null;
    this.hrCharacteristic = null;
  }

  /**
   * Parse the binary payload received from the heart rate measurement characteristic
   */
  private parseHeartRate(value: DataView) {
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x01;
    let bpm = 0;
    
    if (rate16Bits) {
      bpm = value.getUint16(1, true);
    } else {
      bpm = value.getUint8(1);
    }

    this.heartRate.set(bpm);
  }

  /**
   * Start simulating a workout heart rate curve
   */
  startSimulation() {
    this.error.set('');
    if (this.deviceConnected() && !this.isSimulated()) {
      this.disconnect();
    }

    this.isSimulated.set(true);
    this.deviceConnected.set(true);
    this.deviceName.set('Virtual FitBand (Simulated)');
    this.simBaseHr = 70 + Math.random() * 10;
    this.simTime = 0;
    this.heartRate.set(Math.round(this.simBaseHr));

    this.simulationIntervalId = setInterval(() => {
      this.simTime += 1;
      
      const riseFactor = Math.atan(this.simTime / 60) * 80;
      const noise = Math.sin(this.simTime * 0.2) * 3 + (Math.random() - 0.5) * 2;
      
      const currentBpm = Math.round(this.simBaseHr + riseFactor + noise);
      
      this.heartRate.set(Math.max(60, Math.min(200, currentBpm)));
    }, 1000);
  }

  /**
   * Stop the heart rate simulation
   */
  stopSimulation() {
    if (this.simulationIntervalId) {
      clearInterval(this.simulationIntervalId);
      this.simulationIntervalId = null;
    }
    this.isSimulated.set(false);
    this.handleDisconnect();
  }

  /**
   * Adjust base HR during simulation (can be triggered by UI to simulate exertion)
   */
  exertSimulated(exertion: 'rest' | 'moderate' | 'intense') {
    if (!this.isSimulated()) return;

    if (exertion === 'rest') {
      this.simBaseHr = Math.max(60, this.simBaseHr - 15);
    } else if (exertion === 'moderate') {
      this.simBaseHr = Math.min(130, this.simBaseHr + 10);
    } else if (exertion === 'intense') {
      this.simBaseHr = Math.min(170, this.simBaseHr + 20);
    }
  }
}
