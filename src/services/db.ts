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
  return (await loadData<NPCTemplate[]>('npcTemplates')) || [];
};

export const deleteNPCTemplate = async (id: string): Promise<void> => {
  const templates = await loadNPCTemplates();
  const filteredTemplates = templates.filter(t => t.id !== id);
  await saveData('npcTemplates', filteredTemplates);
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
  return (await loadData<Shop[]>('shops')) || [];
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