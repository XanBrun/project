import { BleClient, BleDevice, numbersToDataView, dataViewToNumbers } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';

export interface BluetoothDeviceNative {
  id: string;
  name: string;
  connected: boolean;
  macAddress?: string;
  deviceName?: string;
  rssi?: number;
}

export interface BluetoothMessage {
  type: 'dice_roll' | 'character_update' | 'campaign_event' | 'chat_message' | 'shop_purchase' | 'combat_action';
  data: any;
  timestamp: number;
  senderId: string;
}

class BluetoothNativeService {
  private device: BluetoothDeviceNative | null = null;
  private bleDevice: BleDevice | null = null;
  private isInitialized = false;
  private messageHandlers: Map<string, (message: BluetoothMessage) => void> = new Map();

  // Service and characteristic UUIDs for D&D app
  private readonly SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
  private readonly CHARACTERISTIC_UUID = '87654321-4321-4321-4321-cba987654321';

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (Capacitor.isNativePlatform()) {
        console.log('Initializing native Bluetooth...');
        await BleClient.initialize({
          androidNeverForLocation: true
        });
        this.isInitialized = true;
        console.log('Native Bluetooth initialized successfully');
      } else {
        console.log('Running in web mode, using Web Bluetooth API');
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('Error initializing Bluetooth:', error);
      throw error;
    }
  }

  async isSupported(): Promise<boolean> {
    if (Capacitor.isNativePlatform()) {
      try {
        await this.initialize();
        return true;
      } catch {
        return false;
      }
    } else {
      return 'bluetooth' in navigator && 'requestDevice' in navigator.bluetooth;
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return true; // Web doesn't need explicit permissions
    }

    try {
      await this.initialize();
      
      // Request location permission (required for Bluetooth scanning on Android)
      const permissions = await BleClient.requestPermissions();
      console.log('Bluetooth permissions:', permissions);
      
      return permissions.granted;
    } catch (error) {
      console.error('Error requesting Bluetooth permissions:', error);
      return false;
    }
  }

  async scanForDevices(): Promise<BluetoothDeviceNative[]> {
    await this.initialize();
    
    if (!Capacitor.isNativePlatform()) {
      // Fallback to Web Bluetooth for web platform
      return this.scanWebBluetooth();
    }

    try {
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        throw new Error('Bluetooth permissions not granted');
      }

      console.log('Starting Bluetooth scan...');
      const devices: BluetoothDeviceNative[] = [];

      await BleClient.requestLEScan(
        {
          services: [], // Scan for all devices
          allowDuplicates: false,
          scanMode: 'lowPowerMode'
        },
        (result) => {
          console.log('Device found:', result);
          
          const device: BluetoothDeviceNative = {
            id: result.device.deviceId,
            name: result.device.name || 'Dispositivo Desconocido',
            connected: false,
            macAddress: result.device.deviceId,
            deviceName: result.device.name || 'Dispositivo Desconocido',
            rssi: result.rssi
          };

          // Avoid duplicates
          if (!devices.find(d => d.id === device.id)) {
            devices.push(device);
          }
        }
      );

      // Scan for 10 seconds
      await new Promise(resolve => setTimeout(resolve, 10000));
      await BleClient.stopLEScan();

      console.log('Scan completed. Found devices:', devices.length);
      return devices;
    } catch (error) {
      console.error('Error scanning for devices:', error);
      throw error;
    }
  }

  private async scanWebBluetooth(): Promise<BluetoothDeviceNative[]> {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [this.SERVICE_UUID]
      });

      return [{
        id: device.id,
        name: device.name || 'Dispositivo Web',
        connected: false,
        macAddress: device.id,
        deviceName: device.name || 'Dispositivo Web'
      }];
    } catch (error) {
      console.error('Error with Web Bluetooth:', error);
      throw error;
    }
  }

  async connectToDevice(deviceId: string): Promise<void> {
    await this.initialize();

    if (!Capacitor.isNativePlatform()) {
      // Fallback to Web Bluetooth
      return this.connectWebBluetooth(deviceId);
    }

    try {
      console.log('Connecting to device:', deviceId);
      
      await BleClient.connect(deviceId, (deviceId) => {
        console.log('Device disconnected:', deviceId);
        this.onDisconnected();
      });

      // Store device info
      this.bleDevice = { deviceId };
      this.device = {
        id: deviceId,
        name: 'Dispositivo Conectado',
        connected: true,
        macAddress: deviceId,
        deviceName: 'Dispositivo Conectado'
      };

      console.log('Connected successfully to:', deviceId);

      // Try to discover services and setup notifications
      try {
        const services = await BleClient.getServices(deviceId);
        console.log('Available services:', services);

        // Look for our custom service
        const targetService = services.find(s => s.uuid === this.SERVICE_UUID);
        if (targetService) {
          const characteristic = targetService.characteristics?.find(c => c.uuid === this.CHARACTERISTIC_UUID);
          if (characteristic) {
            // Start notifications
            await BleClient.startNotifications(
              deviceId,
              this.SERVICE_UUID,
              this.CHARACTERISTIC_UUID,
              (value) => {
                this.handleNotification(value);
              }
            );
            console.log('Notifications started for D&D service');
          }
        }
      } catch (serviceError) {
        console.warn('Could not setup D&D service, using basic connection:', serviceError);
      }

    } catch (error) {
      console.error('Error connecting to device:', error);
      throw error;
    }
  }

  private async connectWebBluetooth(deviceId: string): Promise<void> {
    // Implementation for web platform would go here
    console.log('Web Bluetooth connection not implemented in this example');
    throw new Error('Web Bluetooth connection not implemented');
  }

  async disconnect(): Promise<void> {
    if (this.bleDevice && Capacitor.isNativePlatform()) {
      try {
        await BleClient.disconnect(this.bleDevice.deviceId);
      } catch (error) {
        console.error('Error disconnecting:', error);
      }
    }
    this.onDisconnected();
  }

  private onDisconnected(): void {
    if (this.device) {
      this.device.connected = false;
    }
    this.bleDevice = null;
    console.log('Disconnected from Bluetooth device');
  }

  private handleNotification(value: DataView): void {
    try {
      const decoder = new TextDecoder();
      const messageStr = decoder.decode(value);
      const message: BluetoothMessage = JSON.parse(messageStr);
      
      console.log('Received Bluetooth message:', message);

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

  async sendMessage(message: BluetoothMessage): Promise<void> {
    if (!this.bleDevice || !this.device?.connected) {
      console.warn('No device connected, message not sent:', message);
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      console.warn('Web Bluetooth sending not implemented');
      return;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(message));
      const dataView = numbersToDataView(Array.from(data));

      await BleClient.write(
        this.bleDevice.deviceId,
        this.SERVICE_UUID,
        this.CHARACTERISTIC_UUID,
        dataView
      );

      console.log('Message sent successfully:', message.type);
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

  getDevice(): BluetoothDeviceNative | null {
    return this.device;
  }

  getDeviceInfo(): { name: string; mac: string; id: string } | null {
    if (!this.device) return null;
    
    return {
      name: this.device.deviceName || this.device.name,
      mac: this.device.macAddress || 'No disponible',
      id: this.device.id
    };
  }

  isConnected(): boolean {
    return this.device?.connected || false;
  }

  isMobile(): boolean {
    return Capacitor.isNativePlatform();
  }

  // D&D specific message methods
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

  async sendCombatAction(action: string, participantId: string, data: any): Promise<void> {
    const message: BluetoothMessage = {
      type: 'combat_action',
      data: { action, participantId, data },
      timestamp: Date.now(),
      senderId: this.device?.id || 'unknown'
    };
    
    await this.sendMessage(message);
    console.log('Combat action sent:', action, participantId);
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
export const bluetoothNativeService = new BluetoothNativeService();

export const formatBluetoothError = (error: any): string => {
  if (error.message?.includes('permissions')) {
    return 'Permisos de Bluetooth denegados. Por favor, habilita los permisos en la configuración.';
  } else if (error.message?.includes('not supported')) {
    return 'Bluetooth no es compatible con este dispositivo.';
  } else if (error.message?.includes('not enabled')) {
    return 'Bluetooth no está habilitado. Por favor, activa Bluetooth en tu dispositivo.';
  } else if (error.message?.includes('scan')) {
    return 'Error al buscar dispositivos Bluetooth.';
  } else if (error.message?.includes('connect')) {
    return 'Error al conectar con el dispositivo Bluetooth.';
  } else {
    return error.message || 'Ocurrió un error desconocido de Bluetooth.';
  }
};

// Utility function to check if device supports Bluetooth
export const checkBluetoothSupport = async (): Promise<{ supported: boolean; message: string }> => {
  try {
    const service = bluetoothNativeService;
    const supported = await service.isSupported();
    
    if (!supported) {
      return {
        supported: false,
        message: 'Bluetooth no es compatible con este dispositivo.'
      };
    }

    if (service.isMobile()) {
      return {
        supported: true,
        message: 'Bluetooth nativo disponible en dispositivo móvil.'
      };
    } else {
      return {
        supported: true,
        message: 'Web Bluetooth disponible en navegador.'
      };
    }
  } catch (error) {
    return {
      supported: false,
      message: 'Error al verificar compatibilidad de Bluetooth.'
    };
  }
};