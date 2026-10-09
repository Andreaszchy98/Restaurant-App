import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  INITIAL_BANNERS,
  INITIAL_BUSINESS_PROFILE,
  INITIAL_INGREDIENTS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
} from '../data/initialData';
import {
  BusinessProfile,
  CartItem,
  CurrentUser,
  Ingredient,
  Order,
  OrderStatus,
  Product,
  ProductRecipeItem,
  PromoBanner,
  ThemeConfig,
  ThemeId,
  UserRole,
} from '../types';
import { getTheme, THEMES } from '../utils/themes';
import {
  firebaseInfo,
  subscribeProducts,
  subscribeIngredients,
  subscribeOrders,
  subscribeBanners,
  subscribeBusinessProfile,
  upsertProductFirestore,
  deleteProductFirestore,
  upsertIngredientFirestore,
  deleteIngredientFirestore,
  saveOrderFirestore,
  updateOrderStatusFirestore,
  upsertBannerFirestore,
  deleteBannerFirestore,
  saveBusinessProfileFirestore,
  pushAllToFirestore,
} from '../firebase';

interface AppContextType {
  // Theme
  theme: ThemeConfig;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;

  // Cloud / Firestore
  firebaseSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  firebaseInfo: typeof firebaseInfo;
  syncAllToFirestore: () => Promise<void>;

  // Business Profile
  businessProfile: BusinessProfile;
  updateBusinessProfile: (partial: Partial<BusinessProfile>) => void;
  resetToDefaultData: () => void;
  loadBusinessPreset: (presetType: 'cafe' | 'grill' | 'boutique') => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => string;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
  setProductRecipe: (productId: string, recipe: ProductRecipeItem[]) => void;
  clearProductRecipe: (productId: string) => void;
  clearAllRecipes: () => void;

  // Central Ingredients / Insumos (Many-to-Many Architecture)
  ingredients: Ingredient[];
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => string;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
  adjustIngredientStock: (id: string, delta: number) => void;

  // Banners
  banners: PromoBanner[];
  addBanner: (banner: Omit<PromoBanner, 'id'>) => string;
  updateBanner: (id: string, updates: Partial<PromoBanner>) => void;
  deleteBanner: (id: string) => void;
  toggleBannerActive: (id: string) => void;

  // Orders
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  markOrderPaymentReceived: (orderId: string, received: boolean) => void;
  deleteOrder: (orderId: string) => void;
  clearAllOrders: () => void;

  // Auth / Role
  currentUser: CurrentUser;
  switchRole: (role: UserRole) => void;
  updateCurrentUser: (updates: Partial<CurrentUser>) => void;

  // Shopping Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Product Customizer Modal
  modalProductId: string | null;
  openProductModal: (productId: string) => void;
  closeProductModal: () => void;

  // Cart Drawer
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;

  // Active Admin Tab (Removed logistica)
  adminTab: 'resumen' | 'pedidos' | 'inventario' | 'catalogo' | 'banners' | 'configuracion';
  setAdminTab: (tab: 'resumen' | 'pedidos' | 'inventario' | 'catalogo' | 'banners' | 'configuracion') => void;

  // Active Customer Tab
  customerTab: 'catalogo' | 'pedidos';
  setCustomerTab: (tab: 'catalogo' | 'pedidos') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: 'bl_theme_id',
  PROFILE: 'bl_business_profile',
  PRODUCTS: 'bl_products_list',
  INGREDIENTS: 'bl_ingredients_central_stock',
  BANNERS: 'bl_banners_list',
  ORDERS: 'bl_orders_list_v2', // Updated key to ensure clean order state
  ROLE: 'bl_user_role',
  CART: 'bl_cart_items',
  RECIPES_CLEARED: 'bl_recipes_cleared_by_admin',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeId;
    return saved && THEMES[saved] ? saved : 'default';
  });

  const theme = getTheme(themeId);

  // Firestore Sync State
  const [firebaseSyncStatus, setFirebaseSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const isCloudLoadedRef = useRef(false);

  const setThemeId = (newId: ThemeId) => {
    setThemeIdState(newId);
    localStorage.setItem(STORAGE_KEYS.THEME, newId);
    setBusinessProfileState((prev) => {
      const updated = { ...prev, currentTheme: newId };
      saveBusinessProfileFirestore(updated).catch(() => {});
      return updated;
    });
  };

  // Business Profile
  const [businessProfile, setBusinessProfileState] = useState<BusinessProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_BUSINESS_PROFILE;
  });

  const updateBusinessProfile = (partial: Partial<BusinessProfile>) => {
    setBusinessProfileState((prev) => {
      const updated = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
      saveBusinessProfileFirestore(updated).catch((err) => console.warn('Firestore profile sync error:', err));
      return updated;
    });
  };

  // Central Ingredients / Insumos (Many-to-Many Architecture)
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
    if (saved) {
      try {
        const parsed: Ingredient[] = JSON.parse(saved);
        // Merge missing default ingredients if any
        const missing = INITIAL_INGREDIENTS.filter(
          (init) => !parsed.some((p) => p.id === init.id)
        );
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          return merged;
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_INGREDIENTS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(ingredients));
  }, [ingredients]);

  const addIngredient = (ingredient: Omit<Ingredient, 'id'>): string => {
    const id = `ing-${Date.now()}`;
    const newIng: Ingredient = { ...ingredient, id };
    setIngredients((prev) => [newIng, ...prev]);
    upsertIngredientFirestore(newIng).catch((err) => console.warn('Firestore addIngredient error:', err));
    return id;
  };

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setIngredients((prev) => {
      const updated = prev.map((ing) => (ing.id === id ? { ...ing, ...updates } : ing));
      const target = updated.find((i) => i.id === id);
      if (target) {
        upsertIngredientFirestore(target).catch((err) => console.warn('Firestore updateIngredient error:', err));
      }
      return updated;
    });
  };

  const deleteIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
    deleteIngredientFirestore(id).catch((err) => console.warn('Firestore deleteIngredient error:', err));
    // Also remove reference from any product recipe and options
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        recipe: p.recipe ? p.recipe.filter((r) => r.ingredientId !== id) : [],
        optionGroups: p.optionGroups
          ? p.optionGroups.map((g) => ({
              ...g,
              options: g.options.map((opt) =>
                opt.extraIngredientId === id
                  ? { ...opt, extraIngredientId: undefined, extraIngredientQuantity: undefined }
                  : opt
              ),
            }))
          : p.optionGroups,
      }))
    );
  };

  const adjustIngredientStock = (id: string, delta: number) => {
    setIngredients((prev) => {
      const updated = prev.map((ing) => {
        if (ing.id === id) {
          return { ...ing, stock: Math.max(0, ing.stock + delta) };
        }
        return ing;
      });
      const target = updated.find((i) => i.id === id);
      if (target) {
        upsertIngredientFirestore(target).catch((err) => console.warn('Firestore adjustIngredientStock error:', err));
      }
      return updated;
    });
  };

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  // Ensure initial products have recipes and option ingredients loaded if from pre-existing localStorage
  useEffect(() => {
    const isRecipesCleared = localStorage.getItem(STORAGE_KEYS.RECIPES_CLEARED) === 'true';
    setProducts((prev) => {
      let changed = false;
      const updated = prev.map((p) => {
        const initial = INITIAL_PRODUCTS.find((ip) => ip.id === p.id);
        if (!initial) return p;

        let pChanged = false;
        let newRecipe = p.recipe;
        if (!isRecipesCleared && initial.recipe && (!p.recipe || p.recipe.length === 0)) {
          newRecipe = initial.recipe;
          pChanged = true;
        }

        // Sync option ingredients if missing
        let newOptionGroups = p.optionGroups;
        if (initial.optionGroups && p.optionGroups) {
          const syncedGroups = p.optionGroups.map((g) => {
            const initGroup = initial.optionGroups.find((ig) => ig.id === g.id);
            if (!initGroup) return g;
            const syncedOptions = g.options.map((opt) => {
              const initOpt = initGroup.options.find((io) => io.id === opt.id);
              if (initOpt?.extraIngredientId && !opt.extraIngredientId) {
                pChanged = true;
                return {
                  ...opt,
                  extraIngredientId: initOpt.extraIngredientId,
                  extraIngredientQuantity: initOpt.extraIngredientQuantity,
                };
              }
              return opt;
            });
            return { ...g, options: syncedOptions };
          });
          if (pChanged) {
            newOptionGroups = syncedGroups;
          }
        }

        if (pChanged) {
          changed = true;
          return { ...p, recipe: newRecipe, optionGroups: newOptionGroups };
        }
        return p;
      });
      return changed ? updated : prev;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  const addProduct = (product: Omit<Product, 'id'>): string => {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = { ...product, id };
    setProducts((prev) => [newProduct, ...prev]);
    upsertProductFirestore(newProduct).catch((err) => console.warn('Firestore addProduct error:', err));
    return id;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      const target = updated.find((p) => p.id === id);
      if (target) {
        upsertProductFirestore(target).catch((err) => console.warn('Firestore updateProduct error:', err));
      }
      return updated;
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    deleteProductFirestore(id).catch((err) => console.warn('Firestore deleteProduct error:', err));
  };

  const adjustStock = (id: string, delta: number) => {
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          const newStock = Math.max(0, p.stock + delta);
          return { ...p, stock: newStock };
        }
        return p;
      });
      const target = updated.find((p) => p.id === id);
      if (target) {
        upsertProductFirestore(target).catch((err) => console.warn('Firestore adjustStock error:', err));
      }
      return updated;
    });
  };

  const setProductRecipe = (productId: string, recipe: ProductRecipeItem[]) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === productId ? { ...p, recipe } : p));
      const target = updated.find((p) => p.id === productId);
      if (target) {
        upsertProductFirestore(target).catch((err) => console.warn('Firestore setProductRecipe error:', err));
      }
      return updated;
    });
  };

  const clearProductRecipe = (productId: string) => {
    setProductRecipe(productId, []);
  };

  const clearAllRecipes = () => {
    localStorage.setItem(STORAGE_KEYS.RECIPES_CLEARED, 'true');
    setProducts((prev) => {
      const updated = prev.map((p) => ({
        ...p,
        recipe: [],
      }));
      updated.forEach((p) => {
        upsertProductFirestore(p).catch(() => {});
      });
      return updated;
    });
  };

  // Banners
  const [banners, setBanners] = useState<PromoBanner[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BANNERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_BANNERS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
  }, [banners]);

  const addBanner = (banner: Omit<PromoBanner, 'id'>): string => {
    const id = `ban-${Date.now()}`;
    const newBanner: PromoBanner = { ...banner, id };
    setBanners((prev) => [newBanner, ...prev]);
    upsertBannerFirestore(newBanner).catch((err) => console.warn('Firestore addBanner error:', err));
    return id;
  };

  const updateBanner = (id: string, updates: Partial<PromoBanner>) => {
    setBanners((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, ...updates } : b));
      const target = updated.find((b) => b.id === id);
      if (target) {
        upsertBannerFirestore(target).catch((err) => console.warn('Firestore updateBanner error:', err));
      }
      return updated;
    });
  };

  const deleteBanner = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    deleteBannerFirestore(id).catch((err) => console.warn('Firestore deleteBanner error:', err));
  };

  const toggleBannerActive = (id: string) => {
    setBanners((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b));
      const target = updated.find((b) => b.id === id);
      if (target) {
        upsertBannerFirestore(target).catch((err) => console.warn('Firestore toggleBannerActive error:', err));
      }
      return updated;
    });
  };

  // Orders: Cleaned empty registry
  const [orders, setOrders] = useState<Order[]>(() => {
    // Clear old legacy orders
    localStorage.removeItem('bl_orders_list');
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ORDERS; // Empty array
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order => {
    const orderNumber = `PED-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
    };

    // 1. Deduct direct finished product stock
    orderData.items.forEach((item) => {
      adjustStock(item.productId, -item.quantity);
    });

    // 2. Relación Many-to-Many: Descontar stock central de ingredientes según la receta
    const ingredientDeductions: Record<string, number> = {};

    orderData.items.forEach((cartItem) => {
      const prod = products.find((p) => p.id === cartItem.productId);
      if (!prod) return;

      // A) Ingredientes de la receta base del producto
      if (prod.recipe && prod.recipe.length > 0) {
        prod.recipe.forEach((recipeItem) => {
          const totalReq = recipeItem.quantity * cartItem.quantity;
          ingredientDeductions[recipeItem.ingredientId] =
            (ingredientDeductions[recipeItem.ingredientId] || 0) + totalReq;
        });
      }

      // B) Ingredientes adicionales vinculados a opciones seleccionadas
      if (cartItem.selectedOptions && cartItem.selectedOptions.length > 0) {
        cartItem.selectedOptions.forEach((selectedOpt) => {
          for (const group of prod.optionGroups || []) {
            const opt = group.options.find((o) => o.id === selectedOpt.optionId);
            if (opt?.extraIngredientId) {
              const qty = (opt.extraIngredientQuantity && opt.extraIngredientQuantity > 0) ? opt.extraIngredientQuantity : 1;
              const extraTotal = qty * cartItem.quantity;
              ingredientDeductions[opt.extraIngredientId] =
                (ingredientDeductions[opt.extraIngredientId] || 0) + extraTotal;
            }
          }
        });
      }
    });

    // Aplicar los descuentos al catálogo central de ingredientes
    if (Object.keys(ingredientDeductions).length > 0) {
      setIngredients((prev) =>
        prev.map((ing) => {
          const toDeduct = ingredientDeductions[ing.id];
          if (toDeduct && toDeduct > 0) {
            const updatedStock = Math.max(0, ing.stock - toDeduct);
            const updated = { ...ing, stock: updatedStock };
            upsertIngredientFirestore(updated).catch(() => {});
            return updated;
          }
          return ing;
        })
      );
    }

    setOrders((prev) => [newOrder, ...prev]);
    saveOrderFirestore(newOrder).catch((err) => console.warn('Firestore saveOrder error:', err));
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    updateOrderStatusFirestore(orderId, status).catch((err) => console.warn('Firestore updateOrderStatus error:', err));
  };

  const markOrderPaymentReceived = (orderId: string, received: boolean) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, paymentReceived: received } : o)));
    const target = orders.find((o) => o.id === orderId);
    if (target) {
      updateOrderStatusFirestore(orderId, target.status, received).catch((err) => console.warn('Firestore markOrder error:', err));
    }
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllOrders = () => {
    setOrders([]);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
  };

  // Synchronize All Local Data to Firestore on Demand
  const syncAllToFirestore = async () => {
    setFirebaseSyncStatus('syncing');
    try {
      await pushAllToFirestore({
        products,
        ingredients,
        banners,
        orders,
        profile: businessProfile,
      });
      setFirebaseSyncStatus('synced');
    } catch (e) {
      console.error('Error syncing all data to Firestore:', e);
      setFirebaseSyncStatus('error');
      throw e;
    }
  };

  // Real-time Firestore Listeners
  useEffect(() => {
    let isMounted = true;

    const unsubProducts = subscribeProducts(
      (remoteProducts) => {
        if (!isMounted) return;
        if (remoteProducts.length > 0) {
          setProducts(remoteProducts);
          isCloudLoadedRef.current = true;
          setFirebaseSyncStatus('synced');
        } else if (!isCloudLoadedRef.current) {
          // If cloud has 0 products yet, seed them automatically once!
          pushAllToFirestore({
            products,
            ingredients,
            banners,
            orders,
            profile: businessProfile,
          })
            .then(() => {
              if (isMounted) setFirebaseSyncStatus('synced');
            })
            .catch(() => {});
        }
      },
      () => {
        if (isMounted) setFirebaseSyncStatus('offline');
      }
    );

    const unsubIngredients = subscribeIngredients(
      (remoteIngredients) => {
        if (!isMounted) return;
        if (remoteIngredients.length > 0) {
          setIngredients(remoteIngredients);
          setFirebaseSyncStatus('synced');
        }
      },
      () => {}
    );

    const unsubOrders = subscribeOrders(
      (remoteOrders) => {
        if (!isMounted) return;
        if (remoteOrders.length > 0) {
          setOrders(remoteOrders);
          setFirebaseSyncStatus('synced');
        }
      },
      () => {}
    );

    const unsubBanners = subscribeBanners(
      (remoteBanners) => {
        if (!isMounted) return;
        if (remoteBanners.length > 0) {
          setBanners(remoteBanners);
          setFirebaseSyncStatus('synced');
        }
      },
      () => {}
    );

    const unsubProfile = subscribeBusinessProfile(
      (remoteProfile) => {
        if (!isMounted) return;
        if (remoteProfile && remoteProfile.name) {
          setBusinessProfileState(remoteProfile);
          if (remoteProfile.currentTheme) {
            setThemeIdState(remoteProfile.currentTheme);
          }
          setFirebaseSyncStatus('synced');
        }
      },
      () => {}
    );

    return () => {
      isMounted = false;
      unsubProducts();
      unsubIngredients();
      unsubOrders();
      unsubBanners();
      unsubProfile();
    };
  }, []);

  // Auth / Current User
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    const savedRole = localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole;
    return {
      role: savedRole === 'admin' ? 'admin' : 'client',
      name: savedRole === 'admin' ? 'Gerente Propietario' : 'Mariana Gómez',
      phone: '+52 55 9182 7364',
      address: '',
    };
  });

  const switchRole = (role: UserRole) => {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
    setCurrentUser((prev) => ({
      ...prev,
      role,
      name: role === 'admin' ? 'Gerente Propietario' : 'Mariana Gómez',
    }));
  };

  const updateCurrentUser = (updates: Partial<CurrentUser>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
    setIsCartDrawerOpen(true);
  };

  const updateCartItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Modals & Navigation States
  const [modalProductId, setModalProductId] = useState<string | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<'resumen' | 'pedidos' | 'inventario' | 'catalogo' | 'banners' | 'configuracion'>('resumen');
  const [customerTab, setCustomerTab] = useState<'catalogo' | 'pedidos'>('catalogo');

  const openProductModal = (productId: string) => {
    setModalProductId(productId);
  };

  const closeProductModal = () => {
    setModalProductId(null);
  };

  // Reset to default
  const resetToDefaultData = () => {
    setProducts(INITIAL_PRODUCTS);
    setIngredients(INITIAL_INGREDIENTS);
    setBanners(INITIAL_BANNERS);
    setOrders([]);
    setBusinessProfileState(INITIAL_BUSINESS_PROFILE);
    setThemeId('default');
    localStorage.clear();
  };

  // Load sample business presets
  const loadBusinessPreset = (presetType: 'cafe' | 'grill' | 'boutique') => {
    if (presetType === 'cafe') {
      updateBusinessProfile({
        name: 'Aroma & Grano Specialty Coffee',
        slogan: 'Cafetería de especialidad, métodos de extracción y repostería fina',
        category: 'Cafetería & Pastelería',
        currentTheme: 'cafe',
      });
      setThemeId('cafe');
    } else if (presetType === 'grill') {
      updateBusinessProfile({
        name: 'Red Bull Smash & Smokehouse',
        slogan: 'Hamburguesas al carbón, cortes selectos y papas trufadas',
        category: 'Restaurante & Grill',
        currentTheme: 'rojo',
      });
      setThemeId('rojo');
    } else if (presetType === 'boutique') {
      updateBusinessProfile({
        name: 'Ámbar Estudio & Concept Store',
        slogan: 'Objetos de diseño, accesorios de autor y productos exclusivos',
        category: 'Tienda & Concept Store',
        currentTheme: 'naranja',
      });
      setThemeId('naranja');
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        themeId,
        setThemeId,
        firebaseSyncStatus,
        firebaseInfo,
        syncAllToFirestore,
        businessProfile,
        updateBusinessProfile,
        resetToDefaultData,
        loadBusinessPreset,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        setProductRecipe,
        clearProductRecipe,
        clearAllRecipes,
        ingredients,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        adjustIngredientStock,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBannerActive,
        orders,
        createOrder,
        updateOrderStatus,
        markOrderPaymentReceived,
        deleteOrder,
        clearAllOrders,
        currentUser,
        switchRole,
        updateCurrentUser,
        cart,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        modalProductId,
        openProductModal,
        closeProductModal,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        adminTab,
        setAdminTab,
        customerTab,
        setCustomerTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
