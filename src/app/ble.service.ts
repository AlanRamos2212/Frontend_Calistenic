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
   * Connect to a physical BLE Heart Rate Wearable using Web Bluetooth
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
      this.error.set('Web Bluetooth is not supported in this browser. Please try Chrome, Edge, or Opera, or use Simulation mode.');
      return;
    }

    try {
      // Standard Heart Rate service UUID is 0x180D (or 'heart_rate')
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
      
      // Start receiving heart rate notification events
      await this.hrCharacteristic.startNotifications();
      this.hrCharacteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        this.parseHeartRate(event.target.value);
      });

      this.deviceConnected.set(true);
      this.isScanning.set(false);
    } catch (err: any) {
      this.isScanning.set(false);
      if (err.name === 'NotFoundError') {
        this.error.set('Bluetooth device selection cancelled.');
      } else {
        this.error.set(`Connection failed: ${err.message || err}`);
      }
      this.handleDisconnect();
    }
  }

  /**
   * Disconnect from BLE device or stop simulation
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
   * Parse the binary payload received from standard BLE Heart Rate Measurement Characteristic (0x2A37)
   */
  private parseHeartRate(value: DataView) {
    // Standard BLE Heart Rate parsing:
    // First byte is flags.
    // Bit 0 specifies format: 0 = uint8 BPM, 1 = uint16 BPM.
    const flags = value.getUint8(0);
    const rate16Bits = flags & 0x01;
    let bpm = 0;
    
    if (rate16Bits) {
      bpm = value.getUint16(1, true); // true for Little Endian
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
    this.simBaseHr = 70 + Math.random() * 10; // Random starting HR (70-80 BPM)
    this.simTime = 0;
    this.heartRate.set(Math.round(this.simBaseHr));

    // Update simulated heart rate every 1 second
    this.simulationIntervalId = setInterval(() => {
      this.simTime += 1;
      
      // Simulate physical workout load: HR ramps up over time, then stabilizes, with small random fluctuations
      // We use a mathematical function (sine/arctangent) to mimic workout curves:
      // Rapid rise at the beginning, peaking, then minor fluctuations.
      const riseFactor = Math.atan(this.simTime / 60) * 80; // Rise up to +80 bpm
      const noise = Math.sin(this.simTime * 0.2) * 3 + (Math.random() - 0.5) * 2;
      
      const currentBpm = Math.round(this.simBaseHr + riseFactor + noise);
      
      // Keep it within human-athlete limits (60 - 200 BPM)
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
