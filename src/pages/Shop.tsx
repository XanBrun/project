import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Search, Filter, Star, Coins, Package, Eye, X, Check, ArrowLeft, Sword, Shield, Zap, Heart, Book, Gem, Hammer, Bot as Bow, Scroll, Option as Potion, Crown, Target, Feather, Anchor, Compass, Key, Lock, Flame, Snowflake, Wind, Mountain, Waves, Sun, Moon, TreePine } from 'lucide-react';
import { 
  loadShops, saveShop, loadCharacters, loadCharacter, saveCharacter, 
  saveTransaction, generateId 
} from '../services/db';
import { 
  Shop, ShopItem, CartItem, Character, Transaction, Currency,
  CURRENCY_CONVERSION, CURRENCY_NAMES, CURRENCY_SYMBOLS,
  RARITY_COLORS, RARITY_NAMES, CATEGORY_NAMES
} from '../types';

function ShopPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const characterId = searchParams.get('characterId');

  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [rarityFilter, setRarityFilter] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [characterId]);

  const loadData = async () => {
    try {
      let savedShops = await loadShops();
      
      if (!savedShops || savedShops.length === 0) {
        savedShops = await createExampleShops();
      }
      
      setShops(savedShops);
      if (savedShops.length > 0) {
        setSelectedShop(savedShops[0]);
      }

      if (characterId) {
        const char = await loadCharacter(characterId);
        setCharacter(char);
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
        description: "La mejor selección de armas y armaduras forjadas por maestros herreros",
        type: 'weapon_shop',
        location: "Distrito del Mercado",
        keeper: "Thorek Martillo de Hierro",
        discountPercentage: 0,
        reputation: 95,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        items: [
          // Armas Cuerpo a Cuerpo
          {
            id: generateId(),
            name: "Espada Larga",
            description: "Una espada versátil y equilibrada, favorita de muchos aventureros.",
            category: 'weapon',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 15, platinum: 0 },
            weight: 3,
            properties: ["Versátil (1d10)"],
            damage: "1d8 cortante",
            inStock: 8,
            tags: ["espada", "cuerpo a cuerpo", "versátil"]
          },
          {
            id: generateId(),
            name: "Espada Larga +1",
            description: "Una espada larga encantada que brilla con una luz tenue azulada.",
            category: 'magic_item',
            rarity: 'uncommon',
            price: { copper: 0, silver: 0, electrum: 0, gold: 500, platinum: 0 },
            weight: 3,
            properties: ["Versátil (1d10)", "Mágica +1"],
            damage: "1d8+1 cortante",
            inStock: 2,
            tags: ["espada", "mágica", "encantada"]
          },
          {
            id: generateId(),
            name: "Hacha de Batalla",
            description: "Un arma pesada y devastadora para guerreros experimentados.",
            category: 'weapon',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 10, platinum: 0 },
            weight: 4,
            properties: ["Versátil (1d10)"],
            damage: "1d8 cortante",
            inStock: 5,
            tags: ["hacha", "cuerpo a cuerpo", "versátil"]
          },
          {
            id: generateId(),
            name: "Martillo de Guerra",
            description: "Un martillo pesado diseñado para aplastar armaduras.",
            category: 'weapon',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 15, platinum: 0 },
            weight: 2,
            properties: ["Versátil (1d10)"],
            damage: "1d8 contundente",
            inStock: 4,
            tags: ["martillo", "cuerpo a cuerpo", "versátil"]
          },
          {
            id: generateId(),
            name: "Daga",
            description: "Una hoja corta y afilada, perfecta para combate sigiloso.",
            category: 'weapon',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 2, platinum: 0 },
            weight: 1,
            properties: ["Arrojadiza (20/60)", "Sutil", "Ligera"],
            damage: "1d4 perforante",
            inStock: 15,
            tags: ["daga", "ligera", "arrojadiza"]
          },
          {
            id: generateId(),
            name: "Cimitarra",
            description: "Una espada curva y elegante, favorita de duelistas.",
            category: 'weapon',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 25, platinum: 0 },
            weight: 3,
            properties: ["Sutil", "Ligera"],
            damage: "1d6 cortante",
            inStock: 6,
            tags: ["espada", "sutil", "ligera"]
          },
          // Armas a Distancia
          {
            id: generateId(),
            name: "Arco Largo",
            description: "Un arco poderoso con gran alcance y precisión.",
            category: 'weapon',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 50, platinum: 0 },
            weight: 2,
            properties: ["Munición (150/600)", "Pesada", "Dos manos"],
            damage: "1d8 perforante",
            inStock: 4,
            tags: ["arco", "distancia", "dos manos"]
          },
          {
            id: generateId(),
            name: "Ballesta Ligera",
            description: "Una ballesta compacta y fácil de usar.",
            category: 'weapon',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 25, platinum: 0 },
            weight: 5,
            properties: ["Munición (80/320)", "Carga"],
            damage: "1d8 perforante",
            inStock: 3,
            tags: ["ballesta", "distancia", "carga"]
          },
          // Armaduras
          {
            id: generateId(),
            name: "Armadura de Cuero",
            description: "Armadura ligera hecha de cuero endurecido.",
            category: 'armor',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 10, platinum: 0 },
            weight: 10,
            properties: ["Armadura Ligera"],
            armorClass: 11,
            inStock: 6,
            tags: ["armadura", "ligera", "cuero"]
          },
          {
            id: generateId(),
            name: "Armadura de Cuero Tachonado",
            description: "Armadura de cuero reforzada con tachuelas metálicas.",
            category: 'armor',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 45, platinum: 0 },
            weight: 13,
            properties: ["Armadura Ligera"],
            armorClass: 12,
            inStock: 4,
            tags: ["armadura", "ligera", "tachonado"]
          },
          {
            id: generateId(),
            name: "Cota de Malla",
            description: "Armadura hecha de anillos metálicos entrelazados.",
            category: 'armor',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 75, platinum: 0 },
            weight: 20,
            properties: ["Armadura Media"],
            armorClass: 13,
            inStock: 3,
            tags: ["armadura", "media", "malla"]
          },
          {
            id: generateId(),
            name: "Armadura de Placas",
            description: "La mejor protección disponible, hecha de placas de acero.",
            category: 'armor',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 1500, platinum: 0 },
            weight: 65,
            properties: ["Armadura Pesada"],
            armorClass: 18,
            requirements: "Fue 13",
            inStock: 1,
            tags: ["armadura", "pesada", "placas"]
          },
          // Escudos
          {
            id: generateId(),
            name: "Escudo",
            description: "Un escudo de madera reforzado con metal.",
            category: 'shield',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 10, platinum: 0 },
            weight: 6,
            properties: ["+2 CA"],
            armorClass: 2,
            inStock: 8,
            tags: ["escudo", "defensa", "madera"]
          }
        ]
      },
      {
        id: generateId(),
        name: "Pociones y Pergaminos de Elara",
        description: "Objetos mágicos, pociones curativas y pergaminos de hechizos",
        type: 'magic_shop',
        location: "Torre de los Magos",
        keeper: "Elara Lunaverde",
        discountPercentage: 5,
        reputation: 88,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        items: [
          // Pociones
          {
            id: generateId(),
            name: "Poción de Curación",
            description: "Una poción roja que restaura 2d4+2 puntos de vida.",
            category: 'consumable',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 50, platinum: 0 },
            weight: 0.5,
            properties: ["Curación 2d4+2", "Acción para beber"],
            inStock: 12,
            tags: ["poción", "curación", "consumible"]
          },
          {
            id: generateId(),
            name: "Poción de Curación Mayor",
            description: "Una poción carmesí que restaura 4d4+4 puntos de vida.",
            category: 'consumable',
            rarity: 'uncommon',
            price: { copper: 0, silver: 0, electrum: 0, gold: 150, platinum: 0 },
            weight: 0.5,
            properties: ["Curación 4d4+4", "Acción para beber"],
            inStock: 6,
            tags: ["poción", "curación", "mayor"]
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
            tags: ["poción", "fuerza", "mejora"]
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
            tags: ["poción", "invisibilidad", "sigilo"]
          },
          // Pergaminos
          {
            id: generateId(),
            name: "Pergamino de Misiles Mágicos",
            description: "Pergamino que contiene el hechizo Misiles Mágicos (1er nivel).",
            category: 'consumable',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 25, platinum: 0 },
            weight: 0,
            properties: ["Hechizo nivel 1", "Un uso"],
            inStock: 8,
            tags: ["pergamino", "hechizo", "daño"]
          },
          {
            id: generateId(),
            name: "Pergamino de Curar Heridas",
            description: "Pergamino que contiene el hechizo Curar Heridas (1er nivel).",
            category: 'consumable',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 25, platinum: 0 },
            weight: 0,
            properties: ["Hechizo nivel 1", "Un uso"],
            inStock: 10,
            tags: ["pergamino", "curación", "divino"]
          },
          {
            id: generateId(),
            name: "Pergamino de Bola de Fuego",
            description: "Pergamino que contiene el hechizo Bola de Fuego (3er nivel).",
            category: 'consumable',
            rarity: 'uncommon',
            price: { copper: 0, silver: 0, electrum: 0, gold: 150, platinum: 0 },
            weight: 0,
            properties: ["Hechizo nivel 3", "Un uso"],
            inStock: 3,
            tags: ["pergamino", "fuego", "área"]
          },
          // Objetos Mágicos
          {
            id: generateId(),
            name: "Varita de Misiles Mágicos",
            description: "Varita con 7 cargas que se regeneran al amanecer.",
            category: 'magic_item',
            rarity: 'uncommon',
            price: { copper: 0, silver: 0, electrum: 0, gold: 800, platinum: 0 },
            weight: 1,
            properties: ["7 cargas", "Regenera 1d6+1 al amanecer"],
            inStock: 2,
            tags: ["varita", "mágica", "cargas"]
          },
          {
            id: generateId(),
            name: "Anillo de Protección",
            description: "Otorga +1 a CA y tiradas de salvación.",
            category: 'magic_item',
            rarity: 'rare',
            price: { copper: 0, silver: 0, electrum: 0, gold: 2000, platinum: 0 },
            weight: 0,
            properties: ["+1 CA", "+1 Salvaciones"],
            inStock: 1,
            tags: ["anillo", "protección", "defensa"]
          },
          {
            id: generateId(),
            name: "Capa de Élfico",
            description: "Otorga ventaja en tiradas de Sigilo.",
            category: 'magic_item',
            rarity: 'uncommon',
            price: { copper: 0, silver: 0, electrum: 0, gold: 600, platinum: 0 },
            weight: 1,
            properties: ["Ventaja en Sigilo"],
            inStock: 2,
            tags: ["capa", "sigilo", "élfico"]
          },
          {
            id: generateId(),
            name: "Botas de Velocidad",
            description: "Duplica tu velocidad durante 10 minutos (1 vez por día).",
            category: 'magic_item',
            rarity: 'rare',
            price: { copper: 0, silver: 0, electrum: 0, gold: 1500, platinum: 0 },
            weight: 1,
            properties: ["Velocidad x2", "10 min/día"],
            inStock: 1,
            tags: ["botas", "velocidad", "movimiento"]
          },
          // Componentes Mágicos
          {
            id: generateId(),
            name: "Polvo de Diamante",
            description: "Componente material para hechizos de resurrección.",
            category: 'trade_good',
            rarity: 'rare',
            price: { copper: 0, silver: 0, electrum: 0, gold: 300, platinum: 0 },
            weight: 0,
            properties: ["Componente material", "300 gp de valor"],
            inStock: 3,
            tags: ["componente", "diamante", "resurrección"]
          },
          {
            id: generateId(),
            name: "Perla",
            description: "Componente material para el hechizo Identificar.",
            category: 'trade_good',
            rarity: 'uncommon',
            price: { copper: 0, silver: 0, electrum: 0, gold: 100, platinum: 0 },
            weight: 0,
            properties: ["Componente material", "100 gp de valor"],
            inStock: 5,
            tags: ["componente", "perla", "identificar"]
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
          // Equipo de Aventura
          {
            id: generateId(),
            name: "Mochila",
            description: "Una mochila resistente para llevar tu equipo.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 2, platinum: 0 },
            weight: 5,
            properties: ["Capacidad 30 libras"],
            inStock: 20,
            tags: ["mochila", "almacenamiento", "equipo"]
          },
          {
            id: generateId(),
            name: "Cuerda de Cáñamo (50 pies)",
            description: "Cuerda resistente de 50 pies de longitud.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 2, platinum: 0 },
            weight: 10,
            properties: ["50 pies", "Resistente"],
            inStock: 15,
            tags: ["cuerda", "escalada", "utilidad"]
          },
          {
            id: generateId(),
            name: "Antorcha",
            description: "Proporciona luz brillante en un radio de 20 pies.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 1, silver: 0, electrum: 0, gold: 0, platinum: 0 },
            weight: 1,
            properties: ["Luz 20 pies", "Duración 1 hora"],
            inStock: 50,
            tags: ["antorcha", "luz", "fuego"]
          },
          {
            id: generateId(),
            name: "Linterna Sorda",
            description: "Linterna que proyecta luz en un cono de 60 pies.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 5, platinum: 0 },
            weight: 2,
            properties: ["Luz cónica 60 pies", "Requiere aceite"],
            inStock: 8,
            tags: ["linterna", "luz", "aceite"]
          },
          {
            id: generateId(),
            name: "Aceite (frasco)",
            description: "Aceite para linternas o como arma improvisada.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 1, electrum: 0, gold: 0, platinum: 0 },
            weight: 1,
            properties: ["Combustible", "Arrojadiza"],
            inStock: 25,
            tags: ["aceite", "combustible", "linterna"]
          },
          {
            id: generateId(),
            name: "Raciones (1 día)",
            description: "Comida seca que se conserva bien durante viajes.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 2, electrum: 0, gold: 0, platinum: 0 },
            weight: 2,
            properties: ["Alimenta 1 día"],
            inStock: 40,
            tags: ["comida", "raciones", "supervivencia"]
          },
          {
            id: generateId(),
            name: "Odre",
            description: "Recipiente para transportar agua u otros líquidos.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 2, electrum: 0, gold: 0, platinum: 0 },
            weight: 5,
            properties: ["Capacidad 4 pintas"],
            inStock: 12,
            tags: ["odre", "agua", "líquidos"]
          },
          {
            id: generateId(),
            name: "Saco de Dormir",
            description: "Saco cómodo para dormir al aire libre.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 5, electrum: 0, gold: 0, platinum: 0 },
            weight: 7,
            properties: ["Cómodo", "Resistente al clima"],
            inStock: 10,
            tags: ["saco", "dormir", "descanso"]
          },
          // Herramientas
          {
            id: generateId(),
            name: "Herramientas de Ladrón",
            description: "Conjunto de ganzúas y herramientas para abrir cerraduras.",
            category: 'tool',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 25, platinum: 0 },
            weight: 1,
            properties: ["Competencia requerida"],
            inStock: 5,
            tags: ["herramientas", "ladrón", "cerraduras"]
          },
          {
            id: generateId(),
            name: "Kit de Herborista",
            description: "Herramientas para identificar y usar plantas medicinales.",
            category: 'tool',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 5, platinum: 0 },
            weight: 3,
            properties: ["Competencia requerida"],
            inStock: 6,
            tags: ["herramientas", "herborista", "plantas"]
          },
          {
            id: generateId(),
            name: "Kit de Sanador",
            description: "Vendas, ungüentos y férulas para primeros auxilios.",
            category: 'tool',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 5, platinum: 0 },
            weight: 3,
            properties: ["10 usos", "Estabiliza moribundos"],
            inStock: 8,
            tags: ["sanador", "curación", "primeros auxilios"]
          },
          {
            id: generateId(),
            name: "Herramientas de Artesano (Herrero)",
            description: "Herramientas especializadas para trabajar el metal.",
            category: 'tool',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 20, platinum: 0 },
            weight: 8,
            properties: ["Competencia requerida"],
            inStock: 3,
            tags: ["herramientas", "herrero", "metal"]
          },
          // Munición
          {
            id: generateId(),
            name: "Flechas (20)",
            description: "Flechas de calidad para arcos largos y cortos.",
            category: 'ammunition',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 1, platinum: 0 },
            weight: 1,
            properties: ["20 flechas"],
            inStock: 30,
            tags: ["flechas", "munición", "arco"]
          },
          {
            id: generateId(),
            name: "Virotes de Ballesta (20)",
            description: "Virotes para ballestas ligeras y pesadas.",
            category: 'ammunition',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 1, platinum: 0 },
            weight: 1.5,
            properties: ["20 virotes"],
            inStock: 25,
            tags: ["virotes", "munición", "ballesta"]
          },
          {
            id: generateId(),
            name: "Balas de Honda (20)",
            description: "Proyectiles de plomo para hondas.",
            category: 'ammunition',
            rarity: 'common',
            price: { copper: 4, silver: 0, electrum: 0, gold: 0, platinum: 0 },
            weight: 1.5,
            properties: ["20 balas"],
            inStock: 20,
            tags: ["balas", "munición", "honda"]
          },
          // Objetos Diversos
          {
            id: generateId(),
            name: "Espejo de Acero",
            description: "Espejo pulido útil para señales o ver alrededor de esquinas.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 5, platinum: 0 },
            weight: 0.5,
            properties: ["Reflectante", "Señales"],
            inStock: 6,
            tags: ["espejo", "señales", "utilidad"]
          },
          {
            id: generateId(),
            name: "Cadena (10 pies)",
            description: "Cadena de hierro resistente.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 5, platinum: 0 },
            weight: 10,
            properties: ["10 pies", "Hierro resistente"],
            inStock: 4,
            tags: ["cadena", "hierro", "restricción"]
          },
          {
            id: generateId(),
            name: "Candado",
            description: "Candado de hierro con llave.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 10, platinum: 0 },
            weight: 1,
            properties: ["Incluye llave", "CD 15 para forzar"],
            inStock: 8,
            tags: ["candado", "seguridad", "llave"]
          },
          {
            id: generateId(),
            name: "Pergamino en Blanco",
            description: "Pergamino de calidad para escribir hechizos o mapas.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 1, electrum: 0, gold: 0, platinum: 0 },
            weight: 0,
            properties: ["Calidad escribano"],
            inStock: 15,
            tags: ["pergamino", "escritura", "mapas"]
          },
          {
            id: generateId(),
            name: "Tinta y Pluma",
            description: "Tinta negra y pluma para escribir.",
            category: 'adventuring_gear',
            rarity: 'common',
            price: { copper: 0, silver: 0, electrum: 0, gold: 2, platinum: 0 },
            weight: 0,
            properties: ["Suficiente para muchas páginas"],
            inStock: 12,
            tags: ["tinta", "pluma", "escritura"]
          }
        ]
      }
    ];

    // Guardar las tiendas de ejemplo
    for (const shop of exampleShops) {
      await saveShop(shop);
    }

    return exampleShops;
  };

  const addToCart = (item: ShopItem) => {
    const existingItem = cart.find(cartItem => cartItem.item.id === item.id);
    
    if (existingItem) {
      if (existingItem.quantity < item.inStock) {
        setCart(cart.map(cartItem =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        ));
      }
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(cartItem => cartItem.item.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const item = cart.find(cartItem => cartItem.item.id === itemId);
    if (item && quantity <= item.item.inStock) {
      setCart(cart.map(cartItem =>
        cartItem.item.id === itemId
          ? { ...cartItem, quantity }
          : cartItem
      ));
    }
  };

  const calculateTotal = (): Currency => {
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
    if (!character || cart.length === 0) return;

    const total = calculateTotal();
    
    if (!canAfford(total, character.currency)) {
      alert('No tienes suficiente dinero para esta compra');
      return;
    }

    try {
      // Deduct currency from character
      const newCurrency = deductCurrency(character.currency, total);
      
      // Add items to character's equipment
      const newEquipment = [...character.equipment];
      cart.forEach(cartItem => {
        for (let i = 0; i < cartItem.quantity; i++) {
          newEquipment.push(cartItem.item.name);
        }
      });

      // Update character
      const updatedCharacter = {
        ...character,
        currency: newCurrency,
        equipment: newEquipment,
        updatedAt: Date.now()
      };

      await saveCharacter(updatedCharacter);
      setCharacter(updatedCharacter);

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
        setShops(shops.map(shop => shop.id === updatedShop.id ? updatedShop : shop));
      }

      // Save transaction
      const transaction: Transaction = {
        id: generateId(),
        characterId: character.id,
        shopId: selectedShop?.id || '',
        items: cart,
        totalCost: total,
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

  const getItemIcon = (category: string) => {
    const icons: Record<string, any> = {
      weapon: Sword,
      armor: Shield,
      shield: Shield,
      magic_item: Zap,
      consumable: Potion,
      tool: Hammer,
      adventuring_gear: Package,
      ammunition: Target,
      trade_good: Gem,
      treasure: Crown
    };
    return icons[category] || Package;
  };

  const filteredItems = selectedShop?.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesRarity = !rarityFilter || item.rarity === rarityFilter;
    
    return matchesSearch && matchesCategory && matchesRarity && item.inStock > 0;
  }) || [];

  const getUniqueCategories = () => {
    if (!selectedShop) return [];
    const categories = [...new Set(selectedShop.items.map(item => item.category))];
    return categories.sort();
  };

  const getUniqueRarities = () => {
    if (!selectedShop) return [];
    const rarities = [...new Set(selectedShop.items.map(item => item.rarity))];
    return rarities.sort();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-amber-700 hover:text-amber-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Volver</span>
            </button>
            <ShoppingCart className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-amber-900">Tienda de Aventureros</h1>
              <p className="text-amber-700">Equípate para tus próximas aventuras</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {character && (
              <div className="bg-amber-100 rounded-lg p-3 border border-amber-300">
                <div className="text-sm font-medium text-amber-900">{character.name}</div>
                <div className="text-xs text-amber-700">
                  {formatPrice(character.currency)}
                </div>
              </div>
            )}
            
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              <ShoppingCart size={18} />
              <span>Carrito</span>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Shop Selection */}
        <div className="flex items-center space-x-4 mb-4">
          <select
            value={selectedShop?.id || ''}
            onChange={(e) => {
              const shop = shops.find(s => s.id === e.target.value);
              setSelectedShop(shop || null);
            }}
            className="flex-1 p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Seleccionar tienda...</option>
            {shops.map(shop => (
              <option key={shop.id} value={shop.id}>
                {shop.name} - {shop.location}
              </option>
            ))}
          </select>
        </div>

        {selectedShop && (
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-amber-900">{selectedShop.name}</h2>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-amber-700">{selectedShop.reputation}% reputación</span>
              </div>
            </div>
            <p className="text-amber-700 mb-2">{selectedShop.description}</p>
            <div className="flex items-center justify-between text-sm text-amber-600">
              <span>📍 {selectedShop.location}</span>
              <span>👤 {selectedShop.keeper}</span>
              {selectedShop.discountPercentage > 0 && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {selectedShop.discountPercentage}% descuento
                </span>
              )}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" size={18} />
              <input
                type="text"
                placeholder="Buscar objetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              {getUniqueCategories().map(category => (
                <option key={category} value={category}>
                  {CATEGORY_NAMES[category as keyof typeof CATEGORY_NAMES] || category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value)}
              className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Todas las rarezas</option>
              {getUniqueRarities().map(rarity => (
                <option key={rarity} value={rarity}>
                  {RARITY_NAMES[rarity as keyof typeof RARITY_NAMES] || rarity}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {selectedShop && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
          <h2 className="text-2xl font-bold text-amber-900 mb-6">
            Objetos Disponibles ({filteredItems.length})
          </h2>
          
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <p className="text-amber-600 text-lg">No hay objetos disponibles</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map(item => {
                const ItemIcon = getItemIcon(item.category);
                const isInCart = cart.some(cartItem => cartItem.item.id === item.id);
                const cartQuantity = cart.find(cartItem => cartItem.item.id === item.id)?.quantity || 0;
                
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl p-4 border-2 shadow-sm hover:shadow-md transition-all ${
                      RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS]
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <ItemIcon className="w-5 h-5 text-amber-600" />
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.rarity === 'common' ? 'bg-gray-100 text-gray-800' :
                          item.rarity === 'uncommon' ? 'bg-green-100 text-green-800' :
                          item.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                          item.rarity === 'very_rare' ? 'bg-purple-100 text-purple-800' :
                          item.rarity === 'legendary' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {RARITY_NAMES[item.rarity as keyof typeof RARITY_NAMES]}
                        </span>
                      </div>
                      <span className="text-xs text-amber-600">Stock: {item.inStock}</span>
                    </div>

                    <h3 className="font-bold text-amber-900 mb-2">{item.name}</h3>
                    <p className="text-sm text-amber-700 mb-3 line-clamp-2">{item.description}</p>

                    {item.damage && (
                      <div className="text-xs text-red-600 mb-2">
                        <strong>Daño:</strong> {item.damage}
                      </div>
                    )}

                    {item.armorClass && (
                      <div className="text-xs text-blue-600 mb-2">
                        <strong>CA:</strong> {item.armorClass}
                      </div>
                    )}

                    {item.properties.length > 0 && (
                      <div className="text-xs text-amber-600 mb-3">
                        <strong>Propiedades:</strong> {item.properties.join(', ')}
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-bold text-green-700">
                        {formatPrice(item.price)}
                      </div>
                      <div className="text-xs text-amber-600">
                        {item.weight > 0 && `${item.weight} lb`}
                      </div>
                    </div>

                    {isInCart ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQuantity(item.id, cartQuantity - 1)}
                            className="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                          >
                            -
                          </button>
                          <span className="font-bold text-amber-900">{cartQuantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, cartQuantity + 1)}
                            disabled={cartQuantity >= item.inStock}
                            className="w-6 h-6 bg-green-500 text-white rounded-full text-xs hover:bg-green-600 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        disabled={item.inStock === 0}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus size={16} />
                        <span>Agregar</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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
                        <p className="text-sm text-amber-700">{formatPrice(cartItem.item.price)} c/u</p>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQuantity(cartItem.item.id, cartItem.quantity - 1)}
                            className="w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                          >
                            -
                          </button>
                          <span className="font-bold text-amber-900 min-w-[2rem] text-center">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(cartItem.item.id, cartItem.quantity + 1)}
                            disabled={cartItem.quantity >= cartItem.item.inStock}
                            className="w-6 h-6 bg-green-500 text-white rounded-full text-xs hover:bg-green-600 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="text-sm font-bold text-green-700 min-w-[4rem] text-right">
                          {formatPrice(multiplyPrice(cartItem.item.price, cartItem.quantity))}
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(cartItem.item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-amber-200 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-amber-900">Total:</span>
                    <span className="text-lg font-bold text-green-700">
                      {formatPrice(calculateTotal())}
                    </span>
                  </div>

                  {character && (
                    <div className="mb-4">
                      <div className="text-sm text-amber-700 mb-2">Tu dinero:</div>
                      <div className="text-sm font-medium text-amber-900">
                        {formatPrice(character.currency)}
                      </div>
                      {!canAfford(calculateTotal(), character.currency) && (
                        <div className="text-sm text-red-600 mt-1">
                          No tienes suficiente dinero
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowCart(false)}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Seguir Comprando
                    </button>
                    <button
                      onClick={() => {
                        setShowCart(false);
                        setShowCheckout(true);
                      }}
                      disabled={!character || cart.length === 0 || !canAfford(calculateTotal(), character.currency)}
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-amber-900">Confirmar Compra</h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <h3 className="font-bold text-amber-900 mb-2">Resumen de Compra</h3>
                <div className="space-y-2">
                  {cart.map(cartItem => (
                    <div key={cartItem.item.id} className="flex justify-between text-sm">
                      <span>{cartItem.item.name} x{cartItem.quantity}</span>
                      <span>{formatPrice(multiplyPrice(cartItem.item.price, cartItem.quantity))}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-amber-300 mt-2 pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
              </div>

              {character && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-2">Tu Dinero</h3>
                  <div className="text-sm">
                    <div>Antes: {formatPrice(character.currency)}</div>
                    <div>Después: {formatPrice(deductCurrency(character.currency, calculateTotal()))}</div>
                  </div>
                </div>
              )}
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
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check size={18} />
                <span>Confirmar Compra</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShopPage;