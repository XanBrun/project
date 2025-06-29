import React, { useState, useEffect } from 'react';
import { 
  Sword, Shield, Heart, Clock, Plus, Minus, Play, Pause, RotateCcw, 
  Dice6, Users, Trash2, Edit, Save, X, AlertTriangle, Zap, Target,
  ChevronRight, ChevronDown, Timer, SkipForward, Package, Eye
} from 'lucide-react';
import { loadCharacters, generateId, saveData, loadData as dbLoadData } from '../services/db';
import { Character, CONDITIONS } from '../types';

interface CombatParticipant {
  id: string;
  name: string;
  initiative: number;
  hitPoints: {
    current: number;
    maximum: number;
    temporary: number;
  };
  armorClass: number;
  isPlayer: boolean;
  conditions: string[];
  notes: string;
  characterId?: string;
  equipment?: string[];
}

interface CombatEncounter {
  id: string;
  name: string;
  participants: CombatParticipant[];
  currentTurn: number;
  round: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

function CombatTracker() {
  const [encounters, setEncounters] = useState<CombatEncounter[]>([]);
  const [currentEncounter, setCurrentEncounter] = useState<CombatEncounter | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showCreateEncounter, setShowCreateEncounter] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<string | null>(null);
  const [expandedParticipant, setExpandedParticipant] = useState<string | null>(null);
  const [showEquipment, setShowEquipment] = useState<string | null>(null);

  const [newParticipant, setNewParticipant] = useState({
    name: '',
    initiative: 10,
    hitPoints: { current: 10, maximum: 10, temporary: 0 },
    armorClass: 10,
    isPlayer: false,
    characterId: ''
  });

  const [newEncounter, setNewEncounter] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [savedEncounters, savedCharacters] = await Promise.all([
        dbLoadData<CombatEncounter[]>('combatEncounters'),
        loadCharacters()
      ]);
      
      setEncounters(savedEncounters || []);
      setCharacters(savedCharacters);
      
      // Load the most recent active encounter
      const activeEncounter = (savedEncounters || []).find(e => e.isActive);
      if (activeEncounter) {
        setCurrentEncounter(activeEncounter);
      }
    } catch (error) {
      console.error('Error loading combat data:', error);
    }
  };

  const saveEncounters = async (updatedEncounters: CombatEncounter[]) => {
    try {
      await saveData('combatEncounters', updatedEncounters);
      setEncounters(updatedEncounters);
    } catch (error) {
      console.error('Error saving encounters:', error);
    }
  };

  const createEncounter = async () => {
    if (!newEncounter.name.trim()) return;

    const encounter: CombatEncounter = {
      id: generateId(),
      name: newEncounter.name,
      participants: [],
      currentTurn: 0,
      round: 1,
      isActive: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updatedEncounters = [...encounters, encounter];
    await saveEncounters(updatedEncounters);
    setCurrentEncounter(encounter);
    setNewEncounter({ name: '', description: '' });
    setShowCreateEncounter(false);
  };

  const addParticipant = () => {
    if (!currentEncounter || !newParticipant.name.trim()) return;

    let participantData = { ...newParticipant };

    // If it's a player character, load their data
    if (newParticipant.isPlayer && newParticipant.characterId) {
      const character = characters.find(c => c.id === newParticipant.characterId);
      if (character) {
        participantData = {
          ...participantData,
          name: character.name,
          hitPoints: { ...character.hitPoints },
          armorClass: character.armorClass
        };
      }
    }

    const participant: CombatParticipant = {
      id: generateId(),
      ...participantData,
      conditions: [],
      notes: '',
      equipment: newParticipant.isPlayer && newParticipant.characterId ? 
        characters.find(c => c.id === newParticipant.characterId)?.equipment || [] : []
    };

    const updatedEncounter = {
      ...currentEncounter,
      participants: [...currentEncounter.participants, participant].sort((a, b) => b.initiative - a.initiative),
      updatedAt: Date.now()
    };

    updateCurrentEncounter(updatedEncounter);
    setNewParticipant({
      name: '',
      initiative: 10,
      hitPoints: { current: 10, maximum: 10, temporary: 0 },
      armorClass: 10,
      isPlayer: false,
      characterId: ''
    });
    setShowAddParticipant(false);
  };

  const updateCurrentEncounter = async (updatedEncounter: CombatEncounter) => {
    const updatedEncounters = encounters.map(e => 
      e.id === updatedEncounter.id ? updatedEncounter : e
    );
    await saveEncounters(updatedEncounters);
    setCurrentEncounter(updatedEncounter);
  };

  const removeParticipant = (participantId: string) => {
    if (!currentEncounter) return;

    const updatedEncounter = {
      ...currentEncounter,
      participants: currentEncounter.participants.filter(p => p.id !== participantId),
      updatedAt: Date.now()
    };

    // Adjust current turn if necessary
    if (updatedEncounter.currentTurn >= updatedEncounter.participants.length) {
      updatedEncounter.currentTurn = 0;
    }

    updateCurrentEncounter(updatedEncounter);
  };

  const updateParticipantHP = (participantId: string, type: 'current' | 'maximum' | 'temporary', value: number) => {
    if (!currentEncounter) return;

    const updatedEncounter = {
      ...currentEncounter,
      participants: currentEncounter.participants.map(p => 
        p.id === participantId 
          ? { 
              ...p, 
              hitPoints: { 
                ...p.hitPoints, 
                [type]: Math.max(0, value) 
              } 
            }
          : p
      ),
      updatedAt: Date.now()
    };

    updateCurrentEncounter(updatedEncounter);
  };

  const toggleCondition = (participantId: string, condition: string) => {
    if (!currentEncounter) return;

    const updatedEncounter = {
      ...currentEncounter,
      participants: currentEncounter.participants.map(p => 
        p.id === participantId 
          ? { 
              ...p, 
              conditions: p.conditions.includes(condition)
                ? p.conditions.filter(c => c !== condition)
                : [...p.conditions, condition]
            }
          : p
      ),
      updatedAt: Date.now()
    };

    updateCurrentEncounter(updatedEncounter);
  };

  const startCombat = () => {
    if (!currentEncounter) return;

    const updatedEncounter = {
      ...currentEncounter,
      isActive: true,
      currentTurn: 0,
      round: 1,
      updatedAt: Date.now()
    };

    updateCurrentEncounter(updatedEncounter);
  };

  const nextTurn = () => {
    if (!currentEncounter || !currentEncounter.isActive) return;

    let nextTurn = currentEncounter.currentTurn + 1;
    let nextRound = currentEncounter.round;

    if (nextTurn >= currentEncounter.participants.length) {
      nextTurn = 0;
      nextRound += 1;
    }

    const updatedEncounter = {
      ...currentEncounter,
      currentTurn: nextTurn,
      round: nextRound,
      updatedAt: Date.now()
    };

    updateCurrentEncounter(updatedEncounter);
  };

  const endCombat = () => {
    if (!currentEncounter) return;

    const updatedEncounter = {
      ...currentEncounter,
      isActive: false,
      updatedAt: Date.now()
    };

    updateCurrentEncounter(updatedEncounter);
  };

  const rollInitiativeForAll = () => {
    if (!currentEncounter) return;

    const updatedEncounter = {
      ...currentEncounter,
      participants: currentEncounter.participants
        .map(p => ({
          ...p,
          initiative: Math.floor(Math.random() * 20) + 1
        }))
        .sort((a, b) => b.initiative - a.initiative),
      currentTurn: 0,
      updatedAt: Date.now()
    };

    updateCurrentEncounter(updatedEncounter);
  };

  const getCurrentParticipant = () => {
    if (!currentEncounter || !currentEncounter.isActive) return null;
    return currentEncounter.participants[currentEncounter.currentTurn];
  };

  const getConditionColor = (condition: string) => {
    const colors: Record<string, string> = {
      'Blinded': 'bg-gray-500',
      'Charmed': 'bg-pink-500',
      'Deafened': 'bg-yellow-500',
      'Frightened': 'bg-purple-500',
      'Grappled': 'bg-orange-500',
      'Incapacitated': 'bg-red-500',
      'Invisible': 'bg-blue-500',
      'Paralyzed': 'bg-red-600',
      'Petrified': 'bg-gray-600',
      'Poisoned': 'bg-green-500',
      'Prone': 'bg-brown-500',
      'Restrained': 'bg-orange-600',
      'Stunned': 'bg-yellow-600',
      'Unconscious': 'bg-black'
    };
    return colors[condition] || 'bg-gray-400';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Sword className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-amber-900">Rastreador de Combate</h1>
              <p className="text-amber-700">Gestiona encuentros épicos con iniciativa automática</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateEncounter(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              <Plus size={18} />
              <span>Nuevo Encuentro</span>
            </button>
          </div>
        </div>

        {/* Encounter Selection */}
        <div className="flex items-center space-x-4">
          <select
            value={currentEncounter?.id || ''}
            onChange={(e) => {
              const encounter = encounters.find(enc => enc.id === e.target.value);
              setCurrentEncounter(encounter || null);
            }}
            className="flex-1 p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Seleccionar encuentro...</option>
            {encounters.map(encounter => (
              <option key={encounter.id} value={encounter.id}>
                {encounter.name} {encounter.isActive ? '(Activo)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentEncounter && (
        <>
          {/* Combat Controls */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-lg font-bold text-amber-900">
                  <Clock className="w-6 h-6" />
                  <span>Ronda: {currentEncounter.round}</span>
                </div>
                
                {currentEncounter.isActive && getCurrentParticipant() && (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-amber-100 rounded-lg border border-amber-300">
                    <Target className="w-5 h-5 text-amber-700" />
                    <span className="font-bold text-amber-900">
                      Turno: {getCurrentParticipant()?.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAddParticipant(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Users size={18} />
                  <span>Agregar</span>
                </button>

                <button
                  onClick={rollInitiativeForAll}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Dice6 size={18} />
                  <span>Tirar Iniciativa</span>
                </button>

                {!currentEncounter.isActive ? (
                  <button
                    onClick={startCombat}
                    disabled={currentEncounter.participants.length === 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Play size={18} />
                    <span>Iniciar Combate</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={nextTurn}
                      className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      <SkipForward size={18} />
                      <span>Siguiente Turno</span>
                    </button>
                    <button
                      onClick={endCombat}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Pause size={18} />
                      <span>Terminar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Participants List */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Participantes</h2>
            
            {currentEncounter.participants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <p className="text-amber-600 text-lg">No hay participantes en este encuentro</p>
                <button
                  onClick={() => setShowAddParticipant(true)}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Agregar Primer Participante
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {currentEncounter.participants.map((participant, index) => {
                  const isCurrentTurn = currentEncounter.isActive && index === currentEncounter.currentTurn;
                  const isExpanded = expandedParticipant === participant.id;
                  const isUnconscious = participant.hitPoints.current <= 0;
                  
                  return (
                    <div
                      key={participant.id}
                      className={`rounded-xl border-2 transition-all ${
                        isCurrentTurn 
                          ? 'border-amber-500 bg-amber-50 shadow-lg' 
                          : 'border-amber-200 bg-white'
                      } ${isUnconscious ? 'opacity-60' : ''}`}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                participant.isPlayer ? 'bg-blue-600' : 'bg-red-600'
                              }`}>
                                {participant.initiative}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-amber-900 flex items-center space-x-2">
                                  <span>{participant.name}</span>
                                  {participant.isPlayer && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                      Jugador
                                    </span>
                                  )}
                                  {isUnconscious && (
                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                      Inconsciente
                                    </span>
                                  )}
                                </h3>
                                <div className="flex items-center space-x-4 text-sm text-amber-700">
                                  <div className="flex items-center space-x-1">
                                    <Shield className="w-4 h-4" />
                                    <span>CA {participant.armorClass}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Heart className="w-4 h-4" />
                                    <span>{participant.hitPoints.current}/{participant.hitPoints.maximum}</span>
                                    {participant.hitPoints.temporary > 0 && (
                                      <span className="text-green-600">+{participant.hitPoints.temporary}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Conditions */}
                            {participant.conditions.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {participant.conditions.map(condition => (
                                  <span
                                    key={condition}
                                    className={`text-xs text-white px-2 py-1 rounded-full ${getConditionColor(condition)}`}
                                  >
                                    {condition}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {participant.equipment && participant.equipment.length > 0 && (
                              <button
                                onClick={() => setShowEquipment(showEquipment === participant.id ? null : participant.id)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Ver equipo"
                              >
                                <Package size={18} />
                              </button>
                            )}
                            
                            <button
                              onClick={() => setExpandedParticipant(isExpanded ? null : participant.id)}
                              className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                            >
                              {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </button>
                            <button
                              onClick={() => removeParticipant(participant.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Equipment Display */}
                        {showEquipment === participant.id && participant.equipment && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-bold text-blue-900 mb-2 flex items-center">
                              <Package className="w-4 h-4 mr-2" />
                              Equipo Disponible
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {participant.equipment.map((item, index) => (
                                <div key={index} className="text-sm bg-white p-2 rounded border border-blue-200">
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-amber-200 space-y-4">
                            {/* HP Management */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-red-900">PV Actuales</span>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => updateParticipantHP(participant.id, 'current', participant.hitPoints.current - 1)}
                                      className="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                                    >
                                      -
                                    </button>
                                    <span className="font-bold text-red-900 min-w-[2rem] text-center">
                                      {participant.hitPoints.current}
                                    </span>
                                    <button
                                      onClick={() => updateParticipantHP(participant.id, 'current', participant.hitPoints.current + 1)}
                                      className="w-6 h-6 bg-green-500 text-white rounded-full text-xs hover:bg-green-600"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-blue-900">PV Máximos</span>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => updateParticipantHP(participant.id, 'maximum', participant.hitPoints.maximum - 1)}
                                      className="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                                    >
                                      -
                                    </button>
                                    <span className="font-bold text-blue-900 min-w-[2rem] text-center">
                                      {participant.hitPoints.maximum}
                                    </span>
                                    <button
                                      onClick={() => updateParticipantHP(participant.id, 'maximum', participant.hitPoints.maximum + 1)}
                                      className="w-6 h-6 bg-green-500 text-white rounded-full text-xs hover:bg-green-600"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-green-900">PV Temporales</span>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => updateParticipantHP(participant.id, 'temporary', participant.hitPoints.temporary - 1)}
                                      className="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                                    >
                                      -
                                    </button>
                                    <span className="font-bold text-green-900 min-w-[2rem] text-center">
                                      {participant.hitPoints.temporary}
                                    </span>
                                    <button
                                      onClick={() => updateParticipantHP(participant.id, 'temporary', participant.hitPoints.temporary + 1)}
                                      className="w-6 h-6 bg-green-500 text-white rounded-full text-xs hover:bg-green-600"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Conditions */}
                            <div>
                              <h4 className="font-medium text-amber-900 mb-2">Condiciones</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {CONDITIONS.map(condition => (
                                  <button
                                    key={condition}
                                    onClick={() => toggleCondition(participant.id, condition)}
                                    className={`text-xs p-2 rounded-lg border transition-colors ${
                                      participant.conditions.includes(condition)
                                        ? `${getConditionColor(condition)} text-white border-transparent`
                                        : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-50'
                                    }`}
                                  >
                                    {condition}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Create Encounter Modal */}
      {showCreateEncounter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-amber-900">Nuevo Encuentro</h2>
              <button
                onClick={() => setShowCreateEncounter(false)}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Nombre del Encuentro *
                </label>
                <input
                  type="text"
                  value={newEncounter.name}
                  onChange={(e) => setNewEncounter(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ej: Batalla en la Taberna"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateEncounter(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={createEncounter}
                  disabled={!newEncounter.name.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Participant Modal */}
      {showAddParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-amber-900">Agregar Participante</h2>
              <button
                onClick={() => setShowAddParticipant(false)}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={!newParticipant.isPlayer}
                    onChange={() => setNewParticipant(prev => ({ ...prev, isPlayer: false, characterId: '' }))}
                    className="text-amber-600"
                  />
                  <span>NPC/Enemigo</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={newParticipant.isPlayer}
                    onChange={() => setNewParticipant(prev => ({ ...prev, isPlayer: true }))}
                    className="text-amber-600"
                  />
                  <span>Personaje Jugador</span>
                </label>
              </div>

              {newParticipant.isPlayer ? (
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Seleccionar Personaje
                  </label>
                  <select
                    value={newParticipant.characterId}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, characterId: e.target.value }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar personaje...</option>
                    {characters.map(character => (
                      <option key={character.id} value={character.id}>
                        {character.name} - {character.class} Nivel {character.level}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={newParticipant.name}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Nombre del NPC o enemigo"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Iniciativa
                  </label>
                  <input
                    type="number"
                    value={newParticipant.initiative}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, initiative: parseInt(e.target.value) || 0 }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Clase de Armadura
                  </label>
                  <input
                    type="number"
                    value={newParticipant.armorClass}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, armorClass: parseInt(e.target.value) || 10 }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {!newParticipant.isPlayer && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-2">
                      PV Actuales
                    </label>
                    <input
                      type="number"
                      value={newParticipant.hitPoints.current}
                      onChange={(e) => setNewParticipant(prev => ({ 
                        ...prev, 
                        hitPoints: { 
                          ...prev.hitPoints, 
                          current: parseInt(e.target.value) || 0 
                        } 
                      }))}
                      className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-900 mb-2">
                      PV Máximos
                    </label>
                    <input
                      type="number"
                      value={newParticipant.hitPoints.maximum}
                      onChange={(e) => setNewParticipant(prev => ({ 
                        ...prev, 
                        hitPoints: { 
                          ...prev.hitPoints, 
                          maximum: parseInt(e.target.value) || 0 
                        } 
                      }))}
                      className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddParticipant(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addParticipant}
                  disabled={
                    newParticipant.isPlayer 
                      ? !newParticipant.characterId 
                      : !newParticipant.name.trim()
                  }
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CombatTracker;