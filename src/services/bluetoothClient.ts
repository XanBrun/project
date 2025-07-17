import { BleClient, BleDevice, dataViewToText, textToDataView } from '@capacitor-community/bluetooth-le';

const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const MESSAGE_CHARACTERISTIC_UUID = '87654321-4321-4321-4321-cba987654321';

export interface BluetoothMessage {
  type: 'dice_roll' | 'character_update' | 'campaign_event' | 'chat_message' | 'shop_purchase';
  data: any;
  timestamp: number;
  senderId: string;
}

class BluetoothClientService {
  private device: BleDevice | null = null;
  private messageHandlers: Map<string, (message: BluetoothMessage) => void> = new Map();

  async initialize(): Promise<void> {
    await BleClient.initialize();
  }

  async scan(): Promise<BleDevice[]> {
    const devices: BleDevice[] = [];
    await BleClient.requestLEScan(
      {
        services: [SERVICE_UUID],
      },
      (result) => {
        if (result.device) {
          devices.push(result.device);
        }
      }
    );

    setTimeout(async () => {
      await BleClient.stopLEScan();
    }, 5000);

    return devices;
  }

  async connect(deviceId: string): Promise<void> {
    await BleClient.connect(deviceId, (disconnectedDeviceId) => {
      console.log(`Device ${disconnectedDeviceId} disconnected`);
      this.device = null;
    });
    const result = await BleClient.getServices(deviceId);
    this.device = { deviceId, services: result };

    await BleClient.startNotifications(
      deviceId,
      SERVICE_UUID,
      MESSAGE_CHARACTERISTIC_UUID,
      (value) => {
        const messageString = dataViewToText(value);
        try {
          const message: BluetoothMessage = JSON.parse(messageString);
          this.messageHandlers.forEach(handler => handler(message));
        } catch (e) {
          console.error("Error parsing bluetooth message", e);
        }
      }
    );
  }

  async disconnect(): Promise<void> {
    if (this.device) {
      await BleClient.disconnect(this.device.deviceId);
      this.device = null;
    }
  }

  addMessageHandler(id: string, handler: (message: BluetoothMessage) => void): void {
    this.messageHandlers.set(id, handler);
  }

  removeMessageHandler(id: string): void {
    this.messageHandlers.delete(id);
  }

  async sendMessage(message: BluetoothMessage): Promise<void> {
    if (this.device) {
      const messageString = JSON.stringify(message);
      const data = textToDataView(messageString);
      await BleClient.write(this.device.deviceId, SERVICE_UUID, MESSAGE_CHARACTERISTIC_UUID, data);
    }
  }
}

export const bluetoothClientService = new BluetoothClientService();
