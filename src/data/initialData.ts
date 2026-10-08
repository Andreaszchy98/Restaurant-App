import { BusinessProfile, Ingredient, Order, Product, PromoBanner } from '../types';

export const INITIAL_BUSINESS_PROFILE: BusinessProfile = {
  name: 'Valhalla Coffee & Craft Grill',
  slogan: 'Sabores de autor, café de especialidad y gastronomía artesanal',
  logoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&auto=format&fit=crop&q=80',
  category: 'Restaurante & Cafetería',
  currency: '$',
  currencyCode: 'MXN',
  phone: '+52 55 1234 5678',
  address: 'Av. Providencia 1420, Ciudad Central',
  currentTheme: 'default', // Default: Claro con botones negros y letras blancas
  enableStockControl: true,
  licenseCode: 'LIC-SKELETON-MULTI-2026-X99',
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-burger',
    name: 'Smash Burger Clásica con Queso Fundido',
    description: 'Carne 100% Angus smash caramelizada con queso cheddar artesanal, pepinillos crujientes y pan brioche dorado a la mantequilla.',
    category: 'Comida',
    type: 'comida',
    price: 145,
    costPrice: 58,
    stock: 28,
    minStockAlert: 8,
    imageUrl: '/src/assets/images/product_craft_burger_1791387703846.jpg',
    available: true,
    badge: 'Más Vendido',
    optionGroups: [
      {
        id: 'opt-meat-size',
        title: 'Tamaño de la Carne',
        type: 'single',
        required: true,
        options: [
          { id: 'size-single', name: 'Sencilla (120g Angus)', priceDelta: 0 },
          { id: 'size-double', name: 'Doble Smash (240g Angus)', priceDelta: 45 },
          { id: 'size-triple', name: 'Triple Smash Bestia (360g Angus)', priceDelta: 85 },
        ],
      },
      {
        id: 'opt-bread',
        title: 'Tipo de Pan',
        type: 'single',
        required: true,
        options: [
          { id: 'bread-brioche', name: 'Pan Brioche Mantequilla', priceDelta: 0 },
          { id: 'bread-potato', name: 'Pan de Papa Suave', priceDelta: 0 },
          { id: 'bread-keto', name: 'Pan Keto sin Gluten', priceDelta: 20 },
        ],
      },
      {
        id: 'opt-burger-extras',
        title: 'Extras e Ingredientes Especiales',
        type: 'multiple',
        required: false,
        options: [
          { id: 'extra-bacon', name: 'Tiras de Tocino Crujiente', priceDelta: 25, extraIngredientId: 'ing-bacon-slices', extraIngredientQuantity: 2 },
          { id: 'extra-cheese', name: 'Queso Cheddar Extra Derretido', priceDelta: 18, extraIngredientId: 'ing-cheddar-cheese', extraIngredientQuantity: 2 },
          { id: 'extra-onion-jam', name: 'Cebolla Caramelizada al Balsámico', priceDelta: 12 },
          { id: 'extra-sauce', name: 'Salsa Trufada de la Casa', priceDelta: 15 },
          { id: 'extra-no-pickle', name: 'Sin Pepinillos (Quitar)', priceDelta: 0 },
        ],
      },
    ],
    recipe: [
      { ingredientId: 'ing-angus-meat', quantity: 120 }, // 120g Carne Angus por burger
      { ingredientId: 'ing-brioche-bun', quantity: 1 },   // 1 Pan Brioche
      { ingredientId: 'ing-cheddar-cheese', quantity: 2 }, // 2 Rebanadas de Queso Cheddar
    ],
  },
  {
    id: 'prod-latte',
    name: 'Iced Latte Artesanal de Vainilla Bourbon',
    description: 'Espresso doble de origen con leche emulsionada sedosa y jarabe orgánico macerado con vainilla de Madagascar.',
    category: 'Bebidas',
    type: 'bebida',
    price: 75,
    costPrice: 24,
    stock: 45,
    minStockAlert: 10,
    imageUrl: '/src/assets/images/product_signature_latte_1791387717165.jpg',
    available: true,
    badge: 'Favorito del Barista',
    optionGroups: [
      {
        id: 'opt-temp',
        title: 'Temperatura',
        type: 'single',
        required: true,
        options: [
          { id: 'temp-iced', name: 'En las Rocas (Con Hielo)', priceDelta: 0 },
          { id: 'temp-hot', name: 'Caliente Texturizado (65°C)', priceDelta: 0 },
          { id: 'temp-frappe', name: 'Estilo Frappé Cremoso', priceDelta: 12 },
        ],
      },
      {
        id: 'opt-size',
        title: 'Tamaño',
        type: 'single',
        required: true,
        options: [
          { id: 'latte-reg', name: 'Regular (12 oz)', priceDelta: 0 },
          { id: 'latte-large', name: 'Grande (16 oz)', priceDelta: 18 },
        ],
      },
      {
        id: 'opt-milk',
        title: 'Tipo de Leche',
        type: 'single',
        required: true,
        options: [
          { id: 'milk-whole', name: 'Leche Entera Cremosa', priceDelta: 0, extraIngredientId: 'ing-whole-milk', extraIngredientQuantity: 220 },
          { id: 'milk-light', name: 'Leche Deslactosada Light', priceDelta: 0, extraIngredientId: 'ing-light-milk', extraIngredientQuantity: 220 },
          { id: 'milk-oat', name: 'Leche de Avena Barista', priceDelta: 15, extraIngredientId: 'ing-oat-milk', extraIngredientQuantity: 220 },
          { id: 'milk-almond', name: 'Leche de Almendra Tostada', priceDelta: 15, extraIngredientId: 'ing-almond-milk', extraIngredientQuantity: 220 },
        ],
      },
      {
        id: 'opt-latte-extras',
        title: 'Toppings y Adicionales',
        type: 'multiple',
        required: false,
        options: [
          { id: 'extra-shot', name: 'Doble Shot de Espresso Extra', priceDelta: 15, extraIngredientId: 'ing-coffee-beans', extraIngredientQuantity: 18 },
          { id: 'extra-caramel', name: 'Llovizna de Caramelo Salado', priceDelta: 10, extraIngredientId: 'ing-salted-caramel', extraIngredientQuantity: 25 },
          { id: 'extra-sugarfree', name: 'Endulzante Stevia / Monk Fruit', priceDelta: 0 },
        ],
      },
    ],
    recipe: [
      { ingredientId: 'ing-coffee-beans', quantity: 18 },  // 18g de café espresso base
      { ingredientId: 'ing-vanilla-syrup', quantity: 20 }, // 20ml de jarabe de vainilla
      { ingredientId: 'ing-cup-cold', quantity: 1 },       // 1 vaso descartable con tapa
    ],
  },
  {
    id: 'prod-beans',
    name: 'Bolsa de Café de Especialidad en Grano (340g)',
    description: 'Granos de altura 1,650 msnm proceso Honey con notas a chocolate amargo, frutos rojos y miel silvestre.',
    category: 'Tienda & Retail',
    type: 'producto_fisico',
    price: 240,
    costPrice: 110,
    stock: 15,
    minStockAlert: 5,
    imageUrl: '/src/assets/images/promo_specialty_blend_1791387684928.jpg',
    available: true,
    badge: 'Cosecha Limitada',
    optionGroups: [
      {
        id: 'opt-grind',
        title: 'Tipo de Molienda',
        type: 'single',
        required: true,
        options: [
          { id: 'grind-whole', name: 'Grano Entero (Para Moler en Casa)', priceDelta: 0 },
          { id: 'grind-fine', name: 'Molido Fino (Para Cafetera Espresso)', priceDelta: 0 },
          { id: 'grind-medium', name: 'Molido Medio (Filtro / V60 / Goteo)', priceDelta: 0 },
          { id: 'grind-coarse', name: 'Molido Grueso (Prensa Francesa / Cold Brew)', priceDelta: 0 },
        ],
      },
      {
        id: 'opt-gift-pack',
        title: 'Empaque de Regalo',
        type: 'multiple',
        required: false,
        options: [
          { id: 'pack-box', name: 'Caja Kraft de Lujo con Sello Lacrado', priceDelta: 35 },
          { id: 'pack-card', name: 'Tarjeta con Dedicatoria Personalizada', priceDelta: 15 },
        ],
      },
    ],
    recipe: [
      { ingredientId: 'ing-coffee-beans', quantity: 340 }, // 340g del MISMO café central
      { ingredientId: 'ing-kraft-bag', quantity: 1 },      // 1 bolsa kraft
    ],
  },
  {
    id: 'prod-tasting-service',
    name: 'Experiencia Privada de Cata & Maridaje',
    description: 'Sesión presencial de 90 minutos para 2 personas con maestro tostador. Degustación de 4 orígenes y maridaje dulce.',
    category: 'Servicios',
    type: 'servicio',
    price: 490,
    costPrice: 160,
    stock: 6,
    minStockAlert: 2,
    imageUrl: '/src/assets/images/hero_artisan_banner_1791387671351.jpg',
    available: true,
    badge: 'Experiencia Exclusiva',
    optionGroups: [
      {
        id: 'opt-turn',
        title: 'Horario del Servicio',
        type: 'single',
        required: true,
        options: [
          { id: 'turn-morning', name: 'Sábado 11:00 AM (Matutino)', priceDelta: 0 },
          { id: 'turn-afternoon', name: 'Sábado 05:00 PM (Atardecer)', priceDelta: 0 },
          { id: 'turn-sunday', name: 'Domingo 12:00 PM (Brunch)', priceDelta: 20 },
        ],
      },
      {
        id: 'opt-service-extras',
        title: 'Complementos de la Sesión',
        type: 'multiple',
        required: false,
        options: [
          { id: 'extra-person', name: 'Persona Adicional a la Mesa (+1 Pax)', priceDelta: 190 },
          { id: 'extra-mug-kit', name: 'Par de Tazas Cerámicas Conmemorativas', priceDelta: 140 },
        ],
      },
    ],
    recipe: [
      { ingredientId: 'ing-coffee-beans', quantity: 60 }, // 60g del café central para la cata
    ],
  },
];

export const INITIAL_BANNERS: PromoBanner[] = [
  {
    id: 'ban-1',
    title: 'Festival del Café & Smash Grill',
    subtitle: 'Prueba la combinación perfecta: Smash Burger y Latte Frío de autor',
    tagline: 'Oferta Especial de la Semana',
    badge: 'PROMOCIÓN',
    imageUrl: '/src/assets/images/hero_artisan_banner_1791387671351.jpg',
    targetProductId: 'prod-burger',
    active: true,
    discountHighlight: 'Envío Gratis',
  },
  {
    id: 'ban-2',
    title: 'Cosecha Limitada de Altura',
    subtitle: 'Nuevos lotes recién tostados con notas a chocolate amargo y miel',
    tagline: 'Directo de Finca Asociada',
    badge: 'PATROCINIO',
    imageUrl: '/src/assets/images/promo_specialty_blend_1791387684928.jpg',
    targetProductId: 'prod-beans',
    active: true,
    discountHighlight: 'Tostado Semanal',
  },
  {
    id: 'ban-3',
    title: 'Nueva Receta: Iced Bourbon Latte',
    subtitle: 'Vainilla natural infusionada y café de alta densidad con hielo',
    tagline: 'Bebida de Temporada',
    badge: 'NOVEDAD',
    imageUrl: '/src/assets/images/product_signature_latte_1791387717165.jpg',
    targetProductId: 'prod-latte',
    active: true,
    discountHighlight: 'Recomendado',
  },
];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-coffee-beans',
    name: 'Café de Especialidad (Grano Espresso Blend)',
    unit: 'g',
    stock: 5000, // 5,000 gramos = 5 kg
    minStockAlert: 1000,
    costPerUnit: 0.35, // $0.35/g ($350 por kg)
    category: 'Café & Granos',
    supplier: 'Finca Las Nubes, Veracruz',
  },
  {
    id: 'ing-whole-milk',
    name: 'Leche Entera Cremosa Barista',
    unit: 'ml',
    stock: 15000, // 15,000 ml = 15 Litros
    minStockAlert: 3000,
    costPerUnit: 0.025, // $25 por litro
    category: 'Lácteos & Bebidas',
    supplier: 'Lácteos Los Alpes',
  },
  {
    id: 'ing-light-milk',
    name: 'Leche Deslactosada Light',
    unit: 'ml',
    stock: 12000, // 12,000 ml = 12 Litros
    minStockAlert: 2500,
    costPerUnit: 0.026,
    category: 'Lácteos & Bebidas',
    supplier: 'Lácteos Los Alpes',
  },
  {
    id: 'ing-oat-milk',
    name: 'Leche de Avena Barista (Vegetal)',
    unit: 'ml',
    stock: 8000, // 8,000 ml = 8 Litros
    minStockAlert: 2000,
    costPerUnit: 0.045,
    category: 'Lácteos & Bebidas',
    supplier: 'Oat Craft Barista',
  },
  {
    id: 'ing-almond-milk',
    name: 'Leche de Almendra Tostada',
    unit: 'ml',
    stock: 6000, // 6,000 ml = 6 Litros
    minStockAlert: 1500,
    costPerUnit: 0.048,
    category: 'Lácteos & Bebidas',
    supplier: 'Almond Pure MX',
  },
  {
    id: 'ing-salted-caramel',
    name: 'Llovizna de Caramelo Salado Artesanal',
    unit: 'ml',
    stock: 2000, // 2,000 ml
    minStockAlert: 400,
    costPerUnit: 0.07,
    category: 'Jarabes & Toppings',
    supplier: 'Syrup Craft Labs',
  },
  {
    id: 'ing-vanilla-syrup',
    name: 'Jarabe Artesanal Vainilla Bourbon',
    unit: 'ml',
    stock: 2500, // 2,500 ml
    minStockAlert: 500,
    costPerUnit: 0.08,
    category: 'Jarabes & Toppings',
    supplier: 'Syrup Craft Labs',
  },
  {
    id: 'ing-cup-cold',
    name: 'Vaso Biodegradable 16oz + Tapa',
    unit: 'unidad',
    stock: 200,
    minStockAlert: 40,
    costPerUnit: 3.5,
    category: 'Empaques & Desechables',
    supplier: 'EcoPackaging MX',
  },
  {
    id: 'ing-angus-meat',
    name: 'Carne Angus Molida Prime (100% Res)',
    unit: 'g',
    stock: 8000, // 8,000 g = 8 kg
    minStockAlert: 1500,
    costPerUnit: 0.22, // $220 por kg
    category: 'Carnes & Proteínas',
    supplier: 'Carnicería Sonora Prime',
  },
  {
    id: 'ing-brioche-bun',
    name: 'Pan Brioche Artesanal Mantequilla',
    unit: 'unidad',
    stock: 50,
    minStockAlert: 12,
    costPerUnit: 12.0,
    category: 'Panadería',
    supplier: 'Panadería La Tahona',
  },
  {
    id: 'ing-cheddar-cheese',
    name: 'Rebanadas de Queso Cheddar Fundente',
    unit: 'unidad',
    stock: 120,
    minStockAlert: 25,
    costPerUnit: 4.5,
    category: 'Lácteos & Quesos',
    supplier: 'Quesería del Valle',
  },
  {
    id: 'ing-bacon-slices',
    name: 'Tiras de Tocino Ahumado Manzano',
    unit: 'unidad',
    stock: 90,
    minStockAlert: 20,
    costPerUnit: 5.0,
    category: 'Carnes & Proteínas',
    supplier: 'Carnicería Sonora Prime',
  },
  {
    id: 'ing-kraft-bag',
    name: 'Bolsa Kraft con Válvula de Desgasificación (340g)',
    unit: 'unidad',
    stock: 60,
    minStockAlert: 15,
    costPerUnit: 8.5,
    category: 'Empaques & Desechables',
    supplier: 'EcoPackaging MX',
  },
];

