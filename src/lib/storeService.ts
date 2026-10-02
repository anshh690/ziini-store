import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Product, Order, OrderStatus, Coupon, CartItem, ShippingAddress } from '../types';
import { INITIAL_PRODUCTS, SAMPLE_COUPONS } from './sampleProducts';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const COUPONS_COLLECTION = 'coupons';

// Auto-seed helper if Firestore has no products yet
export async function ensureCatalogPopulated(): Promise<Product[]> {
  try {
    const collRef = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(collRef);
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
    }
    
    // Seed initial products to Firestore
    console.log('Catalog empty, seeding Firestore with curated fashion items...');
    const created: Product[] = [];
    for (const prod of INITIAL_PRODUCTS) {
      const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
      await setDoc(docRef, prod);
      created.push(prod);
    }

    // Seed coupons too
    for (const c of SAMPLE_COUPONS) {
      const cRef = doc(db, COUPONS_COLLECTION, c.code);
      await setDoc(cRef, c);
    }

    return created;
  } catch (error) {
    console.warn('Error reading/seeding products from Firestore, falling back to local dataset:', error);
    return INITIAL_PRODUCTS;
  }
}

export async function getProducts(options?: {
  gender?: string;
  category?: string;
  isSale?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
}): Promise<Product[]> {
  try {
    const collRef = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(collRef);
    
    if (snap.empty) {
      return await ensureCatalogPopulated();
    }

    let products = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));

    if (options?.gender && options.gender !== 'all') {
      products = products.filter(p => p.gender === options.gender || p.gender === 'unisex');
    }
    if (options?.category && options.category !== 'all') {
      products = products.filter(p => p.category === options.category);
    }
    if (options?.isSale) {
      products = products.filter(p => p.isSale || (p.salePrice && p.salePrice < p.basePrice));
    }
    if (options?.isNewArrival) {
      products = products.filter(p => p.isNewArrival);
    }
    if (options?.isFeatured) {
      products = products.filter(p => p.isFeatured);
    }

    return products;
  } catch (error) {
    console.warn('getProducts failed from Firestore, using initial dataset:', error);
    return INITIAL_PRODUCTS;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Product;
    }
    const foundLocal = INITIAL_PRODUCTS.find(p => p.id === id);
    return foundLocal || null;
  } catch (error) {
    console.warn('getProductById failed, falling back:', error);
    return INITIAL_PRODUCTS.find(p => p.id === id) || null;
  }
}

export async function saveProduct(product: Product): Promise<Product> {
  const path = `${PRODUCTS_COLLECTION}/${product.id}`;
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
    const payload = {
      ...product,
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, payload, { merge: true });
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeProduct(productId: string): Promise<void> {
  const path = `${PRODUCTS_COLLECTION}/${productId}`;
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Order management with inventory reduction
export async function createOrderTransaction(
  orderInput: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'status'> & { status?: OrderStatus }
): Promise<Order> {
  const orderNumber = `ZN-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    ...orderInput,
    id: orderId,
    orderNumber,
    status: orderInput.status || 'pending',
    createdAt: now,
    updatedAt: now
  };

  try {
    // Run Firestore transaction to validate and decrement stock for each cart item
    await runTransaction(db, async (transaction) => {
      // 1. Read all required product documents
      const productDocs = new Map<string, any>();
      for (const item of orderInput.items) {
        if (!productDocs.has(item.productId)) {
          const prodRef = doc(db, PRODUCTS_COLLECTION, item.productId);
          const snap = await transaction.get(prodRef);
          if (snap.exists()) {
            productDocs.set(item.productId, { ref: prodRef, data: snap.data() });
          }
        }
      }

      // 2. Validate and adjust variants
      for (const item of orderInput.items) {
        const prod = productDocs.get(item.productId);
        if (prod) {
          const variants = [...prod.data.variants];
          const variantIndex = variants.findIndex(v => v.color.toLowerCase() === item.color.toLowerCase());
          if (variantIndex !== -1) {
            const variant = { ...variants[variantIndex] };
            const currentStock = variant.sizes?.[item.size] ?? 0;
            if (currentStock < item.quantity) {
              throw new Error(`Insufficient stock for ${item.productName} (${item.color} - ${item.size}). Remaining: ${currentStock}`);
            }
            variant.sizes = {
              ...variant.sizes,
              [item.size]: Math.max(0, currentStock - item.quantity)
            };
            variants[variantIndex] = variant;
            prod.data.variants = variants;
            // stage write in transaction
            transaction.update(prod.ref, { 
              variants,
              updatedAt: now
            });
          }
        }
      }

      // 3. Create the order doc
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      transaction.set(orderRef, newOrder);
    });

    return newOrder;
  } catch (error) {
    console.error('Order creation transaction failed:', error);
    // If transaction fails (e.g. offline or rules), attempt direct order creation
    try {
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      await setDoc(orderRef, newOrder);
      return newOrder;
    } catch (inner) {
      handleFirestoreError(error, OperationType.CREATE, `${ORDERS_COLLECTION}/${orderId}`);
    }
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const collRef = collection(db, ORDERS_COLLECTION);
    const snap = await getDocs(collRef);
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.warn('getAllOrders error:', error);
    return [];
  }
}

export async function getCustomerOrders(email: string, customerId?: string): Promise<Order[]> {
  try {
    const all = await getAllOrders();
    return all.filter(o => 
      o.customerEmail.toLowerCase() === email.toLowerCase() || 
      (customerId && o.customerId === customerId)
    );
  } catch (error) {
    console.warn('getCustomerOrders error:', error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const path = `${ORDERS_COLLECTION}/${orderId}`;
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function validateCouponCode(code: string, currentSubtotal: number): Promise<{ valid: boolean; discount: number; message: string; coupon?: Coupon }> {
  const normalized = code.trim().toUpperCase();
  try {
    const docRef = doc(db, COUPONS_COLLECTION, normalized);
    const snap = await getDoc(docRef);
    let coupon: Coupon | undefined;

    if (snap.exists()) {
      coupon = snap.data() as Coupon;
    } else {
      coupon = SAMPLE_COUPONS.find(c => c.code.toUpperCase() === normalized);
    }

    if (!coupon || !coupon.active) {
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
    }

    if (coupon.minOrder && currentSubtotal < coupon.minOrder) {
      return { valid: false, discount: 0, message: `Minimum purchase of ৳${coupon.minOrder} required.` };
    }

    let discount = 0;
    if (coupon.discountType === 'percent') {
      discount = Math.round((currentSubtotal * coupon.value) / 100);
    } else {
      discount = Math.min(coupon.value, currentSubtotal);
    }

    return {
      valid: true,
      discount,
      message: `Coupon applied: -${coupon.discountType === 'percent' ? coupon.value + '%' : '৳' + coupon.value}`,
      coupon
    };
  } catch (err) {
    // fallback check
    const local = SAMPLE_COUPONS.find(c => c.code.toUpperCase() === normalized);
    if (local) {
      const discount = local.discountType === 'percent' 
        ? Math.round((currentSubtotal * local.value) / 100) 
        : Math.min(local.value, currentSubtotal);
      return { valid: true, discount, message: 'Coupon applied successfully!', coupon: local };
    }
    return { valid: false, discount: 0, message: 'Invalid coupon code.' };
  }
}

// Reset/reseed database directly from admin
export async function reseedStoreDatabase(): Promise<number> {
  let count = 0;
  for (const prod of INITIAL_PRODUCTS) {
    const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
    await setDoc(docRef, { ...prod, updatedAt: new Date().toISOString() });
    count++;
  }
  for (const c of SAMPLE_COUPONS) {
    const cRef = doc(db, COUPONS_COLLECTION, c.code);
    await setDoc(cRef, c);
  }
  return count;
}
