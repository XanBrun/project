import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Dice6, Users, Sword, Map, Settings, Home, UserPlus, ShoppingCart 
} from 'lucide-react';
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

function Sidebar() {
  const location = useLocation();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-amber-900 to-amber-800 text-amber-100 shadow-2xl z-10">
      {/* Header */}
      <div className="p-6 border-b border-amber-700">
        <div className="flex items-center space-x-3">
          <Dice6 className="h-10 w-10 text-amber-300" />
          <div>
            <h1 className="text-2xl font-bold text-amber-100">D&D Local</h1>
            <p className="text-xs text-amber-300">Aventuras Épicas</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
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
        <BluetoothStatus showDetails={true} className="bg-amber-800/50 border-amber-600" />
      </div>
    </div>
  );
}

export default Sidebar;