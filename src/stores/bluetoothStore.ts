import { create } from 'zustand';
import { Capacitor } from '@capacitor/core';
import { bluetoothService, formatBluetoothError } from '../services/bluetooth';
import { nativeBluetoothService, shouldUseNativeBluetooth, NativeBluetoothDevice } from '../services/bluetooth-native';

interface BluetoothState {
  device: any | null;
  deviceInfo: { name: string; mac: string; id: string; fullName: string; rssi?: number } | null;
  isConnected: boolean;
  isConnecting: boolean;
  isScanning: boolean;
  availableDevices: any[];
  error: string | null;
  isNative: boolean;
  initializeBluetoothState: () => Promise<void>;
  scanForDevices: () => Promise<void>;
  connectToDevice: (deviceId?: string) => Promise<void>;
  disconnectDevice: () => Promise<void>;
  clearError: () => void;
  sendDiceRoll: (diceType: string, results: number[], modifier?: number) => Promise<void>;
  sendCharacterUpdate: (characterId: string, updates: any) => Promise<void>;
  sendShopPurchase: (characterId: string, items: any[], totalCost: any) => Promise<void>;
}

export const useBluetoothStore = create<BluetoothState>((set, get) => ({
  device: null,
  deviceInfo: null,
  isConnected: false,
  isConnecting: false,
  isScanning: false,
  availableDevices: [],
  error: null,
  isNative: shouldUseNativeBluetooth(),

  initializeBluetoothState: async () => {
    const isNative = shouldUseNativeBluetooth();
    console.log('🔵 Initializing Bluetooth state, native:', isNative);
    
    set({
      device: null,
      deviceInfo: null,
      isConnected: false,
      isConnecting: false,
      isScanning: false,
      availableDevices: [],
      error: null,
      isNative
    });

    if (isNative) {
      try {
        await nativeBluetoothService.initialize();
        
        // Try to reconnect to last device
        const lastDevice = await nativeBluetoothService.getLastConnectedDevice();
        if (lastDevice && Date.now() - lastDevice.timestamp < 24 * 60 * 60 * 1000) { // Within 24 hours
          console.log('🔄 Attempting to reconnect to last device:', lastDevice.name);
          try {
            await get().connectToDevice(lastDevice.id);
          } catch (error) {
            console.warn('Could not reconnect to last device:', error);
          }
        }
      } catch (error) {
        console.error('Error initializing native Bluetooth:', error);
        set({ error: 'Error al inicializar Bluetooth nativo' });
      }
    } else {
      // Web Bluetooth fallback
      if (!navigator.bluetooth) {
        set({ error: 'Bluetooth no compatible con este navegador' });
        return;
      }
    }
  },

  scanForDevices: async () => {
    const { isNative } = get();
    
    try {
      set({ isScanning: true, error: null, availableDevices: [] });

      if (isNative) {
        console.log('🔍 Scanning with native Bluetooth...');
        const devices = await nativeBluetoothService.scanForDevices(10000);
        
        const formattedDevices = devices.map(device => ({
          ...device,
          fullName: device.name,
          mac: device.macAddress || 'No disponible'
        }));

        set({ 
          availableDevices: formattedDevices,
          isScanning: false 
        });

        console.log(`✅ Found ${devices.length} D&D devices`);
      } else {
        // Web Bluetooth scanning is limited, so we'll just prepare for connection
        set({ 
          availableDevices: [],
          isScanning: false 
        });
        console.log('ℹ️ Web Bluetooth requires user interaction to select devices');
      }
    } catch (error) {
      console.error('Error scanning for devices:', error);
      set({
        isScanning: false,
        error: formatBluetoothError(error),
        availableDevices: []
      });
    }
  },

  connectToDevice: async (deviceId?: string) => {
    const { isNative } = get();
    
    try {
      set({ isConnecting: true, error: null });

      if (isNative) {
        console.log('🔗 Connecting with native Bluetooth...');
        
        let targetDeviceId = deviceId;
        
        // If no device ID provided, scan and let user choose
        if (!targetDeviceId) {
          const devices = await nativeBluetoothService.scanForDevices(10000);
          if (devices.length === 0) {
            throw new Error('No se encontraron dispositivos D&D cercanos');
          }
          
          // For now, connect to the first device found
          // In a real app, you'd show a selection dialog
          targetDeviceId = devices[0].id;
          console.log('📱 Auto-selecting first device:', devices[0].name);
        }

        const device = await nativeBluetoothService.connectToDevice(targetDeviceId);
        const deviceInfo = {
          name: device.name,
          mac: device.macAddress || 'No disponible',
          id: device.id,
          fullName: device.name,
          rssi: device.rssi
        };

        set({
          device,
          deviceInfo,
          isConnected: true,
          isConnecting: false,
          error: null
        });

        console.log('✅ Connected to native device:', device.name);
      } else {
        // Web Bluetooth fallback
        console.log('🔗 Connecting with Web Bluetooth...');
        
        const device = await bluetoothService.requestDevice();
        if (!device) {
          set({ isConnecting: false });
          return;
        }

        await bluetoothService.connect();
        const deviceInfo = bluetoothService.getDeviceInfo();
        
        set({
          device,
          deviceInfo,
          isConnected: bluetoothService.isConnected(),
          isConnecting: false,
          error: null
        });

        console.log('✅ Connected to web device:', deviceInfo?.name);
      }
    } catch (error) {
      console.error('Bluetooth connection error:', error);
      
      // Check if the error is due to user cancellation
      if (error instanceof Error && (error.name === 'NotFoundError' || error.message.includes('cancelled'))) {
        console.info('User cancelled Bluetooth device selection');
        set({
          isConnecting: false,
          error: null
        });
      } else {
        const errorMessage = formatBluetoothError(error);
        set({
          isConnecting: false,
          error: errorMessage,
          device: null,
          deviceInfo: null,
          isConnected: false
        });
      }
    }
  },

  disconnectDevice: async () => {
    const { isNative } = get();
    
    try {
      if (isNative) {
        await nativeBluetoothService.disconnect();
      } else {
        await bluetoothService.disconnect();
      }
      
      set({
        device: null,
        deviceInfo: null,
        isConnected: false,
        error: null
      });
      
      console.log('✅ Disconnected successfully');
    } catch (error) {
      console.error('Disconnect error:', error);
      set({ error: formatBluetoothError(error) });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  sendDiceRoll: async (diceType: string, results: number[], modifier: number = 0) => {
    const { isNative, isConnected } = get();
    
    if (!isConnected) {
      throw new Error('No hay dispositivo conectado');
    }

    try {
      if (isNative) {
        await nativeBluetoothService.sendDiceRoll(diceType, results, modifier);
      } else {
        const total = results.reduce((sum, result) => sum + result, 0) + modifier;
        await bluetoothService.sendDiceRoll(diceType, total, modifier);
      }
      
      console.log('📤 Dice roll sent:', diceType, results, modifier);
    } catch (error) {
      console.error('Error sending dice roll:', error);
      throw error;
    }
  },

  sendCharacterUpdate: async (characterId: string, updates: any) => {
    const { isNative, isConnected } = get();
    
    if (!isConnected) {
      throw new Error('No hay dispositivo conectado');
    }

    try {
      if (isNative) {
        await nativeBluetoothService.sendCharacterUpdate(characterId, updates);
      } else {
        await bluetoothService.sendCharacterUpdate(characterId, updates);
      }
      
      console.log('📤 Character update sent:', characterId);
    } catch (error) {
      console.error('Error sending character update:', error);
      throw error;
    }
  },

  sendShopPurchase: async (characterId: string, items: any[], totalCost: any) => {
    const { isNative, isConnected } = get();
    
    if (!isConnected) {
      throw new Error('No hay dispositivo conectado');
    }

    try {
      if (isNative) {
        await nativeBluetoothService.sendShopPurchase(characterId, items, totalCost);
      } else {
        await bluetoothService.sendShopPurchase(characterId, items, totalCost);
      }
      
      console.log('📤 Shop purchase sent:', characterId, items.length, 'items');
    } catch (error) {
      console.error('Error sending shop purchase:', error);
      throw error;
    }
  }
}));