import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Product, Ingredient, Order, PromoBanner, BusinessProfile } from './types';

// 1. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Initialize Firestore using the designated databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

export const firebaseInfo = {
  projectId: firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId,
  appName: 'MultiRestaurant',
  consoleUrl: `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data`,
};

// 3. Error handling specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 4. Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
      return false;
    }
    // Expected to receive either document-not-found or permission-denied without breaking offline usage
    return true;
  }
}

// Auto-run connection test
testConnection();

// ============================================================================
// FIRESTORE SYNC & PERSISTENCE SERVICES
// ============================================================================

// --- Products ---
export function subscribeProducts(
  onSuccess: (products: Product[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'products';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({ ...data, id: docSnap.id } as Product);
      });
      onSuccess(items);
    },
    (err) => {
      console.error('Products listener error:', err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function upsertProductFirestore(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    // Sanitized document payload matching schema
    const payload = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      category: product.category || 'General',
      type: product.type || 'comida',
      price: Number(product.price) || 0,
      costPrice: Number(product.costPrice) || 0,
      stock: Number(product.stock) || 0,
      minStockAlert: Number(product.minStockAlert) || 0,
      imageUrl: product.imageUrl || '',
      isDriveUrl: Boolean(product.isDriveUrl),
      driveRawUrl: product.driveRawUrl || '',
      available: Boolean(product.available),
      badge: product.badge || '',
      optionGroups: product.optionGroups || [],
      recipe: product.recipe || [],
    };
    await setDoc(doc(db, 'products', product.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductFirestore(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Ingredients ---
export function subscribeIngredients(
  onSuccess: (ingredients: Ingredient[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'ingredients';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Ingredient[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({ ...data, id: docSnap.id } as Ingredient);
      });
      onSuccess(items);
    },
    (err) => {
      console.error('Ingredients listener error:', err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function upsertIngredientFirestore(ingredient: Ingredient): Promise<void> {
  const path = `ingredients/${ingredient.id}`;
  try {
    const payload = {
      id: ingredient.id,
      name: ingredient.name,
      unit: ingredient.unit,
      stock: Number(ingredient.stock) || 0,
      minStockAlert: Number(ingredient.minStockAlert) || 0,
      costPerUnit: Number(ingredient.costPerUnit) || 0,
      category: ingredient.category || 'General',
      supplier: ingredient.supplier || '',
    };
    await setDoc(doc(db, 'ingredients', ingredient.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteIngredientFirestore(ingredientId: string): Promise<void> {
  const path = `ingredients/${ingredientId}`;
  try {
    await deleteDoc(doc(db, 'ingredients', ingredientId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Orders ---
export function subscribeOrders(
  onSuccess: (orders: Order[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'orders';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({ ...data, id: docSnap.id } as Order);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onSuccess(items);
    },
    (err) => {
      console.error('Orders listener error:', err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function saveOrderFirestore(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    const payload = {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerNotes: order.customerNotes || '',
      items: order.items || [],
      subtotal: Number(order.subtotal) || 0,
      total: Number(order.total) || 0,
      paymentMethod: order.paymentMethod || 'efectivo',
      cashPayment: order.cashPayment || { amountPaid: 0, changeNeeded: 0 },
      paymentReceived: Boolean(order.paymentReceived),
      status: order.status || 'pendiente',
      createdAt: order.createdAt,
    };
    await setDoc(doc(db, 'orders', order.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateOrderStatusFirestore(orderId: string, status: Order['status'], paymentReceived?: boolean): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const patch: Record<string, unknown> = { status };
    if (paymentReceived !== undefined) {
      patch.paymentReceived = paymentReceived;
    }
    await setDoc(doc(db, 'orders', orderId), patch, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// --- Banners ---
export function subscribeBanners(
  onSuccess: (banners: PromoBanner[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'banners';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: PromoBanner[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({ ...data, id: docSnap.id } as PromoBanner);
      });
      onSuccess(items);
    },
    (err) => {
      console.error('Banners listener error:', err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.LIST, path);
    }
  );
}

export async function upsertBannerFirestore(banner: PromoBanner): Promise<void> {
  const path = `banners/${banner.id}`;
  try {
    const payload = {
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      tagline: banner.tagline || '',
      badge: banner.badge,
      imageUrl: banner.imageUrl,
      targetProductId: banner.targetProductId || '',
      active: Boolean(banner.active),
      discountHighlight: banner.discountHighlight || '',
    };
    await setDoc(doc(db, 'banners', banner.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBannerFirestore(bannerId: string): Promise<void> {
  const path = `banners/${bannerId}`;
  try {
    await deleteDoc(doc(db, 'banners', bannerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Business Profile ---
export function subscribeBusinessProfile(
  onSuccess: (profile: BusinessProfile) => void,
  onError?: (err: Error) => void
) {
  const path = 'business_profiles/main';
  return onSnapshot(
    doc(db, 'business_profiles', 'main'),
    (snapshot) => {
      if (snapshot.exists()) {
        onSuccess(snapshot.data() as BusinessProfile);
      }
    },
    (err) => {
      console.error('BusinessProfile listener error:', err);
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export async function saveBusinessProfileFirestore(profile: BusinessProfile): Promise<void> {
  const path = 'business_profiles/main';
  try {
    await setDoc(doc(db, 'business_profiles', 'main'), profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Batch Initial Seed / Push to Cloud ---
export async function pushAllToFirestore(data: {
  products: Product[];
  ingredients: Ingredient[];
  banners: PromoBanner[];
  orders: Order[];
  profile: BusinessProfile;
}): Promise<void> {
  const batch = writeBatch(db);

  // Profile
  batch.set(doc(db, 'business_profiles', 'main'), data.profile, { merge: true });

  // Products
  data.products.forEach((p) => {
    batch.set(doc(db, 'products', p.id), p);
  });

  // Ingredients
  data.ingredients.forEach((i) => {
    batch.set(doc(db, 'ingredients', i.id), i);
  });

  // Banners
  data.banners.forEach((b) => {
    batch.set(doc(db, 'banners', b.id), b);
  });

  // Orders
  data.orders.forEach((o) => {
    batch.set(doc(db, 'orders', o.id), o);
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'batch_seed');
  }
}
