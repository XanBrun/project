import { useBluetoothStore } from './bluetoothStore';
import { bluetoothServerService } from '../services/bluetooth';
import { bluetoothClientService } from '../services/bluetoothClient';
import { act } from '@testing-library/react';

// Mock the services
jest.mock('../services/bluetooth', () => ({
  bluetoothServerService: {
    startServer: jest.fn(),
    stopServer: jest.fn(),
    sendMessage: jest.fn(),
    addMessageHandler: jest.fn(),
    removeMessageHandler: jest.fn(),
  },
}));

jest.mock('../services/bluetoothClient', () => ({
  bluetoothClientService: {
    scan: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    sendMessage: jest.fn(),
    addMessageHandler: jest.fn(),
    removeMessageHandler: jest.fn(),
  },
}));

describe('bluetoothStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    act(() => {
        useBluetoothStore.setState({
            mode: 'none',
            isScanning: false,
            isConnecting: false,
            isConnected: false,
            serverName: null,
            scannedDevices: [],
            connectedDevice: null,
            error: null,
            messages: [],
        });
    });
  });

  it('should start the server', async () => {
    const deviceName = 'Test Server';
    (bluetoothServerService.startServer as jest.Mock).mockResolvedValue(undefined);

    await act(async () => {
      await useBluetoothStore.getState().startServer(deviceName);
    });

    expect(bluetoothServerService.startServer).toHaveBeenCalledWith(deviceName);
    expect(useBluetoothStore.getState().mode).toBe('server');
    expect(useBluetoothStore.getState().isConnected).toBe(true);
    expect(useBluetoothStore.getState().serverName).toBe(deviceName);
  });

  it('should handle server start failure', async () => {
    const errorMessage = 'Failed to start server';
    (bluetoothServerService.startServer as jest.Mock).mockRejectedValue(new Error(errorMessage));

    await act(async () => {
      await useBluetoothStore.getState().startServer('Test Server');
    });

    expect(useBluetoothStore.getState().error).toBe(errorMessage);
    expect(useBluetoothStore.getState().isConnected).toBe(false);
  });

  it('should scan for devices', async () => {
    const devices = [{ deviceId: '123', name: 'Test Device' }];
    (bluetoothClientService.scan as jest.Mock).mockResolvedValue(devices);

    await act(async () => {
      await useBluetoothStore.getState().scanForDevices();
    });

    expect(bluetoothClientService.scan).toHaveBeenCalled();
    expect(useBluetoothStore.getState().scannedDevices).toEqual(devices);
  });

  it('should connect to a device', async () => {
    const deviceId = '123';
    const devices = [{ deviceId: '123', name: 'Test Device' }];
    useBluetoothStore.setState({ scannedDevices: devices });
    (bluetoothClientService.connect as jest.Mock).mockResolvedValue(undefined);

    await act(async () => {
      await useBluetoothStore.getState().connectToDevice(deviceId);
    });

    expect(bluetoothClientService.connect).toHaveBeenCalledWith(deviceId);
    expect(useBluetoothStore.getState().mode).toBe('client');
    expect(useBluetoothStore.getState().isConnected).toBe(true);
    expect(useBluetoothStore.getState().connectedDevice).toEqual(devices[0]);
  });
});
