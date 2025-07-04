import { create } from 'zustand';
import { bluetoothService, formatBluetoothError } from '../services/bluetooth';

interface BluetoothState {
  device: any | null;
  deviceInfo: { name: string; mac: string; id: string; fullName: string } | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  initializeBluetoothState: () => Promise<void>;
  connectToDevice: () => Promise<void>;
  disconnectDevice: () => Promise<void>;
  clearError: () => void;
}

export const useBluetoothStore = create<BluetoothState>((set, get) => ({
  device: null,
  deviceInfo: null,
  isConnected: false,
  isConnecting: false,
  error: null,

  initializeBluetoothState: async () => {
    if (!navigator.bluetooth) {
      set({ error: 'Bluetooth no compatible con este navegador' });
      return;
    }
    
    set({
      device: null,
      deviceInfo: null,
      isConnected: false,
      isConnecting: false,
      error: null
    });
  },

  connectToDevice: async () => {
    try {
      set({ isConnecting: true, error: null });

      // First, request device selection
      const device = await bluetoothService.requestDevice();
      if (!device) {
        set({ isConnecting: false });
        return;
      }

      // Then attempt to connect to the selected device
      await bluetoothService.connect();
      const deviceInfo = bluetoothService.getDeviceInfo();
      
      console.log('Device connected with info:', deviceInfo);
      
      set({
        device,
        deviceInfo,
        isConnected: bluetoothService.isConnected(),
        isConnecting: false,
        error: null
      });
    } catch (error) {
      console.error('Bluetooth connection error:', error);
      
      // Check if the error is due to user cancellation
      if (error instanceof Error && error.name === 'NotFoundError') {
        console.info('User cancelled Bluetooth device selection');
        set({
          isConnecting: false,
          error: null // Don't show error for user cancellation
        });
      } else {
        // Format and display the actual error
        const errorMessage = formatBluetoothError(error);
        console.error('Formatted error:', errorMessage);
        
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
    try {
      await bluetoothService.disconnect();
      set({
        device: null,
        deviceInfo: null,
        isConnected: false,
        error: null
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      set({ error: formatBluetoothError(error) });
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));