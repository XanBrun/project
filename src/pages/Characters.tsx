import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Filter, Edit, Trash2, Eye, Heart, Shield, Zap, Coins, Star, Crown, Sword, UserPlus, ArrowRight, Calendar, Gavel as Level, TreePine, Target, Book } from 'lucide-react';
import { loadCharacters, deleteCharacter } from '../services/db';
import { Character, CURRENCY_SYMBOLS } from '../types';

function Characters() {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    loadCharactersData();
  }, []);

  useEffect(() => {
    filterCharacters();
  }, [characters, searchTerm, filterClass, filterLevel]);

  const loadCharactersData = async () => {
    try {
      const charactersData = await loadCharacters();
      setCharacters(charactersData);
    } catch (error) {
      console.error('Error loading characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCharacters = () => {
    let filtered = characters;

    if (searchTerm) {
      filtered = filtered.filter(char =>
        char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        char.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
        char.race.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterClass) {
      filtered = filtered.filter(char => char.class === filterClass);
    }

    if (filterLevel) {
      const level = parseInt(filterLevel);
      filtered = filtered.filter(char => char.level === level);
    }

    setFilteredCharacters(filtered);
  };

  const handleDeleteCharacter = async (characterId: string) => {
    try {
      await deleteCharacter(characterId);
      setCharacters(prev => prev.filter(char => char.id !== characterId));
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting character:', error);
      alert('Error al eliminar el personaje');
    }
  };

  const getClassIcon = (characterClass: string) => {
    const icons: Record<string, any> = {
      'Barbarian': Sword,
      'Bard': Star,
      'Cleric': Shield,
      'Druid': TreePine,
      'Fighter': Sword,
      'Monk': Zap,
      'Paladin': Crown,
      'Ranger': Target,
      'Rogue': Eye,
      'Sorcerer': Zap,
      'Warlock': Star,
      'Wizard': Book
    };
    return icons[characterClass] || Users;
  };

  const getClassColor = (characterClass: string) => {
    const colors: Record<string, string> = {
      'Barbarian': 'from-red-500 to-red-600',
      'Bard': 'from-purple-500 to-purple-600',
      'Cleric': 'from-yellow-500 to-yellow-600',
      'Druid': 'from-green-500 to-green-600',
      'Fighter': 'from-gray-500 to-gray-600',
      'Monk': 'from-blue-500 to-blue-600',
      'Paladin': 'from-amber-500 to-amber-600',
      'Ranger': 'from-emerald-500 to-emerald-600',
      'Rogue': 'from-slate-500 to-slate-600',
      'Sorcerer': 'from-pink-500 to-pink-600',
      'Warlock': 'from-indigo-500 to-indigo-600',
      'Wizard': 'from-cyan-500 to-cyan-600'
    };
    return colors[characterClass] || 'from-gray-500 to-gray-600';
  };

  const formatCurrency = (currency: any) => {
    if (!currency) return '0 gp';
    
    const total = (currency.platinum || 0) * 1000 + 
                  (currency.gold || 0) * 100 + 
                  (currency.electrum || 0) * 50 + 
                  (currency.silver || 0) * 10 + 
                  (currency.copper || 0);
    
    if (total >= 1000) {
      return `${Math.floor(total / 1000)} ${CURRENCY_SYMBOLS.platinum}`;
    } else if (total >= 100) {
      return `${Math.floor(total / 100)} ${CURRENCY_SYMBOLS.gold}`;
    } else if (total >= 10) {
      return `${Math.floor(total / 10)} ${CURRENCY_SYMBOLS.silver}`;
    } else {
      return `${total} ${CURRENCY_SYMBOLS.copper}`;
    }
  };

  const getUniqueClasses = () => {
    const classes = [...new Set(characters.map(char => char.class))];
    return classes.sort();
  };

  const getUniqueLevels = () => {
    const levels = [...new Set(characters.map(char => char.level))];
    return levels.sort((a, b) => a - b);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-200">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-amber-700">Cargando personajes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-amber-900">Mis Personajes</h1>
              <p className="text-amber-700">Gestiona tus héroes épicos de D&D</p>
            </div>
          </div>
          
          <Link
            to="/character/create"
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg transform hover:scale-105"
          >
            <UserPlus size={20} />
            <span>Crear Personaje</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre, clase o raza..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Todas las clases</option>
              {getUniqueClasses().map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Todos los niveles</option>
              {getUniqueLevels().map(level => (
                <option key={level} value={level}>Nivel {level}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{characters.length}</div>
              <div className="text-sm text-blue-700">Total Personajes</div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900">
                {characters.length > 0 ? Math.round(characters.reduce((sum, char) => sum + char.level, 0) / characters.length) : 0}
              </div>
              <div className="text-sm text-green-700">Nivel Promedio</div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">
                {getUniqueClasses().length}
              </div>
              <div className="text-sm text-purple-700">Clases Diferentes</div>
            </div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-900">
                {characters.length > 0 ? Math.max(...characters.map(char => char.level)) : 0}
              </div>
              <div className="text-sm text-amber-700">Nivel Máximo</div>
            </div>
          </div>
        </div>
      </div>

      {/* Characters Grid */}
      {filteredCharacters.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-amber-200 text-center">
          {characters.length === 0 ? (
            <>
              <Users className="w-24 h-24 text-amber-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-amber-900 mb-4">¡Comienza tu Aventura!</h2>
              <p className="text-xl text-amber-700 mb-8 max-w-2xl mx-auto">
                No tienes personajes creados aún. Crea tu primer héroe y embárcate en aventuras épicas.
              </p>
              <Link
                to="/character/create"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg transform hover:scale-105 text-lg font-semibold"
              >
                <UserPlus size={24} />
                <span>Crear Mi Primer Personaje</span>
              </Link>
            </>
          ) : (
            <>
              <Search className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-amber-900 mb-2">No se encontraron personajes</h2>
              <p className="text-amber-700">Intenta ajustar los filtros de búsqueda</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterClass('');
                  setFilterLevel('');
                }}
                className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Limpiar Filtros
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharacters.map(character => {
            const ClassIcon = getClassIcon(character.class);
            const classColor = getClassColor(character.class);
            
            return (
              <div
                key={character.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                {/* Character Header */}
                <div className={`bg-gradient-to-r ${classColor} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <ClassIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{character.name}</h3>
                        <p className="text-white/80">{character.race} {character.class}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">Nv. {character.level}</div>
                    </div>
                  </div>
                  
                  {character.background && (
                    <p className="text-white/90 text-sm">{character.background}</p>
                  )}
                </div>

                {/* Character Stats */}
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center bg-red-50 rounded-lg p-3 border border-red-200">
                      <Heart className="w-5 h-5 text-red-600 mx-auto mb-1" />
                      <div className="text-sm font-medium text-red-900">PV</div>
                      <div className="text-lg font-bold text-red-800">
                        {character.hitPoints.current}/{character.hitPoints.maximum}
                      </div>
                    </div>
                    
                    <div className="text-center bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <Shield className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-sm font-medium text-blue-900">CA</div>
                      <div className="text-lg font-bold text-blue-800">{character.armorClass}</div>
                    </div>
                    
                    <div className="text-center bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <Zap className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <div className="text-sm font-medium text-purple-900">Comp</div>
                      <div className="text-lg font-bold text-purple-800">+{character.proficiencyBonus}</div>
                    </div>
                  </div>

                  {/* Currency */}
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200 mb-6">
                    <div className="flex items-center justify-center space-x-2">
                      <Coins className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-900">
                        {formatCurrency(character.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Equipment Count */}
                  <div className="text-center text-sm text-amber-600 mb-6">
                    {character.equipment.length} objetos en inventario
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/character/${character.id}`}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye size={16} />
                      <span>Ver</span>
                    </Link>
                    
                    <button
                      onClick={() => setShowDeleteModal(character.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Last Updated */}
                  <div className="mt-4 text-xs text-amber-500 text-center">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Actualizado: {new Date(character.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      {characters.length > 0 && (
        <div className="bg-gradient-to-r from-purple-800 to-purple-900 rounded-2xl p-8 text-white shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Acciones Rápidas</h2>
            <p className="text-purple-200">Gestiona tus aventuras con facilidad</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              to="/dice"
              className="bg-purple-700 hover:bg-purple-600 rounded-lg p-4 text-center transition-colors"
            >
              <Zap className="w-8 h-8 mx-auto mb-2" />
              <div className="font-semibold">Lanzar Dados</div>
            </Link>
            
            <Link
              to="/combat"
              className="bg-purple-700 hover:bg-purple-600 rounded-lg p-4 text-center transition-colors"
            >
              <Sword className="w-8 h-8 mx-auto mb-2" />
              <div className="font-semibold">Combate</div>
            </Link>
            
            <Link
              to="/shop"
              className="bg-purple-700 hover:bg-purple-600 rounded-lg p-4 text-center transition-colors"
            >
              <Coins className="w-8 h-8 mx-auto mb-2" />
              <div className="font-semibold">Tienda</div>
            </Link>
            
            <Link
              to="/campaigns"
              className="bg-purple-700 hover:bg-purple-600 rounded-lg p-4 text-center transition-colors"
            >
              <Users className="w-8 h-8 mx-auto mb-2" />
              <div className="font-semibold">Campañas</div>
            </Link>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Eliminar Personaje?</h2>
              <p className="text-gray-600">
                Esta acción no se puede deshacer. El personaje y todos sus datos se eliminarán permanentemente.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteCharacter(showDeleteModal)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Characters;