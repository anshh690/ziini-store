import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Product } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product, color?: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalized = query.trim().toLowerCase();

  const filtered = normalized === '' ? [] : products.filter((p) => {
    const matchName = p.name.toLowerCase().includes(normalized);
    const matchCategory = p.category.toLowerCase().includes(normalized);
    const matchGender = p.gender.toLowerCase().includes(normalized);
    const matchSubcategory = p.subcategory.toLowerCase().includes(normalized);
    const matchTags = p.tags.some(t => t.toLowerCase().includes(normalized));
    const matchSku = p.variants.some(v => v.sku.toLowerCase().includes(normalized) || v.color.toLowerCase().includes(normalized));
    return matchName || matchCategory || matchGender || matchSubcategory || matchTags || matchSku;
  });

  const popularSearches = [
    'Heavyweight Tee',
    'Tactical Cargo',
    'Puffer Jacket',
    'Hoodie',
    'Vortex Sneaker',
    'Crossbody Bag',
    'Sale'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Dark overlay */}
      <div 
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative min-h-screen flex flex-col items-center pt-16 sm:pt-24 px-4 sm:px-6">
        <div className="w-full max-w-3xl bg-[#0e0e0e] border border-neutral-800 shadow-2xl overflow-hidden animate-slide-up">
          {/* Search Input Bar */}
          <div className="relative flex items-center border-b border-neutral-800 px-5 py-4">
            <Search className="w-5 h-5 text-[#ccff00] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH BY PRODUCT, SKU, COLOR OR TAG..."
              className="w-full bg-transparent border-none pl-4 pr-10 text-sm sm:text-base font-mono text-white placeholder-neutral-500 focus:outline-none uppercase tracking-wider"
            />
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white transition-colors"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Filters / Trends */}
          {query.trim() === '' && (
            <div className="p-6">
              <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-3">
                POPULAR SEARCHES
              </p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-[#ccff00] hover:text-black border border-neutral-800 text-neutral-300 text-xs font-mono uppercase tracking-wider transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {query.trim() !== '' && (
            <div className="p-5 max-h-[60vh] overflow-y-auto divide-y divide-neutral-900">
              <div className="pb-3 text-xs font-mono text-neutral-400 flex items-center justify-between">
                <span>FOUND {filtered.length} RESULTS FOR "{query.toUpperCase()}"</span>
                <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                  <CornerDownLeft className="w-3 h-3" /> Select to view
                </span>
              </div>

              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-neutral-400 font-mono text-xs uppercase mb-2">No matching products found</p>
                  <p className="text-neutral-600 text-xs">Try searching for "tee", "cargo", "jacket", or "black"</p>
                </div>
              ) : (
                filtered.map((prod) => {
                  const defaultVariant = prod.variants[0];
                  const img = defaultVariant.images[0];
                  const price = prod.salePrice ?? prod.basePrice;

                  return (
                    <div
                      key={prod.id}
                      onClick={() => {
                        onClose();
                        onSelectProduct(prod, defaultVariant.color);
                      }}
                      className="py-3 flex items-center justify-between group cursor-pointer hover:bg-neutral-950 px-2 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={img}
                          alt={prod.name}
                          className="w-14 h-16 object-cover object-center bg-neutral-950 border border-neutral-800"
                        />
                        <div>
                          <p className="text-[10px] font-mono uppercase text-neutral-500">
                            {prod.gender} • {prod.category}
                          </p>
                          <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#ccff00] uppercase transition-colors">
                            {prod.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono font-bold text-white">
                              ৳{price.toFixed(2)}
                            </span>
                            {prod.salePrice && (
                              <span className="text-[11px] font-mono text-neutral-500 line-through">
                                ৳{prod.basePrice.toFixed(2)}
                              </span>
                            )}
                            <div className="flex items-center gap-1 ml-2">
                              {prod.variants.map((v) => (
                                <span
                                  key={v.color}
                                  className="w-2 h-2 inline-block border border-white/20"
                                  style={{ backgroundColor: v.colorCode }}
                                  title={v.color}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-[#ccff00] group-hover:translate-x-1 transition-all" />
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Footer note */}
          <div className="p-3 bg-neutral-950 border-t border-neutral-800 text-[10px] font-mono text-neutral-500 text-center">
            PRESS <kbd className="px-1.5 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-300">ESC</kbd> TO CLOSE
          </div>
        </div>
      </div>
    </div>
  );
};
