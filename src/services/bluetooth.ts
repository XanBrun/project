// Bluetooth service for D&D application using Web Bluetooth API
export interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
  macAddress?: string;
  deviceName?: string;
  advertisementName?: string;
}

export interface BluetoothMessage {
  type: 'dice_roll' | 'character_update' | 'campaign_event' | 'chat_message' | 'shop_purchase';
  data: any;
  timestamp: number;
  senderId: string;
}

class BluetoothService {
  private device: BluetoothDevice | null = null;
  private nativeDevice: BluetoothDevice | null = null;
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

      const nativeDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [this.SERVICE_UUID]
      });

      // Store the native device reference
      this.nativeDevice = nativeDevice as any;

      // Extract comprehensive device information
      const deviceName = nativeDevice.name || 'Dispositivo Desconocido';
      const deviceId = nativeDevice.id || 'unknown-id';
      
      // Try to get MAC address and additional device info
      let macAddress = 'No disponible';
      let advertisementName = deviceName;
      
      try {
        // Some browsers might expose the MAC address in the device ID
        if (deviceId.includes(':') && deviceId.length >= 17) {
          macAddress = deviceId.toUpperCase();
        } else if (nativeDevice.id && nativeDevice.id.length >= 12) {
          // Format as MAC address if it looks like one
          const id = nativeDevice.id.replace(/[^a-fA-F0-9]/g, '');
          if (id.length >= 12) {
            macAddress = id.substring(0, 12).match(/.{2}/g)?.join(':').toUpperCase() || 'No disponible';
          }
        }

        // Try to get advertisement data if available
        if ('watchAdvertisements' in nativeDevice) {
          try {
            await nativeDevice.watchAdvertisements();
            nativeDevice.addEventListener('advertisementreceived', (event: any) => {
              if (event.name && event.name !== deviceName) {
                advertisementName = event.name;
                // Update stored device info
                if (this.device) {
                  this.device.advertisementName = advertisementName;
                }
              }
            });
          } catch (advError) {
            console.warn('Could not watch advertisements:', advError);
          }
        }
      } catch (error) {
        console.warn('Could not extract additional device info:', error);
      }

      this.device = {
        id: deviceId,
        name: deviceName,
        connected: false,
        macAddress: macAddress,
        deviceName: deviceName,
        advertisementName: advertisementName
      };

      nativeDevice.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));

      console.log('Device selected:', {
        name: deviceName,
        id: deviceId,
        mac: macAddress,
        advertisementName: advertisementName
      });

      return this.device;
    } catch (error) {
      console.error('Error requesting Bluetooth device:', error);
      throw error; // Re-throw the original error to preserve error details
    }
  }

  async connect(): Promise<void> {
    if (!this.device || !this.nativeDevice) {
      throw new Error('No device selected. Call requestDevice() first.');
    }

    try {
      // For reconnection, try to get the device again
      let deviceToConnect = this.nativeDevice;
      
      if (!deviceToConnect.gatt) {
        // Try to get devices and find our device
        try {
          const devices = await navigator.bluetooth.getDevices();
          deviceToConnect = devices.find(d => d.id === this.device!.id);
          
          if (!deviceToConnect) {
            throw new Error('Device not found for reconnection. Please select the device again.');
          }
          
          this.nativeDevice = deviceToConnect as any;
        } catch (getDevicesError) {
          throw new Error('Unable to retrieve previously paired devices. Please select the device again.');
        }
      }

      // Check if GATT server is available
      if (!deviceToConnect.gatt) {
        throw new Error('Device does not support GATT server connection.');
      }

      console.log('Attempting to connect to GATT server...');
      this.server = await deviceToConnect.gatt.connect();
      
      if (!this.server || !this.server.connected) {
        throw new Error('Failed to establish GATT server connection.');
      }

      this.device.connected = true;
      
      // Try to get the service and characteristic
      try {
        console.log('Attempting to get primary service...');
        const service = await this.server.getPrimaryService(this.SERVICE_UUID);
        this.characteristic = await service.getCharacteristic(this.CHARACTERISTIC_UUID);
        
        // Start notifications
        await this.characteristic.startNotifications();
        this.characteristic.addEventListener('characteristicvaluechanged', this.handleNotification.bind(this));
        
        console.log('Connected to D&D service successfully');
      } catch (serviceError) {
        console.warn('Could not connect to D&D service, using basic connection:', serviceError);
        // This is not a fatal error - we can still use basic Bluetooth connection
      }
      
      console.log('Connected to Bluetooth device:', {
        name: this.device.deviceName,
        advertisementName: this.device.advertisementName,
        mac: this.device.macAddress,
        id: this.device.id
      });
    } catch (error) {
      console.error('Error connecting to Bluetooth device:', error);
      
      // Clean up on connection failure
      this.server = null;
      this.characteristic = null;
      if (this.device) {
        this.device.connected = false;
      }
      
      // Re-throw with more specific error information
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(`Connection failed: ${error}`);
      }
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
    console.log('Disconnected from Bluetooth device:', this.device?.deviceName || 'Unknown');
  }

  private handleNotification(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    
    if (value) {
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

  getDevice(): BluetoothDevice | null {
    return this.device;
  }

  getDeviceInfo(): { name: string; mac: string; id: string; fullName: string } | null {
    if (!this.device) return null;
    
    // Determine the best name to show
    const displayName = this.device.advertisementName || this.device.deviceName || this.device.name;
    const fullName = this.device.advertisementName && this.device.advertisementName !== this.device.deviceName 
      ? `${this.device.deviceName} (${this.device.advertisementName})`
      : displayName;
    
    return {
      name: displayName,
      mac: this.device.macAddress || 'No disponible',
      id: this.device.id,
      fullName: fullName
    };
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
  if (!error) {
    return 'Error desconocido de Bluetooth.';
  }

  // Handle different error types
  if (error.name === 'NotFoundError') {
    return 'No se seleccionó ningún dispositivo Bluetooth.';
  } else if (error.name === 'SecurityError') {
    return 'Se denegó el acceso a Bluetooth. Verifica los permisos del navegador.';
  } else if (error.name === 'NotSupportedError') {
    return 'Bluetooth no es compatible con este dispositivo o navegador.';
  } else if (error.name === 'NetworkError') {
    return 'Error de red al conectar con el dispositivo Bluetooth. Verifica que el dispositivo esté encendido y cerca.';
  } else if (error.name === 'InvalidStateError') {
    return 'El adaptador Bluetooth no está disponible. Verifica que Bluetooth esté activado.';
  } else if (error.name === 'NotAllowedError') {
    return 'Se denegó el permiso de Bluetooth. Permite el acceso a Bluetooth en la configuración del navegador.';
  } else if (error.name === 'AbortError') {
    return 'La operación de Bluetooth fue cancelada.';
  } else if (error.name === 'TimeoutError') {
    return 'Tiempo de espera agotado al conectar con el dispositivo Bluetooth.';
  } else if (error.message) {
    // Handle custom error messages
    if (error.message.includes('User cancelled')) {
      return 'Selección de dispositivo cancelada por el usuario.';
    } else if (error.message.includes('not found for reconnection')) {
      return 'Dispositivo no encontrado para reconexión. Selecciona el dispositivo nuevamente.';
    } else if (error.message.includes('GATT server')) {
      return 'No se pudo conectar al servidor GATT del dispositivo. Verifica que el dispositivo sea compatible.';
    } else if (error.message.includes('Connection failed')) {
      return 'Falló la conexión con el dispositivo. Verifica que esté encendido y en rango.';
    } else {
      return `Error de Bluetooth: ${error.message}`;
    }
  } else {
    return 'Ocurrió un error desconocido de Bluetooth.';
  }
};

// Utility function to check if device supports Bluetooth
export const checkBluetoothSupport = (): { supported: boolean; message: string } => {
  if (!navigator.bluetooth) {
    return {
      supported: false,
      message: 'La API Web Bluetooth no es compatible con este navegador. Por favor usa Chrome, Edge u Opera.'
    };
  }

  // Check if we're in a secure context (HTTPS or localhost)
  if (!window.isSecureContext) {
    return {
      supported: false,
      message: 'Web Bluetooth requiere un contexto seguro (HTTPS). Por favor usa HTTPS o localhost.'
    };
  }

  return {
    supported: true,
    message: 'Bluetooth es compatible y está listo para usar.'
  };
};