import React, { useState } from 'react';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product, selectedColor?: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const { showToast } = useToast();

  // Active color variant state
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [showQuickSizes, setShowQuickSizes] = useState(false);
  const [hoveredImageIndex, setHoveredImageIndex] = useState(0);

  const currentVariant: ProductVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const isFavorited = wishlist.includes(product.id);

  // Available images for the currently selected color
  const currentImages = currentVariant?.images?.length ? currentVariant.images : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80'];
  const displayImage = currentImages[hoveredImageIndex] || currentImages[0];

  // Price calculations
  const effectivePrice = currentVariant?.price ?? (product.salePrice ?? product.basePrice);
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice;
  const discountPercent = hasDiscount 
    ? Math.round(((product.basePrice - (product.salePrice ?? product.basePrice)) / product.basePrice) * 100)
    : 0;

  // Available sizes for this variant
  const availableSizes = Object.entries(currentVariant?.sizes || {}).filter(([_, stock]) => stock > 0);
  const isOutOfStock = availableSizes.length === 0;

  const handleQuickAdd = (size: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = addToCart(product, currentVariant, size, 1);
    if (res.success) {
      showToast(`Added ${product.name} (${currentVariant.color} - ${size}) to bag`, 'success');
      setShowQuickSizes(false);
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div 
      className="group relative flex flex-col bg-[#0d0d0d] border border-neutral-800/80 hover:border-neutral-700 transition-all duration-300"
      onMouseLeave={() => {
        setShowQuickSizes(false);
        setHoveredImageIndex(0);
      }}
    >
      {/* Product Image Container (3:4 aspect ratio) */}
      <div 
        className="relative w-full aspect-[3/4] bg-neutral-950 overflow-hidden cursor-pointer"
        onClick={() => onSelect(product, currentVariant.color)}
      >
        <img
          src={displayImage}
          alt={`${product.name} in ${currentVariant.color}`}
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          onMouseEnter={() => {
            if (currentImages.length > 1) {
              setHoveredImageIndex(1);
            }
          }}
          onMouseLeave={() => setHoveredImageIndex(0)}
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="bg-[#ccff00] text-[#050505] text-[10px] font-black font-mono px-2 py-0.5 tracking-wider uppercase">
              -{discountPercent}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="bg-white text-black text-[10px] font-bold font-mono px-2 py-0.5 tracking-wider uppercase">
              NEW
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-red-950/90 text-red-300 border border-red-800/80 text-[10px] font-bold font-mono px-2 py-0.5 tracking-wider uppercase">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
            showToast(isFavorited ? 'Removed from wishlist' : 'Saved to wishlist', 'info');
          }}
          className={`absolute top-2.5 right-2.5 p-2 transition-all duration-200 z-10 ${
            isFavorited
              ? 'text-[#ccff00] bg-black/80'
              : 'text-neutral-400 hover:text-white bg-black/60 hover:bg-black/90'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-[#ccff00]' : ''}`} />
        </button>

        {/* Quick Add Bar / Drawer at bottom of card */}
        <div className="absolute inset-x-0 bottom-0 p-2.5 z-20">
          {!showQuickSizes ? (
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={(e) => {
                e.stopPropagation();
                if (availableSizes.length === 1) {
                  // Only one size (e.g. ONE SIZE)
                  handleQuickAdd(availableSizes[0][0], e);
                } else {
                  setShowQuickSizes(true);
                }
              }}
              className={`w-full py-2.5 px-3 text-[11px] font-bold font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-200 ${
                isOutOfStock
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                  : 'bg-black/90 hover:bg-[#ccff00] hover:text-black text-white border border-neutral-700 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? 'OUT OF STOCK' : '+ QUICK ADD'}</span>
            </button>
          ) : (
            <div 
              className="bg-[#111111]/95 border border-neutral-700 p-2 shadow-2xl animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[10px] font-mono text-neutral-400 mb-1.5 uppercase tracking-wider text-center">
                Select Size ({currentVariant.color})
              </p>
              <div className="flex flex-wrap gap-1 justify-center">
                {Object.entries(currentVariant.sizes).map(([size, stock]) => {
                  const hasStock = stock > 0;
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={!hasStock}
                      onClick={(e) => handleQuickAdd(size, e)}
                      className={`text-[10px] font-mono font-bold px-2 py-1 border transition-all ${
                        hasStock
                          ? 'border-neutral-700 text-neutral-200 hover:border-[#ccff00] hover:bg-[#ccff00] hover:text-black'
                          : 'border-neutral-800 text-neutral-600 line-through cursor-not-allowed bg-neutral-900/50'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Content & Color Selector */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Subcategory & Gender */}
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
            <span>{product.gender} • {product.category}</span>
            <span className="text-neutral-500 text-[9px]">{currentVariant.sku}</span>
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => onSelect(product, currentVariant.color)}
            className="text-xs sm:text-sm font-bold tracking-tight text-white hover:text-[#ccff00] cursor-pointer transition-colors line-clamp-1"
          >
            {product.name}
          </h3>
        </div>

        {/* COLOR VARIATION SWATCHES - CRITICAL REQUIREMENT */}
        <div className="flex items-center justify-between pt-1 border-t border-neutral-800/60">
          <div className="flex items-center gap-1.5 flex-wrap">
            {product.variants.map((v, idx) => {
              const isSelected = idx === selectedVariantIndex;
              return (
                <button
                  key={v.color}
                  type="button"
                  title={`${v.color} (${v.sku})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVariantIndex(idx);
                    setHoveredImageIndex(0);
                  }}
                  className={`relative w-4 h-4 transition-all duration-150 ${
                    isSelected 
                      ? 'ring-2 ring-[#ccff00] ring-offset-2 ring-offset-[#0d0d0d] scale-110' 
                      : 'hover:scale-110 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: v.colorCode }}
                >
                  {/* Subtle white/black border for light swatches */}
                  <span className="absolute inset-0 border border-white/20"></span>
                </button>
              );
            })}
          </div>

          <span className="text-[10px] font-mono text-neutral-400 capitalize">
            {currentVariant.color}
          </span>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-sm sm:text-base font-bold font-mono text-white">
            ৳{effectivePrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-xs font-mono text-neutral-500 line-through">
              ৳{product.basePrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
