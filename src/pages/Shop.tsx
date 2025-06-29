import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Search, Filter, Star, Coins, Package, Users, ArrowLeft, X, Check, AlertCircle, Eye, Sword, Shield, Zap, Scroll, Hammer, Target, Gem, Book, Sparkles, Home, Crown } from 'lucide-react';
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

      console.log('Loaded shops:', shopsData);
      setShops(shopsData);
      setCharacters(charactersData);

      // Set first shop as selected by default
      if (shopsData.length > 0) {
        setSelectedShop(shopsData[0]);
      }
    } catch (error) {
      console.error('Error loading shop data:', error);
    } finally {
      setLoading(false);
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

        {/* Debug Info */}
        <div className="mt-4 text-sm text-gray-600">
          <p>Tiendas cargadas: {shops.length}</p>
          {selectedShop && <p>Objetos en tienda seleccionada: {selectedShop.items.length}</p>}
        </div>
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
                  <div className="mt-2 text-xs text-amber-500">
                    {shop.items.length} objetos disponibles
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
                  <p className="text-sm text-amber-600 mt-1">
                    {selectedShop.items.length} objetos • Atendido por {selectedShop.keeper}
                  </p>
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