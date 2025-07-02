import React from 'react';
import { Bluetooth, BluetoothConnected, Smartphone, Wifi, AlertCircle } from 'lucide-react';
import { useBluetoothStore } from '../../stores/bluetoothStore';

interface BluetoothStatusProps {
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

function BluetoothStatus({ showDetails = false, compact = false, className = '' }: BluetoothStatusProps) {
  const { isConnected, isConnecting, deviceInfo, error, connectToDevice, disconnectDevice } = useBluetoothStore();

  const formatMacAddress = (mac: string) => {
    if (!mac || mac === 'No disponible') return mac;
    return mac.toUpperCase();
  };

  const truncateDeviceName = (name: string, maxLength: number = 15) => {
    if (!name || name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
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
            <div className="text-sm font-medium text-amber-900">
              {isConnecting ? 'Conectando...' : isConnected ? 'Conectado' : 'Desconectado'}
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
              </div>
            )}
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
      </div>
      
      <button
        onClick={isConnected ? disconnectDevice : connectToDevice}
        disabled={isConnecting}
        className={`w-full px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
          isConnecting
            ? 'bg-amber-600 cursor-not-allowed opacity-50'
            : isConnected
            ? 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
        }`}
      >
        {isConnecting ? 'Conectando...' : isConnected ? 'Desconectar' : 'Conectar Dispositivo'}
      </button>
      
      {error && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded flex items-start space-x-1">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default BluetoothStatus;