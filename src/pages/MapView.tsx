import React, { useState, useEffect, useRef } from 'react';
import { 
  Map, Compass, Plus, Minus, RotateCcw, Move, MapPin, Eye, EyeOff,
  Ruler, Zap, Search, Settings, Save, Upload, Download, Trash2,
  X, Edit, Target, Users, Sword, Home, TreePine, Mountain, Waves
} from 'lucide-react';
import { saveData, loadData, generateId } from '../services/db';

interface MapMarker {
  id: string;
  x: number;
  y: number;
  type: 'location' | 'character' | 'enemy' | 'treasure' | 'trap' | 'poi';
  name: string;
  description: string;
  icon: string;
  color: string;
  visible: boolean;
  size: number;
}

interface MapData {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  width: number;
  height: number;
  scale: number; // pixels per foot
  markers: MapMarker[];
  gridSize: number;
  showGrid: boolean;
  createdAt: number;
  updatedAt: number;
}

interface ViewState {
  x: number;
  y: number;
  zoom: number;
}

const MARKER_TYPES = [
  { type: 'location', icon: Home, color: 'bg-blue-500', label: 'Ubicación' },
  { type: 'character', icon: Users, color: 'bg-green-500', label: 'Personaje' },
  { type: 'enemy', icon: Sword, color: 'bg-red-500', label: 'Enemigo' },
  { type: 'treasure', icon: Zap, color: 'bg-yellow-500', label: 'Tesoro' },
  { type: 'trap', icon: Target, color: 'bg-orange-500', label: 'Trampa' },
  { type: 'poi', icon: MapPin, color: 'bg-purple-500', label: 'Punto de Interés' }
];

const EXAMPLE_MAPS: Omit<MapData, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: "Taberna del Dragón Dorado",
    description: "Una acogedora taberna en el centro de la ciudad, conocida por sus aventureros y sus secretos.",
    imageUrl: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg",
    width: 800,
    height: 600,
    scale: 5,
    gridSize: 25,
    showGrid: true,
    markers: [
      {
        id: '1',
        x: 200,
        y: 150,
        type: 'character',
        name: 'Posadero Gareth',
        description: 'Un hombre robusto que conoce todos los rumores de la ciudad.',
        icon: 'Users',
        color: 'bg-green-500',
        visible: true,
        size: 20
      },
      {
        id: '2',
        x: 400,
        y: 300,
        type: 'poi',
        name: 'Mesa de los Aventureros',
        description: 'Donde se reúnen los grupos para planear sus próximas aventuras.',
        icon: 'MapPin',
        color: 'bg-purple-500',
        visible: true,
        size: 15
      },
      {
        id: '3',
        x: 600,
        y: 200,
        type: 'treasure',
        name: 'Cofre Secreto',
        description: 'Escondido detrás de la chimenea, contiene mapas antiguos.',
        icon: 'Zap',
        color: 'bg-yellow-500',
        visible: false,
        size: 12
      }
    ]
  },
  {
    name: "Bosque Sombrio",
    description: "Un denso bosque lleno de peligros y misterios antiguos.",
    imageUrl: "https://images.pexels.com/photos/1496373/pexels-photo-1496373.jpeg",
    width: 1200,
    height: 900,
    scale: 10,
    gridSize: 50,
    showGrid: false,
    markers: [
      {
        id: '4',
        x: 300,
        y: 200,
        type: 'location',
        name: 'Claro del Druida',
        description: 'Un círculo de piedras donde habita un druida ermitaño.',
        icon: 'Home',
        color: 'bg-blue-500',
        visible: true,
        size: 25
      },
      {
        id: '5',
        x: 800,
        y: 600,
        type: 'enemy',
        name: 'Guarida del Oso Búho',
        description: 'Una criatura mágica territorial que protege el bosque.',
        icon: 'Sword',
        color: 'bg-red-500',
        visible: true,
        size: 30
      },
      {
        id: '6',
        x: 600,
        y: 400,
        type: 'trap',
        name: 'Foso Oculto',
        description: 'Una trampa natural cubierta por ramas y hojas.',
        icon: 'Target',
        color: 'bg-orange-500',
        visible: false,
        size: 18
      }
    ]
  },
  {
    name: "Mazmorra del Rey Lich",
    description: "Las ruinas de un antiguo castillo, ahora hogar de un poderoso lich.",
    imageUrl: "https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg",
    width: 1000,
    height: 800,
    scale: 3,
    gridSize: 15,
    showGrid: true,
    markers: [
      {
        id: '7',
        x: 500,
        y: 400,
        type: 'enemy',
        name: 'Trono del Lich',
        description: 'El Rey Lich Malachar espera en su trono de huesos.',
        icon: 'Sword',
        color: 'bg-red-500',
        visible: true,
        size: 35
      },
      {
        id: '8',
        x: 200,
        y: 200,
        type: 'treasure',
        name: 'Cámara del Tesoro',
        description: 'Montones de oro y artefactos mágicos custodiados por esqueletos.',
        icon: 'Zap',
        color: 'bg-yellow-500',
        visible: true,
        size: 20
      },
      {
        id: '9',
        x: 800,
        y: 600,
        type: 'trap',
        name: 'Sala de las Cuchillas',
        description: 'Cuchillas giratorias activadas por presión.',
        icon: 'Target',
        color: 'bg-orange-500',
        visible: false,
        size: 15
      }
    ]
  }
];

function MapView() {
  const [maps, setMaps] = useState<MapData[]>([]);
  const [currentMap, setCurrentMap] = useState<MapData | null>(null);
  const [viewState, setViewState] = useState<ViewState>({ x: 0, y: 0, zoom: 1 });
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [showMarkerModal, setShowMarkerModal] = useState(false);
  const [showCreateMapModal, setShowCreateMapModal] = useState(false);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [showOnlyVisible, setShowOnlyVisible] = useState(true);
  const [measureMode, setMeasureMode] = useState(false);
  const [measureStart, setMeasureStart] = useState<{x: number, y: number} | null>(null);
  const [measureEnd, setMeasureEnd] = useState<{x: number, y: number} | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const [newMarker, setNewMarker] = useState<Partial<MapMarker>>({
    type: 'poi',
    name: '',
    description: '',
    color: 'bg-purple-500',
    visible: true,
    size: 15
  });

  const [newMap, setNewMap] = useState({
    name: '',
    description: '',
    imageUrl: '',
    width: 800,
    height: 600,
    scale: 5,
    gridSize: 25
  });

  useEffect(() => {
    loadMapsData();
  }, []);

  const loadMapsData = async () => {
    try {
      const savedMaps = await loadData<MapData[]>('maps');
      if (savedMaps && savedMaps.length > 0) {
        setMaps(savedMaps);
        setCurrentMap(savedMaps[0]);
      } else {
        // Create example maps if none exist
        const exampleMaps = EXAMPLE_MAPS.map(map => ({
          ...map,
          id: generateId(),
          createdAt: Date.now(),
          updatedAt: Date.now()
        }));
        setMaps(exampleMaps);
        setCurrentMap(exampleMaps[0]);
        await saveData('maps', exampleMaps);
      }
    } catch (error) {
      console.error('Error loading maps:', error);
    }
  };

  const saveMaps = async (updatedMaps: MapData[]) => {
    try {
      await saveData('maps', updatedMaps);
      setMaps(updatedMaps);
    } catch (error) {
      console.error('Error saving maps:', error);
    }
  };

  const createMap = async () => {
    if (!newMap.name.trim()) return;

    const map: MapData = {
      id: generateId(),
      ...newMap,
      markers: [],
      showGrid: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updatedMaps = [...maps, map];
    await saveMaps(updatedMaps);
    setCurrentMap(map);
    setNewMap({
      name: '',
      description: '',
      imageUrl: '',
      width: 800,
      height: 600,
      scale: 5,
      gridSize: 25
    });
    setShowCreateMapModal(false);
  };

  const updateCurrentMap = async (updatedMap: MapData) => {
    const updatedMaps = maps.map(m => m.id === updatedMap.id ? updatedMap : m);
    await saveMaps(updatedMaps);
    setCurrentMap(updatedMap);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (!currentMap || measureMode) return;

    const rect = mapContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - viewState.x) / viewState.zoom;
    const y = (e.clientY - rect.top - viewState.y) / viewState.zoom;

    if (isAddingMarker) {
      setNewMarker(prev => ({ ...prev, x, y }));
      setShowMarkerModal(true);
      setIsAddingMarker(false);
    }
  };

  const handleMeasureClick = (e: React.MouseEvent) => {
    if (!measureMode || !currentMap) return;

    const rect = mapContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - viewState.x) / viewState.zoom;
    const y = (e.clientY - rect.top - viewState.y) / viewState.zoom;

    if (!measureStart) {
      setMeasureStart({ x, y });
    } else {
      setMeasureEnd({ x, y });
    }
  };

  const addMarker = () => {
    if (!currentMap || !newMarker.name?.trim()) return;

    const marker: MapMarker = {
      id: generateId(),
      x: newMarker.x || 0,
      y: newMarker.y || 0,
      type: newMarker.type || 'poi',
      name: newMarker.name,
      description: newMarker.description || '',
      icon: newMarker.type || 'MapPin',
      color: newMarker.color || 'bg-purple-500',
      visible: newMarker.visible !== false,
      size: newMarker.size || 15
    };

    const updatedMap = {
      ...currentMap,
      markers: [...currentMap.markers, marker],
      updatedAt: Date.now()
    };

    updateCurrentMap(updatedMap);
    setNewMarker({
      type: 'poi',
      name: '',
      description: '',
      color: 'bg-purple-500',
      visible: true,
      size: 15
    });
    setShowMarkerModal(false);
  };

  const toggleMarkerVisibility = (markerId: string) => {
    if (!currentMap) return;

    const updatedMap = {
      ...currentMap,
      markers: currentMap.markers.map(m => 
        m.id === markerId ? { ...m, visible: !m.visible } : m
      ),
      updatedAt: Date.now()
    };

    updateCurrentMap(updatedMap);
  };

  const deleteMarker = (markerId: string) => {
    if (!currentMap) return;

    const updatedMap = {
      ...currentMap,
      markers: currentMap.markers.filter(m => m.id !== markerId),
      updatedAt: Date.now()
    };

    updateCurrentMap(updatedMap);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAddingMarker || measureMode) return;
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;

    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;

    setViewState(prev => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setViewState(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(5, prev.zoom * zoomFactor))
    }));
  };

  const resetView = () => {
    setViewState({ x: 0, y: 0, zoom: 1 });
  };

  const calculateDistance = () => {
    if (!measureStart || !measureEnd || !currentMap) return 0;
    
    const dx = measureEnd.x - measureStart.x;
    const dy = measureEnd.y - measureStart.y;
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);
    return Math.round(pixelDistance / currentMap.scale);
  };

  const clearMeasurement = () => {
    setMeasureStart(null);
    setMeasureEnd(null);
    setMeasureMode(false);
  };

  const getMarkerIcon = (type: string) => {
    const markerType = MARKER_TYPES.find(t => t.type === type);
    return markerType?.icon || MapPin;
  };

  const filteredMarkers = currentMap?.markers.filter(marker => 
    showOnlyVisible ? marker.visible : true
  ) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Map className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-amber-900">Sistema de Mapas</h1>
              <p className="text-amber-700">Explora mundos fantásticos con mapas interactivos</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateMapModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              <Plus size={18} />
              <span>Nuevo Mapa</span>
            </button>
          </div>
        </div>

        {/* Map Selection */}
        <div className="flex items-center space-x-4">
          <select
            value={currentMap?.id || ''}
            onChange={(e) => {
              const map = maps.find(m => m.id === e.target.value);
              setCurrentMap(map || null);
              resetView();
            }}
            className="flex-1 p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Seleccionar mapa...</option>
            {maps.map(map => (
              <option key={map.id} value={map.id}>
                {map.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentMap && (
        <>
          {/* Map Controls */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-amber-900">{currentMap.name}</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsAddingMarker(!isAddingMarker)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isAddingMarker 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <MapPin size={18} />
                  <span>{isAddingMarker ? 'Cancelar' : 'Agregar Marcador'}</span>
                </button>

                <button
                  onClick={() => setMeasureMode(!measureMode)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    measureMode 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  <Ruler size={18} />
                  <span>{measureMode ? 'Cancelar' : 'Medir'}</span>
                </button>

                <button
                  onClick={() => setShowOnlyVisible(!showOnlyVisible)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    showOnlyVisible 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {showOnlyVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                  <span>{showOnlyVisible ? 'Solo Visibles' : 'Todos'}</span>
                </button>

                <button
                  onClick={resetView}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <RotateCcw size={18} />
                  <span>Centrar</span>
                </button>
              </div>
            </div>

            <p className="text-amber-700 mb-4">{currentMap.description}</p>

            {/* Zoom and Measurement Info */}
            <div className="flex items-center justify-between text-sm text-amber-600">
              <div className="flex items-center space-x-4">
                <span>Zoom: {Math.round(viewState.zoom * 100)}%</span>
                <span>Escala: {currentMap.scale} px/pie</span>
                <span>Marcadores: {filteredMarkers.length}/{currentMap.markers.length}</span>
              </div>
              
              {measureStart && measureEnd && (
                <div className="flex items-center space-x-2">
                  <span className="font-bold">Distancia: {calculateDistance()} pies</span>
                  <button
                    onClick={clearMeasurement}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Map Container */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 overflow-hidden">
            <div
              ref={mapContainerRef}
              className="relative w-full h-96 lg:h-[600px] overflow-hidden cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              onClick={measureMode ? handleMeasureClick : handleMapClick}
              style={{ cursor: isAddingMarker ? 'crosshair' : measureMode ? 'crosshair' : 'move' }}
            >
              {/* Map Image */}
              <div
                className="absolute"
                style={{
                  transform: `translate(${viewState.x}px, ${viewState.y}px) scale(${viewState.zoom})`,
                  transformOrigin: '0 0'
                }}
              >
                <img
                  src={currentMap.imageUrl}
                  alt={currentMap.name}
                  className="block"
                  style={{
                    width: currentMap.width,
                    height: currentMap.height
                  }}
                  draggable={false}
                />

                {/* Grid Overlay */}
                {currentMap.showGrid && (
                  <svg
                    className="absolute top-0 left-0 pointer-events-none"
                    width={currentMap.width}
                    height={currentMap.height}
                  >
                    <defs>
                      <pattern
                        id="grid"
                        width={currentMap.gridSize}
                        height={currentMap.gridSize}
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d={`M ${currentMap.gridSize} 0 L 0 0 0 ${currentMap.gridSize}`}
                          fill="none"
                          stroke="rgba(0,0,0,0.2)"
                          strokeWidth="1"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                )}

                {/* Markers */}
                {filteredMarkers.map(marker => {
                  const IconComponent = getMarkerIcon(marker.type);
                  return (
                    <div
                      key={marker.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                      style={{
                        left: marker.x,
                        top: marker.y
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMarker(marker);
                      }}
                    >
                      <div
                        className={`${marker.color} rounded-full p-2 shadow-lg border-2 border-white group-hover:scale-110 transition-transform`}
                        style={{
                          width: marker.size + 8,
                          height: marker.size + 8
                        }}
                      >
                        <IconComponent 
                          className="text-white" 
                          size={marker.size} 
                        />
                      </div>
                      
                      {/* Marker Label */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {marker.name}
                      </div>
                    </div>
                  );
                })}

                {/* Measurement Line */}
                {measureStart && measureEnd && (
                  <svg
                    className="absolute top-0 left-0 pointer-events-none"
                    width={currentMap.width}
                    height={currentMap.height}
                  >
                    <line
                      x1={measureStart.x}
                      y1={measureStart.y}
                      x2={measureEnd.x}
                      y2={measureEnd.y}
                      stroke="red"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                    />
                    <circle
                      cx={measureStart.x}
                      cy={measureStart.y}
                      r="5"
                      fill="red"
                    />
                    <circle
                      cx={measureEnd.x}
                      cy={measureEnd.y}
                      r="5"
                      fill="red"
                    />
                  </svg>
                )}

                {/* Measurement Start Point */}
                {measureMode && measureStart && !measureEnd && (
                  <div
                    className="absolute w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{
                      left: measureStart.x,
                      top: measureStart.y
                    }}
                  />
                )}
              </div>

              {/* Instructions Overlay */}
              {(isAddingMarker || measureMode) && (
                <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
                  {isAddingMarker && "Haz clic en el mapa para agregar un marcador"}
                  {measureMode && !measureStart && "Haz clic para establecer el punto inicial"}
                  {measureMode && measureStart && !measureEnd && "Haz clic para establecer el punto final"}
                </div>
              )}
            </div>
          </div>

          {/* Markers List */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
            <h3 className="text-xl font-bold text-amber-900 mb-4">Marcadores</h3>
            
            {currentMap.markers.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <p className="text-amber-600">No hay marcadores en este mapa</p>
                <button
                  onClick={() => setIsAddingMarker(true)}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Agregar Primer Marcador
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentMap.markers.map(marker => {
                  const IconComponent = getMarkerIcon(marker.type);
                  const markerType = MARKER_TYPES.find(t => t.type === marker.type);
                  
                  return (
                    <div
                      key={marker.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        marker.visible 
                          ? 'border-amber-200 bg-white' 
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className={`${marker.color} rounded-full p-1`}>
                            <IconComponent className="text-white" size={16} />
                          </div>
                          <span className="font-bold text-amber-900">{marker.name}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => toggleMarkerVisibility(marker.id)}
                            className="p-1 text-amber-600 hover:bg-amber-100 rounded"
                          >
                            {marker.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <button
                            onClick={() => deleteMarker(marker.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-amber-700 mb-2">{markerType?.label}</p>
                      {marker.description && (
                        <p className="text-sm text-amber-600">{marker.description}</p>
                      )}
                      
                      <div className="text-xs text-amber-500 mt-2">
                        Posición: ({Math.round(marker.x)}, {Math.round(marker.y)})
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Create Map Modal */}
      {showCreateMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-amber-900">Nuevo Mapa</h2>
              <button
                onClick={() => setShowCreateMapModal(false)}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Nombre del Mapa *
                </label>
                <input
                  type="text"
                  value={newMap.name}
                  onChange={(e) => setNewMap(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ej: Castillo del Dragón"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newMap.description}
                  onChange={(e) => setNewMap(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-20"
                  placeholder="Descripción del mapa..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  URL de la Imagen *
                </label>
                <input
                  type="url"
                  value={newMap.imageUrl}
                  onChange={(e) => setNewMap(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Ancho (px)
                  </label>
                  <input
                    type="number"
                    value={newMap.width}
                    onChange={(e) => setNewMap(prev => ({ ...prev, width: parseInt(e.target.value) || 800 }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Alto (px)
                  </label>
                  <input
                    type="number"
                    value={newMap.height}
                    onChange={(e) => setNewMap(prev => ({ ...prev, height: parseInt(e.target.value) || 600 }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Escala (px/pie)
                  </label>
                  <input
                    type="number"
                    value={newMap.scale}
                    onChange={(e) => setNewMap(prev => ({ ...prev, scale: parseInt(e.target.value) || 5 }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Tamaño de Cuadrícula (px)
                  </label>
                  <input
                    type="number"
                    value={newMap.gridSize}
                    onChange={(e) => setNewMap(prev => ({ ...prev, gridSize: parseInt(e.target.value) || 25 }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateMapModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={createMap}
                  disabled={!newMap.name.trim() || !newMap.imageUrl.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Crear Mapa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Marker Modal */}
      {showMarkerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-amber-900">Nuevo Marcador</h2>
              <button
                onClick={() => setShowMarkerModal(false)}
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
                  value={newMarker.name || ''}
                  onChange={(e) => setNewMarker(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Nombre del marcador"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Tipo
                </label>
                <select
                  value={newMarker.type}
                  onChange={(e) => {
                    const selectedType = MARKER_TYPES.find(t => t.type === e.target.value);
                    setNewMarker(prev => ({ 
                      ...prev, 
                      type: e.target.value as any,
                      color: selectedType?.color || 'bg-purple-500'
                    }));
                  }}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  {MARKER_TYPES.map(type => (
                    <option key={type.type} value={type.type}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newMarker.description || ''}
                  onChange={(e) => setNewMarker(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-20"
                  placeholder="Descripción del marcador..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Tamaño
                  </label>
                  <input
                    type="number"
                    min="8"
                    max="40"
                    value={newMarker.size}
                    onChange={(e) => setNewMarker(prev => ({ ...prev, size: parseInt(e.target.value) || 15 }))}
                    className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newMarker.visible !== false}
                      onChange={(e) => setNewMarker(prev => ({ ...prev, visible: e.target.checked }))}
                      className="text-amber-600"
                    />
                    <span className="text-sm font-medium text-amber-900">Visible para jugadores</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMarkerModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addMarker}
                  disabled={!newMarker.name?.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Marker Details Modal */}
      {selectedMarker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`${selectedMarker.color} rounded-full p-2`}>
                  {React.createElement(getMarkerIcon(selectedMarker.type), {
                    className: "text-white",
                    size: 20
                  })}
                </div>
                <h2 className="text-2xl font-bold text-amber-900">{selectedMarker.name}</h2>
              </div>
              <button
                onClick={() => setSelectedMarker(null)}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-amber-700">Tipo:</span>
                <p className="text-amber-900">
                  {MARKER_TYPES.find(t => t.type === selectedMarker.type)?.label}
                </p>
              </div>

              {selectedMarker.description && (
                <div>
                  <span className="text-sm font-medium text-amber-700">Descripción:</span>
                  <p className="text-amber-900">{selectedMarker.description}</p>
                </div>
              )}

              <div>
                <span className="text-sm font-medium text-amber-700">Posición:</span>
                <p className="text-amber-900">
                  X: {Math.round(selectedMarker.x)}, Y: {Math.round(selectedMarker.y)}
                </p>
              </div>

              <div>
                <span className="text-sm font-medium text-amber-700">Estado:</span>
                <p className="text-amber-900">
                  {selectedMarker.visible ? 'Visible para jugadores' : 'Oculto para jugadores'}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => toggleMarkerVisibility(selectedMarker.id)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {selectedMarker.visible ? <EyeOff size={18} /> : <Eye size={18} />}
                  <span>{selectedMarker.visible ? 'Ocultar' : 'Mostrar'}</span>
                </button>
                <button
                  onClick={() => {
                    deleteMarker(selectedMarker.id);
                    setSelectedMarker(null);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={18} />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;