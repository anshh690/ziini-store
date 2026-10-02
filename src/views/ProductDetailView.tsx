import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Ruler, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  ChevronRight, 
  Minus, 
  Plus, 
  Maximize2, 
  X,
  Share2,
  Check
} from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailViewProps {
  product: Product;
  initialColor?: string;
  allProducts: Product[];
  onNavigate: (view: string, params?: any) => void;
  onSelectProduct: (product: Product, color?: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  initialColor,
  allProducts,
  onNavigate,
  onSelectProduct,
}) => {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const { showToast } = useToast();

  // Find initial variant matching color or default to 0
  const initialVariantIdx = Math.max(
    0,
    product.variants.findIndex(v => v.color.toLowerCase() === initialColor?.toLowerCase())
  );

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(initialVariantIdx);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'fabric' | 'shipping'>('details');

  // Active color variant - CRITICAL REQUIREMENT
  const currentVariant: ProductVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const images = currentVariant.images.length > 0 ? currentVariant.images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80'];
  const activeImage = images[selectedImageIndex] || images[0];

  // Available sizes and stock for this exact color
  const sizeEntries = Object.entries(currentVariant.sizes || {});
  const availableStockForSelectedSize = selectedSize ? (currentVariant.sizes[selectedSize] ?? 0) : 0;
  const isOutOfStockAll = sizeEntries.every(([_, stock]) => stock <= 0);

  // Auto-select first in-stock size when variant changes
  useEffect(() => {
    setSelectedImageIndex(0);
    const firstInStock = sizeEntries.find(([_, s]) => s > 0);
    if (firstInStock) {
      setSelectedSize(firstInStock[0]);
    } else if (sizeEntries.length > 0) {
      setSelectedSize(sizeEntries[0][0]);
    }
    setQuantity(1);
  }, [selectedVariantIndex, product.id]);

  const effectivePrice = currentVariant.price ?? (product.salePrice ?? product.basePrice);
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice;
  const isFavorited = wishlist.includes(product.id);

  // Related products
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && (p.category === product.category || p.gender === product.gender))
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize) {
      showToast('Please select a size first.', 'error');
      return;
    }
    const res = addToCart(product, currentVariant, selectedSize, quantity);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      showToast('Please select a size first.', 'error');
      return;
    }
    const res = addToCart(product, currentVariant, selectedSize, quantity);
    if (res.success) {
      onNavigate('checkout');
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase">
        <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
          HOME
        </button>
        <span>/</span>
        <button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">
          SHOP
        </button>
        <span>/</span>
        <button 
          onClick={() => onNavigate('shop', { gender: product.gender })} 
          className="hover:text-white transition-colors"
        >
          {product.gender}
        </button>
        <span>/</span>
        <span className="text-white truncate">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* LEFT COLUMN: IMAGE GALLERY (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails rail */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto shrink-0 sm:w-24">
            {images.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-18 h-24 sm:w-24 sm:h-32 bg-neutral-950 border overflow-hidden shrink-0 transition-all ${
                  selectedImageIndex === idx 
                    ? 'border-[#ccff00] ring-1 ring-[#ccff00]' 
                    : 'border-neutral-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`${product.name} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              </button>
            ))}
          </div>

          {/* Main Hero Gallery Viewport */}
          <div className="relative flex-1 aspect-[3/4] bg-neutral-950 border border-neutral-800 overflow-hidden group">
            <img
              src={activeImage}
              alt={`${product.name} in ${currentVariant.color}`}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {hasDiscount && (
                <span className="bg-[#ccff00] text-black text-xs font-mono font-black px-2.5 py-1 uppercase tracking-wider">
                  SALE ARCHIVE
                </span>
              )}
              {product.isNewArrival && (
                <span className="bg-white text-black text-xs font-mono font-bold px-2.5 py-1 uppercase tracking-wider">
                  NEW SEASON
                </span>
              )}
            </div>

            {/* Zoom Button */}
            <button
              type="button"
              onClick={() => setZoomModalOpen(true)}
              className="absolute top-4 right-4 p-2.5 bg-black/70 hover:bg-black text-white border border-neutral-700 transition-colors"
              aria-label="Zoom image"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Color Swatch Indicator Overlay */}
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 border border-neutral-700/80 flex items-center gap-2">
              <span 
                className="w-3 h-3 inline-block border border-white/20" 
                style={{ backgroundColor: currentVariant.colorCode }}
              />
              <span className="text-[11px] font-mono uppercase text-white font-bold">
                {currentVariant.color}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRODUCT DETAILS & PURCHASE (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Header / Titles */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono uppercase text-neutral-400 mb-2">
                <span>{product.gender} • {product.category}</span>
                <span className="text-[#ccff00] font-bold">SKU: {currentVariant.sku}</span>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl font-black uppercase text-white tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Price display */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white">
                  ৳{effectivePrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="font-mono text-base text-neutral-500 line-through">
                    ৳{product.basePrice.toFixed(2)}
                  </span>
                )}
                {hasDiscount && (
                  <span className="font-mono text-xs text-[#ccff00] font-bold">
                    SAVE ৳{(product.basePrice - effectivePrice).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* CRITICAL COLOR VARIANT SELECTOR */}
            <div className="p-4 bg-[#0d0d0d] border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400 uppercase font-bold tracking-wider">
                  SELECT COLORWAY:
                </span>
                <span className="text-white font-bold uppercase">
                  {currentVariant.color}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {product.variants.map((variant, idx) => {
                  const isSelected = idx === selectedVariantIndex;
                  return (
                    <button
                      key={variant.color}
                      type="button"
                      onClick={() => {
                        setSelectedVariantIndex(idx);
                        showToast(`Switched colorway to ${variant.color}`, 'info');
                      }}
                      className={`relative flex items-center gap-2 p-1.5 border transition-all ${
                        isSelected 
                          ? 'border-[#ccff00] bg-neutral-900/90 ring-1 ring-[#ccff00]' 
                          : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                      }`}
                    >
                      <span
                        className="w-5 h-5 block border border-white/20 shrink-0"
                        style={{ backgroundColor: variant.colorCode }}
                      />
                      <span className={`text-[11px] font-mono uppercase pr-1.5 ${isSelected ? 'text-white font-bold' : 'text-neutral-400'}`}>
                        {variant.color}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SIZE SELECTOR & SIZE GUIDE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400 uppercase font-bold tracking-wider">
                  SELECT SIZE:
                </span>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-neutral-400 hover:text-[#ccff00] uppercase underline flex items-center gap-1 transition-colors"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide</span>
                </button>
              </div>

              {/* Sizes Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {sizeEntries.map(([size, stock]) => {
                  const isAvailable = stock > 0;
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => {
                        setSelectedSize(size);
                        setQuantity(1);
                      }}
                      className={`relative py-3 text-xs font-mono font-bold uppercase border transition-all ${
                        !isAvailable
                          ? 'border-neutral-900 bg-neutral-950/60 text-neutral-600 line-through cursor-not-allowed'
                          : isSelected
                          ? 'border-[#ccff00] bg-[#ccff00] text-black'
                          : 'border-neutral-800 bg-neutral-900 text-white hover:border-neutral-600'
                      }`}
                    >
                      {size}
                      {isAvailable && stock <= 3 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ccff00] rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Stock status indicator */}
              <div className="text-xs font-mono pt-1">
                {selectedSize ? (
                  availableStockForSelectedSize > 0 ? (
                    availableStockForSelectedSize <= 5 ? (
                      <span className="text-[#ccff00] font-semibold">
                        ⚡ ONLY {availableStockForSelectedSize} UNITS REMAINING IN SIZE {selectedSize}
                      </span>
                    ) : (
                      <span className="text-neutral-400">
                        ✓ IN STOCK — READY FOR DISPATCH ({availableStockForSelectedSize} UNITS)
                      </span>
                    )
                  ) : (
                    <span className="text-red-400 font-semibold">
                      ✕ SIZE {selectedSize} IS CURRENTLY OUT OF STOCK
                    </span>
                  )
                ) : (
                  <span className="text-neutral-500">Please choose a size to check availability.</span>
                )}
              </div>
            </div>

            {/* QUANTITY SELECTOR */}
            {selectedSize && availableStockForSelectedSize > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono uppercase text-neutral-400 font-bold">
                  QTY:
                </span>
                <div className="flex items-center border border-neutral-800 bg-neutral-950">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-neutral-400 hover:text-white disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-mono font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(availableStockForSelectedSize, quantity + 1))}
                    disabled={quantity >= availableStockForSelectedSize}
                    className="p-2 text-neutral-400 hover:text-white disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS (ADD TO BAG, BUY NOW, WISHLIST) */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={!selectedSize || availableStockForSelectedSize <= 0}
                  onClick={handleAddToCart}
                  className="flex-1 py-4 bg-[#ccff00] hover:bg-white text-black font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#ccff00]/10"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    {!selectedSize 
                      ? 'SELECT SIZE' 
                      : availableStockForSelectedSize <= 0 
                      ? 'OUT OF STOCK' 
                      : 'ADD TO BAG'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toggleWishlist(product.id);
                    showToast(isFavorited ? 'Removed from wishlist' : 'Saved to wishlist', 'info');
                  }}
                  className={`p-4 border transition-colors ${
                    isFavorited
                      ? 'bg-neutral-900 border-[#ccff00] text-[#ccff00]'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-[#ccff00]' : ''}`} />
                </button>
              </div>

              <button
                type="button"
                disabled={!selectedSize || availableStockForSelectedSize <= 0}
                onClick={handleBuyNow}
                className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-mono font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                INSTANT CHECKOUT
              </button>
            </div>
          </div>

          {/* ACCORDION DETAILS / TABS */}
          <div className="border-t border-neutral-800 pt-6 space-y-4">
            <div className="flex border-b border-neutral-800 text-xs font-mono">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2.5 px-3 uppercase transition-colors ${
                  activeTab === 'details' 
                    ? 'text-[#ccff00] border-b-2 border-[#ccff00] font-bold' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('fabric')}
                className={`pb-2.5 px-3 uppercase transition-colors ${
                  activeTab === 'fabric' 
                    ? 'text-[#ccff00] border-b-2 border-[#ccff00] font-bold' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Specs & Care
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`pb-2.5 px-3 uppercase transition-colors ${
                  activeTab === 'shipping' 
                    ? 'text-[#ccff00] border-b-2 border-[#ccff00] font-bold' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Shipping & Delivery
              </button>
            </div>

            <div className="text-xs text-neutral-300 leading-relaxed min-h-[100px]">
              {activeTab === 'details' && (
                <div className="space-y-3">
                  <p>{product.description}</p>
                  {product.details && (
                    <ul className="space-y-1.5 font-mono text-[11px] text-neutral-400 list-disc list-inside pt-2">
                      {product.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {activeTab === 'fabric' && (
                <div className="space-y-2 font-mono text-[11px] text-neutral-400">
                  <p><strong className="text-white">Fabrication:</strong> 100% Organic Heavyweight Combed Cotton / Cordura® Laminated Ripstop.</p>
                  <p><strong className="text-white">Washing Instructions:</strong> Machine wash cold at 30°C with similar dark garments. Do not bleach. Air dry flat in shade.</p>
                  <p><strong className="text-white">Origin:</strong> Designed in Tokyo Studio. Manufactured in Portugal.</p>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-2 font-mono text-[11px] text-neutral-400">
                  <p><strong className="text-white">Express Delivery:</strong> 2-4 business days worldwide via DHL Express.</p>
                  <p><strong className="text-white">Free Shipping:</strong> Automatically applied at checkout on orders over ৳150.</p>
                  <p><strong className="text-white">Returns:</strong> 30-day complimentary return window with original tags intact.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display text-2xl font-black uppercase text-white tracking-tight">
              COMPLETE THE LOOK
            </h3>
            <button
              onClick={() => onNavigate('shop')}
              className="text-xs font-mono text-neutral-400 hover:text-[#ccff00] uppercase"
            >
              EXPLORE ALL
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* FULL SCREEN IMAGE ZOOM MODAL */}
      {zoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setZoomModalOpen(false)}
            className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-white"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={activeImage}
            alt="Zoomed view"
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
          <p className="font-mono text-xs text-neutral-400 mt-4 uppercase">
            {product.name} — {currentVariant.color}
          </p>
        </div>
      )}

      {/* SIZE GUIDE MODAL */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSizeGuideOpen(false)}
          />

          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-xl bg-[#0f0f0f] border border-neutral-800 p-6 sm:p-8 text-neutral-200">
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <span className="text-[10px] font-mono uppercase text-[#ccff00] tracking-widest">
                  MEASUREMENT MATRIX
                </span>
                <h3 className="font-display text-2xl font-bold uppercase text-white mt-1">
                  OFFICIAL SIZE GUIDE
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  All dimensions are in inches (standard relaxed oversized street fit).
                </p>
              </div>

              <div className="overflow-x-auto border border-neutral-800 mb-6">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400">
                    <tr>
                      <th className="p-3">SIZE</th>
                      <th className="p-3">CHEST (IN)</th>
                      <th className="p-3">LENGTH (IN)</th>
                      <th className="p-3">SHOULDER (IN)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    <tr>
                      <td className="p-3 font-bold text-white">S</td>
                      <td className="p-3">44 - 46</td>
                      <td className="p-3">28.5</td>
                      <td className="p-3">22.0</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">M</td>
                      <td className="p-3">46 - 48</td>
                      <td className="p-3">29.5</td>
                      <td className="p-3">23.0</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">L</td>
                      <td className="p-3">48 - 50</td>
                      <td className="p-3">30.5</td>
                      <td className="p-3">24.0</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">XL</td>
                      <td className="p-3">50 - 52</td>
                      <td className="p-3">31.5</td>
                      <td className="p-3">25.0</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                className="w-full py-3 bg-neutral-900 hover:bg-[#ccff00] hover:text-black border border-neutral-700 text-white font-mono text-xs font-bold uppercase transition-colors"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
