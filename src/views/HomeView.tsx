import React from 'react';
import { ArrowRight, Sparkles, Shield, RefreshCw, Truck } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

interface HomeViewProps {
  products: Product[];
  onNavigate: (view: string, params?: any) => void;
  onSelectProduct: (product: Product, color?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  onNavigate,
  onSelectProduct,
}) => {
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 4);
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  const trendingProducts = products.slice(0, 8);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO CAMPAIGN SECTION */}
      <section className="relative w-full min-h-[85vh] sm:min-h-[90vh] bg-black flex items-center justify-start overflow-hidden border-b border-neutral-800">
        {/* Editorial Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=2000&q=90"
            alt="ZiiNi Streetwear Campaign 2026"
            className="w-full h-full object-cover object-top opacity-55 contrast-125 filter grayscale-[20%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/60 to-transparent" />
        </div>

        {/* Content Box */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl">
            {/* Season Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-900/90 border border-neutral-700/80 mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-[#ccff00]"></span>
              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-white font-bold">
                SS26 DROP 01 / CHAPTER: OBSIDIAN
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-white leading-[0.92]">
              DEFINE YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-500">
                EVERYDAY.
              </span>
            </h1>

            {/* Subtext */}
            <p className="mt-6 text-sm sm:text-base text-neutral-300 font-normal leading-relaxed max-w-lg">
              Engineered street aesthetic crafted with high-twist combed cotton, technical Cordura® ripstop, and monolithic sculptural tailoring.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => onNavigate('shop')}
                className="px-8 py-4 bg-[#ccff00] hover:bg-white text-black font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-3 transition-all duration-200 shadow-xl shadow-[#ccff00]/10"
              >
                <span>SHOP NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('shop', { isNewArrival: true })}
                className="px-7 py-4 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-white font-mono font-bold text-xs uppercase tracking-widest transition-colors backdrop-blur-sm"
              >
                VIEW NEW ARRIVALS
              </button>
            </div>

            {/* Monogram Specs */}
            <div className="mt-12 pt-6 border-t border-neutral-800/80 grid grid-cols-3 gap-4 text-neutral-400 font-mono text-[11px]">
              <div>
                <p className="text-white font-bold">FABRIC</p>
                <p className="text-neutral-500">320-500 GSM Cotton</p>
              </div>
              <div>
                <p className="text-white font-bold">FIT PROFILE</p>
                <p className="text-neutral-500">Boxy Drop Shoulder</p>
              </div>
              <div>
                <p className="text-white font-bold">EDITION</p>
                <p className="text-[#ccff00]">Limited 250 Units</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE MAJOR CATEGORY SPLITS (MEN, WOMEN, BOYS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-neutral-800">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#ccff00]">
              COLLECTIONS
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-white mt-1">
              DISCOVER BY GENDER
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-mono text-neutral-400 hover:text-[#ccff00] uppercase tracking-wider flex items-center gap-1 transition-colors"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* MEN */}
          <div
            onClick={() => onNavigate('shop', { gender: 'men' })}
            className="group relative h-[480px] bg-neutral-950 overflow-hidden border border-neutral-800 cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80"
              alt="Men Streetwear"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end">
              <span className="text-[10px] font-mono uppercase text-[#ccff00] tracking-widest mb-1">
                SEASON 26
              </span>
              <h3 className="font-display text-3xl font-black uppercase text-white tracking-tight">
                MEN
              </h3>
              <p className="text-xs text-neutral-400 mt-1 mb-4">
                Heavyweight tees, modular cargo pants, technical shells.
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white group-hover:text-[#ccff00] transition-colors">
                <span>EXPLORE MEN</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* WOMEN */}
          <div
            onClick={() => onNavigate('shop', { gender: 'women' })}
            className="group relative h-[480px] bg-neutral-950 overflow-hidden border border-neutral-800 cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
              alt="Women Streetwear"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end">
              <span className="text-[10px] font-mono uppercase text-[#ccff00] tracking-widest mb-1">
                ARCHITECTURAL SILHOUETTES
              </span>
              <h3 className="font-display text-3xl font-black uppercase text-white tracking-tight">
                WOMEN
              </h3>
              <p className="text-xs text-neutral-400 mt-1 mb-4">
                Sculpted drape tanks, balloon-leg trousers, tailored oversized layers.
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white group-hover:text-[#ccff00] transition-colors">
                <span>EXPLORE WOMEN</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* BOYS */}
          <div
            onClick={() => onNavigate('shop', { gender: 'boys' })}
            className="group relative h-[480px] bg-neutral-950 overflow-hidden border border-neutral-800 cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1200&q=80"
              alt="Boys Streetwear"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end">
              <span className="text-[10px] font-mono uppercase text-[#ccff00] tracking-widest mb-1">
                YOUTH KINETICS
              </span>
              <h3 className="font-display text-3xl font-black uppercase text-white tracking-tight">
                BOYS
              </h3>
              <p className="text-xs text-neutral-400 mt-1 mb-4">
                Reinforced skate cargos, modular hoodies, engineered endurance.
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-white group-hover:text-[#ccff00] transition-colors">
                <span>EXPLORE BOYS</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-ping" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#ccff00]">
                JUST DROPPED
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-white mt-1">
              NEW ARRIVALS
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop', { isNewArrival: true })}
            className="text-xs font-mono text-neutral-400 hover:text-[#ccff00] uppercase tracking-wider flex items-center gap-1 transition-colors"
          >
            <span>VIEW ALL NEW</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* 4. EDITORIAL SPLIT SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-[#0d0d0d] border border-neutral-800 items-center overflow-hidden">
          <div className="relative h-[400px] sm:h-[550px] w-full bg-neutral-950 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1200&q=80"
              alt="Technical Exoskeleton Puffer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute top-4 left-4 bg-black/80 px-3 py-1 font-mono text-[10px] uppercase text-[#ccff00] border border-neutral-700">
              FEATURED CAPSULE
            </div>
          </div>

          <div className="p-8 sm:p-12 lg:p-16">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#ccff00]">
              PRECISION CRAFTSMANSHIP
            </span>
            <h3 className="font-display text-3xl sm:text-4xl font-black uppercase text-white tracking-tight mt-2 mb-4 leading-tight">
              TECHNICAL EXOSKELETON ARCHITECTURE
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed mb-6 font-normal">
              Built with Japanese 3-layer laminated ripstop nylon and 700 fill-power responsibly sourced duck down. Engineered with internal carry harnesses allowing you to disrobe and wear hands-free when transitioning indoors.
            </p>

            <div className="space-y-3 mb-8 text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#ccff00]" />
                <span>WATERPROOF TAPED AQUAGUARD® ZIPPER SYSTEM</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#ccff00]" />
                <span>INTERNAL CORDURA® MODULAR SHOULDER STRAP</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-[#ccff00]" />
                <span>THERMAL MICRO-FLEECE CHIN GUARD & STORM COLLAR</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('shop')}
              className="px-8 py-3.5 bg-[#ccff00] hover:bg-white text-black font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-3 transition-colors"
            >
              <span>EXPLORE THE CAPSULE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. BRAND PROMISES / ICONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border border-neutral-800 bg-[#0a0a0a] p-6 sm:p-8">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
            <Truck className="w-6 h-6 text-[#ccff00]" />
            <h4 className="font-mono text-xs font-bold uppercase text-white">WORLDWIDE SHIPPING</h4>
            <p className="text-[11px] text-neutral-400">Complimentary on orders exceeding ৳150.</p>
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
            <RefreshCw className="w-6 h-6 text-[#ccff00]" />
            <h4 className="font-mono text-xs font-bold uppercase text-white">30-DAY RETURNS</h4>
            <p className="text-[11px] text-neutral-400">Hassle-free exchange & refund policy.</p>
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
            <Shield className="w-6 h-6 text-[#ccff00]" />
            <h4 className="font-mono text-xs font-bold uppercase text-white">GENUINE FABRICS</h4>
            <p className="text-[11px] text-neutral-400">Certified combed cotton & Cordura® nylon.</p>
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
            <Sparkles className="w-6 h-6 text-[#ccff00]" />
            <h4 className="font-mono text-xs font-bold uppercase text-white">LIMITED RUNS</h4>
            <p className="text-[11px] text-neutral-400">Serialized batches to prevent mass production.</p>
          </div>
        </div>
      </section>

      {/* 6. TRENDING / COMPLETE COLLECTION PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-neutral-800">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#ccff00]">
              CURATED SELECTION
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-white mt-1">
              STREETWEAR ARCHIVE
            </h2>
          </div>
          <button
            onClick={() => onNavigate('shop')}
            className="text-xs font-mono text-neutral-400 hover:text-[#ccff00] uppercase tracking-wider flex items-center gap-1 transition-colors"
          >
            <span>VIEW FULL CATALOG ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {trendingProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
