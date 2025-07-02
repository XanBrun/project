import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Dice6, Users, Sword, Map, Settings, Home, UserPlus, ShoppingCart, 
  Menu, X, Bluetooth, BluetoothConnected 
} from 'lucide-react';
import { useBluetoothStore } from '../../stores/bluetoothStore';
import BluetoothStatus from '../bluetooth/BluetoothStatus';

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

function Navbar() {
  const location = useLocation();
  const { isConnected } = useBluetoothStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-amber-200 px-4 py-3 relative z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Dice6 className="h-8 w-8 text-amber-600" />
            <div>
              <h1 className="text-xl font-bold text-amber-900">D&D Local</h1>
              <p className="text-xs text-amber-600">Aventuras Épicas</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Bluetooth Status Mobile */}
            <BluetoothStatus compact={true} />
            
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeMobileMenu} />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-amber-900 to-amber-800 text-amber-100 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Mobile Header */}
        <div className="p-6 border-b border-amber-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Dice6 className="h-10 w-10 text-amber-300" />
              <div>
                <h1 className="text-2xl font-bold text-amber-100">D&D Local</h1>
                <p className="text-xs text-amber-300">Aventuras Épicas</p>
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
          <BluetoothStatus showDetails={true} className="bg-amber-800/50 border-amber-600" />
        </div>
      </div>
    </>
  );
}

export default Navbar;