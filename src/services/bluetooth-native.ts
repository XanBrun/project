// Native Bluetooth service for mobile using Capacitor Bluetooth LE
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { 
  BleClient, 
  BleDevice, 
  numbersToDataView, 
  dataViewToNumbers,
  ScanResult 
} from '@capacitor-community/bluetooth-le';

export interface NativeBluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
  macAddress?: string;
  deviceName?: string;
  rssi?: number;
  manufacturerData?: string;
  serviceUuids?: string[];
}

export interface NativeBluetoothMessage {
  type: 'dice_roll' | 'character_update' | 'campaign_event' | 'chat_message' | 'shop_purchase' | 'combat_action';
  data: any;
  timestamp: number;
  senderId: string;
  deviceName?: string;
}

class NativeBluetoothService {
  private device: NativeBluetoothDevice | null = null;
  private bleDevice: BleDevice | null = null;
  private isScanning = false;
  private messageHandlers: Map<string, (message: NativeBluetoothMessage) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectTimer: NodeJS.Timeout | null = null;

  // D&D Service UUIDs
  private readonly DND_SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
  private readonly DND_CHARACTERISTIC_UUID = '87654321-4321-4321-4321-cba987654321';
  private readonly DND_DEVICE_NAME_PREFIX = 'DnD';

  async initialize(): Promise<void> {
    try {
      console.log('🔵 Initializing native Bluetooth service...');
      
      // Check if we're on a native platform
      if (!Capacitor.isNativePlatform()) {
        throw new Error('Native Bluetooth only available on mobile platforms');
      }

      // Get device info
      const deviceInfo = await Device.getInfo();
      console.log('📱 Device info:', deviceInfo);

      // Check network status
      const networkStatus = await Network.getStatus();
      console.log('🌐 Network status:', networkStatus);

      // Initialize BLE client
      await BleClient.initialize({
        androidNeverForLocation: true
      });

      console.log('✅ Native Bluetooth service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing native Bluetooth:', error);
      throw error;
    }
  }

  async isBluetoothEnabled(): Promise<boolean> {
    try {
      await BleClient.isEnabled();
      return true;
    } catch (error) {
      console.warn('Bluetooth not enabled:', error);
      return false;
    }
  }

  async enableBluetooth(): Promise<void> {
    try {
      await BleClient.enable();
      console.log('✅ Bluetooth enabled');
    } catch (error) {
      console.error('❌ Error enabling Bluetooth:', error);
      throw new Error('No se pudo activar Bluetooth. Por favor, actívalo manualmente en la configuración.');
    }
  }

  async requestPermissions(): Promise<void> {
    try {
      console.log('🔐 Requesting Bluetooth permissions...');
      
      await BleClient.requestLEScan();
      console.log('✅ Bluetooth permissions granted');
    } catch (error) {
      console.error('❌ Bluetooth permissions denied:', error);
      throw new Error('Se requieren permisos de Bluetooth para conectar dispositivos. Por favor, otorga los permisos en la configuración.');
    }
  }

  async scanForDevices(timeoutMs: number = 10000): Promise<NativeBluetoothDevice[]> {
    try {
      console.log('🔍 Scanning for D&D devices...');
      
      // Check if Bluetooth is enabled
      if (!await this.isBluetoothEnabled()) {
        await this.enableBluetooth();
      }

      // Request permissions
      await this.requestPermissions();

      const devices: NativeBluetoothDevice[] = [];
      this.isScanning = true;

      // Start scanning
      await BleClient.requestLEScan(
        {
          services: [], // Scan for all devices
          allowDuplicates: false,
          scanMode: 'lowPower'
        },
        (result: ScanResult) => {
          console.log('📡 Device found:', result);
          
          // Filter for D&D devices or devices with our service
          const deviceName = result.device.name || result.localName || 'Unknown Device';
          const hasOurService = result.device.uuids?.includes(this.DND_SERVICE_UUID);
          const isDnDDevice = deviceName.toLowerCase().includes('dnd') || 
                             deviceName.toLowerCase().includes('d&d') ||
                             deviceName.toLowerCase().includes('dragon') ||
                             hasOurService;

          if (isDnDDevice || hasOurService) {
            const device: NativeBluetoothDevice = {
              id: result.device.deviceId,
              name: deviceName,
              connected: false,
              macAddress: this.extractMacAddress(result.device.deviceId),
              deviceName: result.device.name,
              rssi: result.rssi,
              manufacturerData: result.manufacturerData ? this.formatManufacturerData(result.manufacturerData) : undefined,
              serviceUuids: result.device.uuids
            };

            // Avoid duplicates
            if (!devices.find(d => d.id === device.id)) {
              devices.push(device);
              console.log('✅ D&D device added:', device.name);
            }
          }
        }
      );

      // Stop scanning after timeout
      setTimeout(async () => {
        if (this.isScanning) {
          await this.stopScanning();
        }
      }, timeoutMs);

      // Wait for scan to complete
      await new Promise(resolve => setTimeout(resolve, timeoutMs));

      console.log(`🔍 Scan completed. Found ${devices.length} D&D devices`);
      return devices;
    } catch (error) {
      console.error('❌ Error scanning for devices:', error);
      await this.stopScanning();
      throw this.formatBluetoothError(error);
    }
  }

  async stopScanning(): Promise<void> {
    try {
      if (this.isScanning) {
        await BleClient.stopLEScan();
        this.isScanning = false;
        console.log('⏹️ Scanning stopped');
      }
    } catch (error) {
      console.warn('Warning stopping scan:', error);
    }
  }

  async connectToDevice(deviceId: string): Promise<NativeBluetoothDevice> {
    try {
      console.log('🔗 Connecting to device:', deviceId);

      // Stop scanning if active
      await this.stopScanning();

      // Connect to device
      await BleClient.connect(deviceId, (deviceId) => {
        console.log('📱 Device disconnected:', deviceId);
        this.onDeviceDisconnected();
      });

      // Get device info
      const services = await BleClient.getServices(deviceId);
      console.log('🔧 Device services:', services);

      // Try to find our D&D service
      let hasOurService = false;
      for (const service of services) {
        if (service.uuid === this.DND_SERVICE_UUID) {
          hasOurService = true;
          
          // Subscribe to notifications
          try {
            await BleClient.startNotifications(
              deviceId,
              this.DND_SERVICE_UUID,
              this.DND_CHARACTERISTIC_UUID,
              (value) => {
                this.handleNotification(value);
              }
            );
            console.log('🔔 Subscribed to D&D notifications');
          } catch (notificationError) {
            console.warn('⚠️ Could not subscribe to notifications:', notificationError);
          }
          break;
        }
      }

      // Create device object
      this.device = {
        id: deviceId,
        name: `D&D Device ${deviceId.substring(0, 8)}`,
        connected: true,
        macAddress: this.extractMacAddress(deviceId),
        serviceUuids: services.map(s => s.uuid)
      };

      this.bleDevice = { deviceId };
      this.reconnectAttempts = 0;

      // Save connected device for auto-reconnect
      await this.saveConnectedDevice(this.device);

      console.log('✅ Connected to D&D device:', this.device.name);
      return this.device;
    } catch (error) {
      console.error('❌ Error connecting to device:', error);
      throw this.formatBluetoothError(error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.bleDevice) {
        console.log('🔌 Disconnecting from device...');
        
        // Stop notifications
        try {
          await BleClient.stopNotifications(
            this.bleDevice.deviceId,
            this.DND_SERVICE_UUID,
            this.DND_CHARACTERISTIC_UUID
          );
        } catch (error) {
          console.warn('Warning stopping notifications:', error);
        }

        // Disconnect
        await BleClient.disconnect(this.bleDevice.deviceId);
        
        this.onDeviceDisconnected();
        console.log('✅ Disconnected successfully');
      }
    } catch (error) {
      console.error('❌ Error disconnecting:', error);
      this.onDeviceDisconnected();
    }
  }

  private onDeviceDisconnected(): void {
    if (this.device) {
      this.device.connected = false;
    }
    this.bleDevice = null;
    
    // Clear reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Attempt auto-reconnect
    this.attemptReconnect();
  }

  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts || !this.device) {
      console.log('🔄 Max reconnect attempts reached or no device to reconnect');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connectToDevice(this.device!.id);
        console.log('✅ Reconnected successfully');
      } catch (error) {
        console.warn('⚠️ Reconnect failed:', error);
        this.attemptReconnect();
      }
    }, 2000 * this.reconnectAttempts); // Exponential backoff
  }

  async sendMessage(message: NativeBluetoothMessage): Promise<void> {
    if (!this.bleDevice || !this.device?.connected) {
      throw new Error('No hay dispositivo conectado para enviar el mensaje');
    }

    try {
      // Add device info to message
      const messageWithDevice = {
        ...message,
        deviceName: this.device.name,
        timestamp: Date.now()
      };

      const messageString = JSON.stringify(messageWithDevice);
      const data = new TextEncoder().encode(messageString);
      const dataView = numbersToDataView(Array.from(data));

      await BleClient.write(
        this.bleDevice.deviceId,
        this.DND_SERVICE_UUID,
        this.DND_CHARACTERISTIC_UUID,
        dataView
      );

      console.log('📤 Message sent:', message.type);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw new Error('Error al enviar mensaje por Bluetooth');
    }
  }

  private handleNotification(value: DataView): void {
    try {
      const data = new Uint8Array(value.buffer);
      const messageString = new TextDecoder().decode(data);
      const message: NativeBluetoothMessage = JSON.parse(messageString);

      console.log('📥 Message received:', message.type);

      // Notify all handlers
      this.messageHandlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    } catch (error) {
      console.error('Error parsing notification:', error);
    }
  }

  addMessageHandler(id: string, handler: (message: NativeBluetoothMessage) => void): void {
    this.messageHandlers.set(id, handler);
  }

  removeMessageHandler(id: string): void {
    this.messageHandlers.delete(id);
  }

  getDevice(): NativeBluetoothDevice | null {
    return this.device;
  }

  isConnected(): boolean {
    return this.device?.connected || false;
  }

  // Utility methods
  private extractMacAddress(deviceId: string): string {
    // Try to extract MAC address from device ID
    if (deviceId.includes(':') && deviceId.length >= 17) {
      return deviceId.toUpperCase();
    }
    
    // Format as MAC-like address
    const cleanId = deviceId.replace(/[^a-fA-F0-9]/g, '');
    if (cleanId.length >= 12) {
      return cleanId.substring(0, 12).match(/.{2}/g)?.join(':').toUpperCase() || 'No disponible';
    }
    
    return 'No disponible';
  }

  private formatManufacturerData(data: DataView): string {
    const bytes = dataViewToNumbers(data);
    return bytes.map(b => b.toString(16).padStart(2, '0')).join(' ').toUpperCase();
  }

  private async saveConnectedDevice(device: NativeBluetoothDevice): Promise<void> {
    try {
      await Preferences.set({
        key: 'lastConnectedDevice',
        value: JSON.stringify({
          id: device.id,
          name: device.name,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.warn('Could not save connected device:', error);
    }
  }

  async getLastConnectedDevice(): Promise<{ id: string; name: string; timestamp: number } | null> {
    try {
      const result = await Preferences.get({ key: 'lastConnectedDevice' });
      return result.value ? JSON.parse(result.value) : null;
    } catch (error) {
      console.warn('Could not get last connected device:', error);
      return null;
    }
  }

  private formatBluetoothError(error: any): Error {
    if (typeof error === 'string') {
      return new Error(error);
    }
    
    if (error?.message) {
      // Common Bluetooth errors
      if (error.message.includes('not enabled')) {
        return new Error('Bluetooth no está activado. Por favor, actívalo en la configuración.');
      } else if (error.message.includes('permission')) {
        return new Error('Se requieren permisos de Bluetooth. Por favor, otorga los permisos en la configuración.');
      } else if (error.message.includes('not found')) {
        return new Error('Dispositivo no encontrado. Asegúrate de que esté encendido y cerca.');
      } else if (error.message.includes('timeout')) {
        return new Error('Tiempo de conexión agotado. Intenta de nuevo.');
      } else {
        return new Error(`Error de Bluetooth: ${error.message}`);
      }
    }
    
    return new Error('Error desconocido de Bluetooth');
  }

  // Convenience methods for D&D messages
  async sendDiceRoll(diceType: string, results: number[], modifier: number = 0): Promise<void> {
    const total = results.reduce((sum, result) => sum + result, 0) + modifier;
    const message: NativeBluetoothMessage = {
      type: 'dice_roll',
      data: { diceType, results, modifier, total },
      timestamp: Date.now(),
      senderId: this.device?.id || 'unknown'
    };
    
    await this.sendMessage(message);
  }

  async sendCharacterUpdate(characterId: string, updates: any): Promise<void> {
    const message: NativeBluetoothMessage = {
      type: 'character_update',
      data: { characterId, updates },
      timestamp: Date.now(),
      senderId: this.device?.id || 'unknown'
    };
    
    await this.sendMessage(message);
  }

  async sendShopPurchase(characterId: string, items: any[], totalCost: any): Promise<void> {
    const message: NativeBluetoothMessage = {
      type: 'shop_purchase',
      data: { characterId, items, totalCost },
      timestamp: Date.now(),
      senderId: this.device?.id || 'unknown'
    };
    
    await this.sendMessage(message);
  }

  async sendCombatAction(action: string, participantId: string, data: any): Promise<void> {
    const message: NativeBluetoothMessage = {
      type: 'combat_action',
      data: { action, participantId, ...data },
      timestamp: Date.now(),
      senderId: this.device?.id || 'unknown'
    };
    
    await this.sendMessage(message);
  }
}

// Export singleton instance
export const nativeBluetoothService = new NativeBluetoothService();

// Check if we should use native Bluetooth
export const shouldUseNativeBluetooth = (): boolean => {
  return Capacitor.isNativePlatform();
};