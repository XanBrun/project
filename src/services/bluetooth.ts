// Bluetooth service for D&D application
export interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
}

export interface BluetoothMessage {
  type: 'dice_roll' | 'character_update' | 'campaign_event' | 'chat_message' | 'shop_purchase';
  data: any;
  timestamp: number;
  senderId: string;
}

class BluetoothService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private messageHandlers: Map<string, (message: BluetoothMessage) => void> = new Map();

  // Service and characteristic UUIDs for D&D app
  private readonly SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
  private readonly CHARACTERISTIC_UUID = '87654321-4321-4321-4321-cba987654321';

  async isSupported(): Promise<boolean> {
    return 'bluetooth' in navigator && 'requestDevice' in navigator.bluetooth;
  }

  async requestDevice(): Promise<BluetoothDevice | null> {
    try {
      if (!await this.isSupported()) {
        throw new Error('Bluetooth is not supported in this browser');
      }

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [this.SERVICE_UUID]
      });

      this.device = {
        id: device.id,
        name: device.name || 'Unknown Device',
        connected: false
      };

      device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));

      return this.device;
    } catch (error) {
      console.error('Error requesting Bluetooth device:', error);
      throw error;
    }
  }

  async connect(): Promise<void> {
    if (!this.device) {
      throw new Error('No device selected. Call requestDevice() first.');
    }

    try {
      const devices = await navigator.bluetooth.getDevices();
      const device = devices.find(d => d.id === this.device!.id);

      if (!device) {
        throw new Error('Device not found');
      }

      this.server = await device.gatt!.connect();
      this.device.connected = true;
      
      // Try to get the service and characteristic
      try {
        const service = await this.server.getPrimaryService(this.SERVICE_UUID);
        this.characteristic = await service.getCharacteristic(this.CHARACTERISTIC_UUID);
        
        // Start notifications
        await this.characteristic.startNotifications();
        this.characteristic.addEventListener('characteristicvaluechanged', this.handleNotification.bind(this));
      } catch (serviceError) {
        console.warn('Could not connect to D&D service, using basic connection:', serviceError);
      }
      
      console.log('Connected to Bluetooth device:', this.device.name);
    } catch (error) {
      console.error('Error connecting to Bluetooth device:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.server && this.server.connected) {
      this.server.disconnect();
    }
    this.onDisconnected();
  }

  private onDisconnected(): void {
    if (this.device) {
      this.device.connected = false;
    }
    this.server = null;
    this.characteristic = null;
    console.log('Disconnected from Bluetooth device');
  }

  private handleNotification(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    
    if (value) {
      try {
        const decoder = new TextDecoder();
        const messageStr = decoder.decode(value);
        const message: BluetoothMessage = JSON.parse(messageStr);
        
        // Notify all registered handlers
        this.messageHandlers.forEach(handler => {
          try {
            handler(message);
          } catch (error) {
            console.error('Error in message handler:', error);
          }
        });
      } catch (error) {
        console.error('Error parsing Bluetooth message:', error);
      }
    }
  }

  async sendMessage(message: BluetoothMessage): Promise<void> {
    if (!this.characteristic) {
      console.warn('No characteristic available, message not sent:', message);
      return;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(message));
      await this.characteristic.writeValue(data);
    } catch (error) {
      console.error('Error sending Bluetooth message:', error);
      throw error;
    }
  }

  addMessageHandler(id: string, handler: (message: BluetoothMessage) => void): void {
    this.messageHandlers.set(id, handler);
  }

  removeMessageHandler(id: string): void {
    this.messageHandlers.delete(id);
  }

  getDevice(): BluetoothDevice | null {
    return this.device;
  }

  isConnected(): boolean {
    return this.device?.connected || false;
  }

  // Convenience methods for D&D specific messages
  async sendDiceRoll(diceType: string, result: number, modifier: number = 0): Promise<void> {
    const message: BluetoothMessage = {
      type: 'dice_roll',
      data: { diceType, result, modifier, total: result + modifier },
      timestamp: Date.now(),
      senderId: this.device?.id || 'unknown'
    };
    
    await this.sendMessage(message);
    console.log(`Dice roll sent: ${diceType} = ${result} + ${modifier} = ${result + modifier}`);
  }

  async sendCharacterUpdate(characterId: string, updates: any): Promise<void> {
    const message: BluetoothMessage = {
      type: 'character_update',
      data: { characterId, updates },
      timestamp: Date.now(),
      senderId: this.device?.id || 'unknown'
    };
    
    await this.sendMessage(message);
    console.log('Character update sent:', characterId, updates);
  }

  async sendShopPurchase(characterId: string, items: any[], totalCost: any): Promise<void> {
    const message: BluetoothMessage = {
      type: 'shop_purchase',
      data: { characterId, items, totalCost },
      timestamp: Date.now(),
      senderId: this.device?.id || 'unknown'
    };
    
    await this.sendMessage(message);
    console.log('Shop purchase sent:', characterId, items, totalCost);
  }

  async sendCampaignEvent(eventType: string, eventData: any): Promise<void> {
    const message: BluetoothMessage = {
      type: 'campaign_event',
      data: { eventType, eventData },
      timestamp: Date.now(),
      senderId: this.device?.id || 'unknown'
    };
    
    await this.sendMessage(message);
    console.log('Campaign event sent:', eventType, eventData);
  }
}

// Export singleton instance
export const bluetoothService = new BluetoothService();

export const formatBluetoothError = (error: any): string => {
  if (error.name === 'NotFoundError') {
    return 'No Bluetooth device was selected.';
  } else if (error.name === 'SecurityError') {
    return 'Bluetooth access was denied.';
  } else if (error.name === 'NotSupportedError') {
    return 'Bluetooth is not supported on this device.';
  } else if (error.name === 'NetworkError') {
    return 'Failed to connect to the Bluetooth device.';
  } else if (error.name === 'InvalidStateError') {
    return 'Bluetooth adapter is not available.';
  } else if (error.name === 'NotAllowedError') {
    return 'Bluetooth permission was denied.';
  } else {
    return error.message || 'An unknown Bluetooth error occurred.';
  }
};

// Utility function to check if device supports Bluetooth
export const checkBluetoothSupport = (): { supported: boolean; message: string } => {
  if (!navigator.bluetooth) {
    return {
      supported: false,
      message: 'Web Bluetooth API is not supported in this browser. Please use Chrome, Edge, or Opera.'
    };
  }

  // Check if we're in a secure context (HTTPS or localhost)
  if (!window.isSecureContext) {
    return {
      supported: false,
      message: 'Web Bluetooth requires a secure context (HTTPS). Please use HTTPS or localhost.'
    };
  }

  return {
    supported: true,
    message: 'Bluetooth is supported and ready to use.'
  };
};