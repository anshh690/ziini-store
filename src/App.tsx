import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { AuthModal } from './components/AuthModal';

import { HomeView } from './views/HomeView';
import { ShopView } from './views/ShopView';
import { ProductDetailView } from './views/ProductDetailView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { AccountView } from './views/AccountView';
import { AdminView } from './views/AdminView';

import { Product } from './types';
import { getProducts } from './lib/storeService';
import { testFirestoreConnection } from './lib/firebase';

const parsePathname = (pathname: string): { 
  view: 'home' | 'shop' | 'product-detail' | 'cart' | 'checkout' | 'account' | 'admin'; 
  params: any 
} => {
  const clean = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (clean.startsWith('/admin')) {
    const parts = clean.split('/').filter(Boolean);
    const sub = parts[1] || 'dashboard';
    let tab = 'dashboard';
    if (sub === 'products' || sub === 'categories') tab = 'products';
    else if (sub === 'orders') tab = 'orders';
    else if (sub === 'customers') tab = 'customers';
    else if (sub === 'coupons') tab = 'coupons';
    else if (sub === 'settings') tab = 'settings';
    else if (sub === 'analytics') tab = 'dashboard';
    return { view: 'admin', params: { tab } };
  }
  if (clean === '/shop' || clean.startsWith('/shop/')) return { view: 'shop', params: {} };
  if (clean === '/cart') return { view: 'cart', params: {} };
  if (clean === '/checkout') return { view: 'checkout', params: {} };
  if (clean === '/account') return { view: 'account', params: {} };
  return { view: 'home', params: {} };
};

function MainApp() {
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'product-detail' | 'cart' | 'checkout' | 'account' | 'admin'>(() => {
    return parsePathname(window.location.pathname).view;
  });
  const [viewParams, setViewParams] = useState<any>(() => {
    return parsePathname(window.location.pathname).params;
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Overlays
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Listen to browser forward/backward navigation
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parsePathname(window.location.pathname);
      setCurrentView(parsed.view);
      setViewParams(parsed.params);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initialize and load products from Firestore
  const loadStoreCatalog = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (e) {
      console.warn('Initial product load warning:', e);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    // 1. Validate connection to Firestore as mandated by Firebase skill
    testFirestoreConnection();
    // 2. Load Firestore products
    loadStoreCatalog();
  }, []);

  const handleNavigate = (view: string, params: any = {}) => {
    setCurrentView(view as any);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Synchronize browser URL bar for protected admin routes and customer pages
    let targetPath = '/';
    if (view === 'admin') {
      targetPath = params?.tab && params.tab !== 'dashboard' ? `/admin/${params.tab}` : '/admin';
    } else if (view === 'shop') {
      targetPath = '/shop';
    } else if (view === 'cart') {
      targetPath = '/cart';
    } else if (view === 'checkout') {
      targetPath = '/checkout';
    } else if (view === 'account') {
      targetPath = '/account';
    }
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ view, params }, '', targetPath);
    }
  };

  const handleSelectProduct = (product: Product, color?: string) => {
    setCurrentView('product-detail');
    setViewParams({ product, color });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProductById = (productId: string) => {
    const found = products.find(p => p.id === productId);
    if (found) {
      handleSelectProduct(found);
    } else {
      handleNavigate('shop');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-[#f5f5f5] selection:bg-[#ccff00] selection:text-[#050505]">
      {/* Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {loadingProducts && products.length === 0 ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-2 border-neutral-800 border-t-[#ccff00] rounded-none animate-spin"></div>
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              SYNCHRONIZING FIRESTORE ARCHIVE...
            </p>
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <HomeView
                products={products}
                onNavigate={handleNavigate}
                onSelectProduct={handleSelectProduct}
              />
            )}

            {currentView === 'shop' && (
              <ShopView
                products={products}
                initialParams={viewParams}
                onNavigate={handleNavigate}
                onSelectProduct={handleSelectProduct}
              />
            )}

            {currentView === 'product-detail' && viewParams.product && (
              <ProductDetailView
                product={viewParams.product}
                initialColor={viewParams.color}
                allProducts={products}
                onNavigate={handleNavigate}
                onSelectProduct={handleSelectProduct}
              />
            )}

            {currentView === 'cart' && (
              <CartView
                onNavigate={handleNavigate}
                onSelectProductById={handleSelectProductById}
              />
            )}

            {currentView === 'checkout' && (
              <CheckoutView
                onNavigate={handleNavigate}
                onOrderCompleted={() => loadStoreCatalog()}
              />
            )}

            {currentView === 'account' && (
              <AccountView
                initialTab={viewParams.tab || 'profile'}
                allProducts={products}
                onNavigate={handleNavigate}
                onSelectProduct={handleSelectProduct}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            )}

            {currentView === 'admin' && (
              <AdminView
                initialTab={viewParams?.tab || 'dashboard'}
                onNavigate={handleNavigate}
                onRefreshCatalog={loadStoreCatalog}
              />
            )}
          </>
        )}
      </main>

      {/* Cart Drawer Overlay */}
      <CartDrawer
        onNavigateToCheckout={() => handleNavigate('checkout')}
        onNavigateToCart={() => handleNavigate('cart')}
        onContinueShopping={() => handleNavigate('shop')}
      />

      {/* Search Overlay */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        products={products}
        onSelectProduct={handleSelectProduct}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Editorial Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <MainApp />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
