import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, X, ChevronDown, Check, RotateCcw } from 'lucide-react';
import { Product, Gender, Category } from '../types';
import { ProductCard } from '../components/ProductCard';

interface ShopViewProps {
  products: Product[];
  initialParams?: {
    gender?: string;
    category?: string;
    isSale?: boolean;
    isNewArrival?: boolean;
  };
  onSelectProduct: (product: Product, color?: string) => void;
  onNavigate: (view: string, params?: any) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  products,
  initialParams,
  onSelectProduct,
  onNavigate,
}) => {
  // Filter States
  const [selectedGender, setSelectedGender] = useState<string>(initialParams?.gender || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialParams?.category || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [onlySale, setOnlySale] = useState<boolean>(initialParams?.isSale || false);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(400);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Color options based on products
  const availableColors = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach(p => {
      p.variants.forEach(v => {
        if (!map.has(v.color)) {
          map.set(v.color, v.colorCode);
        }
      });
    });
    return Array.from(map.entries()).map(([color, hex]) => ({ color, hex }));
  }, [products]);

  // Size options
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', '8Y', '10Y', '12Y', '14Y', 'ONE SIZE'];

  // Filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Gender filter
      if (selectedGender !== 'all') {
        if (selectedGender === 'men' && p.gender !== 'men' && p.gender !== 'unisex') return false;
        if (selectedGender === 'women' && p.gender !== 'women' && p.gender !== 'unisex') return false;
        if (selectedGender === 'boys' && p.gender !== 'boys') return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Subcategory filter
      if (selectedSubcategory !== 'all' && p.subcategory !== selectedSubcategory) {
        return false;
      }

      // Sale filter
      if (onlySale && !p.isSale && (!p.salePrice || p.salePrice >= p.basePrice)) {
        return false;
      }

      // Price filter
      const effectivePrice = p.salePrice ?? p.basePrice;
      if (effectivePrice > maxPrice) {
        return false;
      }

      // Color filter
      if (selectedColor !== 'all') {
        const hasColor = p.variants.some(v => v.color.toLowerCase() === selectedColor.toLowerCase());
        if (!hasColor) return false;
      }

      // Size filter
      if (selectedSize !== 'all') {
        const hasSize = p.variants.some(v => (v.sizes[selectedSize] ?? 0) > 0);
        if (!hasSize) return false;
      }

      // In-stock filter
      if (onlyInStock) {
        const hasAnyStock = p.variants.some(v => Object.values(v.sizes).some(s => s > 0));
        if (!hasAnyStock) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.salePrice ?? a.basePrice;
      const priceB = b.salePrice ?? b.basePrice;

      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [
    products, 
    selectedGender, 
    selectedCategory, 
    selectedSubcategory, 
    selectedColor, 
    selectedSize, 
    onlySale, 
    onlyInStock, 
    maxPrice, 
    sortBy
  ]);

  const activeFilterCount = (selectedGender !== 'all' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedSubcategory !== 'all' ? 1 : 0) +
    (selectedColor !== 'all' ? 1 : 0) +
    (selectedSize !== 'all' ? 1 : 0) +
    (onlySale ? 1 : 0) +
    (onlyInStock ? 1 : 0) +
    (maxPrice < 400 ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedGender('all');
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedColor('all');
    setSelectedSize('all');
    setOnlySale(false);
    setOnlyInStock(false);
    setMaxPrice(400);
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-2 uppercase">
          <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
            HOME
          </button>
          <span>/</span>
          <span className="text-[#ccff00]">CATALOG</span>
          {selectedGender !== 'all' && (
            <>
              <span>/</span>
              <span className="text-white">{selectedGender.toUpperCase()}</span>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
              {selectedGender !== 'all' ? `${selectedGender.toUpperCase()} ARCHIVE` : 'ALL COLLECTIONS'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 font-mono mt-1">
              SHOWING {filteredProducts.length} OF {products.length} ENGINEERED PIECES
            </p>
          </div>

          {/* Sort & Mobile Filter Toggle */}
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden px-4 py-2.5 bg-neutral-900 border border-neutral-700 text-white font-mono text-xs font-bold uppercase flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#ccff00]" />
              <span>FILTERS {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </button>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#111111] border border-neutral-800 px-4 py-2.5 pr-10 text-xs font-mono uppercase text-white focus:outline-none focus:border-[#ccff00] cursor-pointer"
              >
                <option value="featured">SORT: FEATURED</option>
                <option value="newest">SORT: NEWEST ARRIVALS</option>
                <option value="price-low">SORT: PRICE LOW TO HIGH</option>
                <option value="price-high">SORT: PRICE HIGH TO LOW</option>
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mr-2">
            ACTIVE FILTERS:
          </span>

          {selectedGender !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 border border-neutral-700 text-xs font-mono text-white">
              GENDER: {selectedGender.toUpperCase()}
              <button onClick={() => setSelectedGender('all')}><X className="w-3 h-3 hover:text-red-400" /></button>
            </span>
          )}

          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 border border-neutral-700 text-xs font-mono text-white">
              CATEGORY: {selectedCategory.toUpperCase()}
              <button onClick={() => setSelectedCategory('all')}><X className="w-3 h-3 hover:text-red-400" /></button>
            </span>
          )}

          {selectedColor !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 border border-neutral-700 text-xs font-mono text-white">
              COLOR: {selectedColor}
              <button onClick={() => setSelectedColor('all')}><X className="w-3 h-3 hover:text-red-400" /></button>
            </span>
          )}

          {selectedSize !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 border border-neutral-700 text-xs font-mono text-white">
              SIZE: {selectedSize}
              <button onClick={() => setSelectedSize('all')}><X className="w-3 h-3 hover:text-red-400" /></button>
            </span>
          )}

          {onlySale && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#ccff00]/10 border border-[#ccff00] text-xs font-mono text-[#ccff00]">
              SALE ONLY
              <button onClick={() => setOnlySale(false)}><X className="w-3 h-3 hover:text-red-400" /></button>
            </span>
          )}

          {onlyInStock && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 border border-neutral-700 text-xs font-mono text-white">
              IN STOCK
              <button onClick={() => setOnlyInStock(false)}><X className="w-3 h-3 hover:text-red-400" /></button>
            </span>
          )}

          {maxPrice < 400 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 border border-neutral-700 text-xs font-mono text-white">
              MAX: ৳{maxPrice}
              <button onClick={() => setMaxPrice(400)}><X className="w-3 h-3 hover:text-red-400" /></button>
            </span>
          )}

          <button
            onClick={resetAllFilters}
            className="text-[11px] font-mono text-neutral-400 hover:text-white underline ml-2 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* Main Catalog Layout (Sidebar Filters + Products Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden lg:block space-y-6 bg-[#0c0c0c] border border-neutral-800 p-6 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#ccff00]" />
              FILTERS
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="text-[10px] font-mono text-neutral-500 hover:text-white uppercase"
              >
                Reset
              </button>
            )}
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-neutral-400 font-bold mb-2.5">
              GENDER
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {['all', 'men', 'women', 'boys'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGender(g)}
                  className={`py-1.5 px-2 text-xs font-mono uppercase border transition-colors ${
                    selectedGender === g
                      ? 'bg-[#ccff00] text-black border-[#ccff00] font-bold'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-neutral-400 font-bold mb-2.5">
              CATEGORY
            </label>
            <div className="space-y-1">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'clothing', label: 'Clothing' },
                { id: 'footwear', label: 'Footwear & Sneakers' },
                { id: 'accessories', label: 'Accessories & Bags' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`w-full text-left py-1.5 px-2.5 text-xs font-mono uppercase flex items-center justify-between transition-colors ${
                    selectedCategory === c.id
                      ? 'text-[#ccff00] font-bold bg-neutral-900/60'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span>{c.label}</span>
                  {selectedCategory === c.id && <Check className="w-3.5 h-3.5 text-[#ccff00]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-neutral-400 font-bold mb-2.5">
              COLOR
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedColor('all')}
                className={`px-2 py-1 text-[10px] font-mono uppercase border ${
                  selectedColor === 'all'
                    ? 'border-[#ccff00] text-[#ccff00]'
                    : 'border-neutral-800 text-neutral-400'
                }`}
              >
                All
              </button>
              {availableColors.map(({ color, hex }) => {
                const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    onClick={() => setSelectedColor(isSelected ? 'all' : color)}
                    className={`relative w-6 h-6 transition-all ${
                      isSelected
                        ? 'ring-2 ring-[#ccff00] ring-offset-2 ring-offset-[#0c0c0c] scale-110'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ backgroundColor: hex }}
                  >
                    <span className="absolute inset-0 border border-white/20"></span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-neutral-400 font-bold mb-2.5">
              SIZE
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedSize('all')}
                className={`px-2 py-1 text-[10px] font-mono uppercase border ${
                  selectedSize === 'all'
                    ? 'border-[#ccff00] bg-[#ccff00] text-black font-bold'
                    : 'border-neutral-800 text-neutral-400 bg-neutral-900'
                }`}
              >
                All
              </button>
              {availableSizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(selectedSize === s ? 'all' : s)}
                  className={`px-2 py-1 text-[10px] font-mono uppercase border transition-colors ${
                    selectedSize === s
                      ? 'border-[#ccff00] bg-[#ccff00] text-black font-bold'
                      : 'border-neutral-800 text-neutral-400 hover:text-white bg-neutral-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between text-[11px] font-mono uppercase text-neutral-400 mb-2">
              <span className="font-bold">MAX PRICE</span>
              <span className="text-white">৳{maxPrice}</span>
            </div>
            <input
              type="range"
              min="50"
              max="400"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#ccff00] cursor-pointer bg-neutral-800 h-1.5"
            />
          </div>

          {/* Toggles (Sale & Stock) */}
          <div className="pt-2 border-t border-neutral-800 space-y-2.5">
            <label className="flex items-center justify-between text-xs font-mono uppercase text-neutral-300 cursor-pointer">
              <span>ARCHIVE SALE ONLY</span>
              <input
                type="checkbox"
                checked={onlySale}
                onChange={(e) => setOnlySale(e.target.checked)}
                className="w-4 h-4 accent-[#ccff00] bg-neutral-900 border-neutral-700"
              />
            </label>

            <label className="flex items-center justify-between text-xs font-mono uppercase text-neutral-300 cursor-pointer">
              <span>IN STOCK ONLY</span>
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 accent-[#ccff00] bg-neutral-900 border-neutral-700"
              />
            </label>
          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-[#0e0e0e] border border-neutral-800 p-12 text-center">
              <div className="w-12 h-12 border border-neutral-700 flex items-center justify-center mx-auto mb-4 text-[#ccff00]">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold uppercase text-white mb-2">
                NO PIECES MATCH YOUR FILTER
              </h3>
              <p className="text-xs text-neutral-400 font-mono max-w-sm mx-auto mb-6">
                Try widening your price range, clearing color selections, or switching category filters.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-6 py-3 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"
              >
                RESET ALL FILTERS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTER MODAL DRAWER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />

          <div className="relative w-full max-w-xs bg-[#0e0e0e] border-r border-neutral-800 p-6 flex flex-col justify-between h-full z-10 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <span className="font-mono text-xs font-bold uppercase text-white">FILTERS</span>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Gender */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 font-bold mb-2">
                  GENDER
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['all', 'men', 'women', 'boys'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGender(g)}
                      className={`py-1.5 px-2 text-xs font-mono uppercase border ${
                        selectedGender === g
                          ? 'bg-[#ccff00] text-black border-[#ccff00] font-bold'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Category */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-neutral-400 font-bold mb-2">
                  CATEGORY
                </label>
                <div className="space-y-1">
                  {[
                    { id: 'all', label: 'All Items' },
                    { id: 'clothing', label: 'Clothing' },
                    { id: 'footwear', label: 'Footwear & Sneakers' },
                    { id: 'accessories', label: 'Accessories & Bags' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCategory(c.id)}
                      className={`w-full text-left py-1.5 px-2 text-xs font-mono uppercase flex items-center justify-between ${
                        selectedCategory === c.id
                          ? 'text-[#ccff00] font-bold'
                          : 'text-neutral-400'
                      }`}
                    >
                      <span>{c.label}</span>
                      {selectedCategory === c.id && <Check className="w-3.5 h-3.5 text-[#ccff00]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Price */}
              <div>
                <div className="flex justify-between text-[11px] font-mono uppercase text-neutral-400 mb-2">
                  <span className="font-bold">MAX PRICE</span>
                  <span className="text-white">৳{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="400"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#ccff00] h-1.5"
                />
              </div>

              {/* Mobile Toggles */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <label className="flex items-center justify-between text-xs font-mono uppercase text-neutral-300">
                  <span>SALE ONLY</span>
                  <input
                    type="checkbox"
                    checked={onlySale}
                    onChange={(e) => setOnlySale(e.target.checked)}
                    className="w-4 h-4 accent-[#ccff00]"
                  />
                </label>
                <label className="flex items-center justify-between text-xs font-mono uppercase text-neutral-300">
                  <span>IN STOCK ONLY</span>
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 accent-[#ccff00]"
                  />
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase tracking-widest"
              >
                APPLY FILTERS ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
