// Core types for the D&D Bluetooth application

export interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  race: string;
  background: string;
  alignment?: string;
  stats: CharacterStats;
  hitPoints: HitPoints;
  armorClass: number;
  proficiencyBonus: number;
  skills: Record<string, boolean>;
  equipment: string[];
  spells?: string[];
  notes: string;
  currency: Currency;
  createdAt: number;
  updatedAt: number;
}

export interface Currency {
  copper: number;
  silver: number;
  electrum: number;
  gold: number;
  platinum: number;
}

export interface CharacterStats {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface HitPoints {
  current: number;
  maximum: number;
  temporary: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  price: Currency;
  weight: number;
  properties: string[];
  damage?: string;
  armorClass?: number;
  requirements?: string;
  imageUrl?: string;
  inStock: number;
  tags: string[];
}

export interface CartItem {
  item: ShopItem;
  quantity: number;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  type: ShopType;
  location: string;
  keeper: string;
  items: ShopItem[];
  discountPercentage: number;
  reputation: number;
  createdAt: number;
  updatedAt: number;
}

export interface Transaction {
  id: string;
  characterId: string;
  shopId: string;
  items: CartItem[];
  totalCost: Currency;
  timestamp: number;
  type: 'purchase' | 'sale';
}

export type ItemCategory = 
  | 'weapon' 
  | 'armor' 
  | 'shield' 
  | 'tool' 
  | 'adventuring_gear' 
  | 'consumable' 
  | 'magic_item' 
  | 'ammunition' 
  | 'instrument' 
  | 'mount' 
  | 'vehicle' 
  | 'trade_good' 
  | 'treasure';

export type ItemRarity = 
  | 'common' 
  | 'uncommon' 
  | 'rare' 
  | 'very_rare' 
  | 'legendary' 
  | 'artifact';

export type ShopType = 
  | 'general_store' 
  | 'weapon_shop' 
  | 'armor_shop' 
  | 'magic_shop' 
  | 'alchemist' 
  | 'tavern' 
  | 'temple' 
  | 'library' 
  | 'blacksmith' 
  | 'fletcher' 
  | 'jeweler' 
  | 'market';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  setting?: string;
  level?: number;
  maxPlayers?: number;
  status?: 'planning' | 'active' | 'completed' | 'paused';
  playerIds: string[];
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface NPC {
  id: string;
  campaignId: string;
  name: string;
  race?: string;
  class?: string;
  role: 'ally' | 'enemy' | 'neutral' | 'merchant' | 'quest_giver';
  location?: string;
  description: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface Location {
  id: string;
  campaignId: string;
  name: string;
  type: 'city' | 'dungeon' | 'wilderness' | 'building' | 'other';
  description: string;
  inhabitants?: string;
  secrets?: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface CampaignSession {
  id: string;
  campaignId: string;
  sessionNumber: number;
  title: string;
  date: number;
  duration: number;
  summary: string;
  events: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface DiceRoll {
  id: string;
  diceType: string;
  results: number[];
  modifier: number;
  total: number;
  characterId?: string;
  timestamp: number;
}

export interface GameSession {
  id: string;
  campaignId: string;
  sessionNumber: number;
  date: number;
  duration: number;
  notes: string;
  participants: string[];
  events: SessionEvent[];
}

export interface SessionEvent {
  id: string;
  type: 'combat' | 'roleplay' | 'exploration' | 'other';
  description: string;
  timestamp: number;
  participants: string[];
}

export interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
}

export interface BluetoothMessage {
  type: 'dice_roll' | 'character_update' | 'campaign_event' | 'chat_message';
  data: any;
  timestamp: number;
  senderId: string;
}

export interface CombatParticipant {
  id: string;
  name: string;
  initiative: number;
  hitPoints: HitPoints;
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

export interface CombatEncounter {
  id: string;
  name: string;
  participants: CombatParticipant[];
  currentTurn: number;
  round: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface NPCTemplate {
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

export interface MapMarker {
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

export interface MapData {
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

// Utility types
export type UserRole = 'player' | 'dm';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  characterIds: string[];
  campaignIds: string[];
}

// D&D specific enums and constants
export const DICE_TYPES = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'] as const;
export type DiceType = typeof DICE_TYPES[number];

export const CHARACTER_CLASSES = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 
  'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
] as const;
export type CharacterClass = typeof CHARACTER_CLASSES[number];

export const CHARACTER_RACES = [
  'Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Gnome',
  'Half-Elf', 'Half-Orc', 'Tiefling', 'Aasimar', 'Firbolg', 'Genasi',
  'Goliath', 'Kenku', 'Lizardfolk', 'Tabaxi', 'Triton', 'Yuan-ti'
] as const;
export type CharacterRace = typeof CHARACTER_RACES[number];

export const SKILLS = [
  'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception',
  'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
  'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
  'Sleight of Hand', 'Stealth', 'Survival'
] as const;
export type Skill = typeof SKILLS[number];

export const CONDITIONS = [
  'Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled',
  'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned',
  'Prone', 'Restrained', 'Stunned', 'Unconscious'
] as const;
export type Condition = typeof CONDITIONS[number];

// Currency utilities
export const CURRENCY_CONVERSION = {
  copper: 1,
  silver: 10,
  electrum: 50,
  gold: 100,
  platinum: 1000
};

export const CURRENCY_NAMES = {
  copper: 'Cobre',
  silver: 'Plata',
  electrum: 'Electrum',
  gold: 'Oro',
  platinum: 'Platino'
};

export const CURRENCY_SYMBOLS = {
  copper: 'cp',
  silver: 'sp',
  electrum: 'ep',
  gold: 'gp',
  platinum: 'pp'
};

// Item rarity colors
export const RARITY_COLORS = {
  common: 'text-gray-600 border-gray-300',
  uncommon: 'text-green-600 border-green-300',
  rare: 'text-blue-600 border-blue-300',
  very_rare: 'text-purple-600 border-purple-300',
  legendary: 'text-orange-600 border-orange-300',
  artifact: 'text-red-600 border-red-300'
};

export const RARITY_NAMES = {
  common: 'Común',
  uncommon: 'Poco Común',
  rare: 'Raro',
  very_rare: 'Muy Raro',
  legendary: 'Legendario',
  artifact: 'Artefacto'
};

export const CATEGORY_NAMES = {
  weapon: 'Armas',
  armor: 'Armaduras',
  shield: 'Escudos',
  tool: 'Herramientas',
  adventuring_gear: 'Equipo de Aventura',
  consumable: 'Consumibles',
  magic_item: 'Objetos Mágicos',
  ammunition: 'Munición',
  instrument: 'Instrumentos',
  mount: 'Monturas',
  vehicle: 'Vehículos',
  trade_good: 'Bienes Comerciales',
  treasure: 'Tesoros'
};

export const SHOP_TYPE_NAMES = {
  general_store: 'Tienda General',
  weapon_shop: 'Armería',
  armor_shop: 'Tienda de Armaduras',
  magic_shop: 'Tienda Mágica',
  alchemist: 'Alquimista',
  tavern: 'Taberna',
  temple: 'Templo',
  library: 'Biblioteca',
  blacksmith: 'Herrería',
  fletcher: 'Flechero',
  jeweler: 'Joyería',
  market: 'Mercado'
};