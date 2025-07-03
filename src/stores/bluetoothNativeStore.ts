import { create } from 'zustand';
import { bluetoothNativeService, formatBluetoothError, BluetoothDeviceNative } from '../services/bluetooth-native';

interface BluetoothNativeState {
  devices: BluetoothDeviceNative[];
  connectedDevice: BluetoothDeviceNative | null;
  deviceInfo: { name: string; mac: string; id: string } | null;
  isConnected: boolean;
  isConnecting: boolean;
  isScanning: boolean;
  error: string | null;
  isMobile: boolean;
  
  // Actions
  initializeBluetooth: () => Promise<void>;
  scanForDevices: () => Promise<void>;
  connectToDevice: (deviceId: string) => Promise<void>;
  disconnectDevice: () => Promise<void>;
  clearError: () => void;
  
  // Message handlers
  addMessageHandler: (id: string, handler: (message: any) => void) => void;
  removeMessageHandler: (id: string) => void;
  
  // D&D specific actions
  sendDiceRoll: (diceType: string, result: number, modifier?: number) => Promise<void>;
  sendCharacterUpdate: (characterId: string, updates: any) => Promise<void>;
  sendCombatAction: (action: string, participantId: string, data: any) => Promise<void>;
  sendShopPurchase: (characterId: string, items: any[], totalCost: any) => Promise<void>;
  sendCampaignEvent: (eventType: string, eventData: any) => Promise<void>;
}

export const useBluetoothNativeStore = create<BluetoothNativeState>((set, get) => ({
  devices: [],
  connectedDevice: null,
  deviceInfo: null,
  isConnected: false,
  isConnecting: false,
  isScanning: false,
  error: null,
  isMobile: bluetoothNativeService.isMobile(),

  initializeBluetooth: async () => {
    try {
      set({ error: null });
      await bluetoothNativeService.initialize();
      
      // Check if already connected
      const device = bluetoothNativeService.getDevice();
      const deviceInfo = bluetoothNativeService.getDeviceInfo();
      const isConnected = bluetoothNativeService.isConnected();
      
      set({
        connectedDevice: device,
        deviceInfo,
        isConnected,
        isMobile: bluetoothNativeService.isMobile()
      });
      
      console.log('Bluetooth initialized successfully');
    } catch (error) {
      console.error('Error initializing Bluetooth:', error);
      set({ error: formatBluetoothError(error) });
    }
  },

  scanForDevices: async () => {
    try {
      set({ isScanning: true, error: null, devices: [] });
      
      const devices = await bluetoothNativeService.scanForDevices();
      
      set({ 
        devices,
        isScanning: false 
      });
      
      console.log(`Found ${devices.length} devices`);
    } catch (error) {
      console.error('Error scanning for devices:', error);
      set({ 
        isScanning: false,
        error: formatBluetoothError(error)
      });
    }
  },

  connectToDevice: async (deviceId: string) => {
    try {
      set({ isConnecting: true, error: null });
      
      await bluetoothNativeService.connectToDevice(deviceId);
      
      const device = bluetoothNativeService.getDevice();
      const deviceInfo = bluetoothNativeService.getDeviceInfo();
      const isConnected = bluetoothNativeService.isConnected();
      
      set({
        connectedDevice: device,
        deviceInfo,
        isConnected,
        isConnecting: false
      });
      
      console.log('Connected to device:', deviceId);
    } catch (error) {
      console.error('Error connecting to device:', error);
      set({
        isConnecting: false,
        error: formatBluetoothError(error)
      });
    }
  },

  disconnectDevice: async () => {
    try {
      await bluetoothNativeService.disconnect();
      
      set({
        connectedDevice: null,
        deviceInfo: null,
        isConnected: false,
        error: null
      });
      
      console.log('Disconnected from device');
    } catch (error) {
      console.error('Error disconnecting:', error);
      set({ error: formatBluetoothError(error) });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  addMessageHandler: (id: string, handler: (message: any) => void) => {
    bluetoothNativeService.addMessageHandler(id, handler);
  },

  removeMessageHandler: (id: string) => {
    bluetoothNativeService.removeMessageHandler(id);
  },

  // D&D specific actions
  sendDiceRoll: async (diceType: string, result: number, modifier: number = 0) => {
    try {
      await bluetoothNativeService.sendDiceRoll(diceType, result, modifier);
    } catch (error) {
      console.error('Error sending dice roll:', error);
      set({ error: formatBluetoothError(error) });
    }
  },

  sendCharacterUpdate: async (characterId: string, updates: any) => {
    try {
      await bluetoothNativeService.sendCharacterUpdate(characterId, updates);
    } catch (error) {
      console.error('Error sending character update:', error);
      set({ error: formatBluetoothError(error) });
    }
  },

  sendCombatAction: async (action: string, participantId: string, data: any) => {
    try {
      await bluetoothNativeService.sendCombatAction(action, participantId, data);
    } catch (error) {
      console.error('Error sending combat action:', error);
      set({ error: formatBluetoothError(error) });
    }
  },

  sendShopPurchase: async (characterId: string, items: any[], totalCost: any) => {
    try {
      await bluetoothNativeService.sendShopPurchase(characterId, items, totalCost);
    } catch (error) {
      console.error('Error sending shop purchase:', error);
      set({ error: formatBluetoothError(error) });
    }
  },

  sendCampaignEvent: async (eventType: string, eventData: any) => {
    try {
      await bluetoothNativeService.sendCampaignEvent(eventType, eventData);
    } catch (error) {
      console.error('Error sending campaign event:', error);
      set({ error: formatBluetoothError(error) });
    }
  }
}));