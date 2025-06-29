import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Plus, Minus, Search, Filter, Star, Coins, 
  Package, Users, ArrowLeft, X, Check, AlertCircle, Eye,
  Sword, Shield, Zap, Scroll, Hammer, Horse, Carriage,
  Target, Gem, Book, Potion, Wrench, Home, Crown, Sparkles
} from 'lucide-react';
import { 
  loadShops, saveShop, loadCharacters, loadCharacter, saveCharacter, 
  saveTransaction, generateId 
} from '../services/db';
import { 
  Shop, ShopItem, Character, CartItem, Transaction, Currency,
  CURRENCY_CONVERSION, CURRENCY_NAMES, CURRENCY_SYMBOLS,
  RARITY_COLORS, RARITY_NAMES, CATEGORY_NAMES
} from '../types';

function ShopPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const characterId = searchParams.get('characterId');

  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [rarityFilter, setRarityFilter] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (characterId && characters.length > 0) {
      const character = characters.find(c => c.id === characterId);
      if (character) {
        setSelectedCharacter(character);
      }
    }
  }, [characterId, characters]);

  const loadData = async () => {
    try {
      const [shopsData, charactersData] = await Promise.all([
        loadShops(),
        loadCharacters()
      ]);

      if (shopsData.length === 0) {
        const defaultShops = await createDefaultShops();
        setShops(defaultShops);
      } else {
        setShops(shopsData);
      }

      setCharacters(charactersData);

      // Set first shop as selected by default
      const firstShop = shopsData.length > 0 ? shopsData[0] : (await createDefaultShops())[0];
      setSelectedShop(firstShop);
    } catch (error) {
      console.error('Error loading shop data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultShops = async (): Promise<Shop[]> => {
    const defaultShops: Shop[] = [
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

    // Save all shops
    for (const shop of defaultShops) {
      await saveShop(shop);
    }

    return defaultShops;
  };

  const getShopIcon = (shopType: string) => {
    const icons: Record<string, any> = {
      'weapon_shop': Sword,
      'armor_shop': Shield,
      'magic_shop': Sparkles,
      'general_store': Package,
      'blacksmith': Hammer,
      'market': Horse,
      'alchemist': Potion,
      'tavern': Home,
      'temple': Crown,
      'library': Book,
      'fletcher': Target,
      'jeweler': Gem
    };
    return icons[shopType] || Package;
  };

  const getShopColor = (shopType: string) => {
    const colors: Record<string, string> = {
      'weapon_shop': 'from-red-500 to-red-600',
      'armor_shop': 'from-blue-500 to-blue-600',
      'magic_shop': 'from-purple-500 to-purple-600',
      'general_store': 'from-green-500 to-green-600',
      'blacksmith': 'from-orange-500 to-orange-600',
      'market': 'from-amber-500 to-amber-600',
      'alchemist': 'from-pink-500 to-pink-600',
      'tavern': 'from-yellow-500 to-yellow-600',
      'temple': 'from-indigo-500 to-indigo-600',
      'library': 'from-cyan-500 to-cyan-600',
      'fletcher': 'from-emerald-500 to-emerald-600',
      'jeweler': 'from-violet-500 to-violet-600'
    };
    return colors[shopType] || 'from-gray-500 to-gray-600';
  };

  const addToCart = (item: ShopItem, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.item.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: Math.min(cartItem.quantity + quantity, item.inStock) }
            : cartItem
        );
      } else {
        return [...prevCart, { item, quantity: Math.min(quantity, item.inStock) }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(cartItem => cartItem.item.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(cartItem =>
        cartItem.item.id === itemId
          ? { ...cartItem, quantity: Math.min(quantity, cartItem.item.inStock) }
          : cartItem
      )
    );
  };

  const calculateTotalCost = (): Currency => {
    return cart.reduce((total, cartItem) => {
      const itemTotal = multiplyPrice(cartItem.item.price, cartItem.quantity);
      return addCurrency(total, itemTotal);
    }, { copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 });
  };

  const multiplyPrice = (price: Currency, quantity: number): Currency => {
    return {
      copper: price.copper * quantity,
      silver: price.silver * quantity,
      electrum: price.electrum * quantity,
      gold: price.gold * quantity,
      platinum: price.platinum * quantity
    };
  };

  const addCurrency = (a: Currency, b: Currency): Currency => {
    return {
      copper: a.copper + b.copper,
      silver: a.silver + b.silver,
      electrum: a.electrum + b.electrum,
      gold: a.gold + b.gold,
      platinum: a.platinum + b.platinum
    };
  };

  const canAfford = (cost: Currency, playerCurrency: Currency): boolean => {
    const costInCopper = convertToCopper(cost);
    const playerCopperTotal = convertToCopper(playerCurrency);
    return playerCopperTotal >= costInCopper;
  };

  const convertToCopper = (currency: Currency): number => {
    return (
      currency.copper +
      currency.silver * CURRENCY_CONVERSION.silver +
      currency.electrum * CURRENCY_CONVERSION.electrum +
      currency.gold * CURRENCY_CONVERSION.gold +
      currency.platinum * CURRENCY_CONVERSION.platinum
    );
  };

  const deductCurrency = (playerCurrency: Currency, cost: Currency): Currency => {
    let remainingCost = convertToCopper(cost);
    let newCurrency = { ...playerCurrency };

    // Deduct from highest denomination first
    const denominations = ['platinum', 'gold', 'electrum', 'silver', 'copper'] as const;
    
    for (const denom of denominations) {
      const denomValue = CURRENCY_CONVERSION[denom];
      const available = newCurrency[denom];
      const canDeduct = Math.min(available, Math.floor(remainingCost / denomValue));
      
      newCurrency[denom] -= canDeduct;
      remainingCost -= canDeduct * denomValue;
    }

    return newCurrency;
  };

  const handlePurchase = async () => {
    if (!selectedCharacter || cart.length === 0) return;

    const totalCost = calculateTotalCost();
    
    if (!canAfford(totalCost, selectedCharacter.currency)) {
      alert('No tienes suficiente dinero para esta compra');
      return;
    }

    try {
      // Deduct currency from character
      const newCurrency = deductCurrency(selectedCharacter.currency, totalCost);
      
      // Add items to character's equipment
      const newEquipment = [...selectedCharacter.equipment];
      cart.forEach(cartItem => {
        for (let i = 0; i < cartItem.quantity; i++) {
          newEquipment.push(cartItem.item.name);
        }
      });

      // Update character
      const updatedCharacter = {
        ...selectedCharacter,
        currency: newCurrency,
        equipment: newEquipment,
        updatedAt: Date.now()
      };

      await saveCharacter(updatedCharacter);
      setSelectedCharacter(updatedCharacter);

      // Update shop inventory
      if (selectedShop) {
        const updatedItems = selectedShop.items.map(item => {
          const cartItem = cart.find(ci => ci.item.id === item.id);
          if (cartItem) {
            return { ...item, inStock: item.inStock - cartItem.quantity };
          }
          return item;
        });

        const updatedShop = { ...selectedShop, items: updatedItems, updatedAt: Date.now() };
        await saveShop(updatedShop);
        setSelectedShop(updatedShop);
        
        // Update shops list
        setShops(prevShops => 
          prevShops.map(shop => shop.id === updatedShop.id ? updatedShop : shop)
        );
      }

      // Save transaction
      const transaction: Transaction = {
        id: generateId(),
        characterId: selectedCharacter.id,
        shopId: selectedShop!.id,
        items: cart,
        totalCost,
        timestamp: Date.now(),
        type: 'purchase'
      };

      await saveTransaction(transaction);

      // Clear cart and close modals
      setCart([]);
      setShowCart(false);
      setShowCheckout(false);

      alert('¡Compra realizada con éxito!');
    } catch (error) {
      console.error('Error processing purchase:', error);
      alert('Error al procesar la compra');
    }
  };

  const formatPrice = (price: Currency): string => {
    const parts = [];
    if (price.platinum > 0) parts.push(`${price.platinum} ${CURRENCY_SYMBOLS.platinum}`);
    if (price.gold > 0) parts.push(`${price.gold} ${CURRENCY_SYMBOLS.gold}`);
    if (price.electrum > 0) parts.push(`${price.electrum} ${CURRENCY_SYMBOLS.electrum}`);
    if (price.silver > 0) parts.push(`${price.silver} ${CURRENCY_SYMBOLS.silver}`);
    if (price.copper > 0) parts.push(`${price.copper} ${CURRENCY_SYMBOLS.copper}`);
    
    return parts.length > 0 ? parts.join(', ') : '0 cp';
  };

  const filteredItems = selectedShop?.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesRarity = !rarityFilter || item.rarity === rarityFilter;
    
    return matchesSearch && matchesCategory && matchesRarity;
  }) || [];

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-200">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-amber-700">Cargando tiendas...</p>
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
            <ShoppingCart className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-amber-900">Tienda de Aventureros</h1>
              <p className="text-amber-700">Equipa a tus héroes para las aventuras más épicas</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Character Selection */}
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-amber-600" />
              <select
                value={selectedCharacter?.id || ''}
                onChange={(e) => {
                  const character = characters.find(c => c.id === e.target.value);
                  setSelectedCharacter(character || null);
                }}
                className="p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Seleccionar personaje...</option>
                {characters.map(character => (
                  <option key={character.id} value={character.id}>
                    {character.name} - {formatPrice(character.currency)}
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              <ShoppingCart size={18} />
              <span>Carrito</span>
              {getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Character Info */}
        {selectedCharacter && (
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-amber-900">{selectedCharacter.name}</h3>
                <p className="text-amber-700">{selectedCharacter.race} {selectedCharacter.class} - Nivel {selectedCharacter.level}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-amber-700">Dinero disponible:</div>
                <div className="font-bold text-amber-900">{formatPrice(selectedCharacter.currency)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Shops List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
          <h2 className="text-xl font-bold text-amber-900 mb-4">Tiendas Disponibles</h2>
          
          <div className="space-y-3">
            {shops.map(shop => {
              const ShopIcon = getShopIcon(shop.type);
              const shopColor = getShopColor(shop.type);
              
              return (
                <div
                  key={shop.id}
                  onClick={() => setSelectedShop(shop)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedShop?.id === shop.id
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-amber-200 bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${shopColor} flex items-center justify-center`}>
                      <ShopIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-amber-900">{shop.name}</h3>
                      <p className="text-xs text-amber-600">{shop.location}</p>
                    </div>
                  </div>
                  <p className="text-sm text-amber-700 mb-2">{shop.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-600">Por {shop.keeper}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-amber-600">{shop.reputation}%</span>
                    </div>
                  </div>
                  {shop.discountPercentage > 0 && (
                    <div className="mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full inline-block">
                      {shop.discountPercentage}% descuento
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Shop Items */}
        <div className="lg:col-span-3">
          {selectedShop ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
              {/* Shop Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-amber-900">{selectedShop.name}</h2>
                  <p className="text-amber-700">{selectedShop.description}</p>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar objetos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Todas las categorías</option>
                  {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
                
                <select
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value)}
                  className="p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Todas las rarezas</option>
                  {Object.entries(RARITY_NAMES).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Items Grid */}
              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                  <p className="text-amber-600 text-lg">No se encontraron objetos</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('');
                      setRarityFilter('');
                    }}
                    className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      className={`bg-white rounded-xl p-4 border-2 shadow-sm hover:shadow-md transition-all ${RARITY_COLORS[item.rarity]}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-amber-900 mb-1">{item.name}</h3>
                          <p className="text-xs text-amber-600 mb-2">{CATEGORY_NAMES[item.category]} • {RARITY_NAMES[item.rarity]}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-amber-900">{formatPrice(item.price)}</div>
                          <div className="text-xs text-amber-600">Stock: {item.inStock}</div>
                        </div>
                      </div>

                      <p className="text-sm text-amber-700 mb-3">{item.description}</p>

                      {/* Properties */}
                      {item.properties.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs font-medium text-amber-800 mb-1">Propiedades:</div>
                          <div className="flex flex-wrap gap-1">
                            {item.properties.map((prop, index) => (
                              <span
                                key={index}
                                className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full"
                              >
                                {prop}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Damage/AC */}
                      {(item.damage || item.armorClass) && (
                        <div className="mb-3 text-sm">
                          {item.damage && (
                            <div className="text-red-700">
                              <strong>Daño:</strong> {item.damage}
                            </div>
                          )}
                          {item.armorClass && (
                            <div className="text-blue-700">
                              <strong>CA:</strong> {item.armorClass}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => addToCart(item)}
                        disabled={!selectedCharacter || item.inStock === 0}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus size={16} />
                        <span>Agregar al Carrito</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-amber-200 text-center">
              <Package className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-amber-900 mb-2">Selecciona una Tienda</h2>
              <p className="text-amber-700">Elige una tienda de la lista para ver sus productos</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-amber-900">Carrito de Compras</h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <p className="text-amber-600">Tu carrito está vacío</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map(cartItem => (
                    <div key={cartItem.item.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex-1">
                        <h3 className="font-bold text-amber-900">{cartItem.item.name}</h3>
                        <p className="text-sm text-amber-700">{formatPrice(cartItem.item.price)} cada uno</p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQuantity(cartItem.item.id, cartItem.quantity - 1)}
                            className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-bold">{cartItem.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(cartItem.item.id, cartItem.quantity + 1)}
                            disabled={cartItem.quantity >= cartItem.item.inStock}
                            className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 disabled:opacity-50"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        
                        <div className="text-right min-w-[80px]">
                          <div className="font-bold text-amber-900">
                            {formatPrice(multiplyPrice(cartItem.item.price, cartItem.quantity))}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(cartItem.item.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-amber-200 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-amber-900">Total:</span>
                    <span className="text-xl font-bold text-amber-900">
                      {formatPrice(calculateTotalCost())}
                    </span>
                  </div>

                  {selectedCharacter && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-900">Dinero disponible:</span>
                        <span className="font-bold text-blue-900">
                          {formatPrice(selectedCharacter.currency)}
                        </span>
                      </div>
                      {!canAfford(calculateTotalCost(), selectedCharacter.currency) && (
                        <div className="mt-2 text-red-600 text-sm flex items-center">
                          <AlertCircle size={16} className="mr-1" />
                          No tienes suficiente dinero
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setCart([])}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Vaciar Carrito
                    </button>
                    <button
                      onClick={() => setShowCheckout(true)}
                      disabled={!selectedCharacter || cart.length === 0 || !canAfford(calculateTotalCost(), selectedCharacter.currency)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Proceder al Pago
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-amber-900 mb-2">Confirmar Compra</h2>
              <p className="text-amber-700">¿Estás seguro de que quieres realizar esta compra?</p>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 mb-6">
              <div className="text-center">
                <div className="text-sm text-amber-700 mb-1">Total a pagar:</div>
                <div className="text-2xl font-bold text-amber-900">
                  {formatPrice(calculateTotalCost())}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePurchase}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Confirmar Compra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShopPage;