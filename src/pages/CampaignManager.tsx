import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Filter, Edit, Trash2, Eye, Play, Pause, 
  CheckCircle, Clock, MapPin, User, Scroll, Calendar, Target,
  ArrowRight, Star, Crown, Sword, Shield, Book, Home, TreePine,
  Mountain, Waves, Castle, Tent, Compass, Map, Settings, Save,
  X, AlertCircle, UserPlus, FileText, Globe
} from 'lucide-react';
import { 
  saveCampaign, loadCampaigns, deleteCampaign, saveNPC, loadNPCs, 
  deleteNPC, saveLocation, loadLocations, deleteLocation,
  saveCampaignSession, loadCampaignSessions, deleteCampaignSession,
  generateId, loadNPCTemplates, saveNPCTemplate
} from '../services/db';
import { Campaign, NPC, Location, CampaignSession, NPCTemplate } from '../types';

function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [npcs, setNPCs] = useState<NPC[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [sessions, setSessions] = useState<CampaignSession[]>([]);
  const [npcTemplates, setNPCTemplates] = useState<NPCTemplate[]>([]);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'npcs' | 'locations' | 'sessions'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [showCreateNPC, setShowCreateNPC] = useState(false);
  const [showCreateLocation, setShowCreateLocation] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<{type: string, id: string} | null>(null);
  
  // Forms
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    setting: '',
    level: 1,
    maxPlayers: 4,
    status: 'planning' as const,
    notes: ''
  });
  
  const [newNPC, setNewNPC] = useState({
    name: '',
    race: '',
    class: '',
    role: 'neutral' as const,
    location: '',
    description: '',
    notes: ''
  });
  
  const [newLocation, setNewLocation] = useState({
    name: '',
    type: 'other' as const,
    description: '',
    inhabitants: '',
    secrets: '',
    notes: ''
  });
  
  const [newSession, setNewSession] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    duration: 240,
    summary: '',
    events: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      loadCampaignData(selectedCampaign.id);
    }
  }, [selectedCampaign]);

  const loadData = async () => {
    try {
      const [campaignsData, npcTemplatesData] = await Promise.all([
        loadCampaigns(),
        loadNPCTemplates()
      ]);
      
      setCampaigns(campaignsData);
      setNPCTemplates(npcTemplatesData);
      
      // Create example campaign if none exist
      if (campaignsData.length === 0) {
        await createExampleCampaign();
      } else {
        setSelectedCampaign(campaignsData[0]);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const createExampleCampaign = async () => {
    const exampleCampaign: Campaign = {
      id: generateId(),
      name: "La Mina Perdida de Phandelver",
      description: "Una aventura clásica para personajes de nivel 1-5. Los aventureros deben rescatar a Gundren Rockseeker y descubrir los secretos de la Mina Perdida de Phandelver.",
      setting: "Costa de la Espada - Forgotten Realms",
      level: 1,
      maxPlayers: 4,
      status: 'planning',
      playerIds: [],
      notes: "Campaña de ejemplo con NPCs, ubicaciones y sesiones preconfiguradas para demostrar las funcionalidades del sistema.",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await saveCampaign(exampleCampaign);
    
    // Create example NPCs
    const exampleNPCs = [
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Gundren Rockseeker",
        race: "Enano de las montañas",
        class: "Comerciante",
        role: 'ally' as const,
        location: "Goblin Ambush",
        description: "Un enano comerciante con conexiones en Phandalin. Hermano de Nundro y Tharden Rockseeker.",
        notes: "Contrata a los aventureros para escoltar suministros a Phandalin. Conoce la ubicación de la Mina Perdida.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Klarg",
        race: "Bugbear",
        class: "Guerrero",
        role: 'enemy' as const,
        location: "Cuevas de Cragmaw",
        description: "Líder bugbear de los goblins en las Cuevas de Cragmaw. Tiene una mascota lobo llamada Ripper.",
        notes: "Jefe del primer encuentro importante. Puede ser persuadido o derrotado en combate.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Sildar Hallwinter",
        race: "Humano",
        class: "Noble/Guerrero",
        role: 'ally' as const,
        location: "Cuevas de Cragmaw",
        description: "Agente de los Señores de Waterdeep y miembro de la Orden del Guantelete.",
        notes: "Prisionero de los goblins. Busca a Iarno Albrek y puede ofrecer recompensas a los aventureros.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Toblen Stonehill",
        race: "Halfling",
        class: "Posadero",
        role: 'neutral' as const,
        location: "Posada Stonehill",
        description: "Posadero amigable de la Posada Stonehill en Phandalin.",
        notes: "Fuente de información local y rumores. Puede proporcionar alojamiento a los aventureros.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    for (const npc of exampleNPCs) {
      await saveNPC(npc);
    }

    // Create example locations
    const exampleLocations = [
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Phandalin",
        type: 'city' as const,
        description: "Una pequeña ciudad fronteriza en reconstrucción. Hogar de mineros, granjeros y comerciantes.",
        inhabitants: "Toblen Stonehill (posadero), Linene Graywind (comerciante), Harbin Wester (maestro del pueblo)",
        secrets: "Los Redbrands controlan secretamente la ciudad desde el Manor Tresendar.",
        notes: "Hub principal de la aventura. Los aventureros regresarán aquí frecuentemente.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Cuevas de Cragmaw",
        type: 'dungeon' as const,
        description: "Una red de cuevas naturales ocupadas por la tribu goblin Cragmaw.",
        inhabitants: "Klarg (bugbear), goblins Cragmaw, Sildar Hallwinter (prisionero)",
        secrets: "Contiene un pasaje secreto que lleva a una cámara del tesoro oculta.",
        notes: "Primera mazmorra de la aventura. Nivel de dificultad apropiado para personajes de nivel 1.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Manor Tresendar",
        type: 'building' as const,
        description: "Una mansión en ruinas que sirve como base secreta de los Redbrands.",
        inhabitants: "Glasstaff (Iarno Albrek), bandidos Redbrands, Nothic",
        secrets: "Conecta con cuevas subterráneas que contienen un laboratorio de alquimia.",
        notes: "Sede de los Redbrands. Contiene pistas importantes sobre la conspiración.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Mina Perdida de Phandelver",
        type: 'dungeon' as const,
        description: "Una antigua mina mágica llena de peligros y tesoros. También conocida como Wave Echo Cave.",
        inhabitants: "Nundro Rockseeker, espectros, zombis, Nezznar el Araña Negra",
        secrets: "Contiene la Forja de Hechizos, un artefacto mágico de gran poder.",
        notes: "Mazmorra final de la campaña. Requiere personajes de nivel 4-5.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    for (const location of exampleLocations) {
      await saveLocation(location);
    }

    // Create example session
    const exampleSession = {
      id: generateId(),
      campaignId: exampleCampaign.id,
      sessionNumber: 1,
      title: "El Camino a Phandalin",
      date: Date.now() - (7 * 24 * 60 * 60 * 1000), // 1 week ago
      duration: 240,
      summary: "Los aventureros se conocen en Neverwinter y aceptan el trabajo de Gundren Rockseeker para escoltar suministros a Phandalin.",
      events: "- Presentación de personajes en la taberna\n- Encuentro con Gundren Rockseeker\n- Emboscada goblin en el camino\n- Descubrimiento de las Cuevas de Cragmaw\n- Rescate de Sildar Hallwinter",
      notes: "Primera sesión exitosa. Los jugadores trabajaron bien en equipo y mostraron interés en la historia.",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await saveCampaignSession(exampleSession);

    // Reload data
    const updatedCampaigns = await loadCampaigns();
    setCampaigns(updatedCampaigns);
    setSelectedCampaign(exampleCampaign);
  };

  const loadCampaignData = async (campaignId: string) => {
    try {
      const [npcsData, locationsData, sessionsData] = await Promise.all([
        loadNPCs(),
        loadLocations(),
        loadCampaignSessions()
      ]);
      
      setNPCs(npcsData.filter(npc => npc.campaignId === campaignId));
      setLocations(locationsData.filter(loc => loc.campaignId === campaignId));
      setSessions(sessionsData.filter(session => session.campaignId === campaignId));
    } catch (error) {
      console.error('Error loading campaign data:', error);
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name.trim()) return;

    const campaign: Campaign = {
      id: generateId(),
      ...newCampaign,
      playerIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await saveCampaign(campaign);
    const updatedCampaigns = await loadCampaigns();
    setCampaigns(updatedCampaigns);
    setSelectedCampaign(campaign);
    
    setNewCampaign({
      name: '',
      description: '',
      setting: '',
      level: 1,
      maxPlayers: 4,
      status: 'planning',
      notes: ''
    });
    setShowCreateCampaign(false);
  };

  const handleCreateNPC = async () => {
    if (!newNPC.name.trim() || !selectedCampaign) return;

    const npc: NPC = {
      id: generateId(),
      campaignId: selectedCampaign.id,
      ...newNPC,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await saveNPC(npc);
    await loadCampaignData(selectedCampaign.id);
    
    setNewNPC({
      name: '',
      race: '',
      class: '',
      role: 'neutral',
      location: '',
      description: '',
      notes: ''
    });
    setShowCreateNPC(false);
  };

  const handleCreateLocation = async () => {
    if (!newLocation.name.trim() || !selectedCampaign) return;

    const location: Location = {
      id: generateId(),
      campaignId: selectedCampaign.id,
      ...newLocation,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await saveLocation(location);
    await loadCampaignData(selectedCampaign.id);
    
    setNewLocation({
      name: '',
      type: 'other',
      description: '',
      inhabitants: '',
      secrets: '',
      notes: ''
    });
    setShowCreateLocation(false);
  };

  const handleCreateSession = async () => {
    if (!newSession.title.trim() || !selectedCampaign) return;

    const session: CampaignSession = {
      id: generateId(),
      campaignId: selectedCampaign.id,
      sessionNumber: sessions.length + 1,
      date: new Date(newSession.date).getTime(),
      ...newSession,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await saveCampaignSession(session);
    await loadCampaignData(selectedCampaign.id);
    
    setNewSession({
      title: '',
      date: new Date().toISOString().split('T')[0],
      duration: 240,
      summary: '',
      events: '',
      notes: ''
    });
    setShowCreateSession(false);
  };

  const handleDelete = async (type: string, id: string) => {
    try {
      switch (type) {
        case 'campaign':
          await deleteCampaign(id);
          const updatedCampaigns = await loadCampaigns();
          setCampaigns(updatedCampaigns);
          if (selectedCampaign?.id === id) {
            setSelectedCampaign(updatedCampaigns[0] || null);
          }
          break;
        case 'npc':
          await deleteNPC(id);
          if (selectedCampaign) {
            await loadCampaignData(selectedCampaign.id);
          }
          break;
        case 'location':
          await deleteLocation(id);
          if (selectedCampaign) {
            await loadCampaignData(selectedCampaign.id);
          }
          break;
        case 'session':
          await deleteCampaignSession(id);
          if (selectedCampaign) {
            await loadCampaignData(selectedCampaign.id);
          }
          break;
      }
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return Clock;
      case 'active': return Play;
      case 'completed': return CheckCircle;
      case 'paused': return Pause;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'text-yellow-600 bg-yellow-100';
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ally': return Shield;
      case 'enemy': return Sword;
      case 'neutral': return User;
      case 'merchant': return Star;
      case 'quest_giver': return Scroll;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ally': return 'text-green-600 bg-green-100';
      case 'enemy': return 'text-red-600 bg-red-100';
      case 'neutral': return 'text-gray-600 bg-gray-100';
      case 'merchant': return 'text-yellow-600 bg-yellow-100';
      case 'quest_giver': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'city': return Home;
      case 'dungeon': return Mountain;
      case 'wilderness': return TreePine;
      case 'building': return Castle;
      default: return MapPin;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-200">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-amber-700">Cargando campañas...</p>
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
            <Users className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-amber-900">Gestor de Campañas</h1>
              <p className="text-amber-700">Organiza aventuras épicas de D&D</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateCampaign(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg transform hover:scale-105"
          >
            <Plus size={20} />
            <span>Nueva Campaña</span>
          </button>
        </div>

        {/* Campaign Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Seleccionar Campaña
            </label>
            <select
              value={selectedCampaign?.id || ''}
              onChange={(e) => {
                const campaign = campaigns.find(c => c.id === e.target.value);
                setSelectedCampaign(campaign || null);
              }}
              className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Seleccionar campaña...</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name} - {campaign.status}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-center lg:text-right">
            <div className="text-2xl font-bold text-amber-900">{campaigns.length}</div>
            <div className="text-sm text-amber-700">Campañas Totales</div>
          </div>
        </div>
      </div>

      {/* Campaign Content */}
      {selectedCampaign ? (
        <>
          {/* Campaign Info */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getStatusColor(selectedCampaign.status)}`}>
                  {React.createElement(getStatusIcon(selectedCampaign.status), { size: 24 })}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-amber-900">{selectedCampaign.name}</h2>
                  <p className="text-amber-700">{selectedCampaign.setting}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCampaign.status)}`}>
                  {selectedCampaign.status}
                </span>
                <button
                  onClick={() => setShowDeleteModal({type: 'campaign', id: selectedCampaign.id})}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <p className="text-amber-800 mb-4">{selectedCampaign.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-xl font-bold text-amber-900">Nv. {selectedCampaign.level}</div>
                <div className="text-sm text-amber-700">Nivel</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-xl font-bold text-amber-900">{selectedCampaign.maxPlayers}</div>
                <div className="text-sm text-amber-700">Jugadores Máx.</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-xl font-bold text-amber-900">{npcs.length}</div>
                <div className="text-sm text-amber-700">NPCs</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-xl font-bold text-amber-900">{locations.length}</div>
                <div className="text-sm text-amber-700">Ubicaciones</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200">
            <div className="border-b border-amber-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Resumen', icon: Eye },
                  { id: 'npcs', label: 'NPCs', icon: Users },
                  { id: 'locations', label: 'Ubicaciones', icon: MapPin },
                  { id: 'sessions', label: 'Sesiones', icon: Calendar }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-amber-500 text-amber-600'
                        : 'border-transparent text-amber-500 hover:text-amber-700 hover:border-amber-300'
                    }`}
                  >
                    <tab.icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recent NPCs */}
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        NPCs Recientes
                      </h3>
                      {npcs.slice(0, 3).map(npc => (
                        <div key={npc.id} className="flex items-center justify-between py-2">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1 rounded ${getRoleColor(npc.role)}`}>
                              {React.createElement(getRoleIcon(npc.role), { size: 16 })}
                            </div>
                            <span className="font-medium text-amber-900">{npc.name}</span>
                          </div>
                          <span className="text-sm text-amber-600">{npc.role}</span>
                        </div>
                      ))}
                      {npcs.length === 0 && (
                        <p className="text-amber-600 text-sm">No hay NPCs creados</p>
                      )}
                    </div>

                    {/* Recent Locations */}
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        Ubicaciones Recientes
                      </h3>
                      {locations.slice(0, 3).map(location => (
                        <div key={location.id} className="flex items-center justify-between py-2">
                          <div className="flex items-center space-x-2">
                            {React.createElement(getLocationIcon(location.type), { 
                              size: 16, 
                              className: "text-amber-600" 
                            })}
                            <span className="font-medium text-amber-900">{location.name}</span>
                          </div>
                          <span className="text-sm text-amber-600">{location.type}</span>
                        </div>
                      ))}
                      {locations.length === 0 && (
                        <p className="text-amber-600 text-sm">No hay ubicaciones creadas</p>
                      )}
                    </div>
                  </div>

                  {/* Campaign Notes */}
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Notas de la Campaña
                    </h3>
                    <p className="text-amber-800 whitespace-pre-wrap">
                      {selectedCampaign.notes || 'No hay notas para esta campaña.'}
                    </p>
                  </div>
                </div>
              )}

              {/* NPCs Tab */}
              {activeTab === 'npcs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-amber-900">NPCs de la Campaña</h3>
                    <button
                      onClick={() => setShowCreateNPC(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus size={18} />
                      <span>Nuevo NPC</span>
                    </button>
                  </div>

                  {npcs.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                      <p className="text-amber-600">No hay NPCs en esta campaña</p>
                      <button
                        onClick={() => setShowCreateNPC(true)}
                        className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Crear Primer NPC
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {npcs.map(npc => (
                        <div key={npc.id} className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className={`p-2 rounded-lg ${getRoleColor(npc.role)}`}>
                                {React.createElement(getRoleIcon(npc.role), { size: 20 })}
                              </div>
                              <div>
                                <h4 className="font-bold text-amber-900">{npc.name}</h4>
                                <p className="text-sm text-amber-600">{npc.race} {npc.class}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setShowDeleteModal({type: 'npc', id: npc.id})}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          <p className="text-sm text-amber-700 mb-2">{npc.description}</p>
                          
                          {npc.location && (
                            <div className="text-xs text-amber-600 mb-2">
                              <MapPin className="w-3 h-3 inline mr-1" />
                              {npc.location}
                            </div>
                          )}
                          
                          <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(npc.role)}`}>
                            {npc.role}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Locations Tab */}
              {activeTab === 'locations' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-amber-900">Ubicaciones de la Campaña</h3>
                    <button
                      onClick={() => setShowCreateLocation(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={18} />
                      <span>Nueva Ubicación</span>
                    </button>
                  </div>

                  {locations.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                      <p className="text-amber-600">No hay ubicaciones en esta campaña</p>
                      <button
                        onClick={() => setShowCreateLocation(true)}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Crear Primera Ubicación
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {locations.map(location => (
                        <div key={location.id} className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {React.createElement(getLocationIcon(location.type), { 
                                size: 24, 
                                className: "text-amber-600" 
                              })}
                              <div>
                                <h4 className="font-bold text-amber-900">{location.name}</h4>
                                <p className="text-sm text-amber-600 capitalize">{location.type}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setShowDeleteModal({type: 'location', id: location.id})}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          <p className="text-sm text-amber-700 mb-3">{location.description}</p>
                          
                          {location.inhabitants && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-amber-800">Habitantes:</span>
                              <p className="text-xs text-amber-600">{location.inhabitants}</p>
                            </div>
                          )}
                          
                          {location.secrets && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-amber-800">Secretos:</span>
                              <p className="text-xs text-amber-600">{location.secrets}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sessions Tab */}
              {activeTab === 'sessions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-amber-900">Sesiones de la Campaña</h3>
                    <button
                      onClick={() => setShowCreateSession(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus size={18} />
                      <span>Nueva Sesión</span>
                    </button>
                  </div>

                  {sessions.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                      <p className="text-amber-600">No hay sesiones registradas</p>
                      <button
                        onClick={() => setShowCreateSession(true)}
                        className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Registrar Primera Sesión
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sessions.sort((a, b) => b.date - a.date).map(session => (
                        <div key={session.id} className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-bold text-amber-900">
                                Sesión {session.sessionNumber}: {session.title}
                              </h4>
                              <p className="text-sm text-amber-600">
                                {new Date(session.date).toLocaleDateString()} • {session.duration} minutos
                              </p>
                            </div>
                            <button
                              onClick={() => setShowDeleteModal({type: 'session', id: session.id})}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          <p className="text-sm text-amber-700 mb-3">{session.summary}</p>
                          
                          {session.events && (
                            <div className="mb-3">
                              <span className="text-xs font-medium text-amber-800">Eventos:</span>
                              <p className="text-xs text-amber-600 whitespace-pre-wrap">{session.events}</p>
                            </div>
                          )}
                          
                          {session.notes && (
                            <div>
                              <span className="text-xs font-medium text-amber-800">Notas:</span>
                              <p className="text-xs text-amber-600">{session.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-amber-200 text-center">
          <Users className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-amber-900 mb-2">¡Comienza tu Aventura!</h2>
          <p className="text-amber-700 mb-6">
            {campaigns.length === 0 
              ? 'No tienes campañas creadas. Crea tu primera campaña para comenzar.'
              : 'Selecciona una campaña del desplegable superior para ver sus detalles.'
            }
          </p>
          {campaigns.length === 0 && (
            <button
              onClick={() => setShowCreateCampaign(true)}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Crear Mi Primera Campaña
            </button>
          )}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-amber-900">Nueva Campaña</h2>
              <button
                onClick={() => setShowCreateCampaign(false)}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Nombre de la Campaña *
                </label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ej: La Mina Perdida de Phandelver"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-24"
                  placeholder="Descripción de la campaña..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Ambientación
                </label>
                <input
                  type="text"
                  value={newCampaign.setting}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, setting: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ej: Forgotten Realms, Eberron, mundo personalizado..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Nivel Inicial
                  </label>
                  <select
                    value={newCampaign.level}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {Array.from({ length: 20 }, (_, i) => i + 1).map(level => (
                      <option key={level} value={level}>Nivel {level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Jugadores Máximo
                  </label>
                  <select
                    value={newCampaign.maxPlayers}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {Array.from({ length: 8 }, (_, i) => i + 1).map(players => (
                      <option key={players} value={players}>{players} jugadores</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Estado
                </label>
                <select
                  value={newCampaign.status}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="planning">Planificación</option>
                  <option value="active">Activa</option>
                  <option value="paused">Pausada</option>
                  <option value="completed">Completada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Notas
                </label>
                <textarea
                  value={newCampaign.notes}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-24"
                  placeholder="Notas adicionales sobre la campaña..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateCampaign(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateCampaign}
                  disabled={!newCampaign.name.trim()}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Crear Campaña
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create NPC Modal */}
      {showCreateNPC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-amber-900">Nuevo NPC</h2>
              <button
                onClick={() => setShowCreateNPC(false)}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={newNPC.name}
                  onChange={(e) => setNewNPC(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Nombre del NPC"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Raza
                  </label>
                  <input
                    type="text"
                    value={newNPC.race}
                    onChange={(e) => setNewNPC(prev => ({ ...prev, race: e.target.value }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Ej: Humano, Elfo, Enano..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Clase/Profesión
                  </label>
                  <input
                    type="text"
                    value={newNPC.class}
                    onChange={(e) => setNewNPC(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Ej: Comerciante, Guerrero, Mago..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Rol
                  </label>
                  <select
                    value={newNPC.role}
                    onChange={(e) => setNewNPC(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="ally">Aliado</option>
                    <option value="enemy">Enemigo</option>
                    <option value="neutral">Neutral</option>
                    <option value="merchant">Comerciante</option>
                    <option value="quest_giver">Dador de Misiones</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={newNPC.location}
                    onChange={(e) => setNewNPC(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Dónde se encuentra normalmente"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newNPC.description}
                  onChange={(e) => setNewNPC(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-24"
                  placeholder="Descripción física y personalidad del NPC..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Notas
                </label>
                <textarea
                  value={newNPC.notes}
                  onChange={(e) => setNewNPC(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-24"
                  placeholder="Información adicional, motivaciones, secretos..."
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
                  onClick={handleCreateNPC}
                  disabled={!newNPC.name.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Crear NPC
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Location Modal */}
      {showCreateLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-amber-900">Nueva Ubicación</h2>
              <button
                onClick={() => setShowCreateLocation(false)}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Nombre de la ubicación"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Tipo
                </label>
                <select
                  value={newLocation.type}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="city">Ciudad</option>
                  <option value="dungeon">Mazmorra</option>
                  <option value="wilderness">Naturaleza</option>
                  <option value="building">Edificio</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newLocation.description}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-24"
                  placeholder="Descripción de la ubicación..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Habitantes
                </label>
                <textarea
                  value={newLocation.inhabitants}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, inhabitants: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-20"
                  placeholder="Quién vive o frecuenta este lugar..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Secretos
                </label>
                <textarea
                  value={newLocation.secrets}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, secrets: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-20"
                  placeholder="Información oculta o secretos del lugar..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Notas
                </label>
                <textarea
                  value={newLocation.notes}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-20"
                  placeholder="Notas adicionales..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateLocation(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateLocation}
                  disabled={!newLocation.name.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Crear Ubicación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-amber-900">Nueva Sesión</h2>
              <button
                onClick={() => setShowCreateSession(false)}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={newSession.title}
                  onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Título de la sesión"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={newSession.date}
                    onChange={(e) => setNewSession(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    value={newSession.duration}
                    onChange={(e) => setNewSession(prev => ({ ...prev, duration: parseInt(e.target.value) || 240 }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    min="30"
                    step="30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Resumen
                </label>
                <textarea
                  value={newSession.summary}
                  onChange={(e) => setNewSession(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-24"
                  placeholder="Resumen de lo que ocurrió en la sesión..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Eventos
                </label>
                <textarea
                  value={newSession.events}
                  onChange={(e) => setNewSession(prev => ({ ...prev, events: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-32"
                  placeholder="Lista de eventos importantes que ocurrieron..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Notas
                </label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-24"
                  placeholder="Notas adicionales sobre la sesión..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateSession(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateSession}
                  disabled={!newSession.title.trim()}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Crear Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Confirmar Eliminación?</h2>
              <p className="text-gray-600">
                Esta acción no se puede deshacer. Se eliminará permanentemente.
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
                onClick={() => handleDelete(showDeleteModal.type, showDeleteModal.id)}
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

export default CampaignManager;