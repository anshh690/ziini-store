import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onNavigateToCheckout: () => void;
  onNavigateToCart: () => void;
  onContinueShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onNavigateToCheckout,
  onNavigateToCart,
  onContinueShopping,
}) => {
  const { 
    items, 
    cartDrawerOpen, 
    setCartDrawerOpen, 
    removeFromCart, 
    updateQuantity,
    subtotal, 
    shippingFee, 
    discount, 
    total, 
    appliedCoupon, 
    couponMessage, 
    applyCoupon, 
    removeCoupon 
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  if (!cartDrawerOpen) return null;

  const freeShippingThreshold = 150;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    await applyCoupon(couponInput);
    setCouponLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0c0c0c] border-l border-neutral-800 flex flex-col justify-between shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#ccff00]" />
              <h2 className="font-display text-lg font-bold uppercase tracking-wider text-white">
                YOUR BAG ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setCartDrawerOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-neutral-900/60 px-5 py-3 border-b border-neutral-800/60">
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-neutral-400">
                {remainingForFreeShipping > 0 
                  ? `Add ৳${remainingForFreeShipping.toFixed(2)} for FREE shipping` 
                  : '🎉 Free Standard Delivery Unlocked'}
              </span>
              <span className="text-[#ccff00] font-bold">{freeShippingPercent}%</span>
            </div>
            <div className="w-full h-1 bg-neutral-800 overflow-hidden">
              <div 
                className="h-full bg-[#ccff00] transition-all duration-300"
                style={{ width: `${freeShippingPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-neutral-900">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 border border-neutral-800 flex items-center justify-center mb-4 text-neutral-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-display text-base font-bold uppercase text-white mb-2">
                  YOUR BAG IS EMPTY
                </h3>
                <p className="text-xs text-neutral-400 max-w-xs mb-6">
                  Discover our curated seasonal drops for men, women, and boys.
                </p>
                <button
                  onClick={() => {
                    setCartDrawerOpen(false);
                    onContinueShopping();
                  }}
                  className="px-6 py-3 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"
                >
                  START SHOPPING
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-24 bg-neutral-950 shrink-0 border border-neutral-800 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.productName}
                      className="w-full h-full object-cover object-center" 
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold uppercase text-white line-clamp-1">
                          {item.productName}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400 mt-1">
                        <span className="flex items-center gap-1.5">
                          <span 
                            className="w-2.5 h-2.5 inline-block border border-white/20" 
                            style={{ backgroundColor: item.colorCode }}
                          />
                          {item.selectedColor}
                        </span>
                        <span>•</span>
                        <span className="bg-neutral-800 px-1.5 py-0.5 text-neutral-300">
                          {item.selectedSize}
                        </span>
                      </div>
                      
                      <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                        SKU: {item.sku}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-neutral-800 bg-neutral-950">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-mono font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={item.quantity >= item.maxStock}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className={`p-1.5 transition-colors ${
                            item.quantity >= item.maxStock 
                              ? 'text-neutral-600 cursor-not-allowed' 
                              : 'text-neutral-400 hover:text-white'
                          }`}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Price */}
                      <div className="text-xs font-mono font-bold text-white">
                        ৳{(item.unitPrice * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-5 border-t border-neutral-800 bg-[#0a0a0a] space-y-4">
              {/* Promo Code Form */}
              <div>
                {!appliedCoupon ? (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="text"
                        placeholder="PROMO CODE (e.g. ZIINI10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="w-full bg-neutral-900 border border-neutral-800 pl-8 pr-3 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#ccff00]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-4 py-2 bg-neutral-800 hover:bg-[#ccff00] hover:text-black text-white text-xs font-mono font-bold uppercase transition-colors disabled:opacity-50"
                    >
                      APPLY
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between bg-neutral-900/80 border border-[#ccff00]/40 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#ccff00]" />
                      <span className="text-xs font-mono font-bold text-[#ccff00]">
                        {appliedCoupon.code} (-৳{discount.toFixed(2)})
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-mono text-neutral-400 hover:text-white underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {couponMessage && (
                  <p className="text-[10px] font-mono text-neutral-400 mt-1">
                    {couponMessage}
                  </p>
                )}
              </div>

              {/* Order Calculations */}
              <div className="space-y-1.5 text-xs font-mono text-neutral-400 border-t border-neutral-900 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">৳{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#ccff00]">
                    <span>Coupon Discount</span>
                    <span>-৳{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-white">
                    {shippingFee === 0 ? 'FREE' : `৳${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
                  <span>TOTAL</span>
                  <span className="text-base text-[#ccff00]">৳{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setCartDrawerOpen(false);
                    onNavigateToCheckout();
                  }}
                  className="w-full py-3.5 bg-[#ccff00] hover:bg-[#d8ff33] text-black font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#ccff00]/10"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCartDrawerOpen(false);
                    onNavigateToCart();
                  }}
                  className="w-full py-2.5 bg-transparent border border-neutral-800 hover:border-neutral-600 text-neutral-300 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors"
                >
                  VIEW FULL BAG
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-neutral-500">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ccff00]" />
                <span>SSL ENCRYPTED SECURE TRANSACTION</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
