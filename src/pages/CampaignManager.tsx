import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Filter, Edit, Trash2, Eye, Save, X, 
  MapPin, Calendar, Clock, Star, BookOpen, Scroll, Crown,
  UserPlus, Home, Sword, Shield, Zap, Target, TreePine
} from 'lucide-react';
import { 
  saveCampaign, loadCampaigns, deleteCampaign, saveNPC, loadNPCs, deleteNPC,
  saveLocation, loadLocations, deleteLocation, saveCampaignSession, loadCampaignSessions,
  deleteCampaignSession, generateId, loadNPCTemplates, saveNPCTemplate
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNPCModal, setShowNPCModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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
    type: 'city' as const,
    description: '',
    inhabitants: '',
    secrets: '',
    notes: ''
  });

  const [newSession, setNewSession] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    duration: 4,
    summary: '',
    events: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      loadCampaignData();
    }
  }, [selectedCampaign]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [campaignsData, templatesData] = await Promise.all([
        loadCampaigns(),
        loadNPCTemplates()
      ]);
      
      setCampaigns(campaignsData);
      setNPCTemplates(templatesData);
      
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

  const loadCampaignData = async () => {
    if (!selectedCampaign) return;
    
    try {
      const [npcsData, locationsData, sessionsData] = await Promise.all([
        loadNPCs(),
        loadLocations(),
        loadCampaignSessions()
      ]);
      
      setNPCs(npcsData.filter(npc => npc.campaignId === selectedCampaign.id));
      setLocations(locationsData.filter(loc => loc.campaignId === selectedCampaign.id));
      setSessions(sessionsData.filter(session => session.campaignId === selectedCampaign.id));
    } catch (error) {
      console.error('Error loading campaign data:', error);
    }
  };

  const createExampleCampaign = async () => {
    const exampleCampaign: Campaign = {
      id: generateId(),
      name: "La Mina Perdida de Phandelver",
      description: "Una aventura clásica para aventureros novatos que los llevará desde Neverwinter hasta la misteriosa mina perdida.",
      setting: "Costa de la Espada - Reinos Olvidados",
      level: 1,
      maxPlayers: 4,
      status: 'active',
      playerIds: [],
      notes: "Campaña de introducción perfecta para nuevos jugadores. Incluye exploración, combate, roleplay y misterio.",
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
        race: "Enano",
        class: "Comerciante",
        role: 'ally' as const,
        location: "Neverwinter",
        description: "Un enano comerciante que contrata a los aventureros para escoltar un cargamento a Phandalin.",
        notes: "Hermano de Nundro y Tharden. Conoce el secreto de la Mina Perdida de los Ecos de Onda.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Klarg",
        race: "Trasgo",
        class: "Jefe de Banda",
        role: 'enemy' as const,
        location: "Cueva de los Trasgos",
        description: "Un trasgo que lidera una banda de saqueadores en las cuevas cerca del camino a Phandalin.",
        notes: "Primer encuentro de combate importante. Tiene un lobo como mascota.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Hermana Garaele",
        race: "Elfa",
        class: "Clérigo",
        role: 'quest_giver' as const,
        location: "Phandalin",
        description: "Clérigo de Tymora y agente de los Arpistas. Ofrece misiones secundarias a los aventureros.",
        notes: "Puede proporcionar pociones de curación y información sobre la región.",
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
        description: "Un pequeño pueblo fronterizo que está siendo reconstruido después de años de abandono.",
        inhabitants: "Colonos, comerciantes, algunos aventureros retirados",
        secrets: "Los Capas Rojas controlan secretamente gran parte del comercio local",
        notes: "Base de operaciones principal para los aventureros. Incluye la Posada de Stonehill.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Cueva de los Trasgos",
        type: 'dungeon' as const,
        description: "Una red de cuevas naturales ocupada por trasgos y lobos.",
        inhabitants: "Trasgos, lobos, Klarg (jefe trasgo)",
        secrets: "Contiene parte del cargamento robado de Gundren",
        notes: "Primera mazmorra de la campaña. 3 áreas principales con diferentes encuentros.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Mansión Cragmaw",
        type: 'building' as const,
        description: "Una mansión en ruinas que sirve como fortaleza para los trasgos Cragmaw.",
        inhabitants: "Trasgos Cragmaw, Rey Grol, prisioneros",
        secrets: "Aquí está prisionero Gundren Rockseeker",
        notes: "Mazmorra de nivel medio. Requiere estrategia para rescatar a Gundren.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    for (const location of exampleLocations) {
      await saveLocation(location);
    }

    // Create example session
    const exampleSession: CampaignSession = {
      id: generateId(),
      campaignId: exampleCampaign.id,
      sessionNumber: 1,
      title: "El Camino a Phandalin",
      date: Date.now() - (7 * 24 * 60 * 60 * 1000), // 1 week ago
      duration: 4,
      summary: "Los aventureros se conocen en Neverwinter y aceptan la misión de Gundren de escoltar un cargamento a Phandalin.",
      events: "- Encuentro inicial en la taberna\n- Contrato con Gundren\n- Emboscada en el camino\n- Descubrimiento de la cueva de los trasgos",
      notes: "Excelente sesión de introducción. Los jugadores trabajaron bien en equipo durante la emboscada.",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await saveCampaignSession(exampleSession);

    // Reload data
    await loadData();
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
    setCampaigns(prev => [...prev, campaign]);
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
    setShowCreateModal(false);
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
    setNPCs(prev => [...prev, npc]);
    setNewNPC({
      name: '',
      race: '',
      class: '',
      role: 'neutral',
      location: '',
      description: '',
      notes: ''
    });
    setShowNPCModal(false);
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
    setLocations(prev => [...prev, location]);
    setNewLocation({
      name: '',
      type: 'city',
      description: '',
      inhabitants: '',
      secrets: '',
      notes: ''
    });
    setShowLocationModal(false);
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
    setSessions(prev => [...prev, session]);
    setNewSession({
      title: '',
      date: new Date().toISOString().split('T')[0],
      duration: 4,
      summary: '',
      events: '',
      notes: ''
    });
    setShowSessionModal(false);
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta campaña? Se eliminarán todos los NPCs, ubicaciones y sesiones asociadas.')) {
      await deleteCampaign(campaignId);
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      if (selectedCampaign?.id === campaignId) {
        setSelectedCampaign(campaigns.find(c => c.id !== campaignId) || null);
      }
    }
  };

  const handleDeleteNPC = async (npcId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este NPC?')) {
      await deleteNPC(npcId);
      setNPCs(prev => prev.filter(n => n.id !== npcId));
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta ubicación?')) {
      await deleteLocation(locationId);
      setLocations(prev => prev.filter(l => l.id !== locationId));
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta sesión?')) {
      await deleteCampaignSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    }
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, any> = {
      'ally': Shield,
      'enemy': Sword,
      'neutral': Users,
      'merchant': Star,
      'quest_giver': Scroll
    };
    return icons[role] || Users;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      'ally': 'text-green-600 bg-green-100',
      'enemy': 'text-red-600 bg-red-100',
      'neutral': 'text-gray-600 bg-gray-100',
      'merchant': 'text-yellow-600 bg-yellow-100',
      'quest_giver': 'text-purple-600 bg-purple-100'
    };
    return colors[role] || 'text-gray-600 bg-gray-100';
  };

  const getLocationIcon = (type: string) => {
    const icons: Record<string, any> = {
      'city': Home,
      'dungeon': Zap,
      'wilderness': TreePine,
      'building': Crown,
      'other': MapPin
    };
    return icons[type] || MapPin;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'planning': 'bg-yellow-100 text-yellow-800',
      'active': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800',
      'paused': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredNPCs = npcs.filter(npc =>
    npc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    npc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-amber-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-amber-900">Gestor de Campañas</h1>
              <p className="text-amber-700 text-sm sm:text-base">Organiza tus aventuras épicas de D&D</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md text-sm sm:text-base"
          >
            <Plus size={16} className="sm:w-5 sm:h-5" />
            <span>Nueva Campaña</span>
          </button>
        </div>

        {/* Campaign Selection */}
        <div className="mb-4 sm:mb-6">
          <select
            value={selectedCampaign?.id || ''}
            onChange={(e) => {
              const campaign = campaigns.find(c => c.id === e.target.value);
              setSelectedCampaign(campaign || null);
            }}
            className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
          >
            <option value="">Seleccionar campaña...</option>
            {campaigns.map(campaign => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name} - {campaign.status}
              </option>
            ))}
          </select>
        </div>

        {/* Campaign Info */}
        {selectedCampaign && (
          <div className="bg-amber-50 rounded-lg p-3 sm:p-4 border border-amber-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 space-y-2 sm:space-y-0">
              <h3 className="text-lg sm:text-xl font-bold text-amber-900">{selectedCampaign.name}</h3>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCampaign.status)}`}>
                  {selectedCampaign.status}
                </span>
                <button
                  onClick={() => handleDeleteCampaign(selectedCampaign.id)}
                  className="p-1.5 sm:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 size={16} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
            <p className="text-amber-700 mb-2 text-sm sm:text-base">{selectedCampaign.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div><strong>Nivel:</strong> {selectedCampaign.level}</div>
              <div><strong>Jugadores:</strong> {selectedCampaign.maxPlayers}</div>
              <div><strong>NPCs:</strong> {npcs.length}</div>
              <div><strong>Ubicaciones:</strong> {locations.length}</div>
            </div>
          </div>
        )}
      </div>

      {selectedCampaign && (
        <>
          {/* Tabs */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 overflow-hidden">
            <div className="flex overflow-x-auto">
              {[
                { id: 'overview', label: 'Resumen', icon: Eye },
                { id: 'npcs', label: 'NPCs', icon: Users },
                { id: 'locations', label: 'Ubicaciones', icon: MapPin },
                { id: 'sessions', label: 'Sesiones', icon: Calendar }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-3 sm:py-4 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                      activeTab === tab.id
                        ? 'bg-amber-600 text-white'
                        : 'text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    <Icon size={16} className="sm:w-5 sm:h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-amber-200">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-amber-900">Resumen de la Campaña</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                    <div className="text-center">
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-blue-900">{npcs.length}</div>
                      <div className="text-xs sm:text-sm text-blue-700">NPCs</div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
                    <div className="text-center">
                      <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-green-900">{locations.length}</div>
                      <div className="text-xs sm:text-sm text-green-700">Ubicaciones</div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-200">
                    <div className="text-center">
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-purple-900">{sessions.length}</div>
                      <div className="text-xs sm:text-sm text-purple-700">Sesiones</div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 rounded-lg p-3 sm:p-4 border border-amber-200">
                    <div className="text-center">
                      <Star className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600 mx-auto mb-2" />
                      <div className="text-xl sm:text-2xl font-bold text-amber-900">{selectedCampaign.level}</div>
                      <div className="text-xs sm:text-sm text-amber-700">Nivel</div>
                    </div>
                  </div>
                </div>

                {selectedCampaign.notes && (
                  <div className="bg-amber-50 rounded-lg p-3 sm:p-4 border border-amber-200">
                    <h3 className="font-bold text-amber-900 mb-2 text-sm sm:text-base">Notas de la Campaña</h3>
                    <p className="text-amber-800 whitespace-pre-wrap text-sm sm:text-base">{selectedCampaign.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* NPCs Tab */}
            {activeTab === 'npcs' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-amber-900">NPCs</h2>
                  <button
                    onClick={() => setShowNPCModal(true)}
                    className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    <UserPlus size={16} className="sm:w-5 sm:h-5" />
                    <span>Agregar NPC</span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar NPCs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNPCs.map(npc => {
                    const RoleIcon = getRoleIcon(npc.role);
                    return (
                      <div key={npc.id} className="bg-white rounded-xl p-3 sm:p-4 border border-amber-200 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-amber-900 mb-1 text-sm sm:text-base">{npc.name}</h3>
                            <p className="text-xs sm:text-sm text-amber-600">{npc.race} {npc.class}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className={`p-1 rounded-full ${getRoleColor(npc.role)}`}>
                              <RoleIcon size={14} className="sm:w-4 sm:h-4" />
                            </span>
                            <button
                              onClick={() => handleDeleteNPC(npc.id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-xs sm:text-sm text-amber-700 mb-2">{npc.description}</p>
                        
                        {npc.location && (
                          <div className="flex items-center text-xs sm:text-sm text-amber-600 mb-2">
                            <MapPin size={12} className="sm:w-3 sm:h-3 mr-1" />
                            <span>{npc.location}</span>
                          </div>
                        )}
                        
                        {npc.notes && (
                          <p className="text-xs text-amber-500 italic">{npc.notes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {filteredNPCs.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 sm:w-16 sm:h-16 text-amber-400 mx-auto mb-4" />
                    <p className="text-amber-600 text-sm sm:text-base">No hay NPCs en esta campaña</p>
                  </div>
                )}
              </div>
            )}

            {/* Locations Tab */}
            {activeTab === 'locations' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-amber-900">Ubicaciones</h2>
                  <button
                    onClick={() => setShowLocationModal(true)}
                    className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                  >
                    <Plus size={16} className="sm:w-5 sm:h-5" />
                    <span>Agregar Ubicación</span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" size={16} />
                  <input
                    type="text"
                    placeholder="Buscar ubicaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredLocations.map(location => {
                    const LocationIcon = getLocationIcon(location.type);
                    return (
                      <div key={location.id} className="bg-white rounded-xl p-3 sm:p-4 border border-amber-200 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2 flex-1">
                            <LocationIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                            <div>
                              <h3 className="font-bold text-amber-900 text-sm sm:text-base">{location.name}</h3>
                              <p className="text-xs sm:text-sm text-amber-600 capitalize">{location.type}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteLocation(location.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                        
                        <p className="text-xs sm:text-sm text-amber-700 mb-3">{location.description}</p>
                        
                        {location.inhabitants && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-amber-800">Habitantes:</span>
                            <p className="text-xs sm:text-sm text-amber-600">{location.inhabitants}</p>
                          </div>
                        )}
                        
                        {location.secrets && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-amber-800">Secretos:</span>
                            <p className="text-xs sm:text-sm text-amber-600 italic">{location.secrets}</p>
                          </div>
                        )}
                        
                        {location.notes && (
                          <p className="text-xs text-amber-500 italic">{location.notes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {filteredLocations.length === 0 && (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-amber-400 mx-auto mb-4" />
                    <p className="text-amber-600 text-sm sm:text-base">No hay ubicaciones en esta campaña</p>
                  </div>
                )}
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-amber-900">Sesiones</h2>
                  <button
                    onClick={() => setShowSessionModal(true)}
                    className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
                  >
                    <Plus size={16} className="sm:w-5 sm:h-5" />
                    <span>Nueva Sesión</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {sessions.sort((a, b) => b.sessionNumber - a.sessionNumber).map(session => (
                    <div key={session.id} className="bg-white rounded-xl p-3 sm:p-4 border border-amber-200 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                              Sesión #{session.sessionNumber}
                            </span>
                            <h3 className="font-bold text-amber-900 text-sm sm:text-base">{session.title}</h3>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-amber-600">
                            <div className="flex items-center">
                              <Calendar size={12} className="sm:w-3 sm:h-3 mr-1" />
                              <span>{new Date(session.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock size={12} className="sm:w-3 sm:h-3 mr-1" />
                              <span>{session.duration} horas</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded self-start"
                        >
                          <Trash2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-amber-700 mb-3">{session.summary}</p>
                      
                      {session.events && (
                        <div className="mb-3">
                          <span className="text-xs font-medium text-amber-800">Eventos:</span>
                          <p className="text-xs sm:text-sm text-amber-600 whitespace-pre-wrap">{session.events}</p>
                        </div>
                      )}
                      
                      {session.notes && (
                        <p className="text-xs text-amber-500 italic">{session.notes}</p>
                      )}
                    </div>
                  ))}
                </div>

                {sessions.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-amber-400 mx-auto mb-4" />
                    <p className="text-amber-600 text-sm sm:text-base">No hay sesiones registradas</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-amber-900">Nueva Campaña</h2>
              <button
                onClick={() => setShowCreateModal(false)}
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
                  className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
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
                  className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-20 text-sm sm:text-base"
                  placeholder="Descripción de la campaña..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Nivel Inicial
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newCampaign.level}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                    className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Máx. Jugadores
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={newCampaign.maxPlayers}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) || 4 }))}
                    className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Estado
                </label>
                <select
                  value={newCampaign.status}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                >
                  <option value="planning">Planificación</option>
                  <option value="active">Activa</option>
                  <option value="paused">Pausada</option>
                  <option value="completed">Completada</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateCampaign}
                  disabled={!newCampaign.name.trim()}
                  className="flex-1 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create NPC Modal */}
      {showNPCModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-amber-900">Nuevo NPC</h2>
              <button
                onClick={() => setShowNPCModal(false)}
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
                  className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Nombre del NPC"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Raza
                  </label>
                  <input
                    type="text"
                    value={newNPC.race}
                    onChange={(e) => setNewNPC(prev => ({ ...prev, race: e.target.value }))}
                    className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Ej: Humano"
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
                    className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Ej: Comerciante"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Rol
                </label>
                <select
                  value={newNPC.role}
                  onChange={(e) => setNewNPC(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
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
                  className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Dónde se encuentra"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newNPC.description}
                  onChange={(e) => setNewNPC(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-20 text-sm sm:text-base"
                  placeholder="Descripción del NPC..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowNPCModal(false)}
                  className="flex-1 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateNPC}
                  disabled={!newNPC.name.trim()}
                  className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-amber-900">Nueva Ubicación</h2>
              <button
                onClick={() => setShowLocationModal(false)}
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
                  className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
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
                  className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
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
                  className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-20 text-sm sm:text-base"
                  placeholder="Descripción de la ubicación..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Habitantes
                </label>
                <input
                  type="text"
                  value={newLocation.inhabitants}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, inhabitants: e.target.value }))}
                  className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Quién vive aquí"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Secretos
                </label>
                <textarea
                  value={newLocation.secrets}
                  onChange={(e) => setNewLocation(prev => ({ ...prev, secrets: e.target.value }))}
                  className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-16 text-sm sm:text-base"
                  placeholder="Secretos ocultos..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="flex-1 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateLocation}
                  disabled={!newLocation.name.trim()}
                  className="flex-1 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-amber-900">Nueva Sesión</h2>
              <button
                onClick={() => setShowSessionModal(false)}
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
                  className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Título de la sesión"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={newSession.date}
                    onChange={(e) => setNewSession(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Duración (horas)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={newSession.duration}
                    onChange={(e) => setNewSession(prev => ({ ...prev, duration: parseInt(e.target.value) || 4 }))}
                    className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base"
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
                  className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-20 text-sm sm:text-base"
                  placeholder="Resumen de lo que pasó..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Eventos Principales
                </label>
                <textarea
                  value={newSession.events}
                  onChange={(e) => setNewSession(prev => ({ ...prev, events: e.target.value }))}
                  className="w-full p-2 sm:p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-24 text-sm sm:text-base"
                  placeholder="- Evento 1&#10;- Evento 2&#10;- Evento 3"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="flex-1 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateSession}
                  disabled={!newSession.title.trim()}
                  className="flex-1 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CampaignManager;