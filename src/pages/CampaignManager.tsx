import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Edit, Trash2, Users, MapPin, Calendar, 
  Play, Pause, CheckCircle, Clock, Search, Filter, Eye,
  User, Scroll, Home, Star, Save, X, ArrowLeft, Settings
} from 'lucide-react';
import { 
  loadCampaigns, saveCampaign, deleteCampaign, loadNPCs, saveNPC, deleteNPC,
  loadLocations, saveLocation, deleteLocation, loadCampaignSessions, 
  saveCampaignSession, deleteCampaignSession, generateId 
} from '../services/db';
import { Campaign, NPC, Location, CampaignSession } from '../types';

function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [npcs, setNPCs] = useState<NPC[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [sessions, setSessions] = useState<CampaignSession[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'npcs' | 'locations' | 'sessions'>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
    if (campaigns.length === 0) {
      createExampleCampaign();
    }
  }, [campaigns]);

  const loadData = async () => {
    try {
      const [campaignsData, npcsData, locationsData, sessionsData] = await Promise.all([
        loadCampaigns(),
        loadNPCs(),
        loadLocations(),
        loadCampaignSessions()
      ]);

      setCampaigns(campaignsData);
      setNPCs(npcsData);
      setLocations(locationsData);
      setSessions(sessionsData);

      if (campaignsData.length > 0 && !selectedCampaign) {
        setSelectedCampaign(campaignsData[0]);
      }
    } catch (error) {
      console.error('Error loading campaign data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createExampleCampaign = async () => {
    const exampleCampaign: Campaign = {
      id: generateId(),
      name: "La Mina Perdida de Phandelver",
      description: "Una aventura clásica de D&D 5e donde los héroes deben rescatar a Gundren Rockseeker y descubrir los secretos de la Mina Perdida de Phandelver.",
      setting: "Costa de la Espada - Reinos Olvidados",
      level: 1,
      maxPlayers: 4,
      status: 'active',
      playerIds: [],
      notes: "Campaña de ejemplo con contenido preconfigurado para demostrar las funcionalidades del sistema.",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const exampleNPCs: NPC[] = [
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Gundren Rockseeker",
        race: "Enano",
        class: "Noble",
        role: "ally",
        location: "Phandalin",
        description: "Un enano comerciante que ha contratado a los aventureros para escoltar un cargamento a Phandalin.",
        notes: "Hermano de Nundro y Tharden. Conoce la ubicación de la Mina Perdida.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Klarg",
        race: "Trasgo",
        class: "Guerrero",
        role: "enemy",
        location: "Cueva de los Trasgos",
        description: "Un trasgo líder que ha capturado a Sildar Hallwinter por órdenes de los Capas Negras.",
        notes: "Jefe de la cueva de trasgos. Puede ser convencido de cambiar de bando.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Sildar Hallwinter",
        race: "Humano",
        class: "Guerrero",
        role: "ally",
        location: "Phandalin",
        description: "Un señor de Waterdeep y agente de la Alianza de los Señores, capturado por los trasgos.",
        notes: "Busca a Iarno Albrek, que ha desaparecido en Phandalin.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Toblen Stonehill",
        race: "Humano",
        class: "Plebeyo",
        role: "neutral",
        location: "Posada Stonehill",
        description: "El posadero de la Posada Stonehill en Phandalin, amigable y servicial.",
        notes: "Fuente de información local y rumores. Ofrece habitaciones a 5 sp por noche.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Hermana Garaele",
        race: "Elfa",
        class: "Clérigo",
        role: "quest_giver",
        location: "Santuario de la Fortuna",
        description: "Una clérigo élfica de Tymora que dirige el santuario en Phandalin.",
        notes: "Agente de la Alianza de los Arpistas. Puede dar misiones secundarias.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    const exampleLocations: Location[] = [
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Phandalin",
        type: "city",
        description: "Una pequeña ciudad fronteriza que está siendo reconstruida después de ser destruida por orcos hace décadas.",
        inhabitants: "Aproximadamente 50 residentes, principalmente humanos y halflings.",
        secrets: "Los Capas Rojas controlan secretamente la ciudad a través de intimidación.",
        notes: "Centro principal de la aventura. Contiene varias tiendas y servicios.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Cueva de los Trasgos",
        type: "dungeon",
        description: "Una cueva natural utilizada como guarida por una banda de trasgos liderada por Klarg.",
        inhabitants: "Trasgos, lobos y Klarg el trasgo líder.",
        secrets: "Contiene el equipaje de Gundren y pistas sobre los Capas Negras.",
        notes: "Primera mazmorra de la aventura. Nivel apropiado: 1-2.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Mansión Tresendar",
        type: "dungeon",
        description: "Las ruinas de una antigua mansión que ahora sirve como base secreta de los Capas Rojas.",
        inhabitants: "Capas Rojas, esqueletos y Glasstaff (Iarno Albrek).",
        secrets: "Base de operaciones de los Capas Rojas. Contiene una rata gigante como mascota.",
        notes: "Mazmorra principal en Phandalin. Nivel apropiado: 2-3.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Castillo de Cragmaw",
        type: "dungeon",
        description: "Un castillo en ruinas que sirve como fortaleza principal de la tribu Cragmaw.",
        inhabitants: "Trasgos Cragmaw, hobgoblins, owlbears y el Rey Grol.",
        secrets: "Aquí está prisionero Gundren Rockseeker.",
        notes: "Fortaleza principal de los trasgos. Nivel apropiado: 3-4.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Mina Perdida de Phandelver",
        type: "dungeon",
        description: "Una antigua mina enana llena de magia y peligros, ahora controlada por el Araña Negra.",
        inhabitants: "Doppelganger (Araña Negra), espectros, zombis y otras criaturas no-muertas.",
        secrets: "Contiene la Forja de Hechizos, un artefacto mágico de gran poder.",
        notes: "Mazmorra final de la campaña. Nivel apropiado: 4-5.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        name: "Posada Stonehill",
        type: "building",
        description: "La posada principal de Phandalin, un lugar acogedor para descansar y obtener información.",
        inhabitants: "Toblen Stonehill (posadero), su esposa Trilena y sus hijos.",
        secrets: "Los huéspedes a menudo comparten rumores valiosos.",
        notes: "Centro social de Phandalin. Habitaciones: 5 sp/noche, comidas: 2 sp.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    const exampleSessions: CampaignSession[] = [
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        sessionNumber: 1,
        title: "El Camino a Phandalin",
        date: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
        duration: 4,
        summary: "Los aventureros se conocen en Neverwinter y aceptan la misión de Gundren de escoltar un cargamento a Phandalin.",
        events: "- Presentación de personajes en la taberna\n- Gundren explica la misión\n- Partida hacia Phandalin\n- Emboscada de trasgos en el camino\n- Descubrimiento de los caballos muertos",
        notes: "Primera sesión exitosa. Los jugadores trabajaron bien en equipo durante la emboscada.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        campaignId: exampleCampaign.id,
        sessionNumber: 2,
        title: "La Cueva de los Trasgos",
        date: Date.now() - (3 * 24 * 60 * 60 * 1000), // 3 days ago
        duration: 3.5,
        summary: "Los héroes rastrean a los trasgos hasta su cueva y rescatan a Sildar Hallwinter.",
        events: "- Seguimiento de las huellas de los trasgos\n- Infiltración en la cueva\n- Combate con los lobos guardianes\n- Negociación con Klarg\n- Rescate de Sildar\n- Llegada a Phandalin",
        notes: "Excelente uso de sigilo y diplomacia. Klarg se unió temporalmente al grupo.",
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    try {
      await saveCampaign(exampleCampaign);
      
      for (const npc of exampleNPCs) {
        await saveNPC(npc);
      }
      
      for (const location of exampleLocations) {
        await saveLocation(location);
      }
      
      for (const session of exampleSessions) {
        await saveCampaignSession(session);
      }

      // Reload data to include the new example campaign
      await loadData();
      setSelectedCampaign(exampleCampaign);
    } catch (error) {
      console.error('Error creating example campaign:', error);
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

    try {
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
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
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

    try {
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
    } catch (error) {
      console.error('Error creating NPC:', error);
    }
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

    try {
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
    } catch (error) {
      console.error('Error creating location:', error);
    }
  };

  const handleCreateSession = async () => {
    if (!newSession.title.trim() || !selectedCampaign) return;

    const sessionNumber = sessions.filter(s => s.campaignId === selectedCampaign.id).length + 1;

    const session: CampaignSession = {
      id: generateId(),
      campaignId: selectedCampaign.id,
      sessionNumber,
      ...newSession,
      date: new Date(newSession.date).getTime(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
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
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'active': return <Play className="w-4 h-4 text-green-600" />;
      case 'paused': return <Pause className="w-4 h-4 text-orange-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'paused': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ally': return <Star className="w-4 h-4 text-green-600" />;
      case 'enemy': return <Sword className="w-4 h-4 text-red-600" />;
      case 'neutral': return <User className="w-4 h-4 text-gray-600" />;
      case 'merchant': return <Coins className="w-4 h-4 text-yellow-600" />;
      case 'quest_giver': return <Scroll className="w-4 h-4 text-purple-600" />;
      default: return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'city': return <Home className="w-4 h-4 text-blue-600" />;
      case 'dungeon': return <MapPin className="w-4 h-4 text-red-600" />;
      case 'wilderness': return <TreePine className="w-4 h-4 text-green-600" />;
      case 'building': return <Home className="w-4 h-4 text-amber-600" />;
      default: return <MapPin className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const campaignNPCs = npcs.filter(npc => npc.campaignId === selectedCampaign?.id);
  const campaignLocations = locations.filter(location => location.campaignId === selectedCampaign?.id);
  const campaignSessions = sessions.filter(session => session.campaignId === selectedCampaign?.id);

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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-amber-900">Gestor de Campañas</h1>
              <p className="text-amber-700">Organiza tus aventuras épicas de D&D</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
          >
            <Plus size={18} />
            <span>Nueva Campaña</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" size={18} />
          <input
            type="text"
            placeholder="Buscar campañas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaigns List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
          <h2 className="text-xl font-bold text-amber-900 mb-4">Campañas</h2>
          
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <p className="text-amber-600">No hay campañas</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Crear Primera Campaña
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCampaigns.map(campaign => (
                <div
                  key={campaign.id}
                  onClick={() => setSelectedCampaign(campaign)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCampaign?.id === campaign.id
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-amber-200 bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-amber-900">{campaign.name}</h3>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(campaign.status)}`}>
                      {getStatusIcon(campaign.status)}
                      <span className="capitalize">{campaign.status}</span>
                    </div>
                  </div>
                  <p className="text-sm text-amber-700 mb-2 line-clamp-2">{campaign.description}</p>
                  <div className="flex items-center justify-between text-xs text-amber-600">
                    <span>Nivel {campaign.level}</span>
                    <span>{campaign.maxPlayers} jugadores máx.</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campaign Details */}
        <div className="lg:col-span-2">
          {selectedCampaign ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
              {/* Campaign Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-amber-900">{selectedCampaign.name}</h2>
                  <p className="text-amber-700">{selectedCampaign.setting}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm border ${getStatusColor(selectedCampaign.status)}`}>
                    {getStatusIcon(selectedCampaign.status)}
                    <span className="capitalize">{selectedCampaign.status}</span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingItem(selectedCampaign);
                      setShowEditModal(true);
                    }}
                    className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
                  >
                    <Edit size={18} />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-6 bg-amber-100 rounded-lg p-1">
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
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-white text-amber-900 shadow-sm'
                          : 'text-amber-700 hover:text-amber-900'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-amber-900 mb-2">Descripción</h3>
                    <p className="text-amber-800">{selectedCampaign.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-900">{selectedCampaign.level}</div>
                        <div className="text-sm text-amber-700">Nivel de Campaña</div>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-900">{campaignNPCs.length}</div>
                        <div className="text-sm text-blue-700">NPCs</div>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-900">{campaignSessions.length}</div>
                        <div className="text-sm text-green-700">Sesiones</div>
                      </div>
                    </div>
                  </div>

                  {selectedCampaign.notes && (
                    <div>
                      <h3 className="text-lg font-bold text-amber-900 mb-2">Notas</h3>
                      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                        <p className="text-amber-800 whitespace-pre-wrap">{selectedCampaign.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'npcs' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-amber-900">NPCs de la Campaña</h3>
                    <button
                      onClick={() => setShowNPCModal(true)}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={16} />
                      <span>Agregar NPC</span>
                    </button>
                  </div>

                  {campaignNPCs.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                      <p className="text-amber-600">No hay NPCs en esta campaña</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {campaignNPCs.map(npc => (
                        <div key={npc.id} className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-bold text-amber-900">{npc.name}</h4>
                              <p className="text-sm text-amber-600">{npc.race} {npc.class}</p>
                            </div>
                            <div className="flex items-center space-x-1">
                              {getRoleIcon(npc.role)}
                              <span className="text-xs text-amber-600 capitalize">{npc.role}</span>
                            </div>
                          </div>
                          <p className="text-sm text-amber-700 mb-2">{npc.description}</p>
                          {npc.location && (
                            <p className="text-xs text-amber-600">📍 {npc.location}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'locations' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-amber-900">Ubicaciones de la Campaña</h3>
                    <button
                      onClick={() => setShowLocationModal(true)}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus size={16} />
                      <span>Agregar Ubicación</span>
                    </button>
                  </div>

                  {campaignLocations.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                      <p className="text-amber-600">No hay ubicaciones en esta campaña</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {campaignLocations.map(location => (
                        <div key={location.id} className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-bold text-amber-900">{location.name}</h4>
                              <div className="flex items-center space-x-1">
                                {getLocationIcon(location.type)}
                                <span className="text-sm text-amber-600 capitalize">{location.type}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-amber-700 mb-2">{location.description}</p>
                          {location.inhabitants && (
                            <p className="text-xs text-amber-600">👥 {location.inhabitants}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'sessions' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-amber-900">Sesiones de la Campaña</h3>
                    <button
                      onClick={() => setShowSessionModal(true)}
                      className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus size={16} />
                      <span>Agregar Sesión</span>
                    </button>
                  </div>

                  {campaignSessions.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                      <p className="text-amber-600">No hay sesiones registradas</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {campaignSessions.sort((a, b) => b.sessionNumber - a.sessionNumber).map(session => (
                        <div key={session.id} className="bg-white rounded-lg p-4 border border-amber-200 shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-bold text-amber-900">
                                Sesión {session.sessionNumber}: {session.title}
                              </h4>
                              <p className="text-sm text-amber-600">
                                {new Date(session.date).toLocaleDateString()} • {session.duration} horas
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-amber-700 mb-2">{session.summary}</p>
                          {session.events && (
                            <div className="text-xs text-amber-600 bg-amber-50 rounded p-2">
                              <strong>Eventos:</strong>
                              <pre className="whitespace-pre-wrap mt-1">{session.events}</pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-200 text-center">
              <BookOpen className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-amber-900 mb-2">Selecciona una Campaña</h2>
              <p className="text-amber-700">Elige una campaña de la lista para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-amber-900">Nueva Campaña</h2>
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
                  onChange={(e) =>
                    setNewCampaign(prev => ({ ...prev, name: e.target.value }))
                  }
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
                  onChange={(e) =>
                    setNewCampaign(prev => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-20"
                  placeholder="Descripción de la campaña..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Nivel Inicial
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newCampaign.level}
                    onChange={(e) =>
                      setNewCampaign(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))
                    }
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Jugadores Máx.
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={newCampaign.maxPlayers}
                    onChange={(e) =>
                      setNewCampaign(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) || 4 }))
                    }
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
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
                  onClick={handleCreateCampaign}
                  disabled={!newCampaign.name.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Crear Campaña
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create NPC Modal */}
      {showNPCModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-amber-900">Nuevo NPC</h2>
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
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                  Descripción
                </label>
                <textarea
                  value={newNPC.description}
                  onChange={(e) => setNewNPC(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-20"
                  placeholder="Descripción del NPC..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowNPCModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateNPC}
                  disabled={!newNPC.name.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Crear NPC
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-amber-900">Nueva Ubicación</h2>
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
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-20"
                  placeholder="Descripción de la ubicación..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateLocation}
                  disabled={!newLocation.name.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Crear Ubicación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-amber-900">Nueva Sesión</h2>
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
                    Duración (horas)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="12"
                    step="0.5"
                    value={newSession.duration}
                    onChange={(e) => setNewSession(prev => ({ ...prev, duration: parseFloat(e.target.value) || 4 }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-20"
                  placeholder="Resumen de lo que pasó en la sesión..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSessionModal(false)}
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
    </div>
  );
}

export default CampaignManager;