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
  ChevronDown
} from 'lucide-react';
import { Product, Order, OrderStatus, ProductVariant, Gender, Category } from '../types';
import { 
  getProducts, 
  saveProduct, 
  removeProduct, 
  getAllOrders, 
  updateOrderStatus, 
  reseedStoreDatabase 
} from '../lib/storeService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface AdminViewProps {
  onNavigate: (view: string, params?: any) => void;
  onRefreshCatalog: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onNavigate, onRefreshCatalog }) => {
  const { showToast } = useToast();
  const { isAdmin, simulateAdminMode, toggleSimulateAdminMode } = useAuth();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'customers'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & forms
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewOrderModal, setViewOrderModal] = useState<Order | null>(null);
  const [isReseeding, setIsReseeding] = useState(false);

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

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, ords] = await Promise.all([
        getProducts(),
        getAllOrders()
      ]);
      setProducts(prods);
      setOrders(ords);
    } catch (err) {
      console.warn('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      basePrice: 85,
      isSale: false,
      isNewArrival: true,
      isFeatured: false,
      tags: ['streetwear', 'tokyo-cut'],
      variants: [
        {
          color: 'Phantom Black',
          colorCode: '#0a0a0a',
          sku: `ZN-NEW-${Math.floor(100 + Math.random() * 900)}`,
          images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80'],
          sizes: { 'S': 8, 'M': 12, 'L': 6, 'XL': 3 }
        }
      ]
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormProduct(JSON.parse(JSON.stringify(prod)));
    setProductModalOpen(true);
  };

  const handleDuplicateProduct = async (prod: Product) => {
    const copyId = `prod-${Date.now()}`;
    const copyProduct: Product = {
      ...prod,
      id: copyId,
      name: `${prod.name} (COPY)`,
      slug: `${prod.slug}-copy-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    try {
      await saveProduct(copyProduct);
      showToast(`Duplicated ${prod.name}`, 'success');
      loadData();
      onRefreshCatalog();
    } catch (err: any) {
      showToast(err.message || 'Failed to duplicate', 'error');
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
      showToast(err.message || 'Failed to remove', 'error');
    }
  };

  const handleSaveProductForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProduct.name || !formProduct.basePrice || !formProduct.variants?.length) {
      showToast('Please fill out product name, price, and at least one color variant.', 'error');
      return;
    }

    const prodId = editingProduct ? editingProduct.id : `prod-${Date.now()}`;
    const slug = formProduct.slug || formProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const finalProduct: Product = {
      id: prodId,
      name: formProduct.name,
      slug,
      description: formProduct.description || '',
      details: formProduct.details || ['Engineered street fit', 'Premium hardware'],
      gender: (formProduct.gender as Gender) || 'men',
      category: (formProduct.category as Category) || 'clothing',
      subcategory: formProduct.subcategory || 't-shirts',
      basePrice: Number(formProduct.basePrice),
      salePrice: formProduct.salePrice ? Number(formProduct.salePrice) : undefined,
      isSale: formProduct.isSale || false,
      isNewArrival: formProduct.isNewArrival || false,
      isFeatured: formProduct.isFeatured || false,
      tags: formProduct.tags || ['streetwear'],
      variants: formProduct.variants as ProductVariant[],
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
      showToast(err.message || 'Failed to save product to Firestore', 'error');
    }
  };

  // Add a new color variant in the editor
  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      color: 'Signal White',
      colorCode: '#ffffff',
      sku: `ZN-${(formProduct.name || 'ITEM').substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80'],
      sizes: { 'S': 5, 'M': 10, 'L': 5, 'XL': 2 }
    };
    setFormProduct(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant]
    }));
  };

  const handleRemoveVariant = (index: number) => {
    if ((formProduct.variants?.length || 0) <= 1) {
      showToast('A product must contain at least one color variant.', 'error');
      return;
    }
    setFormProduct(prev => ({
      ...prev,
      variants: prev.variants?.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, val: any) => {
    setFormProduct(prev => {
      const copy = [...(prev.variants || [])];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, variants: copy };
    });
  };

  // Order Actions
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to "${newStatus.toUpperCase()}"`, 'success');
      loadData();
      if (viewOrderModal && viewOrderModal.id === orderId) {
        setViewOrderModal(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const handleReseed = async () => {
    if (!window.confirm('Reset store database to curated initial streetwear drops?')) return;
    setIsReseeding(true);
    try {
      const count = await reseedStoreDatabase();
      showToast(`Database reseeded with ${count} streetwear products!`, 'success');
      await loadData();
      onRefreshCatalog();
    } catch (err: any) {
      showToast(err.message || 'Reseeding error', 'error');
    } finally {
      setIsReseeding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-neutral-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#ccff00] animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#ccff00]">
              ADMIN CONTROL CENTER
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black uppercase text-white tracking-tight mt-1">
            ZiiNi STORE OPERATIONS
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Direct Cloud Firestore persistence • Live inventory & multi-variant management
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleReseed}
            disabled={isReseeding}
            className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white font-mono text-xs uppercase flex items-center gap-2"
            title="Reset and repopulate catalog with fresh editorial items"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReseeding ? 'animate-spin' : ''}`} />
            <span>Reseed Catalog</span>
          </button>

          <button
            onClick={() => onNavigate('shop')}
            className="px-3.5 py-2 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase hover:bg-white transition-colors"
          >
            VIEW STOREFRONT
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 text-xs font-mono">
        {[
          { id: 'dashboard', label: 'Dashboard & Metrics', icon: TrendingUp },
          { id: 'products', label: `Products (${products.length})`, icon: Package },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'customers', label: `Customers (${customerList.length})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-5 uppercase transition-colors flex items-center gap-2 ${
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
                  INVENTORY SHORTAGE WARNINGS
                </h3>
                <span className="text-[10px] font-mono text-neutral-500 uppercase">
                  {lowStockVariants.length} CRITICAL
                </span>
              </div>

              {lowStockVariants.length === 0 ? (
                <p className="text-xs font-mono text-neutral-500 py-6 text-center">All variants sufficiently stocked.</p>
              ) : (
                <div className="divide-y divide-neutral-900 max-h-64 overflow-y-auto">
                  {lowStockVariants.slice(0, 8).map((v, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between text-xs font-mono">
                      <div>
                        <p className="font-bold text-white line-clamp-1">{v.product}</p>
                        <p className="text-[10px] text-neutral-400">{v.color} • SIZE: {v.size}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-red-950 border border-red-800 text-red-300 text-[10px] font-bold">
                        {v.stock} LEFT
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-xs font-mono text-neutral-400">
              MANAGE PRODUCTS, IMAGES & MULTI-COLOR VARIANTS IN FIRESTORE
            </p>
            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2.5 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase flex items-center gap-2 hover:bg-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>ADD NEW PRODUCT</span>
            </button>
          </div>

          <div className="bg-[#0c0c0c] border border-neutral-800 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400">
                <tr>
                  <th className="p-4">PRODUCT</th>
                  <th className="p-4">GENDER / CAT</th>
                  <th className="p-4">PRICE</th>
                  <th className="p-4">COLORWAYS</th>
                  <th className="p-4">TOTAL STOCK</th>
                  <th className="p-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {products.map((prod) => {
                  const totalStock = prod.variants.reduce((sum, v) => {
                    return sum + Object.values(v.sizes).reduce((s, count) => s + count, 0);
                  }, 0);

                  return (
                    <tr key={prod.id} className="hover:bg-neutral-950/60 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={prod.variants[0]?.images[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80'}
                          alt={prod.name}
                          className="w-12 h-14 object-cover object-center bg-neutral-900 border border-neutral-800"
                        />
                        <div>
                          <p className="font-bold text-white uppercase line-clamp-1">{prod.name}</p>
                          <p className="text-[10px] text-neutral-500 font-mono">SKU: {prod.variants[0]?.sku || 'N/A'}</p>
                          <div className="flex gap-1 mt-1">
                            {prod.isNewArrival && <span className="text-[8px] bg-white text-black px-1 font-bold">NEW</span>}
                            {prod.isSale && <span className="text-[8px] bg-[#ccff00] text-black px-1 font-bold">SALE</span>}
                            {prod.isFeatured && <span className="text-[8px] bg-neutral-800 text-neutral-300 px-1">FEATURED</span>}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 uppercase text-neutral-300">
                        {prod.gender} • {prod.category}
                      </td>

                      <td className="p-4 font-bold text-white">
                        ৳{prod.salePrice ?? prod.basePrice}
                        {prod.salePrice && <span className="text-neutral-500 line-through text-[10px] ml-1.5">৳{prod.basePrice}</span>}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {prod.variants.map((v, i) => (
                            <span
                              key={i}
                              title={`${v.color} (${v.sku})`}
                              className="w-4 h-4 rounded-none border border-white/20 inline-block"
                              style={{ backgroundColor: v.colorCode }}
                            />
                          ))}
                          <span className="text-[10px] text-neutral-500 ml-1">
                            ({prod.variants.length})
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`font-bold ${totalStock <= 5 ? 'text-red-400' : 'text-neutral-200'}`}>
                          {totalStock} units
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700"
                            title="Edit Product"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicateProduct(prod)}
                            className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 bg-neutral-900 hover:bg-red-950 text-neutral-400 hover:text-red-300 border border-neutral-700"
                            title="Delete"
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

      {/* TAB 3: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <p className="text-xs font-mono text-neutral-400">
            ALL CUSTOMER ORDERS IN REAL TIME • UPDATE STATUS TO SYNCHRONIZE WITH CUSTOMER PORTAL
          </p>

          <div className="bg-[#0c0c0c] border border-neutral-800 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400">
                <tr>
                  <th className="p-4">ORDER ID</th>
                  <th className="p-4">CUSTOMER</th>
                  <th className="p-4">DATE</th>
                  <th className="p-4">TOTAL</th>
                  <th className="p-4">PAYMENT</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4 text-right">INSPECT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-950/60 transition-colors">
                    <td className="p-4 font-bold text-white">
                      #{order.orderNumber}
                    </td>

                    <td className="p-4">
                      <p className="text-white font-bold">{order.customerName}</p>
                      <p className="text-[10px] text-neutral-400">{order.customerEmail}</p>
                    </td>

                    <td className="p-4 text-neutral-400 text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 font-bold text-[#ccff00]">
                      ৳{order.total.toFixed(2)}
                    </td>

                    <td className="p-4 text-neutral-300 text-[11px]">
                      {order.paymentMethod}
                    </td>

                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className={`text-[10px] font-mono uppercase font-bold px-2 py-1 border bg-neutral-900 focus:outline-none ${
                          order.status === 'delivered' ? 'text-[#ccff00] border-[#ccff00]/40' :
                          order.status === 'shipped' ? 'text-indigo-400 border-indigo-400/40' :
                          order.status === 'cancelled' ? 'text-red-400 border-red-400/40' :
                          'text-yellow-400 border-yellow-400/40'
                        }`}
                      >
                        <option value="pending">PENDING</option>
                        <option value="confirmed">CONFIRMED</option>
                        <option value="processing">PROCESSING</option>
                        <option value="shipped">SHIPPED</option>
                        <option value="delivered">DELIVERED</option>
                        <option value="cancelled">CANCELLED</option>
                      </select>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => setViewOrderModal(order)}
                        className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-[11px] font-mono uppercase inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMER MANAGEMENT */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <p className="text-xs font-mono text-neutral-400">
            REGISTERED PURCHASING CLIENTELE & SPEND SUMMARY
          </p>

          <div className="bg-[#0c0c0c] border border-neutral-800 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400">
                <tr>
                  <th className="p-4">CLIENT NAME</th>
                  <th className="p-4">EMAIL</th>
                  <th className="p-4">ORDERS PLACED</th>
                  <th className="p-4">TOTAL SPENT</th>
                  <th className="p-4">LAST ORDER DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {customerList.map((cust, i) => (
                  <tr key={i} className="hover:bg-neutral-950/60">
                    <td className="p-4 font-bold text-white uppercase">{cust.name}</td>
                    <td className="p-4 text-neutral-300">{cust.email}</td>
                    <td className="p-4 text-white font-bold">{cust.ordersCount} orders</td>
                    <td className="p-4 font-bold text-[#ccff00]">৳{cust.totalSpent.toFixed(2)}</td>
                    <td className="p-4 text-neutral-400">{new Date(cust.lastOrder).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRODUCT EDITOR MODAL (WITH COLOR VARIANT BUILDER) */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
            onClick={() => setProductModalOpen(false)}
          />

          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-3xl bg-[#0f0f0f] border border-neutral-800 p-6 sm:p-8 space-y-6 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#ccff00]">CATALOG MASTER</span>
                  <h3 className="font-display text-2xl font-bold uppercase text-white">
                    {editingProduct ? `EDIT: ${editingProduct.name}` : 'CREATE NEW STREETWEAR PIECE'}
                  </h3>
                </div>
                <button onClick={() => setProductModalOpen(false)} className="p-1 text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProductForm} className="space-y-6">
                {/* General Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formProduct.name}
                      onChange={(e) => setFormProduct(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. OVERSIZED HEAVYWEIGHT TECH TEE"
                      className="w-full bg-neutral-900 border border-neutral-800 p-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#ccff00]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                      Gender *
                    </label>
                    <select
                      value={formProduct.gender}
                      onChange={(e) => setFormProduct(prev => ({ ...prev, gender: e.target.value as Gender }))}
                      className="w-full bg-neutral-900 border border-neutral-800 p-2.5 text-xs font-mono text-white uppercase focus:outline-none focus:border-[#ccff00]"
                    >
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="boys">Boys</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                      Category *
                    </label>
                    <select
                      value={formProduct.category}
                      onChange={(e) => setFormProduct(prev => ({ ...prev, category: e.target.value as Category }))}
                      className="w-full bg-neutral-900 border border-neutral-800 p-2.5 text-xs font-mono text-white uppercase focus:outline-none focus:border-[#ccff00]"
                    >
                      <option value="clothing">Clothing</option>
                      <option value="footwear">Footwear</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                      Base Price (BDT) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      value={formProduct.basePrice}
                      onChange={(e) => setFormProduct(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                      className="w-full bg-neutral-900 border border-neutral-800 p-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#ccff00]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                      Sale Price (BDT) (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formProduct.salePrice || ''}
                      onChange={(e) => setFormProduct(prev => ({ ...prev, salePrice: e.target.value ? Number(e.target.value) : undefined }))}
                      placeholder="Leave empty if regular price"
                      className="w-full bg-neutral-900 border border-neutral-800 p-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#ccff00]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                      Editorial Description
                    </label>
                    <textarea
                      rows={3}
                      value={formProduct.description}
                      onChange={(e) => setFormProduct(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Product details, silhouette, fabric density..."
                      className="w-full bg-neutral-900 border border-neutral-800 p-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#ccff00]"
                    />
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="flex gap-6 border-y border-neutral-800 py-3 text-xs font-mono">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formProduct.isNewArrival}
                      onChange={(e) => setFormProduct(prev => ({ ...prev, isNewArrival: e.target.checked }))}
                      className="accent-[#ccff00]"
                    />
                    <span className="text-white">New Arrival</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formProduct.isFeatured}
                      onChange={(e) => setFormProduct(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="accent-[#ccff00]"
                    />
                    <span className="text-white">Featured Homepage</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formProduct.isSale}
                      onChange={(e) => setFormProduct(prev => ({ ...prev, isSale: e.target.checked }))}
                      className="accent-[#ccff00]"
                    />
                    <span className="text-[#ccff00]">Archive Sale</span>
                  </label>
                </div>

                {/* MULTI-COLOR VARIANT BUILDER - CRITICAL SPEC */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <div>
                      <h4 className="font-mono text-xs font-bold uppercase text-white">
                        COLORWAYS & STOCK MATRIX ({formProduct.variants?.length || 0})
                      </h4>
                      <p className="text-[10px] font-mono text-neutral-500">
                        Each colorway maintains its own images, stock levels, and SKU.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-[#ccff00] hover:text-black border border-neutral-700 text-white text-xs font-mono font-bold uppercase flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ ADD COLOR</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formProduct.variants?.map((variant, vIdx) => (
                      <div key={vIdx} className="bg-neutral-950 border border-neutral-800 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold uppercase text-[#ccff00]">
                            Colorway #{vIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(vIdx)}
                            className="text-neutral-500 hover:text-red-400 p-1"
                            title="Remove color variant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                              Color Name
                            </label>
                            <input
                              type="text"
                              value={variant.color}
                              onChange={(e) => handleUpdateVariant(vIdx, 'color', e.target.value)}
                              placeholder="e.g. Acid Olive"
                              className="w-full bg-neutral-900 border border-neutral-800 p-2 text-xs font-mono text-white focus:outline-none focus:border-[#ccff00]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                              Color Hex Code
                            </label>
                            <div className="flex gap-2 items-center">
                              <input
                                type="color"
                                value={variant.colorCode}
                                onChange={(e) => handleUpdateVariant(vIdx, 'colorCode', e.target.value)}
                                className="w-8 h-8 bg-transparent border-0 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={variant.colorCode}
                                onChange={(e) => handleUpdateVariant(vIdx, 'colorCode', e.target.value)}
                                className="flex-1 bg-neutral-900 border border-neutral-800 p-2 text-xs font-mono text-white uppercase focus:outline-none focus:border-[#ccff00]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                              Variant SKU
                            </label>
                            <input
                              type="text"
                              value={variant.sku}
                              onChange={(e) => handleUpdateVariant(vIdx, 'sku', e.target.value)}
                              placeholder="ZN-TEE-BLK"
                              className="w-full bg-neutral-900 border border-neutral-800 p-2 text-xs font-mono text-white uppercase focus:outline-none focus:border-[#ccff00]"
                            />
                          </div>
                        </div>

                        {/* Image URLs */}
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                            Primary Product Photo URL (for this color)
                          </label>
                          <input
                            type="url"
                            value={variant.images[0] || ''}
                            onChange={(e) => {
                              const newImages = [...variant.images];
                              newImages[0] = e.target.value;
                              handleUpdateVariant(vIdx, 'images', newImages);
                            }}
                            placeholder="https://..."
                            className="w-full bg-neutral-900 border border-neutral-800 p-2 text-xs font-mono text-white focus:outline-none focus:border-[#ccff00]"
                          />
                        </div>

                        {/* Sizes stock */}
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">
                            Stock Units by Size:
                          </label>
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                              <div key={size} className="bg-neutral-900 p-1.5 border border-neutral-800">
                                <span className="block text-[10px] font-mono font-bold text-neutral-400 text-center">
                                  {size}
                                </span>
                                <input
                                  type="number"
                                  min="0"
                                  value={variant.sizes[size] ?? 0}
                                  onChange={(e) => {
                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                    const newSizes = { ...variant.sizes, [size]: val };
                                    handleUpdateVariant(vIdx, 'sizes', newSizes);
                                  }}
                                  className="w-full text-center bg-black border border-neutral-700 py-1 text-xs font-mono text-white"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-neutral-800">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-[#ccff00] hover:bg-white text-black font-mono font-bold text-xs uppercase tracking-widest transition-colors"
                  >
                    SAVE TO FIRESTORE
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="px-6 py-3.5 bg-neutral-900 text-neutral-400 hover:text-white font-mono text-xs uppercase"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ORDER INSPECTOR MODAL */}
      {viewOrderModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
            onClick={() => setViewOrderModal(null)}
          />

          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-[#0f0f0f] border border-neutral-800 p-6 sm:p-8 space-y-6 animate-slide-up">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#ccff00]">ORDER INSPECTOR</span>
                  <h3 className="font-display text-xl font-bold uppercase text-white">
                    ORDER #{viewOrderModal.orderNumber}
                  </h3>
                </div>
                <button onClick={() => setViewOrderModal(null)} className="p-1 text-neutral-400 hover:text-white">
                  ✕
                </button>
              </div>

              {/* Status Update Quick Bar */}
              <div className="bg-neutral-950 p-4 border border-neutral-800 flex items-center justify-between gap-4">
                <span className="text-xs font-mono uppercase text-neutral-400 font-bold">
                  UPDATE ORDER STATUS:
                </span>
                <select
                  value={viewOrderModal.status}
                  onChange={(e) => handleStatusChange(viewOrderModal.id, e.target.value as OrderStatus)}
                  className="bg-neutral-900 border border-neutral-700 px-3 py-1.5 text-xs font-mono uppercase text-[#ccff00] font-bold focus:outline-none"
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
    </div>
  );
};
