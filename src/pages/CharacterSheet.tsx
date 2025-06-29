import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Heart, Shield, Zap, Dice6, Edit, Save, ArrowLeft, 
  Sword, Book, Backpack, Scroll, Plus, Minus, Coins, ShoppingCart 
} from 'lucide-react';
import { loadCharacter, saveCharacter } from '../services/db';
import { Character, Currency } from '../types';
import { CURRENCY_NAMES, CURRENCY_SYMBOLS } from '../types';

function CharacterSheet() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharacterData();
  }, [id]);

  const loadCharacterData = async () => {
    if (!id) return;
    
    try {
      const char = await loadCharacter(id);
      setCharacter(char);
    } catch (error) {
      console.error('Error loading character:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!character) return;
    
    try {
      await saveCharacter(character);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving character:', error);
      alert('Error al guardar el personaje');
    }
  };

  const updateCharacter = (field: string, value: any) => {
    if (!character) return;
    
    setCharacter(prev => ({
      ...prev!,
      [field]: value,
      updatedAt: Date.now()
    }));
  };

  const updateHP = (type: 'current' | 'maximum' | 'temporary', value: number) => {
    if (!character) return;
    
    setCharacter(prev => ({
      ...prev!,
      hitPoints: {
        ...prev!.hitPoints,
        [type]: Math.max(0, value)
      },
      updatedAt: Date.now()
    }));
  };

  const updateCurrency = (currencyType: keyof Currency, value: number) => {
    if (!character) return;
    
    setCharacter(prev => ({
      ...prev!,
      currency: {
        ...prev!.currency,
        [currencyType]: Math.max(0, value)
      },
      updatedAt: Date.now()
    }));
  };

  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const formatCurrency = (currency: Currency): string => {
    const parts = [];
    if (currency.platinum > 0) parts.push(`${currency.platinum} ${CURRENCY_SYMBOLS.platinum}`);
    if (currency.gold > 0) parts.push(`${currency.gold} ${CURRENCY_SYMBOLS.gold}`);
    if (currency.electrum > 0) parts.push(`${currency.electrum} ${CURRENCY_SYMBOLS.electrum}`);
    if (currency.silver > 0) parts.push(`${currency.silver} ${CURRENCY_SYMBOLS.silver}`);
    if (currency.copper > 0) parts.push(`${currency.copper} ${CURRENCY_SYMBOLS.copper}`);
    
    return parts.length > 0 ? parts.join(', ') : '0 cp';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-200">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-amber-700">Cargando personaje...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-200 text-center">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">Personaje no encontrado</h2>
          <button
            onClick={() => navigate('/character/create')}
            className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Crear Nuevo Personaje
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-amber-700 hover:text-amber-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/shop?characterId=${character.id}`)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ShoppingCart size={18} />
              <span>Ir a la Tienda</span>
            </button>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit size={18} />
              <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
            </button>
            
            {isEditing && (
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save size={18} />
                <span>Guardar</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {isEditing ? (
              <input
                type="text"
                value={character.name}
                onChange={(e) => updateCharacter('name', e.target.value)}
                className="text-4xl font-bold text-amber-900 bg-transparent border-b-2 border-amber-300 focus:border-amber-600 outline-none w-full"
              />
            ) : (
              <h1 className="text-4xl font-bold text-amber-900">{character.name}</h1>
            )}
            <p className="text-xl text-amber-700 mt-2">
              {character.race} {character.class} - Nivel {character.level}
            </p>
            <p className="text-amber-600">{character.background}</p>
            {character.alignment && (
              <p className="text-amber-600">{character.alignment}</p>
            )}
          </div>
          
          <div className="flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats and Combat */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ability Scores */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
            <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center">
              <Zap className="w-6 h-6 mr-2" />
              Puntuaciones de Habilidad
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {Object.entries(character.stats).map(([stat, value]) => (
                <div key={stat} className="text-center bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="text-sm font-medium text-amber-700 uppercase mb-1">
                    {stat.slice(0, 3)}
                  </div>
                  <div className="text-2xl font-bold text-amber-900">{value}</div>
                  <div className="text-sm text-amber-600">{getModifier(value)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Combat Stats */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
            <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center">
              <Sword className="w-6 h-6 mr-2" />
              Estadísticas de Combate
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Hit Points */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Heart className="w-5 h-5 text-red-600 mr-2" />
                    <span className="font-bold text-red-900">Puntos de Vida</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-700">Actuales:</span>
                    <div className="flex items-center space-x-2">
                      {isEditing && (
                        <button
                          onClick={() => updateHP('current', character.hitPoints.current - 1)}
                          className="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                        >
                          -
                        </button>
                      )}
                      <span className="text-lg font-bold text-red-900 min-w-[2rem] text-center">
                        {character.hitPoints.current}
                      </span>
                      {isEditing && (
                        <button
                          onClick={() => updateHP('current', character.hitPoints.current + 1)}
                          className="w-6 h-6 bg-green-500 text-white rounded-full text-xs hover:bg-green-600"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-700">Máximos:</span>
                    <span className="text-lg font-bold text-red-900">{character.hitPoints.maximum}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-700">Temporales:</span>
                    <div className="flex items-center space-x-2">
                      {isEditing && (
                        <button
                          onClick={() => updateHP('temporary', character.hitPoints.temporary - 1)}
                          className="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                        >
                          -
                        </button>
                      )}
                      <span className="text-lg font-bold text-red-900 min-w-[2rem] text-center">
                        {character.hitPoints.temporary}
                      </span>
                      {isEditing && (
                        <button
                          onClick={() => updateHP('temporary', character.hitPoints.temporary + 1)}
                          className="w-6 h-6 bg-green-500 text-white rounded-full text-xs hover:bg-green-600"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Armor Class */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Shield className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-bold text-blue-900">Clase de Armadura</span>
                </div>
                <div className="text-3xl font-bold text-blue-800">{character.armorClass}</div>
              </div>

              {/* Proficiency Bonus */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="font-bold text-purple-900">Bonif. Competencia</span>
                </div>
                <div className="text-3xl font-bold text-purple-800">+{character.proficiencyBonus}</div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
            <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center">
              <Book className="w-6 h-6 mr-2" />
              Habilidades
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(character.skills).map(([skill, isProficient]) => {
                const relatedStat = 
                  ['Athletics'].includes(skill) ? 'strength' :
                  ['Acrobatics', 'Sleight of Hand', 'Stealth'].includes(skill) ? 'dexterity' :
                  ['Arcana', 'History', 'Investigation', 'Nature', 'Religion'].includes(skill) ? 'intelligence' :
                  ['Animal Handling', 'Insight', 'Medicine', 'Perception', 'Survival'].includes(skill) ? 'wisdom' :
                  'charisma';
                
                const statValue = character.stats[relatedStat as keyof typeof character.stats];
                const modifier = Math.floor((statValue - 10) / 2);
                const totalBonus = modifier + (isProficient ? character.proficiencyBonus : 0);
                
                return (
                  <div key={skill} className={`flex items-center justify-between p-2 rounded ${
                    isProficient ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        isProficient ? 'bg-amber-600' : 'bg-gray-300'
                      }`} />
                      <span className="font-medium text-amber-900">{skill}</span>
                    </div>
                    <span className="font-bold text-amber-800">
                      {totalBonus >= 0 ? '+' : ''}{totalBonus}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Equipment, Currency and Notes */}
        <div className="space-y-6">
          {/* Currency */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
            <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center">
              <Coins className="w-6 h-6 mr-2" />
              Monedas
            </h2>
            <div className="space-y-3">
              {Object.entries(character.currency).map(([currencyType, amount]) => (
                <div key={currencyType} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full ${
                      currencyType === 'platinum' ? 'bg-gray-300' :
                      currencyType === 'gold' ? 'bg-yellow-500' :
                      currencyType === 'electrum' ? 'bg-yellow-300' :
                      currencyType === 'silver' ? 'bg-gray-400' :
                      'bg-orange-600'
                    }`} />
                    <span className="font-medium text-amber-900">
                      {CURRENCY_NAMES[currencyType as keyof Currency]}
                    </span>
                  </div>
                  
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCurrency(currencyType as keyof Currency, amount - 1)}
                        className="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                      >
                        -
                      </button>
                      <span className="font-bold text-amber-900 min-w-[3rem] text-center">
                        {amount}
                      </span>
                      <button
                        onClick={() => updateCurrency(currencyType as keyof Currency, amount + 1)}
                        className="w-6 h-6 bg-green-500 text-white rounded-full text-xs hover:bg-green-600"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <span className="font-bold text-amber-900">
                      {amount} {CURRENCY_SYMBOLS[currencyType as keyof Currency]}
                    </span>
                  )}
                </div>
              ))}
              
              <div className="border-t border-amber-300 pt-3 mt-3">
                <div className="text-center">
                  <span className="text-sm text-amber-700">Total: </span>
                  <span className="font-bold text-amber-900">{formatCurrency(character.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
            <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center">
              <Backpack className="w-6 h-6 mr-2" />
              Equipo
            </h2>
            {isEditing ? (
              <textarea
                value={character.equipment.join('\n')}
                onChange={(e) => updateCharacter('equipment', e.target.value.split('\n').filter(item => item.trim()))}
                className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-40"
                placeholder="Un objeto por línea"
              />
            ) : (
              <div className="space-y-2">
                {character.equipment.length > 0 ? (
                  character.equipment.map((item, index) => (
                    <div key={index} className="flex items-center p-2 bg-amber-50 rounded border border-amber-200">
                      <div className="w-2 h-2 bg-amber-600 rounded-full mr-3" />
                      <span className="text-amber-900">{item}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-amber-600 italic">No hay equipo registrado</p>
                )}
              </div>
            )}
          </div>

          {/* Spells */}
          {character.spells && character.spells.length > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
              <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center">
                <Scroll className="w-6 h-6 mr-2" />
                Hechizos
              </h2>
              <div className="space-y-2">
                {character.spells.map((spell, index) => (
                  <div key={index} className="flex items-center p-2 bg-purple-50 rounded border border-purple-200">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mr-3" />
                    <span className="text-purple-900">{spell}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">Notas</h2>
            {isEditing ? (
              <textarea
                value={character.notes}
                onChange={(e) => updateCharacter('notes', e.target.value)}
                className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-32"
                placeholder="Historia del personaje, personalidad, objetivos..."
              />
            ) : (
              <div className="text-amber-800">
                {character.notes ? (
                  <p className="whitespace-pre-wrap">{character.notes}</p>
                ) : (
                  <p className="text-amber-600 italic">No hay notas registradas</p>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">Acciones Rápidas</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dice')}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Dice6 size={18} />
                <span>Lanzar Dados</span>
              </button>
              <button
                onClick={() => navigate('/combat')}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Sword size={18} />
                <span>Ir a Combate</span>
              </button>
              <button
                onClick={() => navigate(`/shop?characterId=${character.id}`)}
                className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart size={18} />
                <span>Visitar Tienda</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CharacterSheet;