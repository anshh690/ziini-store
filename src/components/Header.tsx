import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  Menu, 
  X, 
  ShieldCheck, 
  SlidersHorizontal,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenSearch: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenAuth,
}) => {
  const { totalItemCount, setCartDrawerOpen, wishlist } = useCart();
  const { user, isAdmin, logout, simulateAdminMode, toggleSimulateAdminMode } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'MEN', view: 'shop', params: { gender: 'men' } },
    { label: 'WOMEN', view: 'shop', params: { gender: 'women' } },
    { label: 'BOYS', view: 'shop', params: { gender: 'boys' } },
    { label: 'NEW ARRIVALS', view: 'shop', params: { isNewArrival: true } },
    { label: 'COLLECTIONS', view: 'shop', params: {} },
    { label: 'SALE', view: 'shop', params: { isSale: true }, isSale: true },
  ];

  return (
    <>
      {/* Top micro-announcement bar */}
      <div className="bg-[#050505] border-b border-neutral-800/80 text-[10px] sm:text-xs text-neutral-400 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse"></span>
            <span className="font-semibold tracking-wider text-neutral-300">SPRING/SUMMER 2026 ARCHIVE</span>
            <span className="hidden md:inline text-neutral-600">|</span>
            <span className="hidden md:inline">Complimentary express shipping worldwide over ৳150</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button 
              onClick={toggleSimulateAdminMode}
              className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors border ${
                simulateAdminMode 
                  ? 'border-[#ccff00] text-[#ccff00] bg-[#ccff00]/10' 
                  : 'border-neutral-800 text-neutral-400 hover:text-white'
              }`}
              title="Toggle simulated admin mode for testing"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Admin Mode: {simulateAdminMode ? 'ON' : 'OFF'}</span>
            </button>
            <span className="hidden sm:inline text-neutral-500 font-mono">EN / BDT</span>
          </div>
        </div>
      </div>

      {/* Main sticky header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#090909]/95 backdrop-blur-md border-b border-neutral-800 py-3 shadow-2xl'
            : 'bg-[#090909] border-b border-neutral-900 py-4.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Hamburger Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 text-neutral-300 hover:text-white transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex items-center">
              <button
                onClick={() => onNavigate('home')}
                className="group text-left flex items-baseline gap-1"
              >
                <span className="font-display text-2xl sm:text-3xl font-black tracking-tighter text-white group-hover:text-neutral-200 transition-colors">
                  ZiiNi
                </span>
                <span className="w-1.5 h-1.5 bg-[#ccff00] transition-transform group-hover:scale-125"></span>
                <span className="hidden sm:inline-block ml-2 text-[9px] font-mono tracking-widest text-neutral-500 uppercase border border-neutral-800 px-1 py-0.5">
                  TOKYO / NYC
                </span>
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => onNavigate(link.view, link.params)}
                  className={`text-xs font-bold tracking-[0.16em] uppercase transition-colors relative py-1 ${
                    link.isSale 
                      ? 'text-[#ccff00] hover:text-[#e4ff4d]' 
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  {link.label}
                  {link.isSale && (
                    <span className="absolute -top-1 -right-2 text-[8px] font-mono text-[#ccff00] tracking-tighter">
                      •
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Search Trigger */}
              <button
                type="button"
                onClick={onOpenSearch}
                className="p-2 text-neutral-300 hover:text-[#ccff00] hover:bg-neutral-900 transition-all rounded-none"
                aria-label="Search catalog"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Link */}
              <button
                type="button"
                onClick={() => onNavigate('account', { tab: 'wishlist' })}
                className="relative p-2 text-neutral-300 hover:text-[#ccff00] hover:bg-neutral-900 transition-all rounded-none"
                aria-label="View Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#ccff00] text-[#050505] text-[9px] font-bold font-mono flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Account Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      onOpenAuth();
                    } else {
                      setUserDropdownOpen(!userDropdownOpen);
                    }
                  }}
                  className="p-2 text-neutral-300 hover:text-[#ccff00] hover:bg-neutral-900 transition-all rounded-none flex items-center gap-1"
                  aria-label="User Account"
                >
                  <UserIcon className="w-5 h-5" />
                  {user && (
                    <span className="hidden xl:inline text-[11px] font-mono text-neutral-400 max-w-[80px] truncate">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                  )}
                </button>

                {user && userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-[#111111] border border-neutral-800 shadow-2xl py-2 z-50 animate-in fade-in"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-neutral-800 text-xs">
                      <p className="font-semibold text-white truncate">{user.displayName || 'Customer'}</p>
                      <p className="text-neutral-400 font-mono text-[10px] truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#ccff00]/10 text-[#ccff00] text-[9px] font-mono uppercase">
                          Store Admin
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigate('account', { tab: 'profile' });
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-900 flex items-center justify-between"
                    >
                      <span>My Profile & Orders</span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigate('admin');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#ccff00] hover:bg-neutral-900 flex items-center justify-between"
                      >
                        <span className="font-bold">Admin Console</span>
                        <SlidersHorizontal className="w-3.5 h-3.5 text-[#ccff00]" />
                      </button>
                    )}

                    <div className="border-t border-neutral-800 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-neutral-900 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Console Direct Link (Desktop) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-neutral-900 border border-[#ccff00]/50 text-[#ccff00] text-[10px] font-bold font-mono tracking-wider uppercase hover:bg-[#ccff00] hover:text-black transition-all"
                  title="Admin Dashboard"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  <span>DASHBOARD</span>
                </button>
              )}

              {/* Shopping Bag / Cart Button */}
              <button
                type="button"
                onClick={() => setCartDrawerOpen(true)}
                className="relative flex items-center gap-2 p-2 bg-neutral-900 hover:bg-[#ccff00] hover:text-black text-white transition-all border border-neutral-800 px-3.5 py-2 group"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 text-[#ccff00] group-hover:text-black transition-colors" />
                <span className="hidden sm:inline text-xs font-bold tracking-wider font-mono">BAG</span>
                <span className="bg-[#ccff00] text-black group-hover:bg-black group-hover:text-[#ccff00] text-[11px] font-black font-mono px-1.5 py-0.2 min-w-[20px] text-center">
                  {totalItemCount}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-full max-w-xs bg-[#0b0b0b] border-r border-neutral-800 p-6 flex flex-col justify-between h-full z-10 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
                <span className="font-display text-2xl font-black tracking-tight text-white">
                  ZiiNi<span className="text-[#ccff00]">.</span>
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Categories Navigation */}
              <div className="py-6 space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-3">
                  CATEGORIES
                </p>
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate(link.view, link.params);
                    }}
                    className={`w-full text-left py-3 px-2 text-sm font-bold tracking-wider uppercase border-b border-neutral-900 flex items-center justify-between ${
                      link.isSale ? 'text-[#ccff00]' : 'text-neutral-200 hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-neutral-600" />
                  </button>
                ))}
              </div>

              {/* Quick Shortcuts */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('account', { tab: 'wishlist' });
                  }}
                  className="w-full text-left py-2.5 px-2 text-xs font-mono tracking-wider uppercase text-neutral-400 hover:text-white flex items-center gap-3"
                >
                  <Heart className="w-4 h-4 text-neutral-400" />
                  <span>Wishlist ({wishlist.length})</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (!user) onOpenAuth();
                    else onNavigate('account');
                  }}
                  className="w-full text-left py-2.5 px-2 text-xs font-mono tracking-wider uppercase text-neutral-400 hover:text-white flex items-center gap-3"
                >
                  <UserIcon className="w-4 h-4 text-neutral-400" />
                  <span>{user ? 'My Account' : 'Sign In / Register'}</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('admin');
                    }}
                    className="w-full text-left py-2.5 px-2 text-xs font-mono tracking-wider uppercase text-[#ccff00] flex items-center gap-3"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </button>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-800 text-[11px] text-neutral-500 font-mono">
              <p>ZiiNi Streetwear Co.</p>
              <p>Global Shipping | Tokyo • NYC • London</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
