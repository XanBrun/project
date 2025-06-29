import { create } from 'zustand';
import { bluetoothService, formatBluetoothError } from '../services/bluetooth';

interface BluetoothState {
  device: any | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  initializeBluetoothState: () => Promise<void>;
  connectToDevice: () => Promise<void>;
  disconnectDevice: () => Promise<void>;
}

export const useBluetoothStore = create<BluetoothState>((set, get) => ({
  device: null,
  isConnected: false,
  isConnecting: false,
  error: null,

  initializeBluetoothState: async () => {
    if (!navigator.bluetooth) {
      set({ error: 'Bluetooth not supported in this browser' });
      return;
    }
    
    set({
      device: null,
      isConnected: false,
      isConnecting: false,
      error: null
    });
  },

  connectToDevice: async () => {
    try {
      set({ isConnecting: true, error: null });

      const device = await bluetoothService.requestDevice();
      if (device) {
        await bluetoothService.connect();
        set({
          device,
          isConnected: bluetoothService.isConnected(),
          isConnecting: false,
          error: null
        });
      }
    } catch (error) {
      set({
        isConnecting: false,
        error: formatBluetoothError(error)
      });
    }
  },

  disconnectDevice: async () => {
    try {
      await bluetoothService.disconnect();
      set({
        device: null,
        isConnected: false,
        error: null
      });
    } catch (error) {
      set({ error: formatBluetoothError(error) });
    }
  }
}));