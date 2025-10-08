import React, { useState, useEffect } from 'react';
import { 
  Sword, Plus, Minus, Play, Pause, RotateCcw, Users, Heart, Shield, 
  Zap, Trash2, Edit, Save, X, AlertCircle, Crown, Target, Eye, EyeOff 
} from 'lucide-react';
import { 
  saveCombatEncounter, loadCombatEncounters, deleteCombatEncounter, 
  loadCharacters, loadNPCTemplates, generateId 
} from '../services/db';
import { CombatEncounter, CombatParticipant, Character, NPCTemplate } from '../types';
import { useBluetoothStore } from '../stores/bluetoothStore';
import BluetoothStatus from '../components/bluetooth/BluetoothStatus';
import ConditionsManager from '../components/combat/ConditionsManager';
import CombatLog, { CombatLogEntry } from '../components/combat/CombatLog';

function CombatTracker() {
  const [encounters, setEncounters] = useState<CombatEncounter[]>([]);
  const [currentEncounter, setCurrentEncounter] = useState<CombatEncounter | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [npcTemplates, setNpcTemplates] = useState<NPCTemplate[]>([]);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [combatLog, setCombatLog] = useState<CombatLogEntry[]>([]);
  const [showLog, setShowLog] = useState(false);

  // Bluetooth store with send capabilities
  const { isConnected, deviceInfo, sendCharacterUpdate } = useBluetoothStore();

  const [newParticipant, setNewParticipant] = useState<Partial<CombatParticipant>>({
    name: '',
    initiative: 10,
    hitPoints: { current: 10, maximum: 10, temporary: 0 },
    armorClass: 10,
    isPlayer: true,
    conditions: [],
    notes: '',
    equipment: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [encountersData, charactersData, templatesData] = await Promise.all([
        loadCombatEncounters(),
        loadCharacters(),
        loadNPCTemplates()
      ]);
      
      setEncounters(encountersData);
      setCharacters(charactersData);
      setNpcTemplates(templatesData);
      
      if (encountersData.length > 0) {
        setCurrentEncounter(encountersData[0]);
      }
    } catch (error) {
      console.error('Error loading combat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewEncounter = async () => {
    const newEncounter: CombatEncounter = {
      id: generateId(),
      name: `Encuentro ${encounters.length + 1}`,
      participants: [],
      currentTurn: 0,
      round: 1,
      isActive: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await saveCombatEncounter(newEncounter);
    setEncounters(prev => [...prev, newEncounter]);
    setCurrentEncounter(newEncounter);
  };

  const addParticipant = async () => {
    if (!currentEncounter || !newParticipant.name) return;

    const participant: CombatParticipant = {
      id: generateId(),
      name: newParticipant.name,
      initiative: newParticipant.initiative || 10,
      hitPoints: newParticipant.hitPoints || { current: 10, maximum: 10, temporary: 0 },
      armorClass: newParticipant.armorClass || 10,
      isPlayer: newParticipant.isPlayer || false,
      conditions: [],
      notes: newParticipant.notes || '',
      equipment: newParticipant.equipment || [],
      characterId: newParticipant.characterId,
      npcType: newParticipant.npcType,
      challengeRating: newParticipant.challengeRating,
      abilities: newParticipant.abilities || []
    };

    const updatedEncounter = {
      ...currentEncounter,
      participants: [...currentEncounter.participants, participant].sort((a, b) => b.initiative - a.initiative),
      updatedAt: Date.now()
    };

    await saveCombatEncounter(updatedEncounter);
    setCurrentEncounter(updatedEncounter);
    setEncounters(prev => prev.map(e => e.id === updatedEncounter.id ? updatedEncounter : e));
    
    setNewParticipant({
      name: '',
      initiative: 10,
      hitPoints: { current: 10, maximum: 10, temporary: 0 },
      armorClass: 10,
      isPlayer: true,
      conditions: [],
      notes: '',
      equipment: []
    });
    setShowAddParticipant(false);
  };

  const updateParticipant = async (participantId: string, updates: Partial<CombatParticipant>) => {
    if (!currentEncounter) return;

    const updatedEncounter = {
      ...currentEncounter,
      participants: currentEncounter.participants.map(p =>
        p.id === participantId ? { ...p, ...updates } : p
      ),
      updatedAt: Date.now()
    };

    await saveCombatEncounter(updatedEncounter);
    setCurrentEncounter(updatedEncounter);
    setEncounters(prev => prev.map(e => e.id === updatedEncounter.id ? updatedEncounter : e));

    // Sync HP changes via Bluetooth
    if (isConnected && updates.hitPoints) {
      try {
        const participant = updatedEncounter.participants.find(p => p.id === participantId);
        await sendCharacterUpdate(participantId, {
          type: 'hp_update',
          name: participant?.name,
          hitPoints: updates.hitPoints,
          timestamp: Date.now()
        });
        console.log('📤 HP update synced via Bluetooth');
      } catch (error) {
        console.warn('Could not sync HP via Bluetooth:', error);
      }
    }
  };

  const removeParticipant = async (participantId: string) => {
    if (!currentEncounter) return;

    const updatedEncounter = {
      ...currentEncounter,
      participants: currentEncounter.participants.filter(p => p.id !== participantId),
      updatedAt: Date.now()
    };

    await saveCombatEncounter(updatedEncounter);
    setCurrentEncounter(updatedEncounter);
    setEncounters(prev => prev.map(e => e.id === updatedEncounter.id ? updatedEncounter : e));
  };

  const addLogEntry = (type: CombatLogEntry['type'], message: string, participantName?: string) => {
    const entry: CombatLogEntry = {
      id: generateId(),
      type,
      message,
      timestamp: Date.now(),
      participantName
    };
    setCombatLog(prev => [...prev, entry]);
  };

  const startCombat = async () => {
    if (!currentEncounter) return;

    const updatedEncounter = {
      ...currentEncounter,
      isActive: true,
      currentTurn: 0,
      round: 1,
      updatedAt: Date.now()
    };

    await saveCombatEncounter(updatedEncounter);
    setCurrentEncounter(updatedEncounter);
    setEncounters(prev => prev.map(e => e.id === updatedEncounter.id ? updatedEncounter : e));
    addLogEntry('action', `¡El combate ha comenzado! Ronda 1`);
  };

  const nextTurn = async () => {
    if (!currentEncounter) return;

    let newTurn = currentEncounter.currentTurn + 1;
    let newRound = currentEncounter.round;

    if (newTurn >= currentEncounter.participants.length) {
      newTurn = 0;
      newRound += 1;
    }

    const updatedEncounter = {
      ...currentEncounter,
      currentTurn: newTurn,
      round: newRound,
      updatedAt: Date.now()
    };

    await saveCombatEncounter(updatedEncounter);
    setCurrentEncounter(updatedEncounter);
    setEncounters(prev => prev.map(e => e.id === updatedEncounter.id ? updatedEncounter : e));

    // Add log entry
    const currentParticipant = updatedEncounter.participants[newTurn];
    if (newTurn === 0) {
      addLogEntry('turn', `Ronda ${newRound} - Turno de ${currentParticipant?.name}`, currentParticipant?.name);
    } else {
      addLogEntry('turn', `Turno de ${currentParticipant?.name}`, currentParticipant?.name);
    }

    // Sync turn change via Bluetooth
    if (isConnected) {
      try {
        await sendCharacterUpdate('combat_turn', {
          encounterId: updatedEncounter.id,
          currentTurn: newTurn,
          round: newRound,
          participantName: currentParticipant?.name,
          timestamp: Date.now()
        });
        console.log('📤 Turn change synced via Bluetooth');
      } catch (error) {
        console.warn('Could not sync turn via Bluetooth:', error);
      }
    }
  };

  const endCombat = async () => {
    if (!currentEncounter) return;

    const updatedEncounter = {
      ...currentEncounter,
      isActive: false,
      updatedAt: Date.now()
    };

    await saveCombatEncounter(updatedEncounter);
    setCurrentEncounter(updatedEncounter);
    setEncounters(prev => prev.map(e => e.id === updatedEncounter.id ? updatedEncounter : e));
  };

  const addCharacterToEncounter = (character: Character) => {
    setNewParticipant({
      name: character.name,
      initiative: 10,
      hitPoints: character.hitPoints,
      armorClass: character.armorClass,
      isPlayer: true,
      conditions: [],
      notes: '',
      equipment: character.equipment,
      characterId: character.id
    });
    setShowAddParticipant(true);
  };

  const addNPCFromTemplate = (template: NPCTemplate) => {
    setNewParticipant({
      name: template.name,
      initiative: 10,
      hitPoints: template.hitPoints,
      armorClass: template.armorClass,
      isPlayer: false,
      conditions: [],
      notes: template.description,
      equipment: [],
      npcType: template.type,
      challengeRating: template.challengeRating,
      abilities: template.abilities
    });
    setShowAddParticipant(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-200">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-amber-700">Cargando rastreador de combate...</p>
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
            <Sword className="w-8 h-8 text-red-600" />
            <div>
              <h1 className="text-3xl font-bold text-amber-900">Rastreador de Combate</h1>
              <p className="text-amber-700">Gestiona encuentros épicos con iniciativa automática</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <BluetoothStatus showDetails={false} compact={true} />
            {isConnected && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 rounded-lg border border-green-300">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">Sincronizado</span>
              </div>
            )}
            <button
              onClick={createNewEncounter}
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
                {encounter.name} - {encounter.participants.length} participantes
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentEncounter ? (
        <>
          {/* Combat Controls */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-amber-900">{currentEncounter.name}</h2>
              <div className="flex items-center space-x-3">
                {currentEncounter.isActive ? (
                  <>
                    <div className="text-center px-4 py-2 bg-green-100 rounded-lg border border-green-300">
                      <div className="text-sm font-medium text-green-900">Ronda {currentEncounter.round}</div>
                    </div>
                    <button
                      onClick={nextTurn}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Play size={18} />
                      <span>Siguiente Turno</span>
                    </button>
                    <button
                      onClick={endCombat}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Pause size={18} />
                      <span>Terminar Combate</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={startCombat}
                    disabled={currentEncounter.participants.length === 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Play size={18} />
                    <span>Iniciar Combate</span>
                  </button>
                )}
              </div>
            </div>

            {/* Add Participant Button */}
            <button
              onClick={() => setShowAddParticipant(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Plus size={18} />
              <span>Agregar Participante</span>
            </button>
          </div>

          {/* Participants List */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
            <h3 className="text-xl font-bold text-amber-900 mb-4">
              Participantes ({currentEncounter.participants.length})
            </h3>
            
            {currentEncounter.participants.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <p className="text-amber-600">No hay participantes en este encuentro</p>
                <button
                  onClick={() => setShowAddParticipant(true)}
                  className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Agregar Primer Participante
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {currentEncounter.participants.map((participant, index) => (
                  <div
                    key={participant.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      currentEncounter.isActive && index === currentEncounter.currentTurn
                        ? 'border-green-500 bg-green-50'
                        : participant.isPlayer
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-red-300 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-amber-900">
                            {participant.initiative}
                          </div>
                          <div className="text-xs text-amber-600">Iniciativa</div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-lg font-bold text-amber-900">{participant.name}</h4>
                            {participant.isPlayer ? (
                              <Crown className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Target className="w-5 h-5 text-red-600" />
                            )}
                            {currentEncounter.isActive && index === currentEncounter.currentTurn && (
                              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                TURNO ACTUAL
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-2">
                              <Heart className="w-4 h-4 text-red-600" />
                              <span className="text-sm">
                                {participant.hitPoints.current}/{participant.hitPoints.maximum}
                                {participant.hitPoints.temporary > 0 && ` (+${participant.hitPoints.temporary})`}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Shield className="w-4 h-4 text-blue-600" />
                              <span className="text-sm">CA {participant.armorClass}</span>
                            </div>
                            
                            {participant.conditions.length > 0 && (
                              <div className="flex items-center space-x-2">
                                <AlertCircle className="w-4 h-4 text-orange-600" />
                                <span className="text-sm">{participant.conditions.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateParticipant(participant.id, {
                            hitPoints: {
                              ...participant.hitPoints,
                              current: Math.max(0, participant.hitPoints.current - 1)
                            }
                          })}
                          className="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        
                        <button
                          onClick={() => updateParticipant(participant.id, {
                            hitPoints: {
                              ...participant.hitPoints,
                              current: Math.min(participant.hitPoints.maximum, participant.hitPoints.current + 1)
                            }
                          })}
                          className="w-8 h-8 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                        
                        <button
                          onClick={() => setEditingParticipant(participant.id)}
                          className="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        
                        <button
                          onClick={() => removeParticipant(participant.id)}
                          className="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-amber-200 text-center">
          <Sword className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-amber-900 mb-2">No hay encuentro seleccionado</h2>
          <p className="text-amber-700 mb-6">Crea un nuevo encuentro o selecciona uno existente</p>
          <button
            onClick={createNewEncounter}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
          >
            Crear Primer Encuentro
          </button>
        </div>
      )}

      {/* Add Participant Modal */}
      {showAddParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-amber-900">Agregar Participante</h2>
              <button
                onClick={() => setShowAddParticipant(false)}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Add from Characters */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-amber-900 mb-3">Personajes Disponibles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-32 overflow-y-auto">
                {characters.map(character => (
                  <button
                    key={character.id}
                    onClick={() => addCharacterToEncounter(character)}
                    className="p-3 text-left bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    <div className="font-bold text-blue-900">{character.name}</div>
                    <div className="text-sm text-blue-700">{character.class} Nv.{character.level}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Add from NPC Templates */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-amber-900 mb-3">Plantillas de NPCs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-32 overflow-y-auto">
                {npcTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => addNPCFromTemplate(template)}
                    className="p-3 text-left bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    <div className="font-bold text-red-900">{template.name}</div>
                    <div className="text-sm text-red-700">CR {template.challengeRating}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Add Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={newParticipant.name || ''}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Nombre del participante"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Iniciativa
                  </label>
                  <input
                    type="number"
                    value={newParticipant.initiative || 10}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, initiative: parseInt(e.target.value) || 10 }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Puntos de Vida
                  </label>
                  <input
                    type="number"
                    value={newParticipant.hitPoints?.maximum || 10}
                    onChange={(e) => {
                      const hp = parseInt(e.target.value) || 10;
                      setNewParticipant(prev => ({ 
                        ...prev, 
                        hitPoints: { current: hp, maximum: hp, temporary: 0 }
                      }));
                    }}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Clase de Armadura
                  </label>
                  <input
                    type="number"
                    value={newParticipant.armorClass || 10}
                    onChange={(e) => setNewParticipant(prev => ({ ...prev, armorClass: parseInt(e.target.value) || 10 }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={newParticipant.isPlayer === true}
                    onChange={() => setNewParticipant(prev => ({ ...prev, isPlayer: true }))}
                    className="text-amber-600"
                  />
                  <span className="text-amber-900">Jugador</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={newParticipant.isPlayer === false}
                    onChange={() => setNewParticipant(prev => ({ ...prev, isPlayer: false }))}
                    className="text-amber-600"
                  />
                  <span className="text-amber-900">NPC/Enemigo</span>
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddParticipant(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addParticipant}
                  disabled={!newParticipant.name}
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