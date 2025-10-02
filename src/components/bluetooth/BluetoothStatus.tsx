import React from 'react';
import { Bluetooth, BluetoothConnected, Smartphone, Wifi, AlertCircle, Info, Search, Zap } from 'lucide-react';
import { useBluetoothStore } from '../../stores/bluetoothStore';

interface BluetoothStatusProps {
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

function BluetoothStatus({ showDetails = false, compact = false, className = '' }: BluetoothStatusProps) {
  const { 
    isConnected, 
    isConnecting, 
    isScanning,
    deviceInfo, 
    error, 
    isNative,
    availableDevices,
    scanForDevices,
    connectToDevice, 
    disconnectDevice,
    clearError
  } = useBluetoothStore();

  const formatMacAddress = (mac: string) => {
    if (!mac || mac === 'No disponible') return mac;
    return mac.toUpperCase();
  };

  const truncateDeviceName = (name: string, maxLength: number = 15) => {
    if (!name || name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  const handleConnect = async (deviceId?: string) => {
    try {
      clearError();
      await connectToDevice(deviceId);
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const handleScan = async () => {
    try {
      clearError();
      await scanForDevices();
    } catch (error) {
      console.error('Scan error:', error);
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
        {showDetails && (
          <span className="text-sm text-amber-700">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        )}
        {isNative && (
          <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Nativo
          </div>
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
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium text-amber-900">
                {isConnecting ? 'Conectando...' : 
                 isScanning ? 'Escaneando...' :
                 isConnected ? 'Conectado' : 'Desconectado'}
              </div>
              {isNative && (
                <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                  <Zap className="w-3 h-3 inline mr-1" />
                  Nativo
                </div>
              )}
            </div>
            
            {isConnected && deviceInfo && (
              <div className="text-xs text-amber-600 mt-1">
                {/* Device Name */}
                <div className="flex items-center space-x-1 mb-1">
                  <Smartphone className="w-3 h-3" />
                  <span title={deviceInfo.fullName}>
                    {truncateDeviceName(deviceInfo.name, 18)}
                  </span>
                </div>
                
                {/* MAC Address */}
                <div className="flex items-center space-x-1 mb-1">
                  <Wifi className="w-3 h-3" />
                  <span className="font-mono text-xs">{formatMacAddress(deviceInfo.mac)}</span>
                </div>
                
                {/* Device ID and RSSI */}
                <div className="flex items-center space-x-1">
                  <Info className="w-3 h-3" />
                  <span className="text-xs opacity-75">
                    ID: {deviceInfo.id.substring(0, 8)}...
                    {deviceInfo.rssi && ` • ${deviceInfo.rssi} dBm`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-400' : 
          isConnecting || isScanning ? 'bg-yellow-400' : 
          'bg-red-400'
        } animate-pulse`} />
      </div>

      {/* Available Devices (Native only) */}
      {isNative && availableDevices.length > 0 && !isConnected && (
        <div className="mb-3">
          <div className="text-xs font-medium text-amber-900 mb-2">Dispositivos encontrados:</div>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {availableDevices.slice(0, 3).map((device, index) => (
              <button
                key={device.id}
                onClick={() => handleConnect(device.id)}
                className="w-full text-left p-2 text-xs bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors"
              >
                <div className="font-medium text-amber-900">{device.name}</div>
                <div className="text-amber-600">
                  {device.rssi && `${device.rssi} dBm • `}
                  {device.mac}
                </div>
              </button>
            ))}
            {availableDevices.length > 3 && (
              <div className="text-xs text-amber-600 text-center py-1">
                +{availableDevices.length - 3} más dispositivos
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="space-y-2">
        {isConnected ? (
          <button
            onClick={disconnectDevice}
            className="w-full px-3 py-2 text-xs font-medium rounded-md bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            Desconectar
          </button>
        ) : (
          <div className="space-y-2">
            {isNative && (
              <button
                onClick={handleScan}
                disabled={isScanning || isConnecting}
                className="w-full px-3 py-2 text-xs font-medium rounded-md bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Search className="w-3 h-3 inline mr-1" />
                {isScanning ? 'Escaneando...' : 'Buscar Dispositivos'}
              </button>
            )}
            <button
              onClick={() => handleConnect()}
              disabled={isConnecting || isScanning}
              className="w-full px-3 py-2 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isConnecting ? 'Conectando...' : 
               isNative ? 'Conectar Seleccionado' : 'Seleccionar Dispositivo'}
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded flex items-start space-x-1">
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium">Error de Bluetooth:</div>
            <div>{error}</div>
            <button
              onClick={clearError}
              className="mt-1 text-xs underline hover:no-underline"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Device Info Tooltip */}
      {isConnected && deviceInfo && deviceInfo.fullName !== deviceInfo.name && (
        <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
          <div className="font-medium">Nombre completo:</div>
          <div>{deviceInfo.fullName}</div>
        </div>
      )}

      {/* Native Bluetooth Info */}
      {isNative && (
        <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
          <div className="font-medium flex items-center">
            <Zap className="w-3 h-3 mr-1" />
            Bluetooth Nativo Activo
          </div>
          <div>Conectividad mejorada para dispositivos móviles</div>
        </div>
      )}
    </div>
  );
}

export default BluetoothStatus;