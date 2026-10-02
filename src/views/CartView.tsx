import React, { useState } from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface CartViewProps {
  onNavigate: (view: string, params?: any) => void;
  onSelectProductById: (productId: string) => void;
}

export const CartView: React.FC<CartViewProps> = ({ onNavigate, onSelectProductById }) => {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
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
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  const freeShippingThreshold = 150;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setLoadingCoupon(true);
    await applyCoupon(couponInput);
    setLoadingCoupon(false);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-20 h-20 border border-neutral-800 flex items-center justify-center mx-auto mb-6 text-neutral-600">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-display text-3xl font-black uppercase text-white mb-3">
          YOUR SHOPPING BAG IS EMPTY
        </h1>
        <p className="text-sm font-mono text-neutral-400 max-w-md mx-auto mb-8">
          Explore our latest collection drops for Men, Women, and Boys.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-8 py-4 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"
        >
          START BROWSING ARCHIVE
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-neutral-800 pb-6 gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#ccff00]">
            ORDER STAGING
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-white tracking-tight mt-1">
            SHOPPING BAG ({items.reduce((s, i) => s + i.quantity, 0)})
          </h1>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-mono text-neutral-500 hover:text-red-400 underline uppercase"
        >
          Clear All Items
        </button>
      </div>

      {/* Free Shipping Meter */}
      <div className="bg-[#0e0e0e] border border-neutral-800 p-4">
        <div className="flex justify-between text-xs font-mono mb-2">
          <span className="text-neutral-300">
            {remainingForFreeShipping > 0 
              ? `Add ৳${remainingForFreeShipping.toFixed(2)} more for complimentary worldwide express delivery.`
              : '⚡ You have unlocked complimentary standard shipping worldwide!'}
          </span>
          <span className="text-[#ccff00] font-bold">{freeShippingPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-neutral-900 overflow-hidden">
          <div 
            className="h-full bg-[#ccff00] transition-all duration-300"
            style={{ width: `${freeShippingPercent}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Items Table + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ITEMS LIST (8 COLS) */}
        <div className="lg:col-span-8 bg-[#0c0c0c] border border-neutral-800 divide-y divide-neutral-900">
          {items.map((item) => (
            <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              <div className="flex gap-4">
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-20 h-26 sm:w-24 sm:h-32 object-cover object-center bg-neutral-950 border border-neutral-800 shrink-0 cursor-pointer"
                  onClick={() => onSelectProductById(item.productId)}
                />
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">
                    SKU: {item.sku}
                  </span>
                  <h3 
                    onClick={() => onSelectProductById(item.productId)}
                    className="text-sm sm:text-base font-bold text-white uppercase hover:text-[#ccff00] cursor-pointer transition-colors"
                  >
                    {item.productName}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-mono text-neutral-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 inline-block border border-white/20"
                        style={{ backgroundColor: item.colorCode }}
                      />
                      {item.selectedColor}
                    </span>
                    <span>•</span>
                    <span className="bg-neutral-800 px-1.5 py-0.5 text-white">
                      SIZE: {item.selectedSize}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-neutral-400 pt-1">
                    Unit Price: ৳{item.unitPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Quantity and Line Total */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                <div className="flex items-center border border-neutral-800 bg-neutral-950">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 text-neutral-400 hover:text-white"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-mono font-bold text-white">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    disabled={item.quantity >= item.maxStock}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 text-neutral-400 hover:text-white disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono text-base font-bold text-white">
                    ৳{(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-neutral-500 hover:text-red-400 p-1 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ORDER SUMMARY (4 COLS) */}
        <div className="lg:col-span-4 bg-[#0e0e0e] border border-neutral-800 p-6 space-y-6">
          <h2 className="font-display text-lg font-bold uppercase text-white tracking-wider pb-3 border-b border-neutral-800">
            SUMMARY
          </h2>

          {/* Coupon input */}
          <div>
            {!appliedCoupon ? (
              <form onSubmit={handleApply} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="PROMO CODE"
                    className="w-full bg-neutral-900 border border-neutral-800 pl-8 pr-3 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#ccff00]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingCoupon || !couponInput.trim()}
                  className="px-4 py-2 bg-neutral-800 hover:bg-[#ccff00] hover:text-black text-white text-xs font-mono font-bold uppercase transition-colors"
                >
                  APPLY
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between bg-neutral-900/80 border border-[#ccff00]/50 p-2.5 text-xs font-mono">
                <span className="text-[#ccff00] font-bold">
                  {appliedCoupon.code} (-৳{discount.toFixed(2)})
                </span>
                <button onClick={removeCoupon} className="text-neutral-400 hover:text-white underline">
                  Remove
                </button>
              </div>
            )}
            {couponMessage && (
              <p className="text-[10px] font-mono text-neutral-400 mt-1.5">{couponMessage}</p>
            )}
          </div>

          {/* Calculations */}
          <div className="space-y-2.5 text-xs font-mono text-neutral-300 border-t border-neutral-800 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-white">৳{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#ccff00]">
                <span>Promotional Discount</span>
                <span>-৳{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Standard Shipping</span>
              <span className="text-white">
                {shippingFee === 0 ? 'COMPLIMENTARY' : `৳${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-4 border-t border-neutral-800">
              <span>ESTIMATED TOTAL</span>
              <span className="text-lg text-[#ccff00]">৳{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => onNavigate('checkout')}
              className="w-full py-4 bg-[#ccff00] hover:bg-white text-black font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#ccff00]/10"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('shop')}
              className="w-full py-3 bg-transparent border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>CONTINUE SHOPPING</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-neutral-500 pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>256-BIT ENCRYPTED CHECKOUT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
