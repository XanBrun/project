import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Search, Filter, Star, Coins, Package, User, ArrowLeft, Check, X, Eye, EyeOff, Sword, Shield, Zap, Wrench, Users as Horse, Truck, Hammer, Gem, Scroll, Target } from 'lucide-react';
import { 
  loadShops, saveShop, loadCharacters, loadCharacter, saveCharacter, 
  saveTransaction, generateId 
} from '../services/db';
import { 
  Shop, ShopItem, CartItem, Character, Transaction, Currency,
  CURRENCY_CONVERSION, CURRENCY_NAMES, CURRENCY_SYMBOLS, RARITY_COLORS, RARITY_NAMES, CATEGORY_NAMES
} from '../types';

function ShopPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [shops, setShops] = useState<Shop[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
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
    const characterId = searchParams.get('characterId');
    if (characterId && characters.length > 0) {
      const character = characters.find(c => c.id === characterId);
      if (character) {
        setSelectedCharacter(character);
      }
    }
  }, [searchParams, characters]);

  const loadData = async () => {
    try {
      const [shopsData, charactersData] = await Promise.all([
        loadShops(),
        loadCharacters()
      ]);

      if (shopsData.length === 0) {
        await createExampleShops();
      } else {
        setShops(shopsData);
        if (shopsData.length > 0) {
          setSelectedShop(shopsData[0]);
        }
      }

      setCharacters(charactersData);
    } catch (error) {
      console.error('Error loading shop data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createExampleShops = async () => {
    const exampleShops: Shop[] = [
      {
        id: generateId(),
        name: "Armería del Dragón de Hierro",
        description: "La mejor selección de armas y armaduras forjadas por maestros herreros",
        type: "weapon_shop",
        location: "Plaza del Mercado",
        keeper: "Thorin Martillo de Hierro",
        discountPercentage: 0,
        reputation: 95,
        items: [
          {
            id: generateId(),
            name: "Espada Larga",
            description: "Una espada versátil de una mano con hoja recta y doble filo",
            category: "weapon",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 15, platinum: 0 },
            weight: 3,
            properties: ["Versátil (1d10)"],
            damage: "1d8 cortante",
            inStock: 8,
            tags: ["espada", "una mano", "versátil"]
          },
          {
            id: generateId(),
            name: "Espada Larga +1",
            description: "Una espada larga mágica con encantamientos de precisión",
            category: "weapon",
            rarity: "uncommon",
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
            description: "Un hacha pesada de dos manos perfecta para guerreros",
            category: "weapon",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 10, platinum: 0 },
            weight: 4,
            properties: ["Dos manos", "Pesada"],
            damage: "1d12 cortante",
            inStock: 5,
            tags: ["hacha", "dos manos", "pesada"]
          },
          {
            id: generateId(),
            name: "Arco Largo",
            description: "Arco de madera élfica para arqueros expertos",
            category: "weapon",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 50, platinum: 0 },
            weight: 2,
            properties: ["Dos manos", "Munición", "Pesada", "Alcance (150/600)"],
            damage: "1d8 perforante",
            inStock: 6,
            tags: ["arco", "distancia", "élfico"]
          },
          {
            id: generateId(),
            name: "Armadura de Cuero",
            description: "Armadura ligera hecha de cuero endurecido",
            category: "armor",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 10, platinum: 0 },
            weight: 10,
            properties: ["Ligera"],
            armorClass: 11,
            inStock: 10,
            tags: ["armadura", "ligera", "cuero"]
          },
          {
            id: generateId(),
            name: "Cota de Malla",
            description: "Armadura media de anillos entrelazados",
            category: "armor",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 75, platinum: 0 },
            weight: 20,
            properties: ["Media"],
            armorClass: 13,
            inStock: 4,
            tags: ["armadura", "media", "malla"]
          },
          {
            id: generateId(),
            name: "Escudo",
            description: "Escudo de madera reforzado con metal",
            category: "shield",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 10, platinum: 0 },
            weight: 6,
            properties: ["+2 CA"],
            armorClass: 2,
            inStock: 8,
            tags: ["escudo", "defensa", "madera"]
          }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        name: "Pociones y Pergaminos de Elara",
        description: "Objetos mágicos, pociones curativas y pergaminos de hechizos",
        type: "magic_shop",
        location: "Distrito Mágico",
        keeper: "Elara Lunaverde",
        discountPercentage: 5,
        reputation: 88,
        items: [
          {
            id: generateId(),
            name: "Poción de Curación",
            description: "Restaura 2d4+2 puntos de vida al consumirla",
            category: "consumable",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 50, platinum: 0 },
            weight: 0.5,
            properties: ["Consumible", "Curación"],
            inStock: 15,
            tags: ["poción", "curación", "salud"]
          },
          {
            id: generateId(),
            name: "Poción de Curación Mayor",
            description: "Restaura 4d4+4 puntos de vida al consumirla",
            category: "consumable",
            rarity: "uncommon",
            price: { copper: 0, silver: 0, electrum: 0, gold: 200, platinum: 0 },
            weight: 0.5,
            properties: ["Consumible", "Curación Mayor"],
            inStock: 8,
            tags: ["poción", "curación", "mayor"]
          },
          {
            id: generateId(),
            name: "Varita de Misiles Mágicos",
            description: "Varita con 7 cargas que lanza misiles mágicos",
            category: "magic_item",
            rarity: "uncommon",
            price: { copper: 0, silver: 0, electrum: 0, gold: 800, platinum: 0 },
            weight: 1,
            properties: ["Varita", "7 cargas", "Recarga al amanecer"],
            inStock: 3,
            tags: ["varita", "misiles", "mágico"]
          },
          {
            id: generateId(),
            name: "Pergamino de Curar Heridas",
            description: "Pergamino que contiene el hechizo Curar Heridas",
            category: "consumable",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 25, platinum: 0 },
            weight: 0,
            properties: ["Pergamino", "Nivel 1", "Un uso"],
            inStock: 12,
            tags: ["pergamino", "curación", "hechizo"]
          },
          {
            id: generateId(),
            name: "Anillo de Protección",
            description: "Anillo que otorga +1 a CA y tiradas de salvación",
            category: "magic_item",
            rarity: "rare",
            price: { copper: 0, silver: 0, electrum: 0, gold: 2000, platinum: 0 },
            weight: 0,
            properties: ["+1 CA", "+1 Salvaciones", "Requiere Sintonización"],
            inStock: 1,
            tags: ["anillo", "protección", "sintonización"]
          },
          {
            id: generateId(),
            name: "Polvo de Diamante",
            description: "Componente material para hechizos de resurrección",
            category: "consumable",
            rarity: "rare",
            price: { copper: 0, silver: 0, electrum: 0, gold: 300, platinum: 0 },
            weight: 0,
            properties: ["Componente Material", "300 gp de valor"],
            inStock: 5,
            tags: ["componente", "diamante", "resurrección"]
          }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        name: "Suministros del Aventurero",
        description: "Todo lo que necesitas para tus aventuras: equipo, herramientas y suministros",
        type: "general_store",
        location: "Entrada de la Ciudad",
        keeper: "Marcus Bolsaverde",
        discountPercentage: 10,
        reputation: 92,
        items: [
          {
            id: generateId(),
            name: "Mochila",
            description: "Mochila de cuero resistente con múltiples compartimentos",
            category: "adventuring_gear",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 2, platinum: 0 },
            weight: 5,
            properties: ["Capacidad 30 libras"],
            inStock: 20,
            tags: ["mochila", "equipo", "almacenamiento"]
          },
          {
            id: generateId(),
            name: "Cuerda de Cáñamo (50 pies)",
            description: "Cuerda resistente de cáñamo trenzado",
            category: "adventuring_gear",
            rarity: "common",
            price: { copper: 0, silver: 20, electrum: 0, gold: 0, platinum: 0 },
            weight: 10,
            properties: ["50 pies", "Resistente"],
            inStock: 15,
            tags: ["cuerda", "escalada", "utilidad"]
          },
          {
            id: generateId(),
            name: "Kit de Ladrón",
            description: "Herramientas especializadas para abrir cerraduras",
            category: "tool",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 25, platinum: 0 },
            weight: 1,
            properties: ["Competencia en Herramientas"],
            inStock: 6,
            tags: ["herramientas", "ladrón", "cerraduras"]
          },
          {
            id: generateId(),
            name: "Raciones (1 día)",
            description: "Comida seca que se conserva durante viajes largos",
            category: "consumable",
            rarity: "common",
            price: { copper: 0, silver: 20, electrum: 0, gold: 0, platinum: 0 },
            weight: 2,
            properties: ["Alimenta 1 día"],
            inStock: 50,
            tags: ["comida", "ración", "viaje"]
          },
          {
            id: generateId(),
            name: "Antorcha",
            description: "Antorcha de madera que proporciona luz brillante",
            category: "adventuring_gear",
            rarity: "common",
            price: { copper: 1, silver: 0, electrum: 0, gold: 0, platinum: 0 },
            weight: 1,
            properties: ["Luz brillante 20 pies", "Dura 1 hora"],
            inStock: 100,
            tags: ["luz", "antorcha", "fuego"]
          },
          {
            id: generateId(),
            name: "Flechas (20)",
            description: "Flechas de madera con puntas de hierro",
            category: "ammunition",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 1, platinum: 0 },
            weight: 1,
            properties: ["Munición para arcos"],
            inStock: 30,
            tags: ["flechas", "munición", "arco"]
          }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        name: "Herrería de Vulcano",
        description: "Forja especializada en armas y armaduras de alta calidad",
        type: "blacksmith",
        location: "Distrito de Artesanos",
        keeper: "Vulcano Forjahierro",
        discountPercentage: 0,
        reputation: 98,
        items: [
          {
            id: generateId(),
            name: "Martillo de Guerra",
            description: "Martillo pesado forjado para el combate",
            category: "weapon",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 15, platinum: 0 },
            weight: 2,
            properties: ["Versátil (1d10)"],
            damage: "1d8 contundente",
            inStock: 6,
            tags: ["martillo", "guerra", "versátil"]
          },
          {
            id: generateId(),
            name: "Armadura de Placas",
            description: "La mejor protección disponible, armadura completa de placas",
            category: "armor",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 1500, platinum: 0 },
            weight: 65,
            properties: ["Pesada"],
            armorClass: 18,
            requirements: "Fuerza 15",
            inStock: 2,
            tags: ["armadura", "placas", "pesada"]
          },
          {
            id: generateId(),
            name: "Daga Maestra",
            description: "Daga perfectamente balanceada por un maestro herrero",
            category: "weapon",
            rarity: "uncommon",
            price: { copper: 0, silver: 0, electrum: 0, gold: 100, platinum: 0 },
            weight: 1,
            properties: ["Sutil", "Arrojadiza (20/60)", "Ligera"],
            damage: "1d4+1 perforante",
            inStock: 4,
            tags: ["daga", "maestra", "sutil"]
          },
          {
            id: generateId(),
            name: "Herramientas de Herrero",
            description: "Conjunto completo de herramientas para trabajar el metal",
            category: "tool",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 20, platinum: 0 },
            weight: 8,
            properties: ["Competencia en Herramientas"],
            inStock: 8,
            tags: ["herramientas", "herrero", "metal"]
          },
          {
            id: generateId(),
            name: "Yunque Portátil",
            description: "Yunque pequeño para reparaciones en el campo",
            category: "tool",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 50, platinum: 0 },
            weight: 25,
            properties: ["Reparaciones básicas"],
            inStock: 3,
            tags: ["yunque", "reparación", "portátil"]
          }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        name: "Establos de Rocinante",
        description: "Monturas, carros y todo lo necesario para viajar",
        type: "market",
        location: "Afueras de la Ciudad",
        keeper: "Elena Riendaveloz",
        discountPercentage: 15,
        reputation: 85,
        items: [
          {
            id: generateId(),
            name: "Caballo de Montar",
            description: "Caballo entrenado para montar, dócil y resistente",
            category: "mount",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 75, platinum: 0 },
            weight: 0,
            properties: ["Velocidad 60 pies", "Capacidad de carga 480 lb"],
            inStock: 8,
            tags: ["caballo", "montura", "viaje"]
          },
          {
            id: generateId(),
            name: "Caballo de Guerra",
            description: "Caballo entrenado para el combate, valiente y fuerte",
            category: "mount",
            rarity: "uncommon",
            price: { copper: 0, silver: 0, electrum: 0, gold: 400, platinum: 0 },
            weight: 0,
            properties: ["Velocidad 60 pies", "Entrenado para combate", "Capacidad 540 lb"],
            inStock: 3,
            tags: ["caballo", "guerra", "combate"]
          },
          {
            id: generateId(),
            name: "Poni",
            description: "Poni pequeño, ideal para halflings y gnomos",
            category: "mount",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 30, platinum: 0 },
            weight: 0,
            properties: ["Velocidad 40 pies", "Capacidad de carga 225 lb"],
            inStock: 6,
            tags: ["poni", "pequeño", "halfling"]
          },
          {
            id: generateId(),
            name: "Carro",
            description: "Carro de dos ruedas tirado por caballos",
            category: "vehicle",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 15, platinum: 0 },
            weight: 200,
            properties: ["Capacidad 1000 lb", "Requiere animal de tiro"],
            inStock: 4,
            tags: ["carro", "transporte", "carga"]
          },
          {
            id: generateId(),
            name: "Carreta",
            description: "Carreta grande de cuatro ruedas para cargas pesadas",
            category: "vehicle",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 35, platinum: 0 },
            weight: 400,
            properties: ["Capacidad 2000 lb", "Requiere 2 animales de tiro"],
            inStock: 2,
            tags: ["carreta", "pesada", "comercio"]
          },
          {
            id: generateId(),
            name: "Silla de Montar",
            description: "Silla de cuero cómoda para viajes largos",
            category: "adventuring_gear",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 10, platinum: 0 },
            weight: 25,
            properties: ["Comodidad en viajes largos"],
            inStock: 12,
            tags: ["silla", "montar", "comodidad"]
          },
          {
            id: generateId(),
            name: "Alforjas",
            description: "Bolsas que se cuelgan a los lados de la montura",
            category: "adventuring_gear",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 4, platinum: 0 },
            weight: 8,
            properties: ["Capacidad adicional 60 lb"],
            inStock: 15,
            tags: ["alforjas", "almacenamiento", "montura"]
          }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: generateId(),
        name: "Joyería de Gemas Brillantes",
        description: "Joyas finas, gemas preciosas y objetos de valor",
        type: "jeweler",
        location: "Distrito Noble",
        keeper: "Madame Esmeralda",
        discountPercentage: 0,
        reputation: 90,
        items: [
          {
            id: generateId(),
            name: "Anillo de Oro",
            description: "Anillo de oro puro finamente trabajado",
            category: "treasure",
            rarity: "common",
            price: { copper: 0, silver: 0, electrum: 0, gold: 25, platinum: 0 },
            weight: 0,
            properties: ["Objeto de valor"],
            inStock: 10,
            tags: ["anillo", "oro", "joya"]
          },
          {
            id: generateId(),
            name: "Collar de Perlas",
            description: "Collar con perlas del mar del norte",
            category: "treasure",
            rarity: "uncommon",
            price: { copper: 0, silver: 0, electrum: 0, gold: 100, platinum: 0 },
            weight: 0,
            properties: ["Objeto de valor", "Perlas genuinas"],
            inStock: 5,
            tags: ["collar", "perlas", "mar"]
          },
          {
            id: generateId(),
            name: "Rubí",
            description: "Gema roja de gran pureza y belleza",
            category: "treasure",
            rarity: "rare",
            price: { copper: 0, silver: 0, electrum: 0, gold: 500, platinum: 0 },
            weight: 0,
            properties: ["Gema preciosa", "500 gp de valor"],
            inStock: 3,
            tags: ["rubí", "gema", "preciosa"]
          },
          {
            id: generateId(),
            name: "Diamante",
            description: "La gema más dura y brillante conocida",
            category: "treasure",
            rarity: "very_rare",
            price: { copper: 0, silver: 0, electrum: 0, gold: 1000, platinum: 0 },
            weight: 0,
            properties: ["Gema preciosa", "1000 gp de valor"],
            inStock: 1,
            tags: ["diamante", "gema", "brillante"]
          },
          {
            id: generateId(),
            name: "Corona de Plata",
            description: "Corona ceremonial de plata con incrustaciones",
            category: "treasure",
            rarity: "rare",
            price: { copper: 0, silver: 0, electrum: 0, gold: 250, platinum: 0 },
            weight: 2,
            properties: ["Objeto ceremonial", "Plata pura"],
            inStock: 2,
            tags: ["corona", "plata", "ceremonial"]
          }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    for (const shop of exampleShops) {
      await saveShop(shop);
    }

    setShops(exampleShops);
    setSelectedShop(exampleShops[0]);
  };

  const addToCart = (item: ShopItem, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.item.id === item.id);
      
      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + quantity, item.inStock);
        return prevCart.map(cartItem =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: newQuantity }
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
          const maxQuantity = cartItem.item.inStock;
          return { ...cartItem, quantity: Math.min(quantity, maxQuantity) };
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

  const convertToCopper = (currency: Currency): number => {
    return (
      currency.copper +
      currency.silver * CURRENCY_CONVERSION.silver +
      currency.electrum * CURRENCY_CONVERSION.electrum +
      currency.gold * CURRENCY_CONVERSION.gold +
      currency.platinum * CURRENCY_CONVERSION.platinum
    );
  };

  const convertFromCopper = (copperAmount: number): Currency => {
    let remaining = copperAmount;
    
    const platinum = Math.floor(remaining / CURRENCY_CONVERSION.platinum);
    remaining %= CURRENCY_CONVERSION.platinum;
    
    const gold = Math.floor(remaining / CURRENCY_CONVERSION.gold);
    remaining %= CURRENCY_CONVERSION.gold;
    
    const electrum = Math.floor(remaining / CURRENCY_CONVERSION.electrum);
    remaining %= CURRENCY_CONVERSION.electrum;
    
    const silver = Math.floor(remaining / CURRENCY_CONVERSION.silver);
    remaining %= CURRENCY_CONVERSION.silver;
    
    const copper = remaining;
    
    return { copper, silver, electrum, gold, platinum };
  };

  const canAfford = (cost: Currency, characterCurrency: Currency): boolean => {
    const costInCopper = convertToCopper(cost);
    const availableInCopper = convertToCopper(characterCurrency);
    return availableInCopper >= costInCopper;
  };

  const deductCurrency = (characterCurrency: Currency, cost: Currency): Currency => {
    const availableInCopper = convertToCopper(characterCurrency);
    const costInCopper = convertToCopper(cost);
    const remainingInCopper = availableInCopper - costInCopper;
    return convertFromCopper(remainingInCopper);
  };

  const handlePurchase = async () => {
    if (!selectedCharacter || cart.length === 0) return;

    const totalCost = calculateCartTotal();
    
    if (!canAfford(totalCost, selectedCharacter.currency)) {
      alert('No tienes suficiente dinero para esta compra');
      return;
    }

    try {
      // Update character currency and equipment
      const newCurrency = deductCurrency(selectedCharacter.currency, totalCost);
      const newEquipment = [...selectedCharacter.equipment];
      
      cart.forEach(cartItem => {
        for (let i = 0; i < cartItem.quantity; i++) {
          newEquipment.push(cartItem.item.name);
        }
      });

      const updatedCharacter = {
        ...selectedCharacter,
        currency: newCurrency,
        equipment: newEquipment,
        updatedAt: Date.now()
      };

      await saveCharacter(updatedCharacter);
      setSelectedCharacter(updatedCharacter);

      // Update characters list
      setCharacters(prev => 
        prev.map(char => char.id === updatedCharacter.id ? updatedCharacter : char)
      );

      // Update shop inventory
      if (selectedShop) {
        const updatedItems = selectedShop.items.map(item => {
          const cartItem = cart.find(ci => ci.item.id === item.id);
          if (cartItem) {
            return { ...item, inStock: item.inStock - cartItem.quantity };
          }
          return item;
        });

        const updatedShop = {
          ...selectedShop,
          items: updatedItems,
          updatedAt: Date.now()
        };

        await saveShop(updatedShop);
        setSelectedShop(updatedShop);
        setShops(prev => prev.map(shop => shop.id === updatedShop.id ? updatedShop : shop));
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

  const formatCurrency = (currency: Currency): string => {
    const parts = [];
    if (currency.platinum > 0) parts.push(`${currency.platinum} ${CURRENCY_SYMBOLS.platinum}`);
    if (currency.gold > 0) parts.push(`${currency.gold} ${CURRENCY_SYMBOLS.gold}`);
    if (currency.electrum > 0) parts.push(`${currency.electrum} ${CURRENCY_SYMBOLS.electrum}`);
    if (currency.silver > 0) parts.push(`${currency.silver} ${CURRENCY_SYMBOLS.silver}`);
    if (currency.copper > 0) parts.push(`${currency.copper} ${CURRENCY_SYMBOLS.copper}`);
    
    return parts.length > 0 ? parts.join(', ') : '0 cp';
  };

  const getShopIcon = (shopType: string) => {
    const icons: Record<string, any> = {
      weapon_shop: Sword,
      armor_shop: Shield,
      magic_shop: Zap,
      general_store: Package,
      blacksmith: Hammer,
      jeweler: Gem,
      market: Horse,
      alchemist: Scroll,
      tavern: Package,
      temple: Star,
      library: Scroll,
      fletcher: Target
    };
    return icons[shopType] || Package;
  };

  const filteredItems = selectedShop?.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesRarity = !rarityFilter || item.rarity === rarityFilter;
    
    return matchesSearch && matchesCategory && matchesRarity;
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
              <h1 className="text-3xl font-bold text-amber-900">Tiendas de Aventureros</h1>
              <p className="text-amber-700">Equipa a tus héroes para sus próximas aventuras</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
            >
              <ShoppingCart size={18} />
              <span>Carrito</span>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Character Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-amber-900 mb-2">
            Seleccionar Personaje para Comprar
          </label>
          <select
            value={selectedCharacter?.id || ''}
            onChange={(e) => {
              const character = characters.find(c => c.id === e.target.value);
              setSelectedCharacter(character || null);
            }}
            className="w-full p-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="">Seleccionar personaje...</option>
            {characters.map(character => (
              <option key={character.id} value={character.id}>
                {character.name} - {character.class} Nivel {character.level} ({formatCurrency(character.currency)})
              </option>
            ))}
          </select>
        </div>

        {/* Shop Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map(shop => {
            const ShopIcon = getShopIcon(shop.type);
            return (
              <button
                key={shop.id}
                onClick={() => setSelectedShop(shop)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedShop?.id === shop.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-amber-200 bg-white hover:border-amber-300'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <ShopIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900">{shop.name}</h3>
                    <p className="text-sm text-amber-600">{shop.keeper}</p>
                  </div>
                </div>
                <p className="text-sm text-amber-700 mb-2">{shop.description}</p>
                <div className="flex items-center justify-between text-xs text-amber-600">
                  <span>📍 {shop.location}</span>
                  <span>⭐ {shop.reputation}%</span>
                </div>
                {shop.discountPercentage > 0 && (
                  <div className="mt-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full inline-block">
                    {shop.discountPercentage}% descuento
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedShop && (
        <>
          {/* Shop Details and Filters */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-amber-900">{selectedShop.name}</h2>
                <p className="text-amber-700">{selectedShop.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-amber-600">
                  <span>📍 {selectedShop.location}</span>
                  <span>👤 {selectedShop.keeper}</span>
                  <span>⭐ {selectedShop.reputation}% reputación</span>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <div className="mt-4 text-sm text-amber-600">
              Mostrando {filteredItems.length} de {selectedShop.items.length} objetos
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 transition-all hover:shadow-2xl ${RARITY_COLORS[item.rarity]}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-amber-900">{item.name}</h3>
                    <p className="text-sm text-amber-600">
                      {CATEGORY_NAMES[item.category as keyof typeof CATEGORY_NAMES] || item.category}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${RARITY_COLORS[item.rarity]} border`}>
                    {RARITY_NAMES[item.rarity as keyof typeof RARITY_NAMES] || item.rarity}
                  </span>
                </div>

                <p className="text-sm text-amber-700 mb-4">{item.description}</p>

                {/* Item Properties */}
                <div className="space-y-2 mb-4">
                  {item.damage && (
                    <div className="text-sm">
                      <span className="font-medium text-amber-900">Daño:</span> {item.damage}
                    </div>
                  )}
                  {item.armorClass && (
                    <div className="text-sm">
                      <span className="font-medium text-amber-900">CA:</span> {item.armorClass}
                    </div>
                  )}
                  {item.weight > 0 && (
                    <div className="text-sm">
                      <span className="font-medium text-amber-900">Peso:</span> {item.weight} lb
                    </div>
                  )}
                  {item.requirements && (
                    <div className="text-sm">
                      <span className="font-medium text-amber-900">Requisitos:</span> {item.requirements}
                    </div>
                  )}
                  {item.properties.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium text-amber-900">Propiedades:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.properties.map((prop, index) => (
                          <span key={index} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                            {prop}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Price and Stock */}
                <div className="border-t border-amber-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(item.price)}
                    </div>
                    <div className="text-sm text-amber-600">
                      Stock: {item.inStock}
                    </div>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={() => addToCart(item)}
                    disabled={!selectedCharacter || item.inStock === 0 || !canAfford(item.price, selectedCharacter?.currency || { copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 })}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={16} />
                    <span>Agregar al Carrito</span>
                  </button>

                  {!selectedCharacter && (
                    <p className="text-xs text-red-600 mt-2 text-center">
                      Selecciona un personaje para comprar
                    </p>
                  )}
                  
                  {selectedCharacter && !canAfford(item.price, selectedCharacter.currency) && (
                    <p className="text-xs text-red-600 mt-2 text-center">
                      Fondos insuficientes
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-amber-200 text-center">
              <Package className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-amber-900 mb-2">No se encontraron objetos</h2>
              <p className="text-amber-700">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </>
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
                        <p className="text-sm text-amber-600">{formatCurrency(cartItem.item.price)} cada uno</p>
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
                            {formatCurrency(multiplyPrice(cartItem.item.price, cartItem.quantity))}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(cartItem.item.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
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
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(calculateCartTotal())}
                    </span>
                  </div>

                  {selectedCharacter && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="font-bold text-blue-900 mb-2">Dinero de {selectedCharacter.name}:</h3>
                      <p className="text-blue-800">{formatCurrency(selectedCharacter.currency)}</p>
                      {!canAfford(calculateCartTotal(), selectedCharacter.currency) && (
                        <p className="text-red-600 text-sm mt-2">⚠️ Fondos insuficientes</p>
                      )}
                    </div>
                  )}

                  <div className="flex space-x-3">
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
                      disabled={!selectedCharacter || !canAfford(calculateCartTotal(), selectedCharacter?.currency || { copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 })}
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

            {selectedCharacter && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-2">Comprador:</h3>
                  <p className="text-blue-800">{selectedCharacter.name}</p>
                  <p className="text-sm text-blue-600">{selectedCharacter.class} Nivel {selectedCharacter.level}</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-bold text-green-900 mb-2">Tienda:</h3>
                  <p className="text-green-800">{selectedShop?.name}</p>
                  <p className="text-sm text-green-600">{selectedShop?.keeper}</p>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h3 className="font-bold text-amber-900 mb-2">Resumen de Compra:</h3>
                  <div className="space-y-2">
                    {cart.map(cartItem => (
                      <div key={cartItem.item.id} className="flex justify-between text-sm">
                        <span>{cartItem.item.name} x{cartItem.quantity}</span>
                        <span>{formatCurrency(multiplyPrice(cartItem.item.price, cartItem.quantity))}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-amber-300 mt-2 pt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateCartTotal())}</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-2">Dinero Actual:</h3>
                  <p className="text-gray-800 mb-2">{formatCurrency(selectedCharacter.currency)}</p>
                  <h3 className="font-bold text-gray-900 mb-2">Dinero Después de la Compra:</h3>
                  <p className="text-gray-800">{formatCurrency(deductCurrency(selectedCharacter.currency, calculateCartTotal()))}</p>
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ShopPage;