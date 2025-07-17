import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bluetooth, Volume2, Bell, User, Download, Upload, Trash2, Wifi, WifiOff } from 'lucide-react';
import { exportData, saveData, loadData } from '../services/db';
import { useBluetoothStore } from '../stores/bluetoothStore';

function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    soundEffects: true,
    autoConnect: false,
    theme: 'light',
    deviceName: `Partida de ${Math.random().toString(36).substring(7)}`
  });

  const {
    mode,
    isScanning,
    isConnected,
    serverName,
    scannedDevices,
    connectedDevice,
    error,
    startServer,
    stopServer,
    scanForDevices,
    connectToDevice,
    disconnect,
    clearError,
  } = useBluetoothStore();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await loadData('settings');
      if (savedSettings) {
        setSettings(s => ({ ...s, ...savedSettings }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSettingChange = async (key: string, value: boolean | string) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    setSettings(newSettings);
    await saveData('settings', newSettings);
  };

  const handleExportData = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dnd-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error al exportar los datos');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-200">
        <div className="flex items-center mb-8">
          <SettingsIcon className="w-8 h-8 mr-4 text-amber-600" />
          <h1 className="text-3xl font-bold text-amber-900">Configuración</h1>
        </div>

        <div className="space-y-8">
          {/* Bluetooth Settings */}
          <div className="border-b border-amber-200 pb-8">
            <h2 className="text-xl font-bold text-amber-800 mb-6 flex items-center">
              <Bluetooth className="w-6 h-6 mr-3" />
              Multijugador Bluetooth
            </h2>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
                <button onClick={clearError} className="mt-2 text-sm font-semibold">Descartar</button>
              </div>
            )}

            {!isConnected ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-amber-900">Crear una partida</h3>
                  <p className="text-sm text-amber-700 mb-2">Permite que otros jugadores se unan a tu partida.</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.deviceName}
                      onChange={(e) => handleSettingChange('deviceName', e.target.value)}
                      placeholder="Nombre de la partida"
                      className="flex-grow p-2 border border-amber-300 rounded-lg"
                    />
                    <button onClick={() => startServer(settings.deviceName)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Crear
                    </button>
                  </div>
                </div>

                <div className="border-t border-amber-200 my-4"></div>

                <div>
                  <h3 className="text-lg font-semibold text-amber-900">Unirse a una partida</h3>
                  <p className="text-sm text-amber-700 mb-2">Busca partidas cercanas para unirte.</p>
                  <button onClick={scanForDevices} disabled={isScanning} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                    {isScanning ? 'Buscando...' : 'Buscar partidas'}
                  </button>
                  <div className="mt-4 space-y-2">
                    {scannedDevices.map(device => (
                      <div key={device.deviceId} className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                        <span>{device.name || 'Dispositivo desconocido'}</span>
                        <button onClick={() => connectToDevice(device.deviceId)} className="px-3 py-1 bg-green-500 text-white text-sm rounded-md">Conectar</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between p-4 bg-green-100 rounded-lg">
                  <div>
                    <p className="text-base font-medium text-green-900">
                      {mode === 'server' ? `Partida "${serverName}" creada` : `Conectado a "${connectedDevice?.name}"`}
                    </p>
                    <p className="text-sm text-green-700">
                      {mode === 'server' ? 'Esperando jugadores...' : 'Listo para jugar.'}
                    </p>
                  </div>
                  <button onClick={disconnect} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Desconectar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Audio Settings, Notification Settings, Theme Settings, Data Management... */}
          {/* ... (The rest of the settings sections remain the same) ... */}
        </div>

        {/* App Info */}
        <div className="mt-8 pt-8 border-t border-amber-200">
          <div className="bg-amber-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-amber-900 mb-4">Información de la Aplicación</h3>
            <div className="space-y-2 text-amber-800">
              <p><strong>Versión:</strong> 1.1.0 (Multijugador)</p>
              <p><strong>Almacenamiento:</strong> Local (sin conexión a internet)</p>
              <p><strong>Conectividad:</strong> Bluetooth Low Energy (Nativo)</p>
              <p><strong>Compatibilidad:</strong> Android, iOS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;