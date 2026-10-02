export type Gender = 'men' | 'women' | 'boys' | 'unisex';
export type Category = 'clothing' | 'footwear' | 'accessories';
export type Subcategory = 
  | 'hoodies-sweats' 
  | 't-shirts' 
  | 'pants-cargos' 
  | 'jackets-outerwear' 
  | 'sneakers' 
  | 'boots' 
  | 'bags-backpacks' 
  | 'headwear' 
  | 'eyewear';

export interface ProductVariant {
  color: string;
  colorCode: string;
  sku: string;
  images: string[];
  sizes: Record<string, number>; // e.g. { "S": 10, "M": 14, "L": 8, "XL": 2 }
  price?: number; // optional variant-specific override
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  details?: string[];
  gender: Gender;
  category: Category;
  subcategory: string;
  basePrice: number;
  salePrice?: number;
  isSale?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  tags: string[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string; // unique item key: `${productId}-${color}-${size}`
  productId: string;
  productName: string;
  slug: string;
  selectedColor: string;
  colorCode: string;
  selectedSize: string;
  image: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
  sku: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled';

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  deliveryInstructions?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  color: string;
  colorCode: string;
  size: string;
  image: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  sku: string;
}

export interface PaymentDetails {
  gateway: 'bkash' | 'nagad' | 'cod';
  transactionId?: string;
  accountNumber?: string; // masked e.g. 017****1234
  paymentStatus: 'PAID' | 'PENDING';
  paidAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentDetails?: PaymentDetails;
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'customer' | 'admin';
  wishlist: string[]; // array of product IDs
  savedAddresses?: ShippingAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'percent' | 'fixed';
  value: number; // e.g. 15 for 15% or 20 for ৳20
  minOrder?: number;
  active: boolean;
  description?: string;
}
