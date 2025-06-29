import React from 'react';
import { Link } from 'react-router-dom';
import { Dice6, Users, Sword, Map, UserPlus, Scroll, Shield, Sparkles, ShoppingCart, BookOpen } from 'lucide-react';

function Home() {
  const features = [
    {
      icon: UserPlus,
      title: 'Crear Personajes',
      description: 'Diseña héroes únicos con nuestro creador de personajes completo con sistema de monedas D&D 5e',
      href: '/character/create',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Dice6,
      title: 'Lanzar Dados',
      description: 'Sistema de dados avanzado con modificadores, historial y animaciones épicas',
      href: '/dice',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: ShoppingCart,
      title: 'Tienda de Aventureros',
      description: 'Compra equipo, armas y objetos mágicos con conversión automática de monedas',
      href: '/shop',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: Sword,
      title: 'Rastreador de Combate',
      description: 'Gestiona encuentros épicos con iniciativa automática y acceso al equipo de personajes',
      href: '/combat',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: BookOpen,
      title: 'Gestión de Campañas',
      description: 'Organiza aventuras completas con NPCs, ubicaciones y sesiones detalladas',
      href: '/campaigns',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Map,
      title: 'Mapas Interactivos',
      description: 'Explora mundos fantásticos con mapas detallados, marcadores y herramientas de medición',
      href: '/map',
      color: 'from-amber-500 to-amber-600'
    }
  ];

  const gameFeatures = [
    {
      title: 'Sistema de Monedas Completo',
      description: 'Gestión automática de Platino, Oro, Electrum, Plata y Cobre con conversión inteligente',
      icon: '💰'
    },
    {
      title: 'Tienda Interactiva',
      description: 'Compra armas, armaduras, objetos mágicos y equipo de aventura con carrito de compras',
      icon: '🛒'
    },
    {
      title: 'Combate Avanzado',
      description: 'Rastreador de iniciativa con acceso al equipo de personajes y gestión de condiciones',
      icon: '⚔️'
    },
    {
      title: 'Campañas Épicas',
      description: 'Gestión completa de NPCs, ubicaciones y sesiones con ejemplos preconfigurados',
      icon: '📚'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <Dice6 className="w-20 h-20 text-amber-600 animate-pulse" />
            <Sparkles className="w-8 h-8 text-amber-400 absolute -top-2 -right-2 animate-bounce" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-amber-900 mb-4">
          Bienvenido a tu Compañero de D&D
        </h1>
        <p className="text-xl text-amber-700 mb-8 max-w-4xl mx-auto">
          La aplicación definitiva para gestionar tus aventuras de Dungeons & Dragons. 
          Crea personajes épicos, gestiona monedas, compra equipo, lanza dados, gestiona combates 
          y mucho más, todo con conectividad Bluetooth para juego multijugador local.
        </p>
        <div className="flex items-center justify-center space-x-4 flex-wrap gap-4">
          <Link
            to="/character/create"
            className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Crear Personaje
          </Link>
          <Link
            to="/shop"
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Visitar Tienda
          </Link>
          <Link
            to="/dice"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Lanzar Dados
          </Link>
        </div>
      </div>

      {/* New Game Features */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-amber-900 text-center mb-8">Nuevas Características del Juego</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gameFeatures.map((feature, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-amber-200">
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{feature.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-amber-900 mb-2">{feature.title}</h3>
                  <p className="text-amber-700">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Link
              key={index}
              to={feature.href}
              className="group bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-amber-200"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-2">{feature.title}</h3>
              <p className="text-amber-700 group-hover:text-amber-800 transition-colors duration-200">
                {feature.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Example Game Section */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-900 rounded-2xl p-8 text-white shadow-2xl mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Ejemplo de Juego Completo</h2>
          <p className="text-purple-200">Experimenta una aventura completa con contenido preconfigurado</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-purple-700 rounded-lg p-4 mb-3">
              <UserPlus className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-bold">1. Crea tu Héroe</h3>
            </div>
            <p className="text-sm text-purple-200">Diseña un personaje con 100 monedas de oro iniciales</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-700 rounded-lg p-4 mb-3">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-bold">2. Equipa tu Aventurero</h3>
            </div>
            <p className="text-sm text-purple-200">Visita tiendas con inventarios únicos y conversión automática de monedas</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-700 rounded-lg p-4 mb-3">
              <BookOpen className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-bold">3. Únete a la Campaña</h3>
            </div>
            <p className="text-sm text-purple-200">Explora "La Mina Perdida de Phandelver" con NPCs y ubicaciones</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-700 rounded-lg p-4 mb-3">
              <Sword className="w-8 h-8 mx-auto mb-2" />
              <h3 className="font-bold">4. Combate Épico</h3>
            </div>
            <p className="text-sm text-purple-200">Usa tu equipo en combate con iniciativa automática</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/campaigns"
            className="bg-white text-purple-900 px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Comenzar Aventura de Ejemplo
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-amber-800 to-amber-900 rounded-2xl p-8 text-white shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Características Principales</h2>
          <p className="text-amber-200">Todo lo que necesitas para tus aventuras épicas</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-amber-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">Conectividad Bluetooth</h3>
            <p className="text-amber-200">Conecta con otros jugadores localmente sin necesidad de internet</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Scroll className="w-12 h-12 text-amber-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">Almacenamiento Local</h3>
            <p className="text-amber-200">Todos tus datos se guardan localmente, sin necesidad de cuenta</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-12 h-12 text-amber-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">Interfaz Intuitiva</h3>
            <p className="text-amber-200">Diseño elegante y fácil de usar para todos los niveles</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;