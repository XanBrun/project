import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Search, Filter, Star, Coins, Package, Users, ArrowLeft, X, Check, AlertCircle, Eye, Sword, Shield, Zap, Scroll, Hammer, Target, Gem, Book, Sparkles, Home, Crown, ChevronDown, Store, RefreshCw } from 'lucide-react';
import { 
  loadShops, saveShop, loadCharacters, loadCharacter, saveCharacter, 
  saveTransaction, generateId 
} from '../services/db';
import { 
  Shop, ShopItem, Character, CartItem, Transaction, Currency,
  CURRENCY_CONVERSION, CURRENCY_NAMES, CURRENCY_SYMBOLS,
  RARITY_COLORS, RARITY_NAMES, CATEGORY_NAMES, SHOP_TYPE_NAMES
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
  const [error, setError] = useState<string | null>(null);

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
      setLoading(true);
      setError(null);
      
      console.log('Loading shop data...');
      
      const [shopsData, charactersData] = await Promise.all([
        loadShops(),
        loadCharacters()
      ]);

      console.log('Shops loaded:', shopsData.length);
      console.log('Characters loaded:', charactersData.length);

      // Validar que las tiendas tengan datos válidos
      const validShops = shopsData.filter(shop => {
        if (!shop || !shop.id || !shop.name || !shop.items || !Array.isArray(shop.items)) {
          console.warn('Invalid shop detected:', shop);
          return false;
        }
        return true;
      });

      if (validShops.length === 0) {
        throw new Error('No se encontraron tiendas válidas');
      }

      setShops(validShops);
      setCharacters(charactersData);

      // Seleccionar la primera tienda válida por defecto
      if (validShops.length > 0) {
        console.log('Setting default shop:', validShops[0].name);
        setSelectedShop(validShops[0]);
      }

    } catch (error) {
      console.error('Error loading shop data:', error);
      setError('Error al cargar los datos de la tienda. Por favor, recarga la página.');
    } finally {
      setLoading(false);
    }
  };

  const handleShopChange = (shopId: string) => {
    console.log('Changing shop to:', shopId);
    
    if (!shopId) {
      setSelectedShop(null);
      return;
    }

    const shop = shops.find(s => s.id === shopId);
    if (shop) {
      console.log('Shop found:', shop.name, 'Items:', shop.items.length);
      setSelectedShop(shop);
      
      // Limpiar filtros al cambiar de tienda
      setSearchTerm('');
      setCategoryFilter('');
      setRarityFilter('');
      
      // Limpiar carrito al cambiar de tienda
      setCart([]);
    } else {
      console.warn('Shop not found for ID:', shopId);
      setSelectedShop(null);
    }
  };

  const getShopIcon = (shopType: string) => {
    const icons: Record<string, any> = {
      'weapon_shop': Sword,
      'armor_shop': Shield,
      'magic_shop': Sparkles,
      'general_store': Package,
      'blacksmith': Hammer,
      'market': Package,
      'alchemist': Zap,
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
    if (!selectedShop) {
      console.warn('No shop selected');
      return;
    }

    console.log('Adding to cart:', item.name, 'Quantity:', quantity);
    
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.item.id === item.id);
      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + quantity, item.inStock);
        console.log('Updating existing item quantity:', newQuantity);
        return prevCart.map(cartItem =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
      } else {
        const newQuantity = Math.min(quantity, item.inStock);
        console.log('Adding new item with quantity:', newQuantity);
        return [...prevCart, { item, quantity: newQuantity }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    console.log('Removing from cart:', itemId);
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
    if (!selectedCharacter || cart.length === 0 || !selectedShop) {
      console.warn('Missing requirements for purchase');
      return;
    }

    const totalCost = calculateTotalCost();
    
    if (!canAfford(totalCost, selectedCharacter.currency)) {
      alert('No tienes suficiente dinero para esta compra');
      return;
    }

    try {
      console.log('Processing purchase...');
      
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

      // Save transaction
      const transaction: Transaction = {
        id: generateId(),
        characterId: selectedCharacter.id,
        shopId: selectedShop.id,
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
      console.log('Purchase completed successfully');
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

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-red-200">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-2">Error al cargar las tiendas</h2>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={loadData}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mx-auto"
            >
              <RefreshCw size={18} />
              <span>Reintentar</span>
            </button>
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

        {/* Shop and Character Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Shop Selection Dropdown */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center space-x-2 mb-3">
              <Store className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-purple-900">Seleccionar Tienda</h3>
            </div>
            <div className="relative">
              <select
                  value={selectedShop?.id || ''}
  onChange={(e) => handleShopChange(e.target.value)}
  className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white appearance-none pr-10"
>
  <option value="">Elige una tienda...</option>
  {shops.map(shop => (
    <option key={shop.id} value={shop.id}>
      {shop.name} - {SHOP_TYPE_NAMES[shop.type] || "Tienda"} 
      ({shop.items?.length || 0} objetos)
    </option>
  ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 pointer-events-none" size={20} />
            </div>
            {selectedShop && (
              <div className="mt-3 text-sm">
                <p className="text-purple-700">
                  <strong>Ubicación:</strong> {selectedShop.location}
                </p>
                <p className="text-purple-700">
                  <strong>Encargado:</strong> {selectedShop.keeper}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-purple-700">{selectedShop.reputation}% reputación</span>
                  </div>
                  {selectedShop.discountPercentage > 0 && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      {selectedShop.discountPercentage}% descuento
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Character Selection */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-900">Personaje Comprador</h3>
            </div>
            <div className="relative">
              <select
                value={selectedCharacter?.id || ''}
                onChange={(e) => {
                  const character = characters.find(c => c.id === e.target.value);
                  setSelectedCharacter(character || null);
                }}
                className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none pr-10"
              >
                <option value="">Seleccionar personaje...</option>
                {characters.map(character => (
                  <option key={character.id} value={character.id}>
                    {character.name} - {character.class} Nv.{character.level}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 pointer-events-none" size={20} />
            </div>
            {selectedCharacter && (
              <div className="mt-3 text-sm">
                <p className="text-blue-700">
                  <strong>Raza:</strong> {selectedCharacter.race}
                </p>
                <p className="text-blue-700">
                  <strong>Dinero disponible:</strong> {formatPrice(selectedCharacter.currency)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Selected Shop Info */}
        {selectedShop && (
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getShopColor(selectedShop.type)} flex items-center justify-center`}>
                {React.createElement(getShopIcon(selectedShop.type), { className: "w-6 h-6 text-white" })}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-amber-900">{selectedShop.name}</h3>
                <p className="text-amber-700">{selectedShop.description}</p>
                <p className="text-sm text-amber-600 mt-1">
                  {SHOP_TYPE_NAMES[selectedShop.type]} • {selectedShop.items?.length || 0} objetos disponibles
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shop Content */}
      {selectedShop ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-amber-200">
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
              <p className="text-amber-500 text-sm mb-4">
                {searchTerm || categoryFilter || rarityFilter 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Esta tienda no tiene objetos disponibles'
                }
              </p>
              {(searchTerm || categoryFilter || rarityFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('');
                    setRarityFilter('');
                  }}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Limpiar Filtros
                </button>
              )}
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
          <Store className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-amber-900 mb-2">Selecciona una Tienda</h2>
          <p className="text-amber-700 mb-6">Elige una tienda del desplegable superior para ver sus productos</p>
          <div className="text-sm text-amber-600">
            <p>Tiendas disponibles: {shops.length}</p>
          </div>
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