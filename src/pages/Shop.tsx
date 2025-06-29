import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ShoppingCart, Plus, Minus, Search, Filter, Star, Coins, 
  Package, Sword, Shield, Zap, ArrowLeft, X, Check, AlertCircle,
  Eye, ShoppingBag, Trash2, CreditCard, Receipt, RefreshCw, RotateCcw
} from 'lucide-react';
import { loadCharacters, loadShops, saveShop, saveCharacter, saveTransaction, generateId } from '../services/db';
import { Character, Shop, ShopItem, CartItem, Currency, ItemCategory, ItemRarity, Transaction } from '../types';
import { CURRENCY_NAMES, CURRENCY_SYMBOLS, RARITY_COLORS, RARITY_NAMES, CATEGORY_NAMES, CURRENCY_CONVERSION } from '../types';

function ShopPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const characterId = searchParams.get('characterId');

  const [characters, setCharacters] = useState<Character[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<ItemRarity | 'all'>('all');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCurrencyConverter, setShowCurrencyConverter] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
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
      const [loadedCharacters, loadedShops] = await Promise.all([
        loadCharacters(),
        loadShops()
      ]);

      setCharacters(loadedCharacters);
      
      if (loadedShops.length === 0) {
        // Create example shops if none exist
        const exampleShops = await createExampleShops();
        setShops(exampleShops);
      } else {
        setShops(loadedShops);
      }

      if (loadedShops.length > 0) {
        setSelectedShop(loadedShops[0]);
      }
    } catch (error) {
      console.error('Error loading shop data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createExampleShops = async (): Promise<Shop[]> => {
    const exampleShops: Shop[] = [
      {
        id: generateId(),
        name: "Armería del Dragón de Hierro",
        description: "La mejor selección de armas y armaduras de la ciudad. Forjado por maestros herreros.",
        type: 'weapon_shop',
        location: "Distrito del Mercado",
        keeper: "Thorin Martillo de Hierro",
        discountPercentage: 0,
        reputation: 95,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        items: [
          {
            id: generateId(),
            name: "Espada Larga",
            description: "Una espada larga bien equilibrada, perfecta para combate versátil.",
            category: 'weapon',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 15, platinum: 0 },
            weight: 3,
            properties: ["Versátil (1d10)"],
            damage: "1d8 cortante",
            inStock: 5,
            tags: ["marcial", "cuerpo a cuerpo"]
          },
          {
            id: generateId(),
            name: "Daga",
            description: "Una daga afilada, ligera y versátil.",
            category: 'weapon',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 2, platinum: 0 },
            weight: 1,
            properties: ["Sutil", "Arrojadiza (20/60)", "Ligera"],
            damage: "1d4 perforante",
            inStock: 10,
            tags: ["simple", "cuerpo a cuerpo", "arrojadiza"]
          },
          {
            id: generateId(),
            name: "Arco Largo",
            description: "Un arco largo de madera de tejo, ideal para combate a distancia.",
            category: 'weapon',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 50, platinum: 0 },
            weight: 2,
            properties: ["Munición (150/600)", "Pesada", "Dos manos"],
            damage: "1d8 perforante",
            inStock: 3,
            tags: ["marcial", "a distancia"]
          },
          {
            id: generateId(),
            name: "Martillo de Guerra",
            description: "Un martillo pesado diseñado para el combate, devastador contra armaduras.",
            category: 'weapon',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 15, platinum: 0 },
            weight: 2,
            properties: ["Versátil (1d10)"],
            damage: "1d8 contundente",
            inStock: 4,
            tags: ["marcial", "cuerpo a cuerpo"]
          },
          {
            id: generateId(),
            name: "Ballesta Ligera",
            description: "Una ballesta compacta y fácil de usar.",
            category: 'weapon',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 25, platinum: 0 },
            weight: 5,
            properties: ["Munición (80/320)", "Carga", "Dos manos"],
            damage: "1d8 perforante",
            inStock: 6,
            tags: ["simple", "a distancia"]
          },
          {
            id: generateId(),
            name: "Armadura de Cuero",
            description: "Armadura ligera hecha de cuero endurecido, ofrece protección básica.",
            category: 'armor',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 10, platinum: 0 },
            weight: 10,
            properties: ["Ligera"],
            armorClass: 11,
            inStock: 8,
            tags: ["ligera", "cuero"]
          },
          {
            id: generateId(),
            name: "Armadura de Cuero Tachonado",
            description: "Armadura de cuero reforzada con tachuelas de metal.",
            category: 'armor',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 45, platinum: 0 },
            weight: 13,
            properties: ["Ligera"],
            armorClass: 12,
            inStock: 5,
            tags: ["ligera", "cuero", "metal"]
          },
          {
            id: generateId(),
            name: "Cota de Malla",
            description: "Armadura media hecha de anillos de metal entrelazados.",
            category: 'armor',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 75, platinum: 0 },
            weight: 20,
            properties: ["Media"],
            armorClass: 13,
            inStock: 4,
            tags: ["media", "metal"]
          },
          {
            id: generateId(),
            name: "Armadura de Placas",
            description: "La mejor protección disponible, hecha de placas de acero entrelazadas.",
            category: 'armor',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 1500, platinum: 0 },
            weight: 65,
            properties: ["Pesada"],
            armorClass: 18,
            inStock: 1,
            tags: ["pesada", "acero"]
          },
          {
            id: generateId(),
            name: "Escudo",
            description: "Un escudo de madera reforzado con metal.",
            category: 'shield',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 10, platinum: 0 },
            weight: 6,
            properties: ["+2 CA"],
            inStock: 6,
            tags: ["defensa"]
          },
          {
            id: generateId(),
            name: "Espada Larga +1",
            description: "Una espada larga mágica con un filo que nunca se desafila.",
            category: 'magic_item',
            rarity: 'uncommon',
            price: { copper: 0, silver: 0, electrum: 0, gold: 500, platinum: 0 },
            weight: 3,
            properties: ["Versátil (1d10)", "Mágica +1"],
            damage: "1d8+1 cortante",
            inStock: 1,
            tags: ["marcial", "mágico", "cuerpo a cuerpo"]
          },
          {
            id: generateId(),
            name: "Armadura de Cuero +1",
            description: "Armadura de cuero encantada que ofrece protección mejorada.",
            category: 'magic_item',
            rarity: 'rare',
            price: { copper: 0, silver: 0, electrum: 0, gold: 1200, platinum: 0 },
            weight: 10,
            properties: ["Ligera", "Mágica +1"],
            armorClass: 12,
            inStock: 1,
            tags: ["ligera", "mágico"]
          }
        ]
      },
      {
        id: generateId(),
        name: "Pociones y Pergaminos de Elara",
        description: "Tienda mágica especializada en pociones, pergaminos y componentes arcanos.",
        type: 'magic_shop',
        location: "Torre de los Magos",
        keeper: "Elara Lunaverde",
        discountPercentage: 10,
        reputation: 88,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        items: [
          {
            id: generateId(),
            name: "Poción de Curación",
            description: "Una poción roja que restaura 2d4+2 puntos de vida.",
            category: 'consumable',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 50, platinum: 0 },
            weight: 0.5,
            properties: ["Cura 2d4+2 PV"],
            inStock: 12,
            tags: ["curación", "poción"]
          },
          {
            id: generateId(),
            name: "Poción de Curación Mayor",
            description: "Una poción roja brillante que restaura 4d4+4 puntos de vida.",
            category: 'consumable',
            rarity: 'uncommon',
            price: { copper: 0, silver: 0, electrum: 0, gold: 200, platinum: 0 },
            weight: 0.5,
            properties: ["Cura 4d4+4 PV"],
            inStock: 6,
            tags: ["curación", "poción"]
          },
          {
            id: generateId(),
            name: "Poción de Curación Superior",
            description: "Una poción carmesí que restaura 8d4+8 puntos de vida.",
            category: 'consumable',
            rarity: 'rare',
            price: { copper: 0, silver: 0, electrum: 0, gold: 500, platinum: 0 },
            weight: 0.5,
            properties: ["Cura 8d4+8 PV"],
            inStock: 3,
            tags: ["curación", "poción"]
          },
          {
            id: generateId(),
            name: "Poción de Fuerza de Gigante",
            description: "Otorga Fuerza 21 durante 1 hora.",
            category: 'consumable',
            rarity: 'rare',
            price: { copper: 0, silver: 0, electrum: 0, gold: 400, platinum: 0 },
            weight: 0.5,
            properties: ["Fuerza 21", "Duración 1 hora"],
            inStock: 2,
            tags: ["mejora", "poción"]
          },
          {
            id: generateId(),
            name: "Poción de Invisibilidad",
            description: "Te vuelve invisible durante 1 hora.",
            category: 'consumable',
            rarity: 'very_rare',
            price: { copper: 0, silver: 0, electrum: 0, gold: 800, platinum: 0 },
            weight: 0.5,
            properties: ["Invisibilidad", "Duración 1 hora"],
            inStock: 1,
            tags: ["sigilo", "poción"]
          },
          {
            id: generateId(),
            name: "Pergamino de Bola de Fuego",
            description: "Un pergamino que contiene el hechizo Bola de Fuego (nivel 3).",
            category: 'consumable',
            rarity: 'uncommon',
            price: { copper: 0, silver: 0, electrum: 0, gold: 150, platinum: 0 },
            weight: 0,
            properties: ["Hechizo nivel 3", "Un uso"],
            inStock: 3,
            tags: ["pergamino", "fuego", "daño"]
          },
          {
            id: generateId(),
            name: "Pergamino de Curar Heridas",
            description: "Un pergamino que contiene el hechizo Curar Heridas (nivel 1).",
            category: 'consumable',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 25, platinum: 0 },
            weight: 0,
            properties: ["Hechizo nivel 1", "Un uso"],
            inStock: 8,
            tags: ["pergamino", "curación"]
          },
          {
            id: generateId(),
            name: "Pergamino de Rayo",
            description: "Un pergamino que contiene el hechizo Rayo (nivel 3).",
            category: 'consumable',
            rarity: 'uncommon',
            price: { copper: 0, silver: 0, electrum: 0, gold: 150, platinum: 0 },
            weight: 0,
            properties: ["Hechizo nivel 3", "Un uso"],
            inStock: 2,
            tags: ["pergamino", "eléctrico", "daño"]
          },
          {
            id: generateId(),
            name: "Pergamino de Teletransporte",
            description: "Un pergamino que contiene el hechizo Teletransporte (nivel 7).",
            category: 'consumable',
            rarity: 'very_rare',
            price: { copper: 0, silver: 0, electrum: 0, gold: 1000, platinum: 0 },
            weight: 0,
            properties: ["Hechizo nivel 7", "Un uso"],
            inStock: 1,
            tags: ["pergamino", "transporte"]
          },
          {
            id: generateId(),
            name: "Varita de Misiles Mágicos",
            description: "Una varita que puede lanzar Misiles Mágicos. Tiene 7 cargas.",
            category: 'magic_item',
            rarity: 'uncommon',
            price: { copper: 0, silver: 0, electrum: 0, gold: 800, platinum: 0 },
            weight: 1,
            properties: ["7 cargas", "Recarga 1d6+1 al amanecer"],
            inStock: 1,
            tags: ["varita", "mágico", "fuerza"]
          },
          {
            id: generateId(),
            name: "Varita de Bolas de Fuego",
            description: "Una varita poderosa que lanza bolas de fuego. Tiene 7 cargas.",
            category: 'magic_item',
            rarity: 'rare',
            price: { copper: 0, silver: 0, electrum: 0, gold: 1500, platinum: 0 },
            weight: 1,
            properties: ["7 cargas", "Recarga 1d6+1 al amanecer"],
            inStock: 1,
            tags: ["varita", "mágico", "fuego"]
          },
          {
            id: generateId(),
            name: "Anillo de Protección",
            description: "Un anillo mágico que otorga +1 a CA y tiradas de salvación.",
            category: 'magic_item',
            rarity: 'rare',
            price: { copper: 0, silver: 0, electrum: 0, gold: 2000, platinum: 0 },
            weight: 0,
            properties: ["+1 CA", "+1 Salvaciones"],
            inStock: 1,
            tags: ["anillo", "protección", "mágico"]
          },
          {
            id: generateId(),
            name: "Capa de Élfico",
            description: "Una capa que otorga ventaja en tiradas de Sigilo.",
            category: 'magic_item',
            rarity: 'uncommon',
            price: { copper: 0, silver: 0, electrum: 0, gold: 600, platinum: 0 },
            weight: 1,
            properties: ["Ventaja en Sigilo"],
            inStock: 1,
            tags: ["capa", "sigilo", "mágico"]
          }
        ]
      },
      {
        id: generateId(),
        name: "Suministros del Aventurero",
        description: "Todo lo que necesitas para tus aventuras: cuerdas, antorchas, raciones y más.",
        type: 'general_store',
        location: "Plaza Central",
        keeper: "Gareth el Comerciante",
        discountPercentage: 5,
        reputation: 92,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        items: [
          {
            id: generateId(),
            name: "Cuerda de Cáñamo (50 pies)",
            description: "Cuerda resistente de cáñamo, esencial para cualquier aventurero.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 2, platinum: 0 },
            weight: 10,
            properties: ["50 pies de longitud"],
            inStock: 20,
            tags: ["utilidad", "escalada"]
          },
          {
            id: generateId(),
            name: "Cuerda de Seda (50 pies)",
            description: "Cuerda ligera y resistente hecha de seda, más fuerte que el cáñamo.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 10, platinum: 0 },
            weight: 5,
            properties: ["50 pies de longitud", "Ligera"],
            inStock: 8,
            tags: ["utilidad", "escalada", "premium"]
          },
          {
            id: generateId(),
            name: "Antorcha",
            description: "Antorcha que proporciona luz brillante en un radio de 20 pies.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 1, silver: 0, electrum: 0, gold: 0, platinum: 0 },
            weight: 1,
            properties: ["Luz 20 pies", "Dura 1 hora"],
            inStock: 50,
            tags: ["luz", "fuego"]
          },
          {
            id: generateId(),
            name: "Linterna Sorda",
            description: "Linterna que proyecta luz brillante en un cono de 60 pies.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 5, platinum: 0 },
            weight: 2,
            properties: ["Luz 60 pies", "Requiere aceite"],
            inStock: 15,
            tags: ["luz", "aceite"]
          },
          {
            id: generateId(),
            name: "Aceite (1 frasco)",
            description: "Aceite para linternas o como arma improvisada.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 1, electrum: 0, gold: 0, platinum: 0 },
            weight: 1,
            properties: ["Combustible", "Arrojadiza"],
            inStock: 30,
            tags: ["combustible", "utilidad"]
          },
          {
            id: generateId(),
            name: "Raciones de Viaje (1 día)",
            description: "Comida seca que se conserva bien durante los viajes.",
            category: 'consumable',
            rarity: 'common',
            price: { copper: 0, silver: 2, electrum: 0, gold: 0, platinum: 0 },
            weight: 2,
            properties: ["Alimenta 1 día"],
            inStock: 30,
            tags: ["comida", "supervivencia"]
          },
          {
            id: generateId(),
            name: "Odre",
            description: "Recipiente de cuero para transportar agua.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 2, electrum: 0, gold: 0, platinum: 0 },
            weight: 5,
            properties: ["4 pintas de líquido"],
            inStock: 25,
            tags: ["contenedor", "agua"]
          },
          {
            id: generateId(),
            name: "Kit de Herramientas de Ladrón",
            description: "Conjunto de herramientas especializadas para abrir cerraduras.",
            category: 'tool',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 25, platinum: 0 },
            weight: 1,
            properties: ["Competencia requerida"],
            inStock: 3,
            tags: ["herramientas", "sigilo"]
          },
          {
            id: generateId(),
            name: "Kit de Herramientas de Herrero",
            description: "Herramientas para trabajar el metal y reparar equipo.",
            category: 'tool',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 20, platinum: 0 },
            weight: 8,
            properties: ["Competencia requerida"],
            inStock: 2,
            tags: ["herramientas", "artesanía"]
          },
          {
            id: generateId(),
            name: "Kit de Herramientas de Alquimista",
            description: "Equipo para crear pociones y sustancias alquímicas.",
            category: 'tool',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 50, platinum: 0 },
            weight: 8,
            properties: ["Competencia requerida"],
            inStock: 1,
            tags: ["herramientas", "alquimia"]
          },
          {
            id: generateId(),
            name: "Mochila",
            description: "Una mochila resistente para llevar equipo de aventura.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 2, platinum: 0 },
            weight: 5,
            properties: ["Capacidad 30 lb"],
            inStock: 15,
            tags: ["contenedor", "utilidad"]
          },
          {
            id: generateId(),
            name: "Bolsa de Componentes",
            description: "Bolsa para guardar componentes de hechizos.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 25, platinum: 0 },
            weight: 2,
            properties: ["Para lanzadores de hechizos"],
            inStock: 8,
            tags: ["magia", "contenedor"]
          },
          {
            id: generateId(),
            name: "Flechas (20)",
            description: "Un carcaj con 20 flechas de calidad.",
            category: 'ammunition',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 1, platinum: 0 },
            weight: 1,
            properties: ["Munición para arcos"],
            inStock: 25,
            tags: ["munición", "arco"]
          },
          {
            id: generateId(),
            name: "Virotes de Ballesta (20)",
            description: "Virotes para ballestas, bien equilibrados.",
            category: 'ammunition',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 1, platinum: 0 },
            weight: 1.5,
            properties: ["Munición para ballestas"],
            inStock: 20,
            tags: ["munición", "ballesta"]
          },
          {
            id: generateId(),
            name: "Balas de Honda (20)",
            description: "Proyectiles de plomo para hondas.",
            category: 'ammunition',
            rarity: 'common',
            price: { copper: 4, silver: 0, electrum: 0, gold: 0, platinum: 0 },
            weight: 1.5,
            properties: ["Munición para hondas"],
            inStock: 30,
            tags: ["munición", "honda"]
          },
          {
            id: generateId(),
            name: "Tienda de Campaña (2 personas)",
            description: "Refugio portátil para dos personas.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 2, platinum: 0 },
            weight: 20,
            properties: ["Capacidad 2 personas"],
            inStock: 10,
            tags: ["refugio", "camping"]
          },
          {
            id: generateId(),
            name: "Manta",
            description: "Manta de lana para mantenerse caliente.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 5, electrum: 0, gold: 0, platinum: 0 },
            weight: 3,
            properties: ["Protección contra frío"],
            inStock: 20,
            tags: ["comodidad", "supervivencia"]
          }
        ]
      }
    ];

    // Save example shops
    for (const shop of exampleShops) {
      await saveShop(shop);
    }

    return exampleShops;
  };

  const restockShop = async (shopId: string) => {
    const shop = shops.find(s => s.id === shopId);
    if (!shop) return;

    const updatedShop = {
      ...shop,
      items: shop.items.map(item => ({
        ...item,
        inStock: item.inStock + Math.floor(Math.random() * 5) + 1
      })),
      updatedAt: Date.now()
    };

    await saveShop(updatedShop);
    setShops(prev => prev.map(s => s.id === shopId ? updatedShop : s));
    if (selectedShop?.id === shopId) {
      setSelectedShop(updatedShop);
    }
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
      prevCart.map(cartItem => {
        if (cartItem.item.id === itemId) {
          return { ...cartItem, quantity: Math.min(quantity, cartItem.item.inStock) };
        }
        return cartItem;
      })
    );
  };

  const calculateCartTotal = (): Currency => {
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

  const subtractCurrency = (a: Currency, b: Currency): Currency => {
    return {
      copper: a.copper - b.copper,
      silver: a.silver - b.silver,
      electrum: a.electrum - b.electrum,
      gold: a.gold - b.gold,
      platinum: a.platinum - b.platinum
    };
  };

  // Nueva función para convertir automáticamente monedas
  const convertCurrencyForPayment = (character: Character, cost: Currency): Currency => {
    const totalCostInCopper = currencyToCopper(cost);
    const totalCharacterCopper = currencyToCopper(character.currency);
    
    if (totalCharacterCopper < totalCostInCopper) {
      return character.currency; // No hay suficiente dinero
    }

    // Crear una copia de la moneda del personaje
    let remainingCurrency = { ...character.currency };
    let remainingCost = totalCostInCopper;

    // Convertir de mayor a menor denominación
    const denominations = [
      { key: 'platinum' as keyof Currency, value: CURRENCY_CONVERSION.platinum },
      { key: 'gold' as keyof Currency, value: CURRENCY_CONVERSION.gold },
      { key: 'electrum' as keyof Currency, value: CURRENCY_CONVERSION.electrum },
      { key: 'silver' as keyof Currency, value: CURRENCY_CONVERSION.silver },
      { key: 'copper' as keyof Currency, value: CURRENCY_CONVERSION.copper }
    ];

    for (const denom of denominations) {
      const availableAmount = remainingCurrency[denom.key];
      const neededAmount = Math.floor(remainingCost / denom.value);
      const usedAmount = Math.min(availableAmount, neededAmount);
      
      remainingCurrency[denom.key] -= usedAmount;
      remainingCost -= usedAmount * denom.value;
      
      if (remainingCost <= 0) break;
    }

    return remainingCurrency;
  };

  const canAfford = (character: Character, cost: Currency): boolean => {
    const totalCostInCopper = currencyToCopper(cost);
    const totalCharacterCopper = currencyToCopper(character.currency);
    return totalCharacterCopper >= totalCostInCopper;
  };

  const currencyToCopper = (currency: Currency): number => {
    return (
      currency.copper +
      currency.silver * CURRENCY_CONVERSION.silver +
      currency.electrum * CURRENCY_CONVERSION.electrum +
      currency.gold * CURRENCY_CONVERSION.gold +
      currency.platinum * CURRENCY_CONVERSION.platinum
    );
  };

  const formatCurrency = (currency: Currency | undefined | null): string => {
    // Handle undefined or null currency
    if (!currency) {
      return '0 cp';
    }

    const parts = [];
    if (currency.platinum > 0) parts.push(`${currency.platinum} ${CURRENCY_SYMBOLS.platinum}`);
    if (currency.gold > 0) parts.push(`${currency.gold} ${CURRENCY_SYMBOLS.gold}`);
    if (currency.electrum > 0) parts.push(`${currency.electrum} ${CURRENCY_SYMBOLS.electrum}`);
    if (currency.silver > 0) parts.push(`${currency.silver} ${CURRENCY_SYMBOLS.silver}`);
    if (currency.copper > 0) parts.push(`${currency.copper} ${CURRENCY_SYMBOLS.copper}`);
    
    return parts.length > 0 ? parts.join(', ') : '0 cp';
  };

  const completePurchase = async () => {
    if (!selectedCharacter || cart.length === 0) return;

    const totalCost = calculateCartTotal();
    
    if (!canAfford(selectedCharacter, totalCost)) {
      alert('No tienes suficiente dinero para esta compra.');
      return;
    }

    try {
      // Convertir automáticamente las monedas para el pago
      const newCurrency = convertCurrencyForPayment(selectedCharacter, totalCost);

      // Update character currency and equipment
      const updatedCharacter = {
        ...selectedCharacter,
        currency: newCurrency,
        equipment: [
          ...selectedCharacter.equipment,
          ...cart.flatMap(cartItem => 
            Array(cartItem.quantity).fill(cartItem.item.name)
          )
        ],
        updatedAt: Date.now()
      };

      // Update shop inventory
      const updatedShop = {
        ...selectedShop!,
        items: selectedShop!.items.map(item => {
          const cartItem = cart.find(ci => ci.item.id === item.id);
          if (cartItem) {
            return { ...item, inStock: item.inStock - cartItem.quantity };
          }
          return item;
        }),
        updatedAt: Date.now()
      };

      // Create transaction record
      const transaction: Transaction = {
        id: generateId(),
        characterId: selectedCharacter.id,
        shopId: selectedShop!.id,
        items: cart,
        totalCost,
        timestamp: Date.now(),
        type: 'purchase'
      };

      // Save all changes
      await Promise.all([
        saveCharacter(updatedCharacter),
        saveShop(updatedShop),
        saveTransaction(transaction)
      ]);

      // Update local state
      setSelectedCharacter(updatedCharacter);
      setCharacters(prev => prev.map(c => c.id === updatedCharacter.id ? updatedCharacter : c));
      setSelectedShop(updatedShop);
      setShops(prev => prev.map(s => s.id === updatedShop.id ? updatedShop : s));
      setCart([]);
      setShowCheckout(false);
      setShowCart(false);

      alert('¡Compra realizada con éxito! Las monedas se han convertido automáticamente.');
    } catch (error) {
      console.error('Error completing purchase:', error);
      alert('Error al procesar la compra');
    }
  };

  const filteredItems = selectedShop?.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesRarity = selectedRarity === 'all' || item.rarity === selectedRarity;
    const inStock = item.inStock > 0;
    
    return matchesSearch && matchesCategory && matchesRarity && inStock;
  }) || [];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-amber-200">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-amber-700">Cargando tienda...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 p-4">
      {/* Header - Mobile Optimized */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-xl border border-amber-200">
        <div className="flex flex-col space-y-4">
          {/* Top Row */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-amber-700 hover:text-amber-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Volver</span>
            </button>
            
            <div className="flex items-center space-x-2 text-center">
              <ShoppingCart className="w-6 h-6 lg:w-8 lg:h-8 text-green-600" />
              <div>
                <h1 className="text-xl lg:text-3xl font-bold text-amber-900">Tienda</h1>
                <p className="text-xs lg:text-base text-amber-700 hidden sm:block">Equipa a tu héroe</p>
              </div>
            </div>

            <div className="flex items-center space-x-1 lg:space-x-2">
              <button
                onClick={() => setShowCurrencyConverter(true)}
                className="flex items-center space-x-1 lg:space-x-2 px-2 lg:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm lg:text-base"
              >
                <RefreshCw size={16} className="lg:hidden" />
                <RefreshCw size={18} className="hidden lg:block" />
                <span className="hidden sm:inline">Conversor</span>
              </button>
              
              <button
                onClick={() => setShowCart(true)}
                className="relative flex items-center space-x-1 lg:space-x-2 px-2 lg:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md text-sm lg:text-base"
              >
                <ShoppingCart size={16} className="lg:hidden" />
                <ShoppingCart size={18} className="hidden lg:block" />
                <span className="hidden sm:inline">Carrito</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 lg:w-6 lg:h-6 flex items-center justify-center">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Character and Shop Selection - Mobile Optimized */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Personaje
              </label>
              <select
                value={selectedCharacter?.id || ''}
                onChange={(e) => {
                  const character = characters.find(c => c.id === e.target.value);
                  setSelectedCharacter(character || null);
                }}
                className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm lg:text-base"
              >
                <option value="">Seleccionar personaje...</option>
                {characters.map(character => (
                  <option key={character.id} value={character.id}>
                    {character.name} - {character.class} Nivel {character.level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Tienda
              </label>
              <div className="flex space-x-2">
                <select
                  value={selectedShop?.id || ''}
                  onChange={(e) => {
                    const shop = shops.find(s => s.id === e.target.value);
                    setSelectedShop(shop || null);
                  }}
                  className="flex-1 p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm lg:text-base"
                >
                  <option value="">Seleccionar tienda...</option>
                  {shops.map(shop => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
                {selectedShop && (
                  <button
                    onClick={() => restockShop(selectedShop.id)}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    title="Reabastecer tienda"
                  >
                    <RotateCcw size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Character Currency Display - Mobile Optimized */}
          {selectedCharacter && (
            <div className="p-3 lg:p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 lg:w-5 lg:h-5 text-amber-600" />
                  <span className="font-bold text-amber-900 text-sm lg:text-base">
                    Dinero de {selectedCharacter.name}:
                  </span>
                </div>
                <div className="text-amber-800 font-medium text-sm lg:text-base">
                  {formatCurrency(selectedCharacter.currency)}
                  <span className="text-xs lg:text-sm text-amber-600 ml-2 block sm:inline">
                    (Total: {currencyToCopper(selectedCharacter.currency)} cp)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedShop && (
        <>
          {/* Shop Info - Mobile Optimized */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-xl border border-amber-200">
            <div className="flex flex-col space-y-4">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-amber-900">{selectedShop.name}</h2>
                <p className="text-amber-700 text-sm lg:text-base">{selectedShop.description}</p>
                <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-2 text-xs lg:text-sm text-amber-600">
                  <span>📍 {selectedShop.location}</span>
                  <span>👤 {selectedShop.keeper}</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-500" />
                    <span>{selectedShop.reputation}% reputación</span>
                  </div>
                  {selectedShop.discountPercentage > 0 && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {selectedShop.discountPercentage}% descuento
                    </span>
                  )}
                </div>
              </div>

              {/* Filters - Mobile Optimized */}
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" size={18} />
                  <input
                    type="text"
                    placeholder="Buscar objetos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm lg:text-base"
                  />
                </div>

                {/* Filter Toggle for Mobile */}
                <div className="lg:hidden">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors w-full justify-center"
                  >
                    <Filter size={18} />
                    <span>Filtros</span>
                  </button>
                </div>

                {/* Filters */}
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as ItemCategory | 'all')}
                    className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm lg:text-base"
                  >
                    <option value="all">Todas las categorías</option>
                    {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>

                  <select
                    value={selectedRarity}
                    onChange={(e) => setSelectedRarity(e.target.value as ItemRarity | 'all')}
                    className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm lg:text-base"
                  >
                    <option value="all">Todas las rarezas</option>
                    {Object.entries(RARITY_NAMES).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Items Grid - Mobile Optimized */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 lg:p-6 shadow-xl border border-amber-200">
            <h3 className="text-lg lg:text-xl font-bold text-amber-900 mb-4 lg:mb-6">Objetos Disponibles</h3>
            
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 lg:py-12">
                <Package className="w-12 h-12 lg:w-16 lg:h-16 text-amber-400 mx-auto mb-4" />
                <p className="text-amber-600 text-base lg:text-lg">No hay objetos que coincidan con los filtros</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl p-3 lg:p-4 border-2 shadow-sm hover:shadow-md transition-all ${RARITY_COLORS[item.rarity]}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-amber-900 text-sm lg:text-base truncate">{item.name}</h4>
                        <p className="text-xs text-amber-600">{CATEGORY_NAMES[item.category]} • {RARITY_NAMES[item.rarity]}</p>
                      </div>
                      <div className="text-right ml-2">
                        <div className="font-bold text-amber-900 text-xs lg:text-sm">{formatCurrency(item.price)}</div>
                        <div className="text-xs text-amber-600">Stock: {item.inStock}</div>
                      </div>
                    </div>

                    <p className="text-xs lg:text-sm text-amber-700 mb-3 line-clamp-2">{item.description}</p>

                    {/* Item Properties */}
                    {item.properties.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {item.properties.slice(0, 2).map((property, index) => (
                            <span
                              key={index}
                              className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full"
                            >
                              {property}
                            </span>
                          ))}
                          {item.properties.length > 2 && (
                            <span className="text-xs text-amber-600">+{item.properties.length - 2} más</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Item Stats */}
                    <div className="text-xs text-amber-600 mb-3 space-y-1">
                      {item.damage && <div>Daño: {item.damage}</div>}
                      {item.armorClass && <div>CA: {item.armorClass}</div>}
                      <div>Peso: {item.weight} lb</div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => addToCart(item)}
                      disabled={!selectedCharacter || item.inStock === 0}
                      className="w-full flex items-center justify-center space-x-2 px-3 lg:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm lg:text-base"
                    >
                      <ShoppingCart size={14} className="lg:hidden" />
                      <ShoppingCart size={16} className="hidden lg:block" />
                      <span className="hidden sm:inline">Agregar</span>
                      <span className="sm:hidden">+</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Currency Converter Modal - Mobile Optimized */}
      {showCurrencyConverter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 lg:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl lg:text-2xl font-bold text-amber-900">Conversor de Monedas</h2>
              <button
                onClick={() => setShowCurrencyConverter(false)}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <h3 className="font-bold text-amber-900 mb-3">Equivalencias D&D 5e</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>1 Platino (pp)</span>
                    <span>= 1000 Cobre (cp)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1 Oro (gp)</span>
                    <span>= 100 Cobre (cp)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1 Electrum (ep)</span>
                    <span>= 50 Cobre (cp)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1 Plata (sp)</span>
                    <span>= 10 Cobre (cp)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1 Cobre (cp)</span>
                    <span>= 1 Cobre (cp)</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">Conversión Automática</h3>
                <p className="text-sm text-blue-800">
                  Al realizar una compra, el sistema convertirá automáticamente tus monedas 
                  de mayor denominación si no tienes suficiente de la denominación exacta.
                </p>
              </div>

              {selectedCharacter && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="font-bold text-green-900 mb-2">Tu Dinero Actual</h3>
                  <div className="space-y-1 text-sm">
                    {Object.entries(selectedCharacter.currency).map(([type, amount]) => (
                      <div key={type} className="flex justify-between">
                        <span>{CURRENCY_NAMES[type as keyof Currency]}:</span>
                        <span>{amount} {CURRENCY_SYMBOLS[type as keyof Currency]}</span>
                      </div>
                    ))}
                    <div className="border-t border-green-300 pt-2 mt-2 font-bold">
                      <div className="flex justify-between">
                        <span>Total en Cobre:</span>
                        <span>{currencyToCopper(selectedCharacter.currency)} cp</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowCurrencyConverter(false)}
                className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Modal - Mobile Optimized */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 lg:p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl lg:text-2xl font-bold text-amber-900">Carrito de Compras</h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 lg:w-16 lg:h-16 text-amber-400 mx-auto mb-4" />
                <p className="text-amber-600">Tu carrito está vacío</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map(cartItem => (
                    <div key={cartItem.item.id} className="flex items-center justify-between p-3 lg:p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-amber-900 text-sm lg:text-base truncate">{cartItem.item.name}</h4>
                        <p className="text-xs lg:text-sm text-amber-600">{formatCurrency(cartItem.item.price)} c/u</p>
                      </div>
                      
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <div className="flex items-center space-x-1 lg:space-x-2">
                          <button
                            onClick={() => updateCartQuantity(cartItem.item.id, cartItem.quantity - 1)}
                            className="w-6 h-6 lg:w-8 lg:h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                          >
                            <Minus size={12} className="lg:hidden" />
                            <Minus size={16} className="hidden lg:block" />
                          </button>
                          <span className="w-6 lg:w-8 text-center font-bold text-sm lg:text-base">{cartItem.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(cartItem.item.id, cartItem.quantity + 1)}
                            disabled={cartItem.quantity >= cartItem.item.inStock}
                            className="w-6 h-6 lg:w-8 lg:h-8 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                          >
                            <Plus size={12} className="lg:hidden" />
                            <Plus size={16} className="hidden lg:block" />
                          </button>
                        </div>
                        
                        <div className="text-right min-w-[60px] lg:min-w-[80px]">
                          <div className="font-bold text-amber-900 text-xs lg:text-sm">
                            {formatCurrency(multiplyPrice(cartItem.item.price, cartItem.quantity))}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(cartItem.item.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={14} className="lg:hidden" />
                          <Trash2 size={16} className="hidden lg:block" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-amber-200 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg lg:text-xl font-bold text-amber-900">Total:</span>
                    <span className="text-lg lg:text-xl font-bold text-amber-900">
                      {formatCurrency(calculateCartTotal())}
                    </span>
                  </div>

                  {selectedCharacter && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-amber-700">Tu dinero:</span>
                        <span className="text-amber-800">{formatCurrency(selectedCharacter.currency)}</span>
                      </div>
                      {!canAfford(selectedCharacter, calculateCartTotal()) ? (
                        <div className="flex items-center space-x-2 mt-2 text-red-600 text-sm">
                          <AlertCircle size={16} />
                          <span>No tienes suficiente dinero para esta compra</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 mt-2 text-green-600 text-sm">
                          <Check size={16} />
                          <span>Se convertirán automáticamente las monedas necesarias</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={() => setShowCart(false)}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Continuar Comprando
                    </button>
                    <button
                      onClick={() => {
                        setShowCart(false);
                        setShowCheckout(true);
                      }}
                      disabled={!selectedCharacter || cart.length === 0 || !canAfford(selectedCharacter, calculateCartTotal())}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CreditCard size={18} />
                      <span>Proceder al Pago</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal - Mobile Optimized */}
      {showCheckout && selectedCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 lg:p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl lg:text-2xl font-bold text-amber-900">Confirmar Compra</h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <h3 className="font-bold text-amber-900 mb-2">Resumen de la Compra</h3>
                <div className="space-y-2 text-sm">
                  {cart.map(cartItem => (
                    <div key={cartItem.item.id} className="flex justify-between">
                      <span className="truncate mr-2">{cartItem.item.name} x{cartItem.quantity}</span>
                      <span className="whitespace-nowrap">{formatCurrency(multiplyPrice(cartItem.item.price, cartItem.quantity))}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-amber-300 mt-2 pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateCartTotal())}</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">Información del Comprador</h3>
                <div className="text-sm space-y-1">
                  <div>Personaje: {selectedCharacter.name}</div>
                  <div>Clase: {selectedCharacter.class} Nivel {selectedCharacter.level}</div>
                  <div>Dinero disponible: {formatCurrency(selectedCharacter.currency)}</div>
                  <div>Dinero restante: {formatCurrency(convertCurrencyForPayment(selectedCharacter, calculateCartTotal()))}</div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-bold text-green-900 mb-2">Conversión Automática</h3>
                <p className="text-sm text-green-800">
                  El sistema convertirá automáticamente tus monedas de mayor denominación 
                  para completar la compra si es necesario.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={completePurchase}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Check size={18} />
                  <span>Confirmar Compra</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShopPage;