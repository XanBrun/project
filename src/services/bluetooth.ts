// Type definitions for cordova-plugin-ble-peripheral
interface BLEPeripheral {
  createService(uuid: string, success: () => void, error: (e: any) => void): void;
  addCharacteristic(serviceUUID: string, characteristicUUID: string, permissions: number, properties: number, success: () => void, error: (e: any) => void): void;
  startAdvertising(serviceUUIDs: string[], name: string, success: () => void, error: (e: any) => void): void;
  stopAdvertising(success: () => void, error: (e: any) => void): void;
  onWriteRequest(handler: (request: { value: ArrayBuffer, requestId: number, characteristic: string }) => void): void;
  sendResponse(requestId: number, offset: number, value: ArrayBuffer): void;
  notify(serviceUUID: string, characteristicUUID: string, value: ArrayBuffer): void;
}

declare global {
  interface Window {
    blePeripheral: BLEPeripheral;
  }
}

const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const MESSAGE_CHARACTERISTIC_UUID = '87654321-4321-4321-4321-cba987654321';

// Permissions and properties for the characteristic
const PERMISSIONS = 3; // read, write
const PROPERTIES = 18; // read, write, notify

export interface BluetoothMessage {
  type: 'dice_roll' | 'character_update' | 'campaign_event' | 'chat_message' | 'shop_purchase';
  data: any;
  timestamp: number;
  senderId: string;
}

class BluetoothServerService {
  private messageHandlers: Map<string, (message: BluetoothMessage) => void> = new Map();

  private stringToArrayBuffer(str: string): ArrayBuffer {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  private arrayBufferToString(buffer: ArrayBuffer): string {
    return String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer)));
  }

  async startServer(deviceName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      window.blePeripheral.createService(SERVICE_UUID, () => {
        window.blePeripheral.addCharacteristic(SERVICE_UUID, MESSAGE_CHARACTERISTIC_UUID, PERMISSIONS, PROPERTIES, () => {
          window.blePeripheral.startAdvertising([SERVICE_UUID], deviceName, resolve, reject);
        }, reject);
      }, reject);

      window.blePeripheral.onWriteRequest((request) => {
        const messageString = this.arrayBufferToString(request.value);
        try {
          const message: BluetoothMessage = JSON.parse(messageString);
          this.messageHandlers.forEach(handler => handler(message));
          window.blePeripheral.sendResponse(request.requestId, 0, new ArrayBuffer(0));
        } catch (e) {
          console.error("Error parsing bluetooth message", e);
        }
      });
    });
  }

  async stopServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      window.blePeripheral.stopAdvertising(resolve, reject);
    });
  }

  addMessageHandler(id: string, handler: (message: BluetoothMessage) => void): void {
    this.messageHandlers.set(id, handler);
  }

  removeMessageHandler(id: string): void {
    this.messageHandlers.delete(id);
  }

  async sendMessage(message: BluetoothMessage): Promise<void> {
    const messageString = JSON.stringify(message);
    const data = this.stringToArrayBuffer(messageString);
    return new Promise((resolve, reject) => {
      window.blePeripheral.notify(SERVICE_UUID, MESSAGE_CHARACTERISTIC_UUID, data);
      resolve();
    });
  }
}

export const bluetoothServerService = new BluetoothServerService();