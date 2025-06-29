import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bluetooth, Volume2, Bell, User, Download, Upload, Trash2 } from 'lucide-react';
import { exportData, saveData, loadData } from '../services/db';

function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    soundEffects: true,
    autoConnect: false,
    theme: 'light'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await loadData('settings');
      if (savedSettings) {
        setSettings(savedSettings);
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
              Configuración Bluetooth
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div>
                  <label className="text-base font-medium text-amber-900">Conexión automática</label>
                  <p className="text-sm text-amber-700">Conectar automáticamente a dispositivos emparejados</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoConnect}
                    onChange={(e) => handleSettingChange('autoConnect', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="border-b border-amber-200 pb-8">
            <h2 className="text-xl font-bold text-amber-800 mb-6 flex items-center">
              <Volume2 className="w-6 h-6 mr-3" />
              Configuración de Audio
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div>
                  <label className="text-base font-medium text-amber-900">Efectos de sonido</label>
                  <p className="text-sm text-amber-700">Reproducir sonidos para lanzamientos de dados y acciones</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.soundEffects}
                    onChange={(e) => handleSettingChange('soundEffects', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="border-b border-amber-200 pb-8">
            <h2 className="text-xl font-bold text-amber-800 mb-6 flex items-center">
              <Bell className="w-6 h-6 mr-3" />
              Notificaciones
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div>
                  <label className="text-base font-medium text-amber-900">Notificaciones push</label>
                  <p className="text-sm text-amber-700">Recibir notificaciones de eventos del juego</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="border-b border-amber-200 pb-8">
            <h2 className="text-xl font-bold text-amber-800 mb-6 flex items-center">
              <User className="w-6 h-6 mr-3" />
              Apariencia
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-lg">
                <label className="text-base font-medium text-amber-900 mb-3 block">Tema</label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div>
            <h2 className="text-xl font-bold text-amber-800 mb-6 flex items-center">
              <Download className="w-6 h-6 mr-3" />
              Gestión de Datos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleExportData}
                className="flex items-center justify-center space-x-2 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                <Download size={20} />
                <span>Exportar Datos</span>
              </button>
              <button
                className="flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <Upload size={20} />
                <span>Importar Datos</span>
              </button>
            </div>
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-bold text-red-900 mb-2">Zona de Peligro</h3>
              <p className="text-sm text-red-700 mb-3">
                Esta acción eliminará permanentemente todos tus datos locales.
              </p>
              <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <Trash2 size={16} />
                <span>Eliminar Todos los Datos</span>
              </button>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="mt-8 pt-8 border-t border-amber-200">
          <div className="bg-amber-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-amber-900 mb-4">Información de la Aplicación</h3>
            <div className="space-y-2 text-amber-800">
              <p><strong>Versión:</strong> 1.0.0</p>
              <p><strong>Almacenamiento:</strong> Local (sin conexión a internet)</p>
              <p><strong>Conectividad:</strong> Bluetooth Web API</p>
              <p><strong>Compatibilidad:</strong> Navegadores modernos con soporte Bluetooth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;