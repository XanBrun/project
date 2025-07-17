import { create } from 'zustand';
import { BleDevice } from '@capacitor-community/bluetooth-le';
import { bluetoothServerService } from '../services/bluetooth';
import { bluetoothClientService } from '../services/bluetoothClient';
import { BluetoothMessage } from '../services/bluetooth';

type ConnectionMode = 'server' | 'client' | 'none';

interface BluetoothState {
  mode: ConnectionMode;
  isScanning: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  serverName: string | null;
  scannedDevices: BleDevice[];
  connectedDevice: BleDevice | null;
  error: string | null;
  messages: BluetoothMessage[];

  startServer: (deviceName: string) => Promise<void>;
  stopServer: () => Promise<void>;
  scanForDevices: () => Promise<void>;
  connectToDevice: (deviceId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  sendMessage: (message: BluetoothMessage) => Promise<void>;
  clearError: () => void;
}

export const useBluetoothStore = create<BluetoothState>((set, get) => ({
  mode: 'none',
  isScanning: false,
  isConnecting: false,
  isConnected: false,
  serverName: null,
  scannedDevices: [],
  connectedDevice: null,
  error: null,
  messages: [],

  startServer: async (deviceName) => {
    try {
      set({ isConnecting: true, error: null });
      await bluetoothServerService.startServer(deviceName);
      set({
        mode: 'server',
        isConnected: true,
        isConnecting: false,
        serverName: deviceName,
      });
      bluetoothServerService.addMessageHandler('store', (message) => {
        set((state) => ({ messages: [...state.messages, message] }));
      });
    } catch (e: any) {
      set({ error: e.message, isConnecting: false });
    }
  },

  stopServer: async () => {
    try {
      await bluetoothServerService.stopServer();
      set({
        mode: 'none',
        isConnected: false,
        serverName: null,
      });
      bluetoothServerService.removeMessageHandler('store');
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  scanForDevices: async () => {
    try {
      set({ isScanning: true, error: null, scannedDevices: [] });
      const devices = await bluetoothClientService.scan();
      set({ scannedDevices: devices, isScanning: false });
    } catch (e: any) {
      set({ error: e.message, isScanning: false });
    }
  },

  connectToDevice: async (deviceId) => {
    try {
      set({ isConnecting: true, error: null });
      await bluetoothClientService.connect(deviceId);
      const device = get().scannedDevices.find(d => d.deviceId === deviceId) || null;
      set({
        mode: 'client',
        isConnected: true,
        isConnecting: false,
        connectedDevice: device,
      });
      bluetoothClientService.addMessageHandler('store', (message) => {
        set((state) => ({ messages: [...state.messages, message] }));
      });
    } catch (e: any) {
      set({ error: e.message, isConnecting: false });
    }
  },

  disconnect: async () => {
    const { mode } = get();
    if (mode === 'server') {
      await get().stopServer();
    } else if (mode === 'client') {
      try {
        await bluetoothClientService.disconnect();
        set({
          mode: 'none',
          isConnected: false,
          connectedDevice: null,
        });
        bluetoothClientService.removeMessageHandler('store');
      } catch (e: any) {
        set({ error: e.message });
      }
    }
  },

  sendMessage: async (message) => {
    const { mode } = get();
    try {
      if (mode === 'server') {
        await bluetoothServerService.sendMessage(message);
      } else if (mode === 'client') {
        await bluetoothClientService.sendMessage(message);
      }
      set((state) => ({ messages: [...state.messages, message] }));
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));