import React, { useEffect, useState } from 'react';
import { 
  Bluetooth, BluetoothConnected, Smartphone, Wifi, AlertCircle, 
  Search, RefreshCw, X, Check, Signal, Battery 
} from 'lucide-react';
import { useBluetoothNativeStore } from '../../stores/bluetoothNativeStore';
import { BluetoothDeviceNative } from '../../services/bluetooth-native';

interface BluetoothNativeStatusProps {
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

function BluetoothNativeStatus({ showDetails = false, compact = false, className = '' }: BluetoothNativeStatusProps) {
  const {
    devices,
    connectedDevice,
    deviceInfo,
    isConnected,
    isConnecting,
    isScanning,
    error,
    isMobile,
    initializeBluetooth,
    scanForDevices,
    connectToDevice,
    disconnectDevice,
    clearError
  } = useBluetoothNativeStore();

  const [showDeviceList, setShowDeviceList] = useState(false);

  useEffect(() => {
    initializeBluetooth();
  }, [initializeBluetooth]);

  const handleScanDevices = async () => {
    await scanForDevices();
    setShowDeviceList(true);
  };

  const handleConnectDevice = async (deviceId: string) => {
    await connectToDevice(deviceId);
    setShowDeviceList(false);
  };

  const formatMacAddress = (mac: string) => {
    if (!mac || mac === 'No disponible') return mac;
    return mac.toUpperCase();
  };

  const truncateDeviceName = (name: string, maxLength: number = 15) => {
    if (!name || name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  const getSignalStrength = (rssi?: number) => {
    if (!rssi) return 'unknown';
    if (rssi > -50) return 'excellent';
    if (rssi > -70) return 'good';
    if (rssi > -85) return 'fair';
    return 'poor';
  };

  const getSignalColor = (rssi?: number) => {
    const strength = getSignalStrength(rssi);
    switch (strength) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {isConnected ? (
          <BluetoothConnected className="h-5 w-5 text-green-500" />
        ) : (
          <Bluetooth className="h-5 w-5 text-amber-500" />
        )}
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-amber-400'} animate-pulse`} />
        {isMobile && (
          <Smartphone className="h-4 w-4 text-blue-500" />
        )}
        {showDetails && (
          <span className="text-sm text-amber-700">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-amber-200 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <BluetoothConnected className="h-5 w-5 text-green-500" />
          ) : (
            <Bluetooth className="h-5 w-5 text-amber-500" />
          )}
          <div className="flex-1">
            <div className="text-sm font-medium text-amber-900 flex items-center space-x-2">
              <span>
                {isConnecting ? 'Conectando...' : 
                 isScanning ? 'Buscando...' :
                 isConnected ? 'Conectado' : 'Desconectado'}
              </span>
              {isMobile && <Smartphone className="w-4 h-4 text-blue-500" />}
            </div>
            {isConnected && deviceInfo && (
              <div className="text-xs text-amber-600 mt-1">
                <div className="flex items-center space-x-1 mb-1">
                  <Smartphone className="w-3 h-3" />
                  <span title={deviceInfo.name}>{truncateDeviceName(deviceInfo.name, 18)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Wifi className="w-3 h-3" />
                  <span className="font-mono text-xs">{formatMacAddress(deviceInfo.mac)}</span>
                </div>
                {connectedDevice?.rssi && (
                  <div className="flex items-center space-x-1 mt-1">
                    <Signal className={`w-3 h-3 ${getSignalColor(connectedDevice.rssi)}`} />
                    <span className="text-xs">{connectedDevice.rssi} dBm</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
      </div>
      
      <div className="space-y-2">
        {!isConnected && (
          <button
            onClick={handleScanDevices}
            disabled={isScanning || isConnecting}
            className={`w-full px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
              isScanning || isConnecting
                ? 'bg-amber-600 cursor-not-allowed opacity-50'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              {isScanning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>{isScanning ? 'Buscando...' : 'Buscar Dispositivos'}</span>
            </div>
          </button>
        )}

        {isConnected && (
          <button
            onClick={disconnectDevice}
            className="w-full px-3 py-2 text-xs font-medium rounded-md bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            Desconectar
          </button>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded flex items-start space-x-1">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="ml-2 text-red-800 hover:text-red-900 underline"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Device List Modal */}
      {showDeviceList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-amber-900">Dispositivos Encontrados</h3>
              <button
                onClick={() => setShowDeviceList(false)}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {devices.length === 0 ? (
              <div className="text-center py-8">
                <Bluetooth className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <p className="text-amber-600">No se encontraron dispositivos</p>
                <button
                  onClick={handleScanDevices}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Buscar de Nuevo
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {devices.map((device) => (
                  <div
                    key={device.id}
                    className="p-4 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-amber-900">{device.name}</div>
                        <div className="text-xs text-amber-600 mt-1">
                          <div>ID: {device.id}</div>
                          {device.rssi && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Signal className={`w-3 h-3 ${getSignalColor(device.rssi)}`} />
                              <span>{device.rssi} dBm ({getSignalStrength(device.rssi)})</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleConnectDevice(device.id)}
                        disabled={isConnecting}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {isConnecting ? 'Conectando...' : 'Conectar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-amber-200">
              <div className="text-xs text-amber-600 text-center">
                {isMobile ? (
                  <span>🔵 Bluetooth nativo en dispositivo móvil</span>
                ) : (
                  <span>🌐 Web Bluetooth en navegador</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BluetoothNativeStatus;