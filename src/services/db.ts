import localforage from 'localforage';
import { Character, Campaign, DiceRoll, GameSession, NPC, Location, CampaignSession, CombatEncounter, MapData, Shop, Transaction, NPCTemplate } from '../types';

// Configure localforage
localforage.config({
  name: 'DnDBluetoothApp',
  version: 1.0,
  size: 4980736,
  storeName: 'dnd_data',
  description: 'D&D Bluetooth App Local Storage'
});

// Generic data storage functions
export const saveData = async <T>(key: string, data: T): Promise<void> => {
  try {
    await localforage.setItem(key, data);
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    throw error;
  }
};

export const loadData = async <T>(key: string): Promise<T | null> => {
  try {
    return await localforage.getItem<T>(key);
  } catch (error) {
    console.error(`Error loading data for key ${key}:`, error);
    throw error;
  }
};

export const removeData = async (key: string): Promise<void> => {
  try {
    await localforage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    throw error;
  }
};

// Character functions
export const saveCharacter = async (character: Character): Promise<void> => {
  const characters = await loadCharacters();
  const existingIndex = characters.findIndex(c => c.id === character.id);
  
  if (existingIndex >= 0) {
    characters[existingIndex] = { ...character, updatedAt: Date.now() };
  } else {
    characters.push({ ...character, createdAt: Date.now(), updatedAt: Date.now() });
  }
  
  await saveData('characters', characters);
};

export const loadCharacters = async (): Promise<Character[]> => {
  const characters = (await loadData<Character[]>('characters')) || [];
  
  // Ensure all characters have a currency property
  return characters.map(character => {
    if (!character.currency) {
      character.currency = {
        copper: 0,
        silver: 0,
        electrum: 0,
        gold: 0,
        platinum: 0
      };
    }
    return character;
  });
};

export const loadCharacter = async (id: string): Promise<Character | null> => {
  const characters = await loadCharacters();
  return characters.find(c => c.id === id) || null;
};

export const deleteCharacter = async (id: string): Promise<void> => {
  const characters = await loadCharacters();
  const filteredCharacters = characters.filter(c => c.id !== id);
  await saveData('characters', filteredCharacters);
};

// Campaign functions
export const saveCampaign = async (campaign: Campaign): Promise<void> => {
  const campaigns = await loadCampaigns();
  const existingIndex = campaigns.findIndex(c => c.id === campaign.id);
  
  if (existingIndex >= 0) {
    campaigns[existingIndex] = { ...campaign, updatedAt: Date.now() };
  } else {
    campaigns.push({ ...campaign, createdAt: Date.now(), updatedAt: Date.now() });
  }
  
  await saveData('campaigns', campaigns);
};

export const loadCampaigns = async (): Promise<Campaign[]> => {
  return (await loadData<Campaign[]>('campaigns')) || [];
};

export const loadCampaign = async (id: string): Promise<Campaign | null> => {
  const campaigns = await loadCampaigns();
  return campaigns.find(c => c.id === id) || null;
};

export const deleteCampaign = async (id: string): Promise<void> => {
  const campaigns = await loadCampaigns();
  const filteredCampaigns = campaigns.filter(c => c.id !== id);
  await saveData('campaigns', filteredCampaigns);
  
  // Also delete related NPCs, locations, and sessions
  const npcs = await loadNPCs();
  const filteredNPCs = npcs.filter(n => n.campaignId !== id);
  await saveData('npcs', filteredNPCs);
  
  const locations = await loadLocations();
  const filteredLocations = locations.filter(l => l.campaignId !== id);
  await saveData('locations', filteredLocations);
  
  const sessions = await loadCampaignSessions();
  const filteredSessions = sessions.filter(s => s.campaignId !== id);
  await saveData('campaignSessions', filteredSessions);
};

// NPC functions
export const saveNPC = async (npc: NPC): Promise<void> => {
  const npcs = await loadNPCs();
  const existingIndex = npcs.findIndex(n => n.id === npc.id);
  
  if (existingIndex >= 0) {
    npcs[existingIndex] = { ...npc, updatedAt: Date.now() };
  } else {
    npcs.push({ ...npc, createdAt: Date.now(), updatedAt: Date.now() });
  }
  
  await saveData('npcs', npcs);
};

export const loadNPCs = async (): Promise<NPC[]> => {
  return (await loadData<NPC[]>('npcs')) || [];
};

export const deleteNPC = async (id: string): Promise<void> => {
  const npcs = await loadNPCs();
  const filteredNPCs = npcs.filter(n => n.id !== id);
  await saveData('npcs', filteredNPCs);
};

// NPCTemplate functions
export const saveNPCTemplate = async (template: NPCTemplate): Promise<void> => {
  const templates = await loadNPCTemplates();
  const existingIndex = templates.findIndex(t => t.id === template.id);
  
  if (existingIndex >= 0) {
    templates[existingIndex] = { ...template, updatedAt: Date.now() };
  } else {
    templates.push({ ...template, createdAt: Date.now(), updatedAt: Date.now() });
  }
  
  await saveData('npcTemplates', templates);
};

export const loadNPCTemplates = async (): Promise<NPCTemplate[]> => {
  const templates = await loadData<NPCTemplate[]>('npcTemplates');
  if (!templates || templates.length === 0) {
    // Create default NPC templates
    const defaultTemplates = await createDefaultNPCTemplates();
    await saveData('npcTemplates', defaultTemplates);
    return defaultTemplates;
  }
  return templates;
};

export const deleteNPCTemplate = async (id: string): Promise<void> => {
  const templates = await loadNPCTemplates();
  const filteredTemplates = templates.filter(t => t.id !== id);
  await saveData('npcTemplates', filteredTemplates);
};

const createDefaultNPCTemplates = async (): Promise<NPCTemplate[]> => {
  return [
    {
      id: generateId(),
      name: "Guardia de la Ciudad",
      type: 'humanoid',
      challengeRating: "1/8",
      hitPoints: { current: 11, maximum: 11, temporary: 0 },
      armorClass: 16,
      abilities: ["Ataque con Lanza", "Escudo"],
      description: "Un guardia entrenado que protege la ciudad",
      size: 'medium',
      alignment: "Legal Neutral",
      speed: "30 pies",
      stats: { strength: 13, dexterity: 12, constitution: 12, intelligence: 10, wisdom: 11, charisma: 10 },
      skills: ["Percepción"],
      damageResistances: [],
      damageImmunities: [],
      conditionImmunities: [],
      senses: ["Percepción pasiva 10"],
      languages: ["Común"],
      isCustom: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: generateId(),
      name: "Bandido",
      type: 'humanoid',
      challengeRating: "1/8",
      hitPoints: { current: 11, maximum: 11, temporary: 0 },
      armorClass: 12,
      abilities: ["Ataque con Cimitarra", "Ballesta Ligera"],
      description: "Un criminal que asalta a los viajeros",
      size: 'medium',
      alignment: "Caótico Neutral",
      speed: "30 pies",
      stats: { strength: 11, dexterity: 12, constitution: 12, intelligence: 10, wisdom: 10, charisma: 10 },
      skills: ["Sigilo"],
      damageResistances: [],
      damageImmunities: [],
      conditionImmunities: [],
      senses: ["Percepción pasiva 10"],
      languages: ["Común"],
      isCustom: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: generateId(),
      name: "Lobo",
      type: 'beast',
      challengeRating: "1/4",
      hitPoints: { current: 11, maximum: 11, temporary: 0 },
      armorClass: 13,
      abilities: ["Mordisco", "Olfato Agudo", "Táctica de Manada"],
      description: "Un depredador salvaje que caza en manadas",
      size: 'medium',
      alignment: "Sin Alineamiento",
      speed: "40 pies",
      stats: { strength: 12, dexterity: 15, constitution: 12, intelligence: 3, wisdom: 12, charisma: 6 },
      skills: ["Percepción", "Sigilo"],
      damageResistances: [],
      damageImmunities: [],
      conditionImmunities: [],
      senses: ["Percepción pasiva 13"],
      languages: [],
      isCustom: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: generateId(),
      name: "Esqueleto",
      type: 'undead',
      challengeRating: "1/4",
      hitPoints: { current: 13, maximum: 13, temporary: 0 },
      armorClass: 13,
      abilities: ["Espada Corta", "Arco Corto", "Inmunidad a Veneno"],
      description: "Los restos animados de un guerrero muerto",
      size: 'medium',
      alignment: "Legal Malvado",
      speed: "30 pies",
      stats: { strength: 10, dexterity: 14, constitution: 15, intelligence: 6, wisdom: 8, charisma: 5 },
      skills: [],
      damageResistances: [],
      damageImmunities: ["Veneno"],
      conditionImmunities: ["Envenenado", "Exhausto"],
      senses: ["Visión en la Oscuridad 60 pies", "Percepción pasiva 9"],
      languages: ["Entiende los idiomas que conocía en vida"],
      isCustom: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: generateId(),
      name: "Trasgo",
      type: 'humanoid',
      challengeRating: "1/4",
      hitPoints: { current: 7, maximum: 7, temporary: 0 },
      armorClass: 15,
      abilities: ["Cimitarra", "Arco Corto", "Huida Ágil"],
      description: "Una criatura pequeña y maliciosa",
      size: 'small',
      alignment: "Neutral Malvado",
      speed: "30 pies",
      stats: { strength: 8, dexterity: 14, constitution: 10, intelligence: 10, wisdom: 8, charisma: 8 },
      skills: ["Sigilo"],
      damageResistances: [],
      damageImmunities: [],
      conditionImmunities: [],
      senses: ["Visión en la Oscuridad 60 pies", "Percepción pasiva 9"],
      languages: ["Común", "Trasgo"],
      isCustom: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ];
};

// Location functions
export const saveLocation = async (location: Location): Promise<void> => {
  const locations = await loadLocations();
  const existingIndex = locations.findIndex(l => l.id === location.id);
  
  if (existingIndex >= 0) {
    locations[existingIndex] = { ...location, updatedAt: Date.now() };
  } else {
    locations.push({ ...location, createdAt: Date.now(), updatedAt: Date.now() });
  }
  
  await saveData('locations', locations);
};

export const loadLocations = async (): Promise<Location[]> => {
  return (await loadData<Location[]>('locations')) || [];
};

export const deleteLocation = async (id: string): Promise<void> => {
  const locations = await loadLocations();
  const filteredLocations = locations.filter(l => l.id !== id);
  await saveData('locations', filteredLocations);
};

// Campaign Session functions
export const saveCampaignSession = async (session: CampaignSession): Promise<void> => {
  const sessions = await loadCampaignSessions();
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = { ...session, updatedAt: Date.now() };
  } else {
    sessions.push({ ...session, createdAt: Date.now(), updatedAt: Date.now() });
  }
  
  await saveData('campaignSessions', sessions);
};

export const loadCampaignSessions = async (): Promise<CampaignSession[]> => {
  return (await loadData<CampaignSession[]>('campaignSessions')) || [];
};

export const deleteCampaignSession = async (id: string): Promise<void> => {
  const sessions = await loadCampaignSessions();
  const filteredSessions = sessions.filter(s => s.id !== id);
  await saveData('campaignSessions', filteredSessions);
};

// Combat Encounter functions
export const saveCombatEncounter = async (encounter: CombatEncounter): Promise<void> => {
  const encounters = await loadCombatEncounters();
  const existingIndex = encounters.findIndex(e => e.id === encounter.id);
  
  if (existingIndex >= 0) {
    encounters[existingIndex] = { ...encounter, updatedAt: Date.now() };
  } else {
    encounters.push({ ...encounter, createdAt: Date.now(), updatedAt: Date.now() });
  }
  
  await saveData('combatEncounters', encounters);
};

export const loadCombatEncounters = async (): Promise<CombatEncounter[]> => {
  return (await loadData<CombatEncounter[]>('combatEncounters')) || [];
};

export const deleteCombatEncounter = async (id: string): Promise<void> => {
  const encounters = await loadCombatEncounters();
  const filteredEncounters = encounters.filter(e => e.id !== id);
  await saveData('combatEncounters', filteredEncounters);
};

// Map functions
export const saveMap = async (map: MapData): Promise<void> => {
  const maps = await loadMaps();
  const existingIndex = maps.findIndex(m => m.id === map.id);
  
  if (existingIndex >= 0) {
    maps[existingIndex] = { ...map, updatedAt: Date.now() };
  } else {
    maps.push({ ...map, createdAt: Date.now(), updatedAt: Date.now() });
  }
  
  await saveData('maps', maps);
};

export const loadMaps = async (): Promise<MapData[]> => {
  return (await loadData<MapData[]>('maps')) || [];
};

export const loadMap = async (id: string): Promise<MapData | null> => {
  const maps = await loadMaps();
  return maps.find(m => m.id === id) || null;
};

export const deleteMap = async (id: string): Promise<void> => {
  const maps = await loadMaps();
  const filteredMaps = maps.filter(m => m.id !== id);
  await saveData('maps', filteredMaps);
};

// Shop functions
export const saveShop = async (shop: Shop): Promise<void> => {
  const shops = await loadShops();
  const existingIndex = shops.findIndex(s => s.id === shop.id);
  
  if (existingIndex >= 0) {
    shops[existingIndex] = { ...shop, updatedAt: Date.now() };
  } else {
    shops.push({ ...shop, createdAt: Date.now(), updatedAt: Date.now() });
  }
  
  await saveData('shops', shops);
};

export const loadShops = async (): Promise<Shop[]> => {
  const shops = await loadData<Shop[]>('shops');
  if (!shops || shops.length === 0) {
    // Create default shops if none exist
    const defaultShops = await createDefaultShops();
    await saveData('shops', defaultShops);
    return defaultShops;
  }
  return shops;
};

export const loadShop = async (id: string): Promise<Shop | null> => {
  const shops = await loadShops();
  return shops.find(s => s.id === id) || null;
};

export const deleteShop = async (id: string): Promise<void> => {
  const shops = await loadShops();
  const filteredShops = shops.filter(s => s.id !== id);
  await saveData('shops', filteredShops);
};

const createDefaultShops = async (): Promise<Shop[]> => {
  return [
    {
      id: generateId(),
      name: "Armería del Dragón de Hierro",
      description: "La mejor selección de armas y armaduras forjadas por maestros herreros",
      type: 'weapon_shop',
      location: "Distrito del Mercado",
      keeper: "Thorek Martillo de Hierro",
      discountPercentage: 0,
      reputation: 95,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items: [
        {
          id: generateId(),
          name: "Espada Larga",
          description: "Una espada versátil de una mano con excelente balance",
          category: 'weapon',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 15, platinum: 0 },
          weight: 3,
          properties: ["Versátil (1d10)"],
          damage: "1d8 cortante",
          inStock: 5,
          tags: ["espada", "una mano", "versátil"]
        },
        {
          id: generateId(),
          name: "Espada Larga +1",
          description: "Una espada larga mágica con encantamiento de precisión",
          category: 'magic_item',
          rarity: 'uncommon',
          price: { copper: 0, silver: 0, electrum: 0, gold: 500, platinum: 0 },
          weight: 3,
          properties: ["Versátil (1d10)", "+1 ataque y daño"],
          damage: "1d8+1 cortante",
          inStock: 1,
          tags: ["espada", "mágica", "encantada"]
        },
        {
          id: generateId(),
          name: "Armadura de Cuero",
          description: "Armadura ligera hecha de cuero endurecido",
          category: 'armor',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 10, platinum: 0 },
          weight: 10,
          properties: ["Armadura ligera"],
          armorClass: 11,
          inStock: 8,
          tags: ["armadura", "ligera", "cuero"]
        },
        {
          id: generateId(),
          name: "Cota de Malla",
          description: "Armadura media hecha de anillos de metal entrelazados",
          category: 'armor',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 50, platinum: 0 },
          weight: 20,
          properties: ["Armadura media"],
          armorClass: 13,
          inStock: 3,
          tags: ["armadura", "media", "metal"]
        },
        {
          id: generateId(),
          name: "Armadura de Placas",
          description: "La mejor protección disponible, hecha de placas de acero",
          category: 'armor',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 1500, platinum: 0 },
          weight: 65,
          properties: ["Armadura pesada"],
          armorClass: 18,
          inStock: 1,
          tags: ["armadura", "pesada", "placas"]
        },
        {
          id: generateId(),
          name: "Escudo",
          description: "Un escudo de madera reforzado con metal",
          category: 'shield',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 10, platinum: 0 },
          weight: 6,
          properties: ["+2 CA"],
          inStock: 6,
          tags: ["escudo", "defensa"]
        },
        {
          id: generateId(),
          name: "Arco Largo",
          description: "Un arco de guerra de largo alcance",
          category: 'weapon',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 50, platinum: 0 },
          weight: 2,
          properties: ["Munición", "Pesada", "Dos manos"],
          damage: "1d8 perforante",
          inStock: 4,
          tags: ["arco", "distancia", "dos manos"]
        },
        {
          id: generateId(),
          name: "Flechas (20)",
          description: "Un carcaj con 20 flechas de calidad",
          category: 'ammunition',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 1, platinum: 0 },
          weight: 1,
          properties: ["Munición para arcos"],
          inStock: 20,
          tags: ["flechas", "munición"]
        }
      ]
    },
    {
      id: generateId(),
      name: "Pociones y Pergaminos de Elara",
      description: "Objetos mágicos, pociones curativas y pergaminos de hechizos",
      type: 'magic_shop',
      location: "Torre del Mago",
      keeper: "Elara la Sabia",
      discountPercentage: 5,
      reputation: 88,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items: [
        {
          id: generateId(),
          name: "Poción de Curación",
          description: "Restaura 2d4+2 puntos de vida al consumirla",
          category: 'consumable',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 50, platinum: 0 },
          weight: 0.5,
          properties: ["Cura 2d4+2 PV"],
          inStock: 12,
          tags: ["poción", "curación", "consumible"]
        },
        {
          id: generateId(),
          name: "Poción de Curación Superior",
          description: "Restaura 4d4+4 puntos de vida al consumirla",
          category: 'consumable',
          rarity: 'uncommon',
          price: { copper: 0, silver: 0, electrum: 0, gold: 200, platinum: 0 },
          weight: 0.5,
          properties: ["Cura 4d4+4 PV"],
          inStock: 5,
          tags: ["poción", "curación", "superior"]
        },
        {
          id: generateId(),
          name: "Varita de Misiles Mágicos",
          description: "Varita que puede lanzar el hechizo Misil Mágico",
          category: 'magic_item',
          rarity: 'uncommon',
          price: { copper: 0, silver: 0, electrum: 0, gold: 800, platinum: 0 },
          weight: 1,
          properties: ["7 cargas", "Misil Mágico (1 carga)"],
          inStock: 2,
          tags: ["varita", "mágica", "misiles"]
        },
        {
          id: generateId(),
          name: "Anillo de Protección",
          description: "Otorga +1 a CA y tiradas de salvación",
          category: 'magic_item',
          rarity: 'rare',
          price: { copper: 0, silver: 0, electrum: 0, gold: 2000, platinum: 0 },
          weight: 0,
          properties: ["+1 CA", "+1 tiradas de salvación"],
          inStock: 1,
          tags: ["anillo", "protección", "mágico"]
        },
        {
          id: generateId(),
          name: "Pergamino de Bola de Fuego",
          description: "Pergamino que contiene el hechizo Bola de Fuego",
          category: 'consumable',
          rarity: 'uncommon',
          price: { copper: 0, silver: 0, electrum: 0, gold: 150, platinum: 0 },
          weight: 0,
          properties: ["Bola de Fuego (3er nivel)"],
          inStock: 3,
          tags: ["pergamino", "hechizo", "fuego"]
        },
        {
          id: generateId(),
          name: "Poción de Fuerza de Gigante",
          description: "Otorga Fuerza 21 durante 1 hora",
          category: 'consumable',
          rarity: 'rare',
          price: { copper: 0, silver: 0, electrum: 0, gold: 400, platinum: 0 },
          weight: 0.5,
          properties: ["Fuerza 21 por 1 hora"],
          inStock: 2,
          tags: ["poción", "fuerza", "gigante"]
        }
      ]
    },
    {
      id: generateId(),
      name: "Suministros del Aventurero",
      description: "Todo lo que necesitas para tus aventuras: equipo, herramientas y suministros",
      type: 'general_store',
      location: "Plaza Central",
      keeper: "Marcus el Comerciante",
      discountPercentage: 10,
      reputation: 92,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items: [
        {
          id: generateId(),
          name: "Cuerda de Cáñamo (50 pies)",
          description: "Cuerda resistente para escalada y otros usos",
          category: 'adventuring_gear',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 2, platinum: 0 },
          weight: 10,
          properties: ["50 pies de longitud"],
          inStock: 15,
          tags: ["cuerda", "escalada", "utilidad"]
        },
        {
          id: generateId(),
          name: "Antorcha",
          description: "Proporciona luz brillante en un radio de 20 pies",
          category: 'adventuring_gear',
          rarity: 'common',
          price: { copper: 1, silver: 0, electrum: 0, gold: 0, platinum: 0 },
          weight: 1,
          properties: ["Luz 20 pies", "Dura 1 hora"],
          inStock: 50,
          tags: ["antorcha", "luz", "fuego"]
        },
        {
          id: generateId(),
          name: "Raciones de Viaje (1 día)",
          description: "Comida seca que se conserva bien durante los viajes",
          category: 'adventuring_gear',
          rarity: 'common',
          price: { copper: 0, silver: 2, electrum: 0, gold: 0, platinum: 0 },
          weight: 2,
          properties: ["Alimenta 1 día"],
          inStock: 30,
          tags: ["comida", "raciones", "viaje"]
        },
        {
          id: generateId(),
          name: "Mochila",
          description: "Mochila de cuero con múltiples compartimentos",
          category: 'adventuring_gear',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 2, platinum: 0 },
          weight: 5,
          properties: ["Capacidad 30 libras"],
          inStock: 8,
          tags: ["mochila", "almacenamiento", "equipo"]
        },
        {
          id: generateId(),
          name: "Kit de Herramientas de Ladrón",
          description: "Herramientas especializadas para abrir cerraduras",
          category: 'tool',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 25, platinum: 0 },
          weight: 1,
          properties: ["Competencia en Herramientas de Ladrón"],
          inStock: 3,
          tags: ["herramientas", "ladrón", "cerraduras"]
        },
        {
          id: generateId(),
          name: "Saco de Dormir",
          description: "Saco cómodo para dormir al aire libre",
          category: 'adventuring_gear',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 1, platinum: 0 },
          weight: 7,
          properties: ["Descanso cómodo"],
          inStock: 10,
          tags: ["saco", "dormir", "descanso"]
        },
        {
          id: generateId(),
          name: "Linterna Sorda",
          description: "Linterna que proyecta luz en un cono",
          category: 'adventuring_gear',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 5, platinum: 0 },
          weight: 2,
          properties: ["Luz 60 pies cono", "Requiere aceite"],
          inStock: 6,
          tags: ["linterna", "luz", "aceite"]
        }
      ]
    },
    {
      id: generateId(),
      name: "Herrería de Vulcano",
      description: "Forja especializada en herramientas, herrajes y trabajos de metal",
      type: 'blacksmith',
      location: "Distrito Industrial",
      keeper: "Vulcano el Herrero",
      discountPercentage: 0,
      reputation: 96,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items: [
        {
          id: generateId(),
          name: "Martillo de Guerra",
          description: "Martillo pesado diseñado para el combate",
          category: 'weapon',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 15, platinum: 0 },
          weight: 2,
          properties: ["Versátil (1d10)"],
          damage: "1d8 contundente",
          inStock: 4,
          tags: ["martillo", "guerra", "contundente"]
        },
        {
          id: generateId(),
          name: "Pico de Guerra",
          description: "Pico militar con punta reforzada",
          category: 'weapon',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 5, platinum: 0 },
          weight: 2,
          properties: ["Perforante"],
          damage: "1d8 perforante",
          inStock: 3,
          tags: ["pico", "guerra", "perforante"]
        },
        {
          id: generateId(),
          name: "Herramientas de Herrero",
          description: "Kit completo de herramientas para trabajar el metal",
          category: 'tool',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 20, platinum: 0 },
          weight: 8,
          properties: ["Competencia en Herramientas de Herrero"],
          inStock: 2,
          tags: ["herramientas", "herrero", "metal"]
        },
        {
          id: generateId(),
          name: "Clavos de Hierro (10)",
          description: "Clavos resistentes para construcción",
          category: 'adventuring_gear',
          rarity: 'common',
          price: { copper: 1, silver: 0, electrum: 0, gold: 0, platinum: 0 },
          weight: 0.5,
          properties: ["Para construcción"],
          inStock: 100,
          tags: ["clavos", "hierro", "construcción"]
        },
        {
          id: generateId(),
          name: "Cadena (10 pies)",
          description: "Cadena de hierro resistente",
          category: 'adventuring_gear',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 5, platinum: 0 },
          weight: 10,
          properties: ["CA 19", "10 PV"],
          inStock: 5,
          tags: ["cadena", "hierro", "resistente"]
        },
        {
          id: generateId(),
          name: "Grapnel",
          description: "Gancho de hierro para escalada",
          category: 'adventuring_gear',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 2, platinum: 0 },
          weight: 4,
          properties: ["Para escalada"],
          inStock: 6,
          tags: ["grapnel", "escalada", "gancho"]
        }
      ]
    },
    {
      id: generateId(),
      name: "Establos Reales de Pegaso",
      description: "Los mejores caballos, monturas exóticas y vehículos de transporte",
      type: 'market',
      location: "Afueras de la Ciudad",
      keeper: "Elena Domacaballos",
      discountPercentage: 0,
      reputation: 90,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      items: [
        {
          id: generateId(),
          name: "Caballo de Montar",
          description: "Caballo entrenado para montar, dócil y resistente",
          category: 'mount',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 75, platinum: 0 },
          weight: 0,
          properties: ["Velocidad 60 pies", "Capacidad 480 lb"],
          inStock: 8,
          tags: ["caballo", "montura", "transporte"]
        },
        {
          id: generateId(),
          name: "Caballo de Guerra",
          description: "Caballo entrenado para el combate, valiente y fuerte",
          category: 'mount',
          rarity: 'uncommon',
          price: { copper: 0, silver: 0, electrum: 0, gold: 400, platinum: 0 },
          weight: 0,
          properties: ["Velocidad 60 pies", "Entrenado para combate"],
          inStock: 3,
          tags: ["caballo", "guerra", "combate"]
        },
        {
          id: generateId(),
          name: "Poni",
          description: "Caballo pequeño, ideal para halflings y gnomos",
          category: 'mount',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 30, platinum: 0 },
          weight: 0,
          properties: ["Velocidad 40 pies", "Tamaño mediano"],
          inStock: 5,
          tags: ["poni", "pequeño", "montura"]
        },
        {
          id: generateId(),
          name: "Mula",
          description: "Animal de carga resistente y terco",
          category: 'mount',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 8, platinum: 0 },
          weight: 0,
          properties: ["Velocidad 40 pies", "Capacidad 420 lb"],
          inStock: 6,
          tags: ["mula", "carga", "resistente"]
        },
        {
          id: generateId(),
          name: "Carreta",
          description: "Vehículo de dos ruedas tirado por animales",
          category: 'vehicle',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 15, platinum: 0 },
          weight: 200,
          properties: ["Capacidad 200 lb", "Requiere animal de tiro"],
          inStock: 4,
          tags: ["carreta", "vehículo", "transporte"]
        },
        {
          id: generateId(),
          name: "Carruaje",
          description: "Vehículo elegante para pasajeros",
          category: 'vehicle',
          rarity: 'uncommon',
          price: { copper: 0, silver: 0, electrum: 0, gold: 100, platinum: 0 },
          weight: 600,
          properties: ["4 pasajeros", "Requiere 2 caballos"],
          inStock: 2,
          tags: ["carruaje", "elegante", "pasajeros"]
        },
        {
          id: generateId(),
          name: "Carro de Guerra",
          description: "Vehículo militar blindado",
          category: 'vehicle',
          rarity: 'rare',
          price: { copper: 0, silver: 0, electrum: 0, gold: 250, platinum: 0 },
          weight: 400,
          properties: ["Blindado", "Armas montadas"],
          inStock: 1,
          tags: ["carro", "guerra", "militar"]
        },
        {
          id: generateId(),
          name: "Silla de Montar",
          description: "Silla cómoda para montar",
          category: 'adventuring_gear',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 10, platinum: 0 },
          weight: 25,
          properties: ["Mejora control de montura"],
          inStock: 12,
          tags: ["silla", "montar", "equipo"]
        },
        {
          id: generateId(),
          name: "Alforjas",
          description: "Bolsas para transportar en monturas",
          category: 'adventuring_gear',
          rarity: 'common',
          price: { copper: 0, silver: 0, electrum: 0, gold: 4, platinum: 0 },
          weight: 8,
          properties: ["Capacidad 60 lb"],
          inStock: 10,
          tags: ["alforjas", "transporte", "almacenamiento"]
        }
      ]
    }
  ];
};

// Transaction functions
export const saveTransaction = async (transaction: Transaction): Promise<void> => {
  const transactions = await loadTransactions();
  transactions.unshift(transaction);
  
  // Keep only the last 1000 transactions
  if (transactions.length > 1000) {
    transactions.splice(1000);
  }
  
  await saveData('transactions', transactions);
};

export const loadTransactions = async (): Promise<Transaction[]> => {
  return (await loadData<Transaction[]>('transactions')) || [];
};

export const loadCharacterTransactions = async (characterId: string): Promise<Transaction[]> => {
  const transactions = await loadTransactions();
  return transactions.filter(t => t.characterId === characterId);
};

// Dice roll functions
export const rollDice = async (sides: number, count: number = 1, modifier: number = 0): Promise<DiceRoll> => {
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(Math.floor(Math.random() * sides) + 1);
  }
  
  const total = results.reduce((sum, result) => sum + result, 0) + modifier;
  
  const diceRoll: DiceRoll = {
    id: generateId(),
    diceType: `d${sides}`,
    results,
    modifier,
    total,
    timestamp: Date.now()
  };
  
  await saveDiceRoll(diceRoll);
  return diceRoll;
};

export const saveDiceRoll = async (roll: DiceRoll): Promise<void> => {
  const rolls = await loadDiceRolls();
  rolls.unshift(roll);
  
  if (rolls.length > 100) {
    rolls.splice(100);
  }
  
  await saveData('diceRolls', rolls);
};

export const loadDiceRolls = async (): Promise<DiceRoll[]> => {
  return (await loadData<DiceRoll[]>('diceRolls')) || [];
};

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const exportData = async (): Promise<string> => {
  const data = {
    characters: await loadCharacters(),
    campaigns: await loadCampaigns(),
    npcs: await loadNPCs(),
    npcTemplates: await loadNPCTemplates(),
    locations: await loadLocations(),
    campaignSessions: await loadCampaignSessions(),
    combatEncounters: await loadCombatEncounters(),
    maps: await loadMaps(),
    shops: await loadShops(),
    transactions: await loadTransactions(),
    diceRolls: await loadDiceRolls(),
    exportDate: new Date().toISOString()
  };
  
  return JSON.stringify(data, null, 2);
};