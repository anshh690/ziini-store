import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  RefreshCw, 
  Eye, 
  ShieldCheck,
  ChevronDown,
  LogOut,
  Tag,
  Settings,
  Lock,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { Product, Order, OrderStatus, ProductVariant, Gender, Category, Coupon } from '../types';
import { 
  getProducts, 
  saveProduct, 
  removeProduct, 
  getAllOrders, 
  updateOrderStatus, 
  reseedStoreDatabase 
} from '../lib/storeService';
import { SAMPLE_COUPONS } from '../lib/sampleProducts';
import { useToast } from '../context/ToastContext';
import { useAuth, AUTHORIZED_ADMIN_EMAIL } from '../context/AuthContext';

interface AdminViewProps {
  initialTab?: string;
  onNavigate: (view: string, params?: any) => void;
  onRefreshCatalog: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ 
  initialTab = 'dashboard', 
  onNavigate, 
  onRefreshCatalog 
}) => {
  const { showToast } = useToast();
  const { user, isAdmin, loading: authLoading, loginWithGoogle, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'customers' | 'coupons' | 'settings'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>(SAMPLE_COUPONS);
  const [loading, setLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Modals & forms
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewOrderModal, setViewOrderModal] = useState<Order | null>(null);
  const [isReseeding, setIsReseeding] = useState(false);

  // New coupon modal state
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Coupon>({
    code: '',
    discountType: 'percent',
    value: 15,
    minOrder: 100,
    active: true,
    description: ''
  });

  // Form state for product editor
  const [formProduct, setFormProduct] = useState<Partial<Product>>({
    name: '',
    slug: '',
    description: '',
    gender: 'men',
    category: 'clothing',
    subcategory: 't-shirts',
    basePrice: 80,
    salePrice: undefined,
    isSale: false,
    isNewArrival: true,
    isFeatured: true,
    tags: ['streetwear', 'oversized'],
    variants: [
      {
        color: 'Onyx Black',
        colorCode: '#0c0c0c',
        sku: 'ZN-SAMPLE-BLK',
        images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80'],
        sizes: { 'S': 10, 'M': 15, 'L': 8, 'XL': 4 }
      }
    ]
  });

  // Sync initial tab from URL route if specified
  useEffect(() => {
    if (initialTab) {
      if (initialTab === 'categories') setActiveTab('products');
      else if (initialTab === 'analytics') setActiveTab('dashboard');
      else if (['dashboard', 'products', 'orders', 'customers', 'coupons', 'settings'].includes(initialTab)) {
        setActiveTab(initialTab as any);
      }
    }
  }, [initialTab]);

  // Load private admin data ONLY when user is authenticated as the authorized administrator
  const loadData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [prods, ords] = await Promise.all([
        getProducts(),
        getAllOrders()
      ]);
      setProducts(prods);
      setOrders(ords);
    } catch (err) {
      console.warn('Error loading admin data from Firestore:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadData();
    } else {
      // Clear all sensitive data when unauthorized or logged out
      setProducts([]);
      setOrders([]);
    }
  }, [user, isAdmin]);

  // Google Login for Admin Panel
  const handleAdminGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const authenticatedUser = await loginWithGoogle();
      const normalizedEmail = authenticatedUser.email?.trim().toLowerCase();
      if (normalizedEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        showToast(`Administrator authenticated: ${authenticatedUser.email}`, 'success');
      } else {
        setLoginError(`Account "${authenticatedUser.email}" is not authorized. Access is strictly limited to ${AUTHORIZED_ADMIN_EMAIL}.`);
      }
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      setLoginError(err.message || 'Google Sign-In failed or popup was closed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Secure Logout
  const handleAdminLogout = async () => {
    try {
      await logout();
      setProducts([]);
      setOrders([]);
      showToast('Administrator session ended', 'info');
      onNavigate('admin', { tab: 'dashboard' });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // -------------------------------------------------------------
  // 1. LOADING STATE
  // -------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4 px-4">
        <div className="w-10 h-10 border-2 border-neutral-800 border-t-[#ccff00] animate-spin"></div>
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-400 text-center">
          VERIFYING ADMINISTRATOR PRIVILEGES...
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. UNAUTHENTICATED STATE: SHOW CLEAN GOOGLE SIGN-IN SCREEN
  // -------------------------------------------------------------
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 animate-fade-in">
        <div className="max-w-md w-full bg-[#0d0d0d] border border-neutral-800 shadow-2xl relative overflow-hidden">
          {/* Accent top stripe */}
          <div className="h-1 bg-[#ccff00] w-full"></div>

          <div className="p-8 sm:p-10 space-y-8">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-[#ccff00]">
                <Lock className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#ccff00] block">
                AUTHENTICATION REQUIRED
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                ZiiNi Store Admin
              </h1>
              <p className="text-xs font-mono text-neutral-400">
                Sign in with your authorized Google account to continue.
              </p>
            </div>

            {loginError && (
              <div className="p-3.5 bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span className="leading-relaxed">{loginError}</span>
              </div>
            )}

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleAdminGoogleLogin}
                disabled={isLoggingIn}
                className="w-full py-3.5 px-4 bg-white hover:bg-neutral-100 text-neutral-900 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-colors shadow-lg disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                )}
                <span>{isLoggingIn ? 'AUTHENTICATING WITH GOOGLE...' : 'CONTINUE WITH GOOGLE'}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="text-xs font-mono text-neutral-500 hover:text-white uppercase transition-colors"
                >
                  ← Return to Public Storefront
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-900 text-center">
              <p className="text-[10px] font-mono text-neutral-500">
                Authorized administrator email: <strong className="text-neutral-400">{AUTHORIZED_ADMIN_EMAIL}</strong>
              </p>
              <p className="text-[9px] font-mono text-neutral-600 mt-1">
                Security enforced by Cloud Firestore rules. Unauthorized logins are rejected.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. UNAUTHORIZED ACCOUNT: ACCESS DENIED SCREEN
  // -------------------------------------------------------------
  if (user && !isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 animate-fade-in">
        <div className="max-w-md w-full bg-[#0d0d0d] border border-red-900/60 shadow-2xl relative overflow-hidden">
          {/* Red warning stripe */}
          <div className="h-1 bg-red-600 w-full"></div>

          <div className="p-8 sm:p-10 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-red-950/60 border border-red-800 text-red-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-red-400 block">
                403 FORBIDDEN
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                Access Denied
              </h1>
              <p className="text-xs font-mono text-neutral-300">
                This Google account is not authorized to access the Ziini Store Admin Panel.
              </p>
            </div>

            <div className="bg-neutral-950 p-4 border border-neutral-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-neutral-400">
                <span>Signed in as:</span>
                <span className="text-white font-bold truncate max-w-[200px]">{user.email}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-400">
                <span>Privilege Status:</span>
                <span className="text-red-400 font-bold uppercase">NOT AUTHORIZED</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleAdminLogout}
                className="w-full py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>SIGN OUT & SWITCH GOOGLE ACCOUNT</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="w-full py-3 px-4 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors"
              >
                RETURN TO STOREFRONT
              </button>
            </div>

            <div className="pt-3 border-t border-neutral-900 text-center">
              <p className="text-[10px] font-mono text-neutral-600">
                Required account: {AUTHORIZED_ADMIN_EMAIL}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 4. AUTHORIZED ADMINISTRATOR: FULL ACCESS GRANTED
  // -------------------------------------------------------------

  // Dashboard Aggregates
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const completedOrdersCount = orders.filter(o => o.status === 'delivered').length;
  
  // Low stock products (any variant size <= 3)
  const lowStockVariants: { product: string; color: string; size: string; stock: number }[] = [];
  products.forEach(p => {
    p.variants.forEach(v => {
      Object.entries(v.sizes).forEach(([size, stock]) => {
        if (stock <= 3) {
          lowStockVariants.push({ product: p.name, color: v.color, size, stock });
        }
      });
    });
  });

  // Unique customers aggregate
  const customersMap = new Map<string, { email: string; name: string; ordersCount: number; totalSpent: number; lastOrder: string }>();
  orders.forEach(o => {
    const key = o.customerEmail.toLowerCase();
    const existing = customersMap.get(key);
    if (existing) {
      existing.ordersCount += 1;
      existing.totalSpent += o.total;
      if (new Date(o.createdAt) > new Date(existing.lastOrder)) {
        existing.lastOrder = o.createdAt;
      }
    } else {
      customersMap.set(key, {
        email: o.customerEmail,
        name: o.customerName,
        ordersCount: 1,
        totalSpent: o.total,
        lastOrder: o.createdAt
      });
    }
  });
  const customerList = Array.from(customersMap.values());

  // Product Actions
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormProduct({
      name: '',
      slug: '',
      description: '',
      gender: 'men',
      category: 'clothing',
      subcategory: 't-shirts',
      basePrice: 80,
      salePrice: undefined,
      isSale: false,
      isNewArrival: true,
      isFeatured: false,
      tags: ['streetwear', 'new'],
      variants: [
        {
          color: 'Onyx Black',
          colorCode: '#0c0c0c',
          sku: `ZN-NEW-${Math.floor(100 + Math.random() * 900)}`,
          images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80'],
          sizes: { 'S': 8, 'M': 12, 'L': 6 }
        }
      ]
    });
    setProductModalOpen(true);
  };

  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormProduct({ ...prod });
    setProductModalOpen(true);
  };

  const handleDuplicateProduct = async (prod: Product) => {
    const copyId = `prod-${Date.now()}`;
    const duplicated: Product = {
      ...prod,
      id: copyId,
      name: `${prod.name} (COPY)`,
      slug: `${prod.slug}-copy-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await saveProduct(duplicated);
      showToast(`Duplicated ${prod.name}`, 'success');
      loadData();
      onRefreshCatalog();
    } catch (err: any) {
      showToast(err.message || 'Duplication failed', 'error');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from Firestore?`)) return;
    try {
      await removeProduct(id);
      showToast(`Removed product ${name}`, 'info');
      loadData();
      onRefreshCatalog();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProduct.name || !formProduct.basePrice || !formProduct.variants?.length) {
      showToast('Please provide a name, price, and at least one variant', 'error');
      return;
    }

    const prodId = editingProduct ? editingProduct.id : `prod-${Date.now()}`;
    const slug = formProduct.slug || formProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const finalProduct: Product = {
      id: prodId,
      name: formProduct.name,
      slug,
      description: formProduct.description || 'Premium streetwear design crafted with architectural tailoring.',
      details: formProduct.details || [
        'Heavyweight premium technical fabric',
        'Engineered boxy fit silhouette',
        'Reinforced seam construction',
        'Signature ZiiNi hardware & branding'
      ],
      gender: formProduct.gender as Gender || 'men',
      category: formProduct.category as Category || 'clothing',
      subcategory: formProduct.subcategory || 't-shirts',
      basePrice: Number(formProduct.basePrice),
      salePrice: formProduct.salePrice ? Number(formProduct.salePrice) : undefined,
      isSale: Boolean(formProduct.isSale),
      isNewArrival: Boolean(formProduct.isNewArrival),
      isFeatured: Boolean(formProduct.isFeatured),
      tags: formProduct.tags || ['streetwear'],
      variants: formProduct.variants,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await saveProduct(finalProduct);
      showToast(`Saved ${finalProduct.name} to Firestore!`, 'success');
      setProductModalOpen(false);
      loadData();
      onRefreshCatalog();
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    }
  };

  // Variant editing inside form
  const handleAddVariantToForm = () => {
    const newVariant: ProductVariant = {
      color: 'Off-White',
      colorCode: '#f5f5f0',
      sku: `ZN-${(formProduct.name || 'ITEM').substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1200&q=80'],
      sizes: { 'S': 5, 'M': 10, 'L': 5 }
    };
    setFormProduct(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant]
    }));
  };

  const handleRemoveVariantFromForm = (idx: number) => {
    if ((formProduct.variants?.length || 0) <= 1) {
      showToast('Product must contain at least 1 colorway', 'error');
      return;
    }
    setFormProduct(prev => ({
      ...prev,
      variants: prev.variants?.filter((_, i) => i !== idx)
    }));
  };

  // Order status update
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to "${newStatus.toUpperCase()}"`, 'success');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (viewOrderModal && viewOrderModal.id === orderId) {
        setViewOrderModal(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  // Database Reseeding
  const handleReseed = async () => {
    if (!window.confirm('Reset and re-seed the Firestore catalog with the latest curated Streetwear products?')) return;
    setIsReseeding(true);
    try {
      const count = await reseedStoreDatabase();
      showToast(`Database reseeded with ${count} streetwear products!`, 'success');
      loadData();
      onRefreshCatalog();
    } catch (err: any) {
      showToast(err.message || 'Reseeding error', 'error');
    } finally {
      setIsReseeding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Top Banner with Admin Identity & Logout */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-neutral-800 pb-6 gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#ccff00] animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ccff00]">
              ADMIN CONTROL CENTER
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#ccff00]/10 border border-[#ccff00]/40 text-[#ccff00] text-[10px] font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AUTHORIZED: {user.email}</span>
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-black uppercase text-white tracking-tight mt-1.5">
            ZiiNi STORE OPERATIONS
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Cloud Firestore real-time persistence • Multi-color variant inventory • Order fulfillment
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleReseed}
            disabled={isReseeding}
            className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white font-mono text-xs uppercase flex items-center gap-2 transition-colors"
            title="Reset and repopulate catalog with fresh editorial items"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReseeding ? 'animate-spin' : ''}`} />
            <span>Reseed Catalog</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('shop')}
            className="px-3.5 py-2 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase hover:bg-white transition-colors"
          >
            VIEW STOREFRONT
          </button>

          {/* DEDICATED ADMIN LOGOUT BUTTON */}
          <button
            type="button"
            onClick={handleAdminLogout}
            className="px-3.5 py-2 bg-neutral-900 hover:bg-red-950 border border-neutral-700 hover:border-red-800 text-neutral-300 hover:text-red-300 font-mono text-xs font-bold uppercase flex items-center gap-2 transition-colors"
            title="End administrator session"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>LOGOUT</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 text-xs font-mono overflow-x-auto no-scrollbar">
        {[
          { id: 'dashboard', label: 'Dashboard & Metrics', icon: TrendingUp },
          { id: 'products', label: `Products (${products.length})`, icon: Package },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'customers', label: `Customers (${customerList.length})`, icon: Users },
          { id: 'coupons', label: `Coupons (${coupons.length})`, icon: Tag },
          { id: 'settings', label: 'Store Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-5 uppercase transition-colors flex items-center gap-2 shrink-0 ${
                activeTab === tab.id
                  ? 'text-[#ccff00] border-b-2 border-[#ccff00] font-bold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-[#0c0c0c] border border-neutral-800 p-6 space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-500">TOTAL REVENUE</span>
              <p className="font-display text-2xl sm:text-3xl font-black text-[#ccff00]">
                ৳{totalRevenue.toFixed(2)}
              </p>
              <p className="text-[10px] font-mono text-neutral-400">All successful orders</p>
            </div>

            <div className="bg-[#0c0c0c] border border-neutral-800 p-6 space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-500">TOTAL ORDERS</span>
              <p className="font-display text-2xl sm:text-3xl font-black text-white">
                {orders.length}
              </p>
              <p className="text-[10px] font-mono text-neutral-400">{pendingOrdersCount} pending fulfillment</p>
            </div>

            <div className="bg-[#0c0c0c] border border-neutral-800 p-6 space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-500">ACTIVE CATALOG</span>
              <p className="font-display text-2xl sm:text-3xl font-black text-white">
                {products.length} PIECES
              </p>
              <p className="text-[10px] font-mono text-neutral-400">Men, Women & Boys</p>
            </div>

            <div className="bg-[#0c0c0c] border border-neutral-800 p-6 space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-500">LOW STOCK ALERTS</span>
              <p className="font-display text-2xl sm:text-3xl font-black text-red-400">
                {lowStockVariants.length}
              </p>
              <p className="text-[10px] font-mono text-neutral-400">Variant sizes ≤ 3 units</p>
            </div>
          </div>

          {/* Recent Orders & Low Stock Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-[#0c0c0c] border border-neutral-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="font-mono text-xs font-bold uppercase text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#ccff00]" />
                  RECENT ORDERS
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="text-[10px] font-mono text-[#ccff00] hover:underline uppercase"
                >
                  View All ({orders.length}) →
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs font-mono text-neutral-500 py-6 text-center">No orders recorded yet.</p>
              ) : (
                <div className="divide-y divide-neutral-900">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="py-3 flex items-center justify-between text-xs font-mono">
                      <div>
                        <p className="font-bold text-white">#{o.orderNumber} • {o.customerName}</p>
                        <p className="text-[10px] text-neutral-500">{new Date(o.createdAt).toLocaleDateString()} • {o.items.length} item(s)</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#ccff00]">৳{o.total.toFixed(2)}</p>
                        <span className="text-[10px] uppercase text-neutral-400">{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Low Stock Warning Box */}
            <div className="bg-[#0c0c0c] border border-neutral-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="font-mono text-xs font-bold uppercase text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  CRITICAL INVENTORY REORDER ALERTS
                </h3>
                <span className="text-[10px] font-mono text-neutral-500 uppercase">Threshold: ≤ 3</span>
              </div>

              {lowStockVariants.length === 0 ? (
                <p className="text-xs font-mono text-neutral-400 py-6 text-center">All variant sizes have healthy inventory levels.</p>
              ) : (
                <div className="divide-y divide-neutral-900 max-h-72 overflow-y-auto pr-1">
                  {lowStockVariants.slice(0, 6).map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs font-mono">
                      <div>
                        <p className="text-white font-medium truncate max-w-[220px]">{item.product}</p>
                        <p className="text-[10px] text-neutral-500">Colorway: {item.color} • Size {item.size}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-red-950/80 border border-red-800 text-red-300 font-bold text-[10px]">
                        {item.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT MANAGEMENT & VARIANT BUILDER */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold font-mono text-white uppercase">STREETWEAR CATALOG PIECES</h2>
              <p className="text-xs font-mono text-neutral-400">Total {products.length} products with multi-colorway variations</p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddProduct}
              className="px-4 py-2.5 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase flex items-center gap-2 hover:bg-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>NEW PIECE</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-[#0c0c0c] border border-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono divide-y divide-neutral-800">
              <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Base Price</th>
                  <th className="py-3 px-4">Sale Price</th>
                  <th className="py-3 px-4">Colorways</th>
                  <th className="py-3 px-4">Total Units</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {products.map(p => {
                  const totalStock = p.variants.reduce((acc, v) => {
                    return acc + Object.values(v.sizes).reduce((sAcc, s) => sAcc + s, 0);
                  }, 0);
                  const firstImg = p.variants[0]?.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80';

                  return (
                    <tr key={p.id} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={firstImg}
                            alt={p.name}
                            className="w-10 h-12 object-cover object-center bg-neutral-900 border border-neutral-800"
                          />
                          <div>
                            <p className="font-bold text-white uppercase">{p.name}</p>
                            <p className="text-[10px] text-neutral-500">ID: {p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 uppercase text-neutral-400">
                        {p.gender} • {p.category}
                      </td>
                      <td className="py-3 px-4 text-white font-bold">৳{p.basePrice.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        {p.salePrice ? (
                          <span className="text-[#ccff00] font-bold">৳{p.salePrice.toFixed(2)}</span>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {p.variants.map((v, i) => (
                            <span
                              key={i}
                              title={`${v.color} (${v.sku})`}
                              className="w-3.5 h-3.5 rounded-none border border-neutral-700"
                              style={{ backgroundColor: v.colorCode }}
                            />
                          ))}
                          <span className="text-[10px] text-neutral-500 ml-1">({p.variants.length})</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${totalStock <= 5 ? 'text-red-400' : 'text-neutral-200'}`}>
                          {totalStock} units
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleDuplicateProduct(p)}
                            title="Duplicate product"
                            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditProduct(p)}
                            title="Edit product"
                            className="p-1.5 text-neutral-400 hover:text-[#ccff00] hover:bg-neutral-800 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            title="Delete product"
                            className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDER FULFILLMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold font-mono text-white uppercase">CUSTOMER ORDERS & DISPATCH</h2>
              <p className="text-xs font-mono text-neutral-400">Total {orders.length} real-time orders stored in Cloud Firestore</p>
            </div>
          </div>

          <div className="bg-[#0c0c0c] border border-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono divide-y divide-neutral-800">
              <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-white uppercase">
                      #{o.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-neutral-400">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-white font-medium">{o.customerName}</p>
                      <p className="text-[10px] text-neutral-500">{o.customerEmail}</p>
                    </td>
                    <td className="py-3 px-4 text-neutral-300">
                      <p className="text-xs">{o.paymentMethod || 'Online Pay'}</p>
                      {o.paymentDetails?.transactionId && (
                        <p className="text-[9px] font-mono text-[#ccff00]">TrxID: {o.paymentDetails.transactionId}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#ccff00]">
                      ৳{o.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                        className="text-[10px] font-mono uppercase font-bold px-2 py-1 border bg-neutral-900 focus:outline-none border-neutral-700 text-white"
                      >
                        <option value="pending">PENDING</option>
                        <option value="confirmed">CONFIRMED</option>
                        <option value="processing">PROCESSING</option>
                        <option value="shipped">SHIPPED</option>
                        <option value="delivered">DELIVERED</option>
                        <option value="cancelled">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setViewOrderModal(o)}
                        className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white text-[10px] uppercase transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMERS DIRECTORY */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold font-mono text-white uppercase">CUSTOMER INTELLIGENCE</h2>
            <p className="text-xs font-mono text-neutral-400">Total {customerList.length} unique client records compiled from transactions</p>
          </div>

          <div className="bg-[#0c0c0c] border border-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono divide-y divide-neutral-800">
              <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Total Orders</th>
                  <th className="py-3 px-4">Lifetime Spend</th>
                  <th className="py-3 px-4">Latest Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {customerList.map((c, i) => (
                  <tr key={i} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{c.name}</td>
                    <td className="py-3 px-4 text-neutral-400">{c.email}</td>
                    <td className="py-3 px-4 text-neutral-200">{c.ordersCount} orders</td>
                    <td className="py-3 px-4 font-bold text-[#ccff00]">৳{c.totalSpent.toFixed(2)}</td>
                    <td className="py-3 px-4 text-neutral-500">{new Date(c.lastOrder).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: COUPONS & DISCOUNTS */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold font-mono text-white uppercase">STORE COUPONS & VOUCHERS</h2>
              <p className="text-xs font-mono text-neutral-400">Manage promo codes and discount vouchers for customers</p>
            </div>
            <button
              type="button"
              onClick={() => setCouponModalOpen(true)}
              className="px-4 py-2.5 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase flex items-center gap-2 hover:bg-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>CREATE COUPON</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map((c, idx) => (
              <div key={idx} className="bg-[#0c0c0c] border border-neutral-800 p-5 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-white bg-neutral-900 border border-neutral-700 px-2 py-0.5 tracking-wider">
                    {c.code}
                  </span>
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 border ${
                    c.active ? 'border-[#ccff00] text-[#ccff00] bg-[#ccff00]/10' : 'border-neutral-700 text-neutral-500'
                  }`}>
                    {c.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <div className="space-y-1 text-xs font-mono">
                  <p className="text-[#ccff00] font-bold">
                    {c.discountType === 'percent' ? `${c.value}% OFF` : `৳${c.value} FLAT DISCOUNT`}
                  </p>
                  <p className="text-neutral-400 text-[11px]">{c.description || 'Promotional coupon'}</p>
                  <p className="text-neutral-500 text-[10px]">Min. Order: ৳{c.minOrder || 0}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: STORE SETTINGS & GATEWAYS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold font-mono text-white uppercase">STORE OPERATIONAL SETTINGS</h2>
            <p className="text-xs font-mono text-neutral-400">Security, currency, and payment gateway configuration</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Config */}
            <div className="bg-[#0c0c0c] border border-neutral-800 p-6 space-y-4">
              <h3 className="font-mono text-xs font-bold uppercase text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
                <ShieldCheck className="w-4 h-4 text-[#ccff00]" />
                ADMIN SECURITY & ACCESS CONTROL
              </h3>
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <span className="text-neutral-500 text-[10px] uppercase block">AUTHORIZED ADMIN GMAIL:</span>
                  <span className="text-[#ccff00] font-bold text-sm">{AUTHORIZED_ADMIN_EMAIL}</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] uppercase block">AUTHENTICATION PROVIDER:</span>
                  <span className="text-white">Google Identity / Firebase Authentication</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] uppercase block">DATABASE RULES:</span>
                  <span className="text-green-400">Cloud Firestore Rules Deployed & Enforced</span>
                </div>
              </div>
            </div>

            {/* Payment Gateways Config */}
            <div className="bg-[#0c0c0c] border border-neutral-800 p-6 space-y-4">
              <h3 className="font-mono text-xs font-bold uppercase text-white flex items-center gap-2 border-b border-neutral-800 pb-3">
                <Smartphone className="w-4 h-4 text-[#ccff00]" />
                PAYMENT GATEWAYS (BANGLADESH)
              </h3>
              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    <span className="text-white font-bold">bKash Direct Gateway</span>
                  </div>
                  <span className="text-[10px] text-[#ccff00] uppercase font-bold">ACTIVE (BDT ৳)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    <span className="text-white font-bold">Nagad MFS Gateway</span>
                  </div>
                  <span className="text-[10px] text-[#ccff00] uppercase font-bold">ACTIVE (BDT ৳)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                    <span className="text-white font-bold">Cash on Delivery (COD)</span>
                  </div>
                  <span className="text-[10px] text-[#ccff00] uppercase font-bold">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setProductModalOpen(false)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-[#0e0e0e] border border-neutral-800 shadow-2xl p-6 sm:p-8 animate-slide-up max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-lg font-bold font-mono text-white uppercase mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#ccff00]" />
                {editingProduct ? `EDIT: ${editingProduct.name}` : 'CREATE NEW STREETWEAR PIECE'}
              </h2>

              <form onSubmit={handleSaveProduct} className="space-y-5 text-xs font-mono">
                <div>
                  <label className="block text-neutral-400 uppercase mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={formProduct.name || ''}
                    onChange={(e) => setFormProduct({ ...formProduct, name: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-white focus:border-[#ccff00] focus:outline-none"
                    placeholder="e.g. OVERSIZED HEAVYWEIGHT TECH TEE"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-400 uppercase mb-1">Gender</label>
                    <select
                      value={formProduct.gender}
                      onChange={(e) => setFormProduct({ ...formProduct, gender: e.target.value as Gender })}
                      className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-white focus:border-[#ccff00] focus:outline-none uppercase"
                    >
                      <option value="men">MEN</option>
                      <option value="women">WOMEN</option>
                      <option value="boys">BOYS</option>
                      <option value="unisex">UNISEX</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-400 uppercase mb-1">Category</label>
                    <select
                      value={formProduct.category}
                      onChange={(e) => setFormProduct({ ...formProduct, category: e.target.value as Category })}
                      className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-white focus:border-[#ccff00] focus:outline-none uppercase"
                    >
                      <option value="clothing">CLOTHING</option>
                      <option value="footwear">FOOTWEAR</option>
                      <option value="accessories">ACCESSORIES</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-400 uppercase mb-1">Base Price (৳ BDT)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formProduct.basePrice || ''}
                      onChange={(e) => setFormProduct({ ...formProduct, basePrice: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-white focus:border-[#ccff00] focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 uppercase mb-1">Sale Price (Optional ৳ BDT)</label>
                    <input
                      type="number"
                      value={formProduct.salePrice || ''}
                      onChange={(e) => {
                        const val = e.target.value ? parseFloat(e.target.value) : undefined;
                        setFormProduct({ ...formProduct, salePrice: val, isSale: Boolean(val) });
                      }}
                      className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-[#ccff00] focus:border-[#ccff00] focus:outline-none font-bold"
                      placeholder="e.g. 68"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase mb-1">Editorial Description</label>
                  <textarea
                    rows={3}
                    value={formProduct.description || ''}
                    onChange={(e) => setFormProduct({ ...formProduct, description: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-white focus:border-[#ccff00] focus:outline-none"
                  />
                </div>

                {/* MULTI-COLOR VARIANT BUILDER */}
                <div className="border border-neutral-800 p-4 space-y-4 bg-neutral-950">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <h3 className="font-bold text-white uppercase text-xs">
                      Colorways & Stock per Size ({formProduct.variants?.length || 0})
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddVariantToForm}
                      className="px-2 py-1 bg-neutral-900 hover:bg-[#ccff00] hover:text-black border border-neutral-700 text-xs transition-colors"
                    >
                      + ADD COLORWAY
                    </button>
                  </div>

                  {formProduct.variants?.map((v, vIdx) => (
                    <div key={vIdx} className="p-3 border border-neutral-900 bg-neutral-900/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 border border-white/20"
                            style={{ backgroundColor: v.colorCode }}
                          />
                          <span className="font-bold text-white uppercase">{v.color} ({v.sku})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantFromForm(vIdx)}
                          className="text-red-400 hover:text-red-300 text-[10px] uppercase font-bold"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-neutral-400 mb-0.5">Color Name</label>
                          <input
                            type="text"
                            value={v.color}
                            onChange={(e) => {
                              const updated = [...(formProduct.variants || [])];
                              updated[vIdx].color = e.target.value;
                              setFormProduct({ ...formProduct, variants: updated });
                            }}
                            className="w-full bg-neutral-950 border border-neutral-800 px-2 py-1 text-white text-[11px]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-neutral-400 mb-0.5">Hex Code</label>
                          <input
                            type="text"
                            value={v.colorCode}
                            onChange={(e) => {
                              const updated = [...(formProduct.variants || [])];
                              updated[vIdx].colorCode = e.target.value;
                              setFormProduct({ ...formProduct, variants: updated });
                            }}
                            className="w-full bg-neutral-950 border border-neutral-800 px-2 py-1 text-white text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-neutral-400 mb-0.5">Image URL</label>
                        <input
                          type="url"
                          value={v.images[0] || ''}
                          onChange={(e) => {
                            const updated = [...(formProduct.variants || [])];
                            updated[vIdx].images = [e.target.value];
                            setFormProduct({ ...formProduct, variants: updated });
                          }}
                          className="w-full bg-neutral-950 border border-neutral-800 px-2 py-1 text-white text-[11px]"
                        />
                      </div>

                      {/* Sizes Stock */}
                      <div>
                        <span className="block text-[10px] text-neutral-400 uppercase mb-1">Sizes Stock</span>
                        <div className="flex gap-2 flex-wrap">
                          {['S', 'M', 'L', 'XL'].map(size => (
                            <div key={size} className="flex items-center gap-1 bg-neutral-950 px-2 py-1 border border-neutral-800">
                              <span className="text-[10px] text-neutral-400">{size}:</span>
                              <input
                                type="number"
                                min={0}
                                value={v.sizes[size] ?? 0}
                                onChange={(e) => {
                                  const updated = [...(formProduct.variants || [])];
                                  updated[vIdx].sizes = {
                                    ...updated[vIdx].sizes,
                                    [size]: parseInt(e.target.value, 10) || 0
                                  };
                                  setFormProduct({ ...formProduct, variants: updated });
                                }}
                                className="w-12 bg-transparent text-white font-bold text-center text-xs focus:outline-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="px-4 py-2 border border-neutral-700 text-neutral-300 hover:text-white uppercase"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#ccff00] text-black font-bold uppercase hover:bg-white transition-colors"
                  >
                    SAVE PIECE
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW ORDER DETAILS MODAL */}
      {viewOrderModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setViewOrderModal(null)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-[#0e0e0e] border border-neutral-800 shadow-2xl p-6 sm:p-8 space-y-6">
              <button
                type="button"
                onClick={() => setViewOrderModal(null)}
                className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#ccff00]">ORDER INVOICE</span>
                  <h3 className="font-display text-2xl font-black text-white">#{viewOrderModal.orderNumber}</h3>
                  <p className="text-xs font-mono text-neutral-500">{new Date(viewOrderModal.createdAt).toLocaleString()}</p>
                </div>

                <select
                  value={viewOrderModal.status}
                  onChange={(e) => handleStatusChange(viewOrderModal.id, e.target.value as OrderStatus)}
                  className="bg-neutral-900 border border-neutral-700 text-white font-mono text-xs uppercase px-3 py-1.5"
                >
                  <option value="pending">PENDING</option>
                  <option value="confirmed">CONFIRMED</option>
                  <option value="processing">PROCESSING</option>
                  <option value="shipped">SHIPPED</option>
                  <option value="delivered">DELIVERED</option>
                  <option value="cancelled">CANCELLED</option>
                </select>
              </div>

              {/* Customer & Shipping info */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-neutral-300">
                <div className="bg-neutral-950 p-4 border border-neutral-900 space-y-1">
                  <span className="text-[10px] uppercase text-neutral-500">CUSTOMER</span>
                  <p className="text-white font-bold">{viewOrderModal.customerName}</p>
                  <p>{viewOrderModal.customerEmail}</p>
                  <p>{viewOrderModal.customerPhone}</p>
                </div>
                <div className="bg-neutral-950 p-4 border border-neutral-900 space-y-1">
                  <span className="text-[10px] uppercase text-neutral-500">SHIPPING DESTINATION</span>
                  <p>{viewOrderModal.shippingAddress.address}</p>
                  <p>{viewOrderModal.shippingAddress.city}, {viewOrderModal.shippingAddress.state} {viewOrderModal.shippingAddress.postalCode}</p>
                  <p>{viewOrderModal.shippingAddress.country}</p>
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase font-bold text-neutral-400">
                  ORDERED LINE ITEMS ({viewOrderModal.items.length})
                </span>
                <div className="divide-y divide-neutral-900 border border-neutral-900 max-h-56 overflow-y-auto">
                  {viewOrderModal.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-10 h-12 object-cover object-center bg-neutral-900 border border-neutral-800"
                        />
                        <div>
                          <p className="text-white font-bold uppercase">{item.productName}</p>
                          <p className="text-[10px] text-neutral-400">
                            COLOR: {item.color} • SIZE: {item.size} • QTY: {item.quantity}
                          </p>
                          <p className="text-[9px] text-neutral-500">SKU: {item.sku}</p>
                        </div>
                      </div>
                      <span className="font-bold text-white">৳{item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-800 pt-3 flex justify-between font-mono text-sm font-bold">
                <span className="text-neutral-400">ORDER TOTAL:</span>
                <span className="text-[#ccff00]">৳{viewOrderModal.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setCouponModalOpen(false)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-[#0e0e0e] border border-neutral-800 shadow-2xl p-6 space-y-4">
              <button
                type="button"
                onClick={() => setCouponModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-base font-bold font-mono text-white uppercase flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#ccff00]" />
                CREATE NEW PROMO CODE
              </h2>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <label className="block text-neutral-400 uppercase mb-1">Coupon Code</label>
                  <input
                    type="text"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. VIP20"
                    className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-white uppercase font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 uppercase mb-1">Type</label>
                    <select
                      value={newCoupon.discountType}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as any })}
                      className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-white uppercase"
                    >
                      <option value="percent">Percentage (%)</option>
                      <option value="fixed">Fixed (৳ BDT)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-neutral-400 uppercase mb-1">Value</label>
                    <input
                      type="number"
                      value={newCoupon.value}
                      onChange={(e) => setNewCoupon({ ...newCoupon, value: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 uppercase mb-1">Description</label>
                  <input
                    type="text"
                    value={newCoupon.description}
                    onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                    placeholder="e.g. 20% discount on summer drop"
                    className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCouponModalOpen(false)}
                    className="px-4 py-2 border border-neutral-700 text-neutral-300 uppercase"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newCoupon.code) return;
                      setCoupons(prev => [...prev, newCoupon]);
                      showToast(`Created coupon ${newCoupon.code}!`, 'success');
                      setCouponModalOpen(false);
                    }}
                    className="px-5 py-2 bg-[#ccff00] text-black font-bold uppercase hover:bg-white transition-colors"
                  >
                    SAVE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
