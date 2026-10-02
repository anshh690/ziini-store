import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant, Coupon } from '../types';
import { validateCouponCode } from '../lib/storeService';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, size: string, quantity?: number) => { success: boolean; message: string };
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItemVariant: (itemId: string, newColor: string, newSize: string) => void;
  clearCart: () => void;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  totalItemCount: number;
  appliedCoupon: Coupon | null;
  couponMessage: string | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ziini_cart_v1';
const WISHLIST_STORAGE_KEY = 'ziini_wishlist_v1';
const FREE_SHIPPING_THRESHOLD = 150;
const STANDARD_SHIPPING_FEE = 15;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Recalculate coupon discount if cart total shifts
  useEffect(() => {
    if (appliedCoupon) {
      if (appliedCoupon.minOrder && subtotal < appliedCoupon.minOrder) {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponMessage(`Coupon ${appliedCoupon.code} removed (minimum order was ৳${appliedCoupon.minOrder}).`);
      } else {
        const disc = appliedCoupon.discountType === 'percent'
          ? Math.round((subtotal * appliedCoupon.value) / 100)
          : Math.min(appliedCoupon.value, subtotal);
        setCouponDiscount(disc);
      }
    }
  }, [subtotal, appliedCoupon]);

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || (appliedCoupon?.code === 'FREESHIP');
  const shippingFee = subtotal > 0 ? (isFreeShipping ? 0 : STANDARD_SHIPPING_FEE) : 0;
  const discount = couponDiscount;
  const total = Math.max(0, subtotal - discount + shippingFee);
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (
    product: Product, 
    variant: ProductVariant, 
    size: string, 
    quantity = 1
  ): { success: boolean; message: string } => {
    const availableStock = variant.sizes[size] ?? 0;
    if (availableStock <= 0) {
      return { success: false, message: `Selected variant (${variant.color} / ${size}) is out of stock.` };
    }

    const itemKey = `${product.id}__${variant.color}__${size}`.toLowerCase().replace(/\s+/g, '-');
    const existingIndex = items.findIndex(i => i.id === itemKey);
    const effectivePrice = variant.price ?? (product.salePrice ?? product.basePrice);
    const mainImage = variant.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80';

    if (existingIndex > -1) {
      const existing = items[existingIndex];
      const newQty = existing.quantity + quantity;
      if (newQty > availableStock) {
        return { 
          success: false, 
          message: `Cannot add more. Only ${availableStock} units available for ${variant.color} (${size}).` 
        };
      }
      const updated = [...items];
      updated[existingIndex] = { ...existing, quantity: newQty };
      setItems(updated);
    } else {
      if (quantity > availableStock) {
        return { 
          success: false, 
          message: `Only ${availableStock} units available for ${variant.color} (${size}).` 
        };
      }
      const newItem: CartItem = {
        id: itemKey,
        productId: product.id,
        productName: product.name,
        slug: product.slug,
        selectedColor: variant.color,
        colorCode: variant.colorCode,
        selectedSize: size,
        image: mainImage,
        unitPrice: effectivePrice,
        quantity,
        maxStock: availableStock,
        sku: variant.sku
      };
      setItems(prev => [newItem, ...prev]);
    }

    setCartDrawerOpen(true);
    return { success: true, message: `Added ${product.name} (${variant.color} - ${size}) to cart.` };
  };

  const removeFromCart = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const clamped = Math.min(newQty, item.maxStock);
        return { ...item, quantity: clamped };
      }
      return item;
    }));
  };

  const updateItemVariant = (itemId: string, newColor: string, newSize: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          id: `${item.productId}__${newColor}__${newSize}`.toLowerCase().replace(/\s+/g, '-'),
          selectedColor: newColor,
          selectedSize: newSize
        };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponMessage(null);
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    if (!code.trim()) return false;
    const res = await validateCouponCode(code, subtotal);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponDiscount(res.discount);
      setCouponMessage(res.message);
      return true;
    } else {
      setCouponMessage(res.message);
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponMessage(null);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemVariant,
        clearCart,
        cartDrawerOpen,
        setCartDrawerOpen,
        subtotal,
        shippingFee,
        discount,
        total,
        totalItemCount,
        appliedCoupon,
        couponMessage,
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isWishlisted
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
