export type ThemeId = 'default' | 'rojo' | 'cafe' | 'naranja' | 'rosa' | 'crema';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  badge: string;
  // Colors applied to the app
  bgClass: string;
  surfaceClass: string;
  buttonClass: string;
  buttonHoverClass: string;
  buttonTextClass: string;
  accentTextClass: string;
  accentBgClass: string;
  accentBorderClass: string;
  headerBgClass: string;
  // Raw hex codes for custom styles if needed
  raw: {
    bg: string;
    primaryBtn: string;
    primaryBtnText: string;
    accent: string;
    border: string;
  };
}

export type IngredientUnit = 'g' | 'kg' | 'ml' | 'l' | 'oz' | 'unidad' | 'porcion';

export interface Ingredient {
  id: string;
  name: string;
  unit: IngredientUnit;
  stock: number; // Stock central en almacén
  minStockAlert: number;
  costPerUnit: number; // Costo por unidad de medida (ej. $0.35/g o $12/unidad)
  category: string; // ej. "Café & Granos", "Lácteos", "Carnes & Panes", "Empaques"
  supplier?: string;
}

export interface ProductRecipeItem {
  ingredientId: string; // Referencia al ID del ingrediente en el catálogo central
  quantity: number; // Cantidad requerida de ese ingrediente por 1 unidad de producto
}

export type ProductType = 'comida' | 'bebida' | 'producto_fisico' | 'servicio';

export interface ProductOption {
  id: string;
  name: string;
  priceDelta: number; // 0 for no price change, > 0 for extra cost
  extraIngredientId?: string; // Opcional: si la opción consume un ingrediente extra central
  extraIngredientQuantity?: number; // Cantidad consumida por la opción
}

export interface ProductOptionGroup {
  id: string;
  title: string; // e.g. "Tamaño", "Tipo de leche", "Ingredientes Extras"
  type: 'single' | 'multiple'; // radio vs checkboxes
  required: boolean; // Obligatorio o no
  minSelections?: number;
  maxSelections?: number;
  options: ProductOption[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  type: ProductType;
  price: number; // Precio base de venta
  costPrice: number; // Costo de compra/producción para inventario
  stock: number; // Cantidad en inventario directo
  minStockAlert: number; // Alerta de stock bajo
  imageUrl: string;
  isDriveUrl?: boolean;
  driveRawUrl?: string;
  available: boolean;
  badge?: string;
  optionGroups: ProductOptionGroup[];
  recipe?: ProductRecipeItem[]; // Relación Many-to-Many: insumos requeridos del catálogo central
}

export type BannerBadge = 'PROMOCIÓN' | 'PATROCINIO' | 'NOVEDAD' | 'ANUNCIO';

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  tagline?: string;
  badge: BannerBadge;
  imageUrl: string;
  targetProductId?: string; // ID del producto del catálogo al que dirige
  active: boolean;
  discountHighlight?: string; // e.g. "-20% HOY"
}

export interface SelectedOptionItem {
  groupId: string;
  groupTitle: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
}

export interface CartItem {
  id: string; // unique item cart instance id
  productId: string;
  productName: string;
  basePrice: number;
  unitPrice: number; // basePrice + total options
  quantity: number;
  selectedOptions: SelectedOptionItem[];
  customerNotes?: string;
  imageUrl: string;
}

export type OrderStatus = 'pendiente' | 'en_preparacion' | 'entregado' | 'cancelado';

export interface CashPaymentDetail {
  amountPaid: number; // Con cuánto paga el cliente
  changeNeeded: number; // Cambio que se debe dar
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "PED-108"
  orderType?: 'recoger'; // Exclusivo: solo para recoger en local / pickup
  customerName: string;
  customerPhone: string;
  customerNotes?: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  paymentMethod: 'efectivo';
  cashPayment: CashPaymentDetail;
  paymentReceived: boolean; // Marcar cobrado
  status: OrderStatus;
  createdAt: string;
}

export interface BusinessProfile {
  name: string;
  slogan: string;
  logoUrl: string;
  category: string;
  currency: string;
  currencyCode: string;
  phone: string;
  address: string;
  currentTheme: ThemeId;
  enableStockControl: boolean;
  licenseCode: string;
}

export type UserRole = 'admin' | 'client';

export interface CurrentUser {
  role: UserRole;
  name: string;
  phone: string;
  address: string;
}
