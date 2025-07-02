import React, { useState, useEffect } from 'react';
import { 
  Sword, Plus, Play, Pause, RotateCcw, Trash2, Edit, Save, X, 
  Heart, Shield, Zap, Users, Eye, EyeOff, AlertTriangle, 
  ChevronUp, ChevronDown, Dice6, Target, Clock, Crown,
  UserPlus, Bot, Settings, Download, Upload, RefreshCw, Send,
  MessageSquare, Activity, Wifi, WifiOff
} from 'lucide-react';
import { 
  saveCombatEncounter, loadCombatEncounters, deleteCombatEncounter,
  loadCharacters, loadNPCTemplates, generateId, rollDice
} from '../services/db';
import { 
  CombatEncounter, CombatParticipant, Character, NPCTemplate, 
  CONDITIONS, HitPoints 
} from '../types';
import { useBluetoothStore } from '../stores/bluetoothStore';
import { bluetoothService } from '../services/bluetooth';

interface InitiativeRoll {
  participantId: string;
  roll: number;
  modifier: number;
  total: number;
}

interface CombatAction {
  id: string;
  participantId: string;
  type: 'attack' | 'damage' | 'heal' | 'condition' | 'move' | 'other';
  description: string;
  target?: string;
  value?: number;
  timestamp: number;
  playerId?: string;
}

interface PlayerAction {
  playerId: string;
  participantId: string;
  action: CombatAction;
  pending: boolean;
}

function CombatTracker() {
  const [encounters, setEncounters] = useState<CombatEncounter[]>([]);
  const [currentEncounter, setCurrentEncounter] = useState<CombatEncounter | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [npcTemplates, setNPCTemplates] = useState<NPCTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [showInitiativeModal, setShowInitiativeModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<CombatParticipant | null>(null);
  const [initiativeRolls, setInitiativeRolls] = useState<InitiativeRoll[]>([]);
  const [combatActions, setCombatActions] = useState<CombatAction[]>([]);
  const [pendingActions, setPendingActions] = useState<PlayerAction[]>([]);
  const [newEncounterName, setNewEncounterName] = useState('');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [selectedNPCs, setSelectedNPCs] = useState<{ templateId: string; count: number }[]>([]);
  const [isDM, setIsDM] = useState(true); // En una implementación real, esto vendría del sistema de usuarios
  const [autoAdvanceTurns, setAutoAdvanceTurns] = useState(false);
  const [turnTimer, setTurnTimer] = useState<number | null>(null);
  const [turnTimeLimit, setTurnTimeLimit] = useState(60); // segundos

  // Bluetooth integration
  const { isConnected, deviceInfo } = useBluetoothStore();

  useEffect(() => {
    loadData();
    setupBluetoothHandlers();
    
    return () => {
      cleanupBluetoothHandlers();
    };
  }, []);

  useEffect(() => {
    // Turn timer logic
    let interval: NodeJS.Timeout;
    
    if (turnTimer !== null && turnTimer > 0 && currentEncounter && autoAdvanceTurns) {
      interval = setInterval(() => {
        setTurnTimer(prev => {
          if (prev === null || prev <= 1) {
            // Auto advance turn when timer expires
            nextTurn();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [turnTimer, currentEncounter, autoAdvanceTurns]);

  const setupBluetoothHandlers = () => {
    if (isConnected) {
      bluetoothService.addMessageHandler('combat-tracker', handleBluetoothMessage);
    }
  };

  const cleanupBluetoothHandlers = () => {
    bluetoothService.removeMessageHandler('combat-tracker');
  };

  const handleBluetoothMessage = (message: any) => {
    switch (message.type) {
      case 'combat_action':
        handleRemoteCombatAction(message.data);
        break;
      case 'combat_sync':
        syncCombatState(message.data);
        break;
      case 'turn_advance':
        if (isDM) {
          nextTurn();
        }
        break;
      case 'initiative_roll':
        handleRemoteInitiativeRoll(message.data);
        break;
    }
  };

  const handleRemoteCombatAction = (actionData: any) => {
    const action: CombatAction = {
      id: generateId(),
      ...actionData,
      timestamp: Date.now()
    };

    if (isDM) {
      // DM can approve or reject actions
      setPendingActions(prev => [...prev, {
        playerId: actionData.playerId,
        participantId: actionData.participantId,
        action,
        pending: true
      }]);
    } else {
      // Players see actions immediately
      setCombatActions(prev => [action, ...prev]);
    }
  };

  const syncCombatState = (encounterData: CombatEncounter) => {
    if (!isDM) {
      setCurrentEncounter(encounterData);
    }
  };

  const handleRemoteInitiativeRoll = (rollData: any) => {
    setInitiativeRolls(prev => [...prev, rollData]);
  };

  const broadcastCombatAction = async (action: CombatAction) => {
    if (isConnected) {
      try {
        await bluetoothService.sendMessage({
          type: 'combat_action',
          data: action,
          timestamp: Date.now(),
          senderId: deviceInfo?.id || 'unknown'
        });
      } catch (error) {
        console.error('Error broadcasting combat action:', error);
      }
    }
  };

  const broadcastCombatSync = async () => {
    if (isConnected && currentEncounter && isDM) {
      try {
        await bluetoothService.sendMessage({
          type: 'combat_sync',
          data: currentEncounter,
          timestamp: Date.now(),
          senderId: deviceInfo?.id || 'unknown'
        });
      } catch (error) {
        console.error('Error syncing combat state:', error);
      }
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [encountersData, charactersData, npcTemplatesData] = await Promise.all([
        loadCombatEncounters(),
        loadCharacters(),
        loadNPCTemplates()
      ]);

      setEncounters(encountersData);
      setCharacters(charactersData);
      setNPCTemplates(npcTemplatesData);

      // Set active encounter if exists
      const activeEncounter = encountersData.find(e => e.isActive);
      if (activeEncounter) {
        setCurrentEncounter(activeEncounter);
      }
    } catch (error) {
      console.error('Error loading combat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEncounter = async () => {
    if (!newEncounterName.trim()) return;

    try {
      // Deactivate current encounter
      if (currentEncounter) {
        await updateEncounter({ ...currentEncounter, isActive: false });
      }

      const participants: CombatParticipant[] = [];

      // Add selected characters
      for (const characterId of selectedCharacters) {
        const character = characters.find(c => c.id === characterId);
        if (character) {
          participants.push({
            id: generateId(),
            name: character.name,
            initiative: 0,
            hitPoints: { ...character.hitPoints },
            armorClass: character.armorClass,
            isPlayer: true,
            conditions: [],
            notes: '',
            characterId: character.id,
            equipment: character.equipment
          });
        }
      }

      // Add selected NPCs
      for (const { templateId, count } of selectedNPCs) {
        const template = npcTemplates.find(t => t.id === templateId);
        if (template) {
          for (let i = 0; i < count; i++) {
            participants.push({
              id: generateId(),
              name: count > 1 ? `${template.name} ${i + 1}` : template.name,
              initiative: 0,
              hitPoints: { ...template.hitPoints },
              armorClass: template.armorClass,
              isPlayer: false,
              conditions: [],
              notes: '',
              npcType: template.type,
              challengeRating: template.challengeRating,
              abilities: template.abilities
            });
          }
        }
      }

      const newEncounter: CombatEncounter = {
        id: generateId(),
        name: newEncounterName,
        participants,
        currentTurn: 0,
        round: 1,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await saveCombatEncounter(newEncounter);
      setEncounters(prev => [newEncounter, ...prev.map(e => ({ ...e, isActive: false }))]);
      setCurrentEncounter(newEncounter);
      
      // Reset form
      setNewEncounterName('');
      setSelectedCharacters([]);
      setSelectedNPCs([]);
      setShowCreateModal(false);

      // Broadcast new encounter to connected players
      await broadcastCombatSync();

      // Show initiative modal
      setShowInitiativeModal(true);
    } catch (error) {
      console.error('Error creating encounter:', error);
      alert('Error al crear el encuentro');
    }
  };

  const updateEncounter = async (updatedEncounter: CombatEncounter) => {
    try {
      const encounter = { ...updatedEncounter, updatedAt: Date.now() };
      await saveCombatEncounter(encounter);
      setEncounters(prev => prev.map(e => e.id === encounter.id ? encounter : e));
      if (currentEncounter?.id === encounter.id) {
        setCurrentEncounter(encounter);
      }
      
      // Broadcast changes to connected players
      await broadcastCombatSync();
    } catch (error) {
      console.error('Error updating encounter:', error);
      throw error;
    }
  };

  const deleteEncounter = async (encounterId: string) => {
    try {
      await deleteCombatEncounter(encounterId);
      setEncounters(prev => prev.filter(e => e.id !== encounterId));
      if (currentEncounter?.id === encounterId) {
        setCurrentEncounter(null);
      }
    } catch (error) {
      console.error('Error deleting encounter:', error);
      alert('Error al eliminar el encuentro');
    }
  };

  const rollInitiative = async () => {
    if (!currentEncounter) return;

    try {
      const rolls: InitiativeRoll[] = [];
      
      for (const participant of currentEncounter.participants) {
        // Calculate dexterity modifier
        let dexModifier = 0;
        if (participant.characterId) {
          const character = characters.find(c => c.id === participant.characterId);
          if (character) {
            dexModifier = Math.floor((character.stats.dexterity - 10) / 2);
          }
        } else {
          // For NPCs, estimate dexterity modifier based on AC
          dexModifier = Math.max(-5, Math.min(5, participant.armorClass - 12));
        }

        const roll = await rollDice(20, 1, 0);
        const total = roll.results[0] + dexModifier;

        const initiativeRoll = {
          participantId: participant.id,
          roll: roll.results[0],
          modifier: dexModifier,
          total
        };

        rolls.push(initiativeRoll);

        // Broadcast initiative roll to connected players
        if (isConnected) {
          await bluetoothService.sendMessage({
            type: 'initiative_roll',
            data: initiativeRoll,
            timestamp: Date.now(),
            senderId: deviceInfo?.id || 'unknown'
          });
        }
      }

      setInitiativeRolls(rolls);
    } catch (error) {
      console.error('Error rolling initiative:', error);
      alert('Error al lanzar iniciativa');
    }
  };

  const applyInitiative = async () => {
    if (!currentEncounter || initiativeRolls.length === 0) return;

    try {
      const updatedParticipants = currentEncounter.participants.map(participant => {
        const roll = initiativeRolls.find(r => r.participantId === participant.id);
        return {
          ...participant,
          initiative: roll ? roll.total : 0
        };
      });

      // Sort by initiative (highest first)
      updatedParticipants.sort((a, b) => b.initiative - a.initiative);

      const updatedEncounter = {
        ...currentEncounter,
        participants: updatedParticipants,
        currentTurn: 0,
        round: 1
      };

      await updateEncounter(updatedEncounter);
      setInitiativeRolls([]);
      setShowInitiativeModal(false);
      
      // Start turn timer if enabled
      if (autoAdvanceTurns) {
        setTurnTimer(turnTimeLimit);
      }
    } catch (error) {
      console.error('Error applying initiative:', error);
      alert('Error al aplicar iniciativa');
    }
  };

  const nextTurn = async () => {
    if (!currentEncounter) return;

    try {
      let nextTurn = currentEncounter.currentTurn + 1;
      let nextRound = currentEncounter.round;

      if (nextTurn >= currentEncounter.participants.length) {
        nextTurn = 0;
        nextRound += 1;
      }

      const updatedEncounter = {
        ...currentEncounter,
        currentTurn: nextTurn,
        round: nextRound
      };

      await updateEncounter(updatedEncounter);
      
      // Reset turn timer
      if (autoAdvanceTurns) {
        setTurnTimer(turnTimeLimit);
      }

      // Broadcast turn advance
      if (isConnected) {
        await bluetoothService.sendMessage({
          type: 'turn_advance',
          data: { currentTurn: nextTurn, round: nextRound },
          timestamp: Date.now(),
          senderId: deviceInfo?.id || 'unknown'
        });
      }
    } catch (error) {
      console.error('Error advancing turn:', error);
      alert('Error al avanzar turno');
    }
  };

  const previousTurn = async () => {
    if (!currentEncounter) return;

    try {
      let prevTurn = currentEncounter.currentTurn - 1;
      let prevRound = currentEncounter.round;

      if (prevTurn < 0) {
        prevTurn = currentEncounter.participants.length - 1;
        prevRound = Math.max(1, prevRound - 1);
      }

      const updatedEncounter = {
        ...currentEncounter,
        currentTurn: prevTurn,
        round: prevRound
      };

      await updateEncounter(updatedEncounter);
      
      // Reset turn timer
      if (autoAdvanceTurns) {
        setTurnTimer(turnTimeLimit);
      }
    } catch (error) {
      console.error('Error going back turn:', error);
      alert('Error al retroceder turno');
    }
  };

  const updateParticipantHP = async (participantId: string, newHP: Partial<HitPoints>, actionDescription?: string) => {
    if (!currentEncounter) return;

    try {
      const updatedParticipants = currentEncounter.participants.map(p => 
        p.id === participantId 
          ? { ...p, hitPoints: { ...p.hitPoints, ...newHP } }
          : p
      );

      const updatedEncounter = {
        ...currentEncounter,
        participants: updatedParticipants
      };

      await updateEncounter(updatedEncounter);

      // Log action
      if (actionDescription) {
        const action: CombatAction = {
          id: generateId(),
          participantId,
          type: newHP.current && newHP.current > 0 ? 'heal' : 'damage',
          description: actionDescription,
          value: Math.abs((newHP.current || 0) - (currentEncounter.participants.find(p => p.id === participantId)?.hitPoints.current || 0)),
          timestamp: Date.now()
        };

        setCombatActions(prev => [action, ...prev]);
        await broadcastCombatAction(action);
      }
    } catch (error) {
      console.error('Error updating HP:', error);
      alert('Error al actualizar puntos de vida');
    }
  };

  const toggleCondition = async (participantId: string, condition: string) => {
    if (!currentEncounter) return;

    try {
      const participant = currentEncounter.participants.find(p => p.id === participantId);
      if (!participant) return;

      const isAdding = !participant.conditions.includes(condition);
      
      const updatedParticipants = currentEncounter.participants.map(p => {
        if (p.id === participantId) {
          const conditions = isAdding
            ? [...p.conditions, condition]
            : p.conditions.filter(c => c !== condition);
          return { ...p, conditions };
        }
        return p;
      });

      const updatedEncounter = {
        ...currentEncounter,
        participants: updatedParticipants
      };

      await updateEncounter(updatedEncounter);

      // Log action
      const action: CombatAction = {
        id: generateId(),
        participantId,
        type: 'condition',
        description: `${isAdding ? 'Aplicó' : 'Removió'} condición: ${condition}`,
        timestamp: Date.now()
      };

      setCombatActions(prev => [action, ...prev]);
      await broadcastCombatAction(action);
    } catch (error) {
      console.error('Error toggling condition:', error);
      alert('Error al cambiar condición');
    }
  };

  const removeParticipant = async (participantId: string) => {
    if (!currentEncounter) return;

    try {
      const updatedParticipants = currentEncounter.participants.filter(p => p.id !== participantId);
      
      // Adjust current turn if necessary
      let newCurrentTurn = currentEncounter.currentTurn;
      const removedIndex = currentEncounter.participants.findIndex(p => p.id === participantId);
      
      if (removedIndex < currentEncounter.currentTurn) {
        newCurrentTurn = Math.max(0, newCurrentTurn - 1);
      } else if (removedIndex === currentEncounter.currentTurn && newCurrentTurn >= updatedParticipants.length) {
        newCurrentTurn = 0;
      }

      const updatedEncounter = {
        ...currentEncounter,
        participants: updatedParticipants,
        currentTurn: newCurrentTurn
      };

      await updateEncounter(updatedEncounter);
    } catch (error) {
      console.error('Error removing participant:', error);
      alert('Error al eliminar participante');
    }
  };

  const addParticipant = async (participant: Omit<CombatParticipant, 'id'>) => {
    if (!currentEncounter) return;

    try {
      const newParticipant: CombatParticipant = {
        ...participant,
        id: generateId()
      };

      const updatedEncounter = {
        ...currentEncounter,
        participants: [...currentEncounter.participants, newParticipant]
      };

      await updateEncounter(updatedEncounter);
      setShowAddParticipantModal(false);
    } catch (error) {
      console.error('Error adding participant:', error);
      alert('Error al agregar participante');
    }
  };

  const approveAction = async (actionIndex: number) => {
    const pendingAction = pendingActions[actionIndex];
    if (!pendingAction) return;

    // Apply the action
    setCombatActions(prev => [pendingAction.action, ...prev]);
    
    // Remove from pending
    setPendingActions(prev => prev.filter((_, index) => index !== actionIndex));

    // Broadcast approval
    await broadcastCombatAction(pendingAction.action);
  };

  const rejectAction = (actionIndex: number) => {
    setPendingActions(prev => prev.filter((_, index) => index !== actionIndex));
  };

  const getCurrentParticipant = () => {
    if (!currentEncounter || currentEncounter.participants.length === 0) return null;
    return currentEncounter.participants[currentEncounter.currentTurn] || null;
  };

  const getParticipantStatus = (participant: CombatParticipant) => {
    const hpPercent = (participant.hitPoints.current / participant.hitPoints.maximum) * 100;
    
    if (participant.hitPoints.current <= 0) {
      return { status: 'unconscious', color: 'text-red-600 bg-red-100', label: 'Inconsciente' };
    } else if (hpPercent <= 25) {
      return { status: 'critical', color: 'text-red-600 bg-red-50', label: 'Crítico' };
    } else if (hpPercent <= 50) {
      return { status: 'wounded', color: 'text-orange-600 bg-orange-50', label: 'Herido' };
    } else {
      return { status: 'healthy', color: 'text-green-600 bg-green-50', label: 'Saludable' };
    }
  };

  const canPlayerAct = (participant: CombatParticipant) => {
    if (!currentEncounter) return false;
    const currentParticipant = getCurrentParticipant();
    return currentParticipant?.id === participant.id && participant.isPlayer;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-200">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-amber-700">Cargando sistema de combate...</p>
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
              <p className="text-amber-700">Sistema multijugador con sincronización Bluetooth</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Connection Status */}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
              <span className="text-sm font-medium">
                {isConnected ? 'Conectado' : 'Sin conexión'}
              </span>
            </div>

            {/* Role Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-amber-700">Rol:</span>
              <button
                onClick={() => setIsDM(!isDM)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  isDM 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-blue-600 text-white'
                }`}
              >
                {isDM ? 'DM' : 'Jugador'}
              </button>
            </div>

            {isDM && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                <Plus size={18} />
                <span>Nuevo Encuentro</span>
              </button>
            )}
          </div>
        </div>

        {/* Combat Settings (DM Only) */}
        {isDM && (
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 mb-6">
            <h3 className="text-lg font-bold text-purple-900 mb-3">Configuración de Combate</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoAdvanceTurns}
                  onChange={(e) => setAutoAdvanceTurns(e.target.checked)}
                  className="text-purple-600"
                />
                <span className="text-sm text-purple-900">Avance automático de turnos</span>
              </label>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-purple-900">Tiempo por turno:</span>
                <input
                  type="number"
                  min="30"
                  max="300"
                  value={turnTimeLimit}
                  onChange={(e) => setTurnTimeLimit(parseInt(e.target.value) || 60)}
                  className="w-16 p-1 border border-purple-300 rounded text-center"
                />
                <span className="text-sm text-purple-700">seg</span>
              </div>

              {turnTimer !== null && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className={`text-sm font-bold ${
                    turnTimer <= 10 ? 'text-red-600' : 'text-purple-900'
                  }`}>
                    {turnTimer}s restantes
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Encounter Selection */}
        {encounters.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Encuentro Activo
            </label>
            <select
              value={currentEncounter?.id || ''}
              onChange={(e) => {
                const encounter = encounters.find(enc => enc.id === e.target.value);
                setCurrentEncounter(encounter || null);
              }}
              disabled={!isDM}
              className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">Seleccionar encuentro...</option>
              {encounters.map(encounter => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.name} - Ronda {encounter.round} ({encounter.participants.length} participantes)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Combat Controls */}
        {currentEncounter && (
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-amber-900">{currentEncounter.name}</h3>
                <p className="text-amber-700">
                  Ronda {currentEncounter.round} • Turno de: {getCurrentParticipant()?.name || 'Ninguno'}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {isDM && (
                  <>
                    <button
                      onClick={() => setShowInitiativeModal(true)}
                      className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Dice6 size={16} />
                      <span>Iniciativa</span>
                    </button>
                    
                    <button
                      onClick={previousTurn}
                      disabled={currentEncounter.participants.length === 0}
                      className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronUp size={18} />
                    </button>
                    
                    <button
                      onClick={nextTurn}
                      disabled={currentEncounter.participants.length === 0}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronDown size={18} />
                    </button>
                    
                    <button
                      onClick={() => setShowAddParticipantModal(true)}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <UserPlus size={18} />
                    </button>
                    
                    <button
                      onClick={() => deleteEncounter(currentEncounter.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pending Actions (DM Only) */}
      {isDM && pendingActions.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-orange-200">
          <h2 className="text-2xl font-bold text-orange-900 mb-4">Acciones Pendientes de Aprobación</h2>
          <div className="space-y-3">
            {pendingActions.map((pendingAction, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <span className="font-medium text-orange-900">
                    {currentEncounter?.participants.find(p => p.id === pendingAction.participantId)?.name}
                  </span>
                  <span className="text-orange-700 ml-2">
                    quiere: {pendingAction.action.description}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => approveAction(index)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => rejectAction(index)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Combat Actions Log */}
      {combatActions.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-200">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Registro de Acciones</h2>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {combatActions.slice(0, 10).map(action => (
              <div key={action.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {currentEncounter?.participants.find(p => p.id === action.participantId)?.name}
                  </span>
                  <span className="text-blue-700">{action.description}</span>
                </div>
                <span className="text-xs text-blue-600">
                  {new Date(action.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Participants List */}
      {currentEncounter ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
          <h2 className="text-2xl font-bold text-amber-900 mb-6">Participantes</h2>
          
          {currentEncounter.participants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <p className="text-amber-600 text-lg">No hay participantes en este encuentro</p>
              {isDM && (
                <button
                  onClick={() => setShowAddParticipantModal(true)}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Agregar Participante
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {currentEncounter.participants.map((participant, index) => {
                const isCurrentTurn = index === currentEncounter.currentTurn;
                const status = getParticipantStatus(participant);
                const canAct = canPlayerAct(participant);
                
                return (
                  <div
                    key={participant.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isCurrentTurn 
                        ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-102' 
                        : 'border-amber-200 bg-white hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Initiative Order */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          isCurrentTurn ? 'bg-blue-600' : 'bg-amber-600'
                        }`}>
                          {index + 1}
                        </div>
                        
                        {/* Participant Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-bold text-amber-900">{participant.name}</h3>
                            {participant.isPlayer ? (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                Jugador
                              </span>
                            ) : (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                                NPC
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              {status.label}
                            </span>
                            {canAct && (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                                Tu Turno
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-2 text-sm text-amber-700">
                            <div className="flex items-center space-x-1">
                              <Target className="w-4 h-4" />
                              <span>Iniciativa: {participant.initiative}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Shield className="w-4 h-4" />
                              <span>CA: {participant.armorClass}</span>
                            </div>
                            {participant.challengeRating && (
                              <div className="flex items-center space-x-1">
                                <Crown className="w-4 h-4" />
                                <span>VD: {participant.challengeRating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {canAct && (
                          <button
                            onClick={() => setShowActionModal(true)}
                            className="flex items-center space-x-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                          >
                            <Send size={16} />
                            <span>Acción</span>
                          </button>
                        )}
                        
                        {isDM && (
                          <>
                            <button
                              onClick={() => setEditingParticipant(participant)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => removeParticipant(participant.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* HP Management */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-red-900">Puntos de Vida</span>
                          <Heart className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="flex items-center space-x-2">
                          {(isDM || canAct) && (
                            <button
                              onClick={() => updateParticipantHP(participant.id, { 
                                current: Math.max(0, participant.hitPoints.current - 1) 
                              }, `Perdió 1 punto de vida`)}
                              className="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                            >
                              -
                            </button>
                          )}
                          <div className="flex-1 text-center">
                            <span className="text-lg font-bold text-red-900">
                              {participant.hitPoints.current}/{participant.hitPoints.maximum}
                            </span>
                            {participant.hitPoints.temporary > 0 && (
                              <span className="text-sm text-red-700 ml-1">
                                (+{participant.hitPoints.temporary})
                              </span>
                            )}
                          </div>
                          {(isDM || canAct) && (
                            <button
                              onClick={() => updateParticipantHP(participant.id, { 
                                current: Math.min(participant.hitPoints.maximum, participant.hitPoints.current + 1) 
                              }, `Recuperó 1 punto de vida`)}
                              className="w-6 h-6 bg-green-500 text-white rounded-full text-xs hover:bg-green-600"
                            >
                              +
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Conditions */}
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-purple-900">Condiciones</span>
                          <AlertTriangle className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {CONDITIONS.slice(0, 4).map(condition => (
                            <button
                              key={condition}
                              onClick={() => (isDM || canAct) && toggleCondition(participant.id, condition)}
                              disabled={!isDM && !canAct}
                              className={`text-xs px-2 py-1 rounded-full transition-colors disabled:opacity-50 ${
                                participant.conditions.includes(condition)
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-purple-200 text-purple-800 hover:bg-purple-300'
                              }`}
                            >
                              {condition}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Equipment/Abilities */}
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-amber-900">
                            {participant.isPlayer ? 'Equipo' : 'Habilidades'}
                          </span>
                          <Zap className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="text-xs text-amber-700 max-h-16 overflow-y-auto">
                          {participant.isPlayer ? (
                            participant.equipment?.slice(0, 3).map((item, idx) => (
                              <div key={idx}>{item}</div>
                            )) || <div>Sin equipo</div>
                          ) : (
                            participant.abilities?.slice(0, 3).map((ability, idx) => (
                              <div key={idx}>{ability}</div>
                            )) || <div>Sin habilidades</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-amber-200 text-center">
          <Sword className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-amber-900 mb-2">No hay encuentro activo</h2>
          <p className="text-amber-700 mb-6">
            {isDM ? 'Crea un nuevo encuentro para comenzar el combate' : 'Esperando que el DM inicie un encuentro'}
          </p>
          {isDM && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              Crear Primer Encuentro
            </button>
          )}
        </div>
      )}

      {/* Create Encounter Modal */}
      {showCreateModal && isDM && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-amber-900">Crear Nuevo Encuentro</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Nombre del Encuentro *
                </label>
                <input
                  type="text"
                  value={newEncounterName}
                  onChange={(e) => setNewEncounterName(e.target.value)}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ej: Emboscada de Goblins"
                />
              </div>

              {/* Character Selection */}
              <div>
                <h3 className="text-lg font-bold text-amber-900 mb-3">Personajes Jugadores</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {characters.map(character => (
                    <label key={character.id} className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200 cursor-pointer hover:bg-amber-100">
                      <input
                        type="checkbox"
                        checked={selectedCharacters.includes(character.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCharacters(prev => [...prev, character.id]);
                          } else {
                            setSelectedCharacters(prev => prev.filter(id => id !== character.id));
                          }
                        }}
                        className="text-amber-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-amber-900">{character.name}</div>
                        <div className="text-sm text-amber-700">{character.race} {character.class} Nv.{character.level}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* NPC Selection */}
              <div>
                <h3 className="text-lg font-bold text-amber-900 mb-3">NPCs Enemigos</h3>
                <div className="space-y-3">
                  {npcTemplates.map(template => (
                    <div key={template.id} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex-1">
                        <div className="font-medium text-red-900">{template.name}</div>
                        <div className="text-sm text-red-700">VD {template.challengeRating} • CA {template.armorClass} • {template.hitPoints.maximum} PV</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-red-900">Cantidad:</label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={selectedNPCs.find(npc => npc.templateId === template.id)?.count || 0}
                          onChange={(e) => {
                            const count = parseInt(e.target.value) || 0;
                            setSelectedNPCs(prev => {
                              const filtered = prev.filter(npc => npc.templateId !== template.id);
                              if (count > 0) {
                                return [...filtered, { templateId: template.id, count }];
                              }
                              return filtered;
                            });
                          }}
                          className="w-16 p-2 border border-red-300 rounded text-center"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={createEncounter}
                  disabled={!newEncounterName.trim() || (selectedCharacters.length === 0 && selectedNPCs.length === 0)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Crear Encuentro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Initiative Modal */}
      {showInitiativeModal && currentEncounter && isDM && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-amber-900">Lanzar Iniciativa</h2>
              <button
                onClick={() => setShowInitiativeModal(false)}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {initiativeRolls.length === 0 ? (
              <div className="text-center py-8">
                <Dice6 className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <p className="text-amber-700 mb-6">Lanza la iniciativa para todos los participantes</p>
                <button
                  onClick={rollInitiative}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
                >
                  Lanzar Iniciativa
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-amber-900">Resultados de Iniciativa</h3>
                <div className="space-y-2">
                  {initiativeRolls
                    .sort((a, b) => b.total - a.total)
                    .map(roll => {
                      const participant = currentEncounter.participants.find(p => p.id === roll.participantId);
                      return (
                        <div key={roll.participantId} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <div>
                            <span className="font-medium text-amber-900">{participant?.name}</span>
                            <span className="text-sm text-amber-700 ml-2">
                              ({participant?.isPlayer ? 'Jugador' : 'NPC'})
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-amber-900">{roll.total}</div>
                            <div className="text-sm text-amber-600">
                              {roll.roll} + {roll.modifier}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={rollInitiative}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Relanzar
                  </button>
                  <button
                    onClick={applyInitiative}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Aplicar Orden
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CombatTracker;