import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  Dice6, Users, Sword, Map, Settings, Home, UserPlus, Bluetooth, BluetoothConnected, 
  ShoppingCart, Menu, X, Smartphone, Wifi 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { useBluetoothStore } from '../stores/bluetoothStore';
import { useBluetoothNativeStore } from '../stores/bluetoothNativeStore';
import BluetoothNativeStatus from './bluetooth/BluetoothNativeStatus';

const navigation = [
  { name: 'Inicio', href: '/', icon: Home },
  { name: 'Crear Personaje', href: '/character/create', icon: UserPlus },
  { name: 'Personajes', href: '/characters', icon: Users },
  { name: 'Campañas', href: '/campaigns', icon: Users },
  { name: 'Dados', href: '/dice', icon: Dice6 },
  { name: 'Combate', href: '/combat', icon: Sword },
  { name: 'Mapa', href: '/map', icon: Map },
  { name: 'Tienda', href: '/shop', icon: ShoppingCart },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

function Layout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Use native Bluetooth store for mobile, web store for browser
  const webBluetooth = useBluetoothStore();
  const nativeBluetooth = useBluetoothNativeStore();

  // Determine which Bluetooth service to use
  const bluetooth = isMobile ? nativeBluetooth : webBluetooth;

  useEffect(() => {
    const checkPlatform = () => {
      const isNative = Capacitor.isNativePlatform();
      setIsMobile(isNative);
      console.log('Platform detected:', isNative ? 'Native Mobile' : 'Web Browser');
    };

    checkPlatform();

    // Initialize appropriate Bluetooth service
    if (Capacitor.isNativePlatform()) {
      nativeBluetooth.initializeBluetooth();
    } else {
      webBluetooth.initializeBluetoothState();
    }
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const formatMacAddress = (mac: string) => {
    if (!mac || mac === 'No disponible') return mac;
    return mac.toUpperCase();
  };

  const truncateDeviceName = (name: string, maxLength: number = 15) => {
    if (!name || name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  // Get connection status based on platform
  const isConnected = isMobile ? nativeBluetooth.isConnected : webBluetooth.isConnected;
  const isConnecting = isMobile ? nativeBluetooth.isConnecting : webBluetooth.isConnecting;
  const deviceInfo = isMobile ? nativeBluetooth.deviceInfo : webBluetooth.deviceInfo;
  const error = isMobile ? nativeBluetooth.error : webBluetooth.error;

  const handleConnect = () => {
    if (isMobile) {
      nativeBluetooth.scanForDevices();
    } else {
      webBluetooth.connectToDevice();
    }
  };

  const handleDisconnect = () => {
    if (isMobile) {
      nativeBluetooth.disconnectDevice();
    } else {
      webBluetooth.disconnectDevice();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/90 backdrop-blur-sm shadow-lg border-b border-amber-200 px-4 py-3 relative z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Dice6 className="h-8 w-8 text-amber-600" />
            <div>
              <h1 className="text-xl font-bold text-amber-900">D&D Local</h1>
              <p className="text-xs text-amber-600">
                {isMobile ? 'Nativo Android' : 'Web App'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Platform indicator */}
            {isMobile && <Smartphone className="h-5 w-5 text-blue-500" />}
            
            {/* Bluetooth Status Mobile */}
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <BluetoothConnected className="h-5 w-5 text-green-500" />
              ) : (
                <Bluetooth className="h-5 w-5 text-amber-500" />
              )}
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-amber-400'} animate-pulse`} />
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeMobileMenu} />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-amber-900 to-amber-800 text-amber-100 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Mobile Header */}
        <div className="p-6 border-b border-amber-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Dice6 className="h-10 w-10 text-amber-300" />
              <div>
                <h1 className="text-2xl font-bold text-amber-100">D&D Local</h1>
                <p className="text-xs text-amber-300">
                  {isMobile ? 'Nativo Android' : 'Web App'}
                </p>
              </div>
            </div>
            <button
              onClick={closeMobileMenu}
              className="p-2 text-amber-300 hover:bg-amber-800 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href === '/characters' && location.pathname.startsWith('/character'));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeMobileMenu}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-700 text-amber-100 shadow-lg'
                    : 'text-amber-200 hover:bg-amber-800 hover:text-amber-100'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Bluetooth Status */}
        <div className="p-4 border-t border-amber-700 bg-amber-900">
          {isMobile ? (
            <BluetoothNativeStatus showDetails={true} className="bg-amber-800/50 border-amber-600" />
          ) : (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <BluetoothConnected className="h-5 w-5 text-green-400" />
                ) : (
                  <Bluetooth className="h-5 w-5 text-amber-400" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {isConnecting ? 'Conectando...' : isConnected ? 'Conectado' : 'Desconectado'}
                  </div>
                  {isConnected && deviceInfo && (
                    <div className="text-xs text-amber-300">
                      <div className="flex items-center space-x-1">
                        <Smartphone className="w-3 h-3" />
                        <span>{truncateDeviceName(deviceInfo.name, 12)}</span>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <Wifi className="w-3 h-3" />
                        <span>{formatMacAddress(deviceInfo.mac)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
            </div>
          )}
          
          {!isMobile && (
            <>
              <button
                onClick={isConnected ? handleDisconnect : handleConnect}
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
                <div className="mt-2 text-xs text-red-300 bg-red-900/30 p-2 rounded">
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-amber-900 to-amber-800 text-amber-100 shadow-2xl z-10">
        {/* Header */}
        <div className="p-6 border-b border-amber-700">
          <div className="flex items-center space-x-3">
            <Dice6 className="h-10 w-10 text-amber-300" />
            <div>
              <h1 className="text-2xl font-bold text-amber-100">D&D Local</h1>
              <p className="text-xs text-amber-300 flex items-center space-x-1">
                <span>{isMobile ? 'Nativo Android' : 'Web App'}</span>
                {isMobile && <Smartphone className="w-3 h-3" />}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href === '/characters' && location.pathname.startsWith('/character'));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-700 text-amber-100 shadow-lg transform scale-105'
                    : 'text-amber-200 hover:bg-amber-800 hover:text-amber-100 hover:transform hover:scale-102'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bluetooth Status */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-amber-700 bg-amber-900">
          {isMobile ? (
            <BluetoothNativeStatus showDetails={true} className="bg-amber-800/50 border-amber-600" />
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {isConnected ? (
                    <BluetoothConnected className="h-5 w-5 text-green-400" />
                  ) : (
                    <Bluetooth className="h-5 w-5 text-amber-400" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {isConnecting ? 'Conectando...' : isConnected ? 'Conectado' : 'Desconectado'}
                    </div>
                    {isConnected && deviceInfo && (
                      <div className="text-xs text-amber-300 mt-1">
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
                onClick={isConnected ? handleDisconnect : handleConnect}
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
                <div className="mt-2 text-xs text-red-300 bg-red-900/30 p-2 rounded">
                  {error}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Desktop Top Bar */}
        <header className="hidden lg:block bg-white/80 backdrop-blur-sm shadow-lg border-b border-amber-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-amber-900">
              {navigation.find(item => 
                item.href === location.pathname || 
                (item.href === '/characters' && location.pathname.startsWith('/character'))
              )?.name || 'D&D Companion'}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-amber-500'}`} />
                <span className="font-medium">
                  {isConnected ? (
                    deviceInfo ? `${truncateDeviceName(deviceInfo.name, 20)}` : 'En línea'
                  ) : 'Sin conexión'}
                </span>
                {isMobile && <Smartphone className="w-4 h-4 text-blue-500" />}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 pt-4 lg:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;