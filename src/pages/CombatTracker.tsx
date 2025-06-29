import React, { useState, useEffect } from 'react';
import { 
  Sword, Shield, Heart, Clock, Plus, Minus, Play, Pause, RotateCcw, 
  Dice6, Users, Trash2, Edit, Save, X, AlertTriangle, Zap, Target,
  ChevronRight, ChevronDown, Timer, SkipForward, Package, Eye,
  BookOpen, Search, Filter, Copy, Star, Crown, TreePine, Book, Skull
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
  npcType?: string;
  challengeRating?: string;
  abilities?: string[];
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

interface NPCTemplate {
  id: string;
  name: string;
  type: 'humanoid' | 'beast' | 'undead' | 'dragon' | 'fiend' | 'celestial' | 'fey' | 'elemental' | 'construct' | 'giant' | 'monstrosity' | 'ooze' | 'plant' | 'aberration';
  challengeRating: string;
  hitPoints: { current: number; maximum: number; temporary: number };
  armorClass: number;
  abilities: string[];
  description: string;
  size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';
  alignment: string;
  speed: string;
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills: string[];
  damageResistances: string[];
  damageImmunities: string[];
  conditionImmunities: string[];
  senses: string[];
  languages: string[];
  isCustom: boolean;
  createdAt: number;
  updatedAt: number;
}

const BASIC_BESTIARY: Omit<NPCTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isCustom'>[] = [
  {
    name: "Trasgo",
    type: "humanoid",
    challengeRating: "1/4",
    hitPoints: { current: 7, maximum: 7, temporary: 0 },
    armorClass: 15,
    abilities: ["Ataque con Cimitarra", "Arco Corto", "Sigilo"],
    description: "Pequeñas criaturas malévolas que viven en cuevas y ruinas.",
    size: "small",
    alignment: "Neutral Evil",
    speed: "30 pies",
    stats: { strength: 8, dexterity: 14, constitution: 10, intelligence: 10, wisdom: 8, charisma: 8 },
    skills: ["Sigilo"],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: ["Visión en la Oscuridad 60 pies"],
    languages: ["Común", "Trasgo"]
  },
  {
    name: "Esqueleto",
    type: "undead",
    challengeRating: "1/4",
    hitPoints: { current: 13, maximum: 13, temporary: 0 },
    armorClass: 13,
    abilities: ["Ataque con Espada Corta", "Arco Corto", "Inmunidad a Veneno"],
    description: "Restos animados de guerreros caídos, controlados por magia necromántica.",
    size: "medium",
    alignment: "Lawful Evil",
    speed: "30 pies",
    stats: { strength: 10, dexterity: 14, constitution: 15, intelligence: 6, wisdom: 8, charisma: 5 },
    skills: [],
    damageResistances: [],
    damageImmunities: ["Veneno"],
    conditionImmunities: ["Envenenado", "Exhausto"],
    senses: ["Visión en la Oscuridad 60 pies"],
    languages: []
  },
  {
    name: "Lobo",
    type: "beast",
    challengeRating: "1/4",
    hitPoints: { current: 11, maximum: 11, temporary: 0 },
    armorClass: 13,
    abilities: ["Mordisco", "Derribo", "Olfato Agudo", "Táctica de Manada"],
    description: "Depredador natural que caza en manadas organizadas.",
    size: "medium",
    alignment: "Unaligned",
    speed: "40 pies",
    stats: { strength: 12, dexterity: 15, constitution: 12, intelligence: 3, wisdom: 12, charisma: 6 },
    skills: ["Percepción", "Sigilo"],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: ["Olfato Agudo"],
    languages: []
  },
  {
    name: "Orco",
    type: "humanoid",
    challengeRating: "1/2",
    hitPoints: { current: 15, maximum: 15, temporary: 0 },
    armorClass: 13,
    abilities: ["Ataque con Hacha de Guerra", "Jabalina", "Agresivo"],
    description: "Guerreros brutales que viven para la batalla y la conquista.",
    size: "medium",
    alignment: "Chaotic Evil",
    speed: "30 pies",
    stats: { strength: 16, dexterity: 12, constitution: 16, intelligence: 7, wisdom: 11, charisma: 10 },
    skills: ["Intimidación"],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: ["Visión en la Oscuridad 60 pies"],
    languages: ["Común", "Orco"]
  },
  {
    name: "Oso Negro",
    type: "beast",
    challengeRating: "1/2",
    hitPoints: { current: 19, maximum: 19, temporary: 0 },
    armorClass: 11,
    abilities: ["Mordisco", "Garras", "Olfato Agudo"],
    description: "Oso salvaje territorial que protege su territorio ferozmente.",
    size: "medium",
    alignment: "Unaligned",
    speed: "40 pies, trepar 30 pies",
    stats: { strength: 15, dexterity: 10, constitution: 14, intelligence: 2, wisdom: 12, charisma: 7 },
    skills: ["Percepción"],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: ["Olfato Agudo"],
    languages: []
  },
  {
    name: "Zombi",
    type: "undead",
    challengeRating: "1/4",
    hitPoints: { current: 22, maximum: 22, temporary: 0 },
    armorClass: 8,
    abilities: ["Golpe", "Resistencia No-Muerto", "Movimiento Lento"],
    description: "Cadáver reanimado que se mueve lentamente pero es difícil de destruir.",
    size: "medium",
    alignment: "Neutral Evil",
    speed: "20 pies",
    stats: { strength: 13, dexterity: 6, constitution: 16, intelligence: 3, wisdom: 6, charisma: 5 },
    skills: [],
    damageResistances: [],
    damageImmunities: ["Veneno"],
    conditionImmunities: ["Envenenado"],
    senses: ["Visión en la Oscuridad 60 pies"],
    languages: []
  },
  {
    name: "Hobgoblin",
    type: "humanoid",
    challengeRating: "1/2",
    hitPoints: { current: 11, maximum: 11, temporary: 0 },
    armorClass: 18,
    abilities: ["Espada Larga", "Arco Largo", "Formación Marcial"],
    description: "Guerreros disciplinados que luchan en formaciones organizadas.",
    size: "medium",
    alignment: "Lawful Evil",
    speed: "30 pies",
    stats: { strength: 13, dexterity: 12, constitution: 12, intelligence: 10, wisdom: 10, charisma: 9 },
    skills: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: ["Visión en la Oscuridad 60 pies"],
    languages: ["Común", "Trasgo"]
  },
  {
    name: "Araña Gigante",
    type: "beast",
    challengeRating: "1",
    hitPoints: { current: 26, maximum: 26, temporary: 0 },
    armorClass: 14,
    abilities: ["Mordisco Venenoso", "Telaraña", "Caminar por Telarañas", "Sentido de Telaraña"],
    description: "Araña del tamaño de un perro con veneno paralizante.",
    size: "large",
    alignment: "Unaligned",
    speed: "30 pies, trepar 30 pies",
    stats: { strength: 14, dexterity: 16, constitution: 12, intelligence: 2, wisdom: 11, charisma: 4 },
    skills: ["Sigilo"],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: ["Visión en la Oscuridad 60 pies", "Sentido de Telaraña"],
    languages: []
  }
];

function CombatTracker() {
  const [encounters, setEncounters] = useState<CombatEncounter[]>([]);
  const [currentEncounter, setCurrentEncounter] = useState<CombatEncounter | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [npcTemplates, setNpcTemplates] = useState<NPCTemplate[]>([]);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showCreateEncounter, setShowCreateEncounter] = useState(false);
  const [showBestiary, setShowBestiary] = useState(false);
  const [showCreateNPC, setShowCreateNPC] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<string | null>(null);
  const [expandedParticipant, setExpandedParticipant] = useState<string | null>(null);
  const [showEquipment, setShowEquipment] = useState<string | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [bestiarySearch, setBestiarySearch] = useState('');
  const [bestiaryFilter, setBestiaryFilter] = useState('');

  const [newParticipant, setNewParticipant] = useState({
    name: '',
    initiative: 10,
    hitPoints: { current: 10, maximum: 10, temporary: 0 },
    armorClass: 10,
    isPlayer: false,
    characterId: '',
    npcTemplateId: ''
  });

  const [newEncounter, setNewEncounter] = useState({
    name: '',
    description: ''
  });

  const [newNPCTemplate, setNewNPCTemplate] = useState<Partial<NPCTemplate>>({
    name: '',
    type: 'humanoid',
    challengeRating: '1/4',
    hitPoints: { current: 10, maximum: 10, temporary: 0 },
    armorClass: 10,
    abilities: [],
    description: '',
    size: 'medium',
    alignment: 'Neutral',
    speed: '30 pies',
    stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    skills: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: [],
    languages: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [savedEncounters, savedCharacters, savedNPCs] = await Promise.all([
        dbLoadData<CombatEncounter[]>('combatEncounters'),
        loadCharacters(),
        dbLoadData<NPCTemplate[]>('npcTemplates')
      ]);
      
      setEncounters(savedEncounters || []);
      setCharacters(savedCharacters);
      
      // Initialize bestiary with basic creatures if none exist
      if (!savedNPCs || savedNPCs.length === 0) {
        const basicTemplates = BASIC_BESTIARY.map(template => ({
          ...template,
          id: generateId(),
          isCustom: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }));
        setNpcTemplates(basicTemplates);
        await saveData('npcTemplates', basicTemplates);
      } else {
        setNpcTemplates(savedNPCs);
      }
      
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

  const saveNPCTemplates = async (updatedTemplates: NPCTemplate[]) => {
    try {
      await saveData('npcTemplates', updatedTemplates);
      setNpcTemplates(updatedTemplates);
    } catch (error) {
      console.error('Error saving NPC templates:', error);
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

  const addSelectedPlayersToEncounter = () => {
    if (!currentEncounter || selectedPlayers.length === 0) return;

    const newParticipants: CombatParticipant[] = selectedPlayers.map(characterId => {
      const character = characters.find(c => c.id === characterId);
      if (!character) return null;

      return {
        id: generateId(),
        name: character.name,
        initiative: Math.floor(Math.random() * 20) + 1,
        hitPoints: { ...character.hitPoints },
        armorClass: character.armorClass,
        isPlayer: true,
        conditions: [],
        notes: '',
        characterId: character.id,
        equipment: character.equipment || []
      };
    }).filter(Boolean) as CombatParticipant[];

    const updatedEncounter = {
      ...currentEncounter,
      participants: [...currentEncounter.participants, ...newParticipants].sort((a, b) => b.initiative - a.initiative),
      updatedAt: Date.now()
    };

    updateCurrentEncounter(updatedEncounter);
    setSelectedPlayers([]);
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

    // If it's from an NPC template, load template data
    if (!newParticipant.isPlayer && newParticipant.npcTemplateId) {
      const template = npcTemplates.find(t => t.id === newParticipant.npcTemplateId);
      if (template) {
        participantData = {
          ...participantData,
          name: template.name,
          hitPoints: { ...template.hitPoints },
          armorClass: template.armorClass
        };
      }
    }

    const participant: CombatParticipant = {
      id: generateId(),
      ...participantData,
      conditions: [],
      notes: '',
      equipment: newParticipant.isPlayer && newParticipant.characterId ? 
        characters.find(c => c.id === newParticipant.characterId)?.equipment || [] : [],
      npcType: !newParticipant.isPlayer && newParticipant.npcTemplateId ?
        npcTemplates.find(t => t.id === newParticipant.npcTemplateId)?.type : undefined,
      challengeRating: !newParticipant.isPlayer && newParticipant.npcTemplateId ?
        npcTemplates.find(t => t.id === newParticipant.npcTemplateId)?.challengeRating : undefined,
      abilities: !newParticipant.isPlayer && newParticipant.npcTemplateId ?
        npcTemplates.find(t => t.id === newParticipant.npcTemplateId)?.abilities || [] : []
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
      characterId: '',
      npcTemplateId: ''
    });
    setShowAddParticipant(false);
  };

  const createNPCTemplate = async () => {
    if (!newNPCTemplate.name?.trim()) return;

    const template: NPCTemplate = {
      id: generateId(),
      ...newNPCTemplate as NPCTemplate,
      isCustom: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updatedTemplates = [...npcTemplates, template];
    await saveNPCTemplates(updatedTemplates);
    
    setNewNPCTemplate({
      name: '',
      type: 'humanoid',
      challengeRating: '1/4',
      hitPoints: { current: 10, maximum: 10, temporary: 0 },
      armorClass: 10,
      abilities: [],
      description: '',
      size: 'medium',
      alignment: 'Neutral',
      speed: '30 pies',
      stats: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
      skills: [],
      damageResistances: [],
      damageImmunities: [],
      conditionImmunities: [],
      senses: [],
      languages: []
    });
    setShowCreateNPC(false);
  };

  const deleteNPCTemplate = async (templateId: string) => {
    const template = npcTemplates.find(t => t.id === templateId);
    if (!template?.isCustom) return; // Can't delete basic bestiary creatures

    const updatedTemplates = npcTemplates.filter(t => t.id !== templateId);
    await saveNPCTemplates(updatedTemplates);
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

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      'humanoid': Users,
      'beast': TreePine,
      'undead': Skull,
      'dragon': Crown,
      'fiend': Sword,
      'celestial': Star,
      'fey': Star,
      'elemental': Zap,
      'construct': Shield,
      'giant': Users,
      'monstrosity': Target,
      'ooze': Target,
      'plant': TreePine,
      'aberration': Eye
    };
    return icons[type] || Users;
  };

  const filteredNPCs = npcTemplates.filter(npc => {
    const matchesSearch = npc.name.toLowerCase().includes(bestiarySearch.toLowerCase()) ||
                         npc.description.toLowerCase().includes(bestiarySearch.toLowerCase());
    const matchesFilter = !bestiaryFilter || npc.type === bestiaryFilter;
    return matchesSearch && matchesFilter;
  });

  const availableCharacters = characters.filter(char => 
    !currentEncounter?.participants.some(p => p.characterId === char.id)
  );

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
              onClick={() => setShowBestiary(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
            >
              <BookOpen size={18} />
              <span>Bestiario</span>
            </button>
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
          {/* Player Management */}
          {availableCharacters.length > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
              <h2 className="text-xl font-bold text-amber-900 mb-4">Agregar Jugadores al Encuentro</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {availableCharacters.map(character => (
                  <div
                    key={character.id}
                    onClick={() => {
                      setSelectedPlayers(prev => 
                        prev.includes(character.id) 
                          ? prev.filter(id => id !== character.id)
                          : [...prev, character.id]
                      );
                    }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPlayers.includes(character.id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-amber-200 bg-white hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-amber-900">{character.name}</h3>
                        <p className="text-sm text-amber-600">{character.race} {character.class} Nv.{character.level}</p>
                        <p className="text-xs text-amber-500">PV: {character.hitPoints.current}/{character.hitPoints.maximum} | CA: {character.armorClass}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 ${
                        selectedPlayers.includes(character.id) 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-amber-300'
                      }`}>
                        {selectedPlayers.includes(character.id) && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedPlayers.length > 0 && (
                <div className="flex items-center justify-between bg-green-50 rounded-lg p-4 border border-green-200">
                  <span className="text-green-900 font-medium">
                    {selectedPlayers.length} jugador(es) seleccionado(s)
                  </span>
                  <button
                    onClick={addSelectedPlayersToEncounter}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Agregar al Encuentro
                  </button>
                </div>
              )}
            </div>
          )}

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
                  <span>Agregar NPC</span>
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
                <div className="mt-4 space-x-4">
                  {availableCharacters.length > 0 && (
                    <p className="text-amber-500 mb-4">Selecciona jugadores arriba o agrega NPCs</p>
                  )}
                  <button
                    onClick={() => setShowAddParticipant(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Agregar NPC
                  </button>
                </div>
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
                                  {!participant.isPlayer && participant.challengeRating && (
                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                      CR {participant.challengeRating}
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
                                  {participant.npcType && (
                                    <div className="flex items-center space-x-1">
                                      {React.createElement(getTypeIcon(participant.npcType), { className: "w-4 h-4" })}
                                      <span className="capitalize">{participant.npcType}</span>
                                    </div>
                                  )}
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

                        {/* NPC Abilities */}
                        {!participant.isPlayer && participant.abilities && participant.abilities.length > 0 && (
                          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                            <h4 className="font-bold text-red-900 mb-2">Habilidades</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {participant.abilities.map((ability, index) => (
                                <div key={index} className="text-sm bg-white p-2 rounded border border-red-200">
                                  {ability}
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

      {/* Bestiary Modal */}
      {showBestiary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-6xl mx-4 h-5/6 flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-amber-200">
              <h2 className="text-2xl font-bold text-amber-900">Bestiario</h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowCreateNPC(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={18} />
                  <span>Crear NPC</span>
                </button>
                <button
                  onClick={() => setShowBestiary(false)}
                  className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="p-6 border-b border-amber-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar criaturas..."
                    value={bestiarySearch}
                    onChange={(e) => setBestiarySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={bestiaryFilter}
                  onChange={(e) => setBestiaryFilter(e.target.value)}
                  className="p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Todos los tipos</option>
                  <option value="humanoid">Humanoide</option>
                  <option value="beast">Bestia</option>
                  <option value="undead">No-muerto</option>
                  <option value="dragon">Dragón</option>
                  <option value="fiend">Demonio</option>
                  <option value="celestial">Celestial</option>
                  <option value="fey">Feérico</option>
                  <option value="elemental">Elemental</option>
                  <option value="construct">Constructo</option>
                  <option value="giant">Gigante</option>
                  <option value="monstrosity">Monstruosidad</option>
                  <option value="ooze">Cieno</option>
                  <option value="plant">Planta</option>
                  <option value="aberration">Aberración</option>
                </select>
              </div>
            </div>

            {/* Creatures List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNPCs.map(npc => {
                  const TypeIcon = getTypeIcon(npc.type);
                  return (
                    <div key={npc.id} className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <TypeIcon className="w-5 h-5 text-amber-600" />
                          <div>
                            <h3 className="font-bold text-amber-900">{npc.name}</h3>
                            <p className="text-sm text-amber-600 capitalize">{npc.type} • CR {npc.challengeRating}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {npc.isCustom && (
                            <button
                              onClick={() => deleteNPCTemplate(npc.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setNewParticipant(prev => ({
                                ...prev,
                                npcTemplateId: npc.id,
                                name: npc.name,
                                hitPoints: { ...npc.hitPoints },
                                armorClass: npc.armorClass,
                                isPlayer: false
                              }));
                              setShowBestiary(false);
                              setShowAddParticipant(true);
                            }}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                            title="Agregar al combate"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-amber-700 mb-2">{npc.description}</p>
                      
                      <div className="text-xs text-amber-600 space-y-1">
                        <div>PV: {npc.hitPoints.maximum} | CA: {npc.armorClass}</div>
                        <div>Tamaño: {npc.size} | Alineamiento: {npc.alignment}</div>
                        {npc.abilities.length > 0 && (
                          <div>Habilidades: {npc.abilities.slice(0, 2).join(', ')}{npc.abilities.length > 2 ? '...' : ''}</div>
                        )}
                      </div>
                      
                      {npc.isCustom && (
                        <div className="mt-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Personalizado
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
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
              <h2 className="text-2xl font-bold text-amber-900">Agregar NPC</h2>
              <button
                onClick={() => setShowAddParticipant(false)}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Seleccionar del Bestiario
                </label>
                <select
                  value={newParticipant.npcTemplateId}
                  onChange={(e) => {
                    const template = npcTemplates.find(t => t.id === e.target.value);
                    if (template) {
                      setNewParticipant(prev => ({
                        ...prev,
                        npcTemplateId: e.target.value,
                        name: template.name,
                        hitPoints: { ...template.hitPoints },
                        armorClass: template.armorClass
                      }));
                    } else {
                      setNewParticipant(prev => ({
                        ...prev,
                        npcTemplateId: '',
                        name: '',
                        hitPoints: { current: 10, maximum: 10, temporary: 0 },
                        armorClass: 10
                      }));
                    }
                  }}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Crear NPC personalizado...</option>
                  {npcTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} (CR {template.challengeRating})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={newParticipant.name}
                  onChange={(e) => setNewParticipant(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Nombre del NPC"
                />
              </div>

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

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddParticipant(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addParticipant}
                  disabled={!newParticipant.name.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create NPC Template Modal */}
      {showCreateNPC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-5/6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-amber-900">Crear NPC Personalizado</h2>
              <button
                onClick={() => setShowCreateNPC(false)}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={newNPCTemplate.name || ''}
                    onChange={(e) => setNewNPCTemplate(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Nombre de la criatura"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Tipo
                  </label>
                  <select
                    value={newNPCTemplate.type}
                    onChange={(e) => setNewNPCTemplate(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="humanoid">Humanoide</option>
                    <option value="beast">Bestia</option>
                    <option value="undead">No-muerto</option>
                    <option value="dragon">Dragón</option>
                    <option value="fiend">Demonio</option>
                    <option value="celestial">Celestial</option>
                    <option value="fey">Feérico</option>
                    <option value="elemental">Elemental</option>
                    <option value="construct">Constructo</option>
                    <option value="giant">Gigante</option>
                    <option value="monstrosity">Monstruosidad</option>
                    <option value="ooze">Cieno</option>
                    <option value="plant">Planta</option>
                    <option value="aberration">Aberración</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Desafío (CR)
                  </label>
                  <select
                    value={newNPCTemplate.challengeRating}
                    onChange={(e) => setNewNPCTemplate(prev => ({ ...prev, challengeRating: e.target.value }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="0">0</option>
                    <option value="1/8">1/8</option>
                    <option value="1/4">1/4</option>
                    <option value="1/2">1/2</option>
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(cr => (
                      <option key={cr} value={cr.toString()}>{cr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Puntos de Vida
                  </label>
                  <input
                    type="number"
                    value={newNPCTemplate.hitPoints?.maximum || 10}
                    onChange={(e) => {
                      const hp = parseInt(e.target.value) || 10;
                      setNewNPCTemplate(prev => ({ 
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
                    value={newNPCTemplate.armorClass || 10}
                    onChange={(e) => setNewNPCTemplate(prev => ({ ...prev, armorClass: parseInt(e.target.value) || 10 }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newNPCTemplate.description || ''}
                  onChange={(e) => setNewNPCTemplate(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-20"
                  placeholder="Descripción de la criatura..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Habilidades (una por línea)
                </label>
                <textarea
                  value={newNPCTemplate.abilities?.join('\n') || ''}
                  onChange={(e) => setNewNPCTemplate(prev => ({ 
                    ...prev, 
                    abilities: e.target.value.split('\n').filter(ability => ability.trim()) 
                  }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-20"
                  placeholder="Mordisco&#10;Garras&#10;Rugido Aterrador"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateNPC(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={createNPCTemplate}
                  disabled={!newNPCTemplate.name?.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Crear NPC
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