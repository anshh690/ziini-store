import React, { useState, useEffect } from 'react';
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Order, Product } from '../types';
import { getCustomerOrders } from '../lib/storeService';
import { ProductCard } from '../components/ProductCard';

interface AccountViewProps {
  initialTab?: string;
  allProducts: Product[];
  onNavigate: (view: string, params?: any) => void;
  onSelectProduct: (product: Product, color?: string) => void;
  onOpenAuth: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  initialTab = 'profile',
  allProducts,
  onNavigate,
  onSelectProduct,
  onOpenAuth,
}) => {
  const { user, userProfile, logout, isAdmin } = useAuth();
  const { wishlist } = useCart();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'addresses'>(
    (initialTab as any) || 'profile'
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  useEffect(() => {
    if (user?.email) {
      setLoadingOrders(true);
      getCustomerOrders(user.email, user.uid)
        .then(res => setOrders(res))
        .catch(err => console.warn(err))
        .finally(() => setLoadingOrders(false));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
          <User className="w-8 h-8" />
        </div>
        <h1 className="font-display text-3xl font-black uppercase text-white">
          SIGN IN TO YOUR ARCHIVE
        </h1>
        <p className="text-xs font-mono text-neutral-400 max-w-sm mx-auto">
          Access your real-time order history, tracking details, saved addresses, and curated wishlist.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-8 py-3.5 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"
        >
          AUTHENTICATE / REGISTER
        </button>
      </div>
    );
  }

  const wishlistedProducts = allProducts.filter(p => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-neutral-800 pb-6 gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#ccff00]">
            CLIENT PORTAL
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-black uppercase text-white tracking-tight mt-1">
            {user.displayName || 'ARCHIVE MEMBER'}
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            {user.email} {isAdmin && <span className="text-[#ccff00] font-bold">• [STORE ADMINISTRATOR]</span>}
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-mono text-neutral-300 hover:text-white uppercase flex items-center gap-2 self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5 text-neutral-500" />
          <span>SIGN OUT</span>
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-neutral-800 text-xs font-mono overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 uppercase transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'text-[#ccff00] border-b-2 border-[#ccff00] font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 uppercase transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'text-[#ccff00] border-b-2 border-[#ccff00] font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 px-4 uppercase transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'wishlist'
              ? 'text-[#ccff00] border-b-2 border-[#ccff00] font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Wishlist ({wishlistedProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 px-4 uppercase transition-colors shrink-0 flex items-center gap-2 ${
            activeTab === 'addresses'
              ? 'text-[#ccff00] border-b-2 border-[#ccff00] font-bold'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Shipping Addresses</span>
        </button>
      </div>

      {/* TAB CONTENT: PROFILE */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0c0c0c] border border-neutral-800 p-6 space-y-3">
            <h3 className="font-mono text-xs font-bold uppercase text-neutral-400">
              ACCOUNT STATUS
            </h3>
            <p className="font-display text-2xl font-bold uppercase text-white">
              TIER: OBSIDIAN
            </p>
            <p className="text-xs text-neutral-500 font-mono">
              Member since {new Date(user.metadata.creationTime || Date.now()).toLocaleDateString()}
            </p>
          </div>

          <div className="bg-[#0c0c0c] border border-neutral-800 p-6 space-y-3">
            <h3 className="font-mono text-xs font-bold uppercase text-neutral-400">
              TOTAL ORDERS
            </h3>
            <p className="font-display text-2xl font-bold uppercase text-[#ccff00]">
              {orders.length} TRANSACTIONS
            </p>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs font-mono text-white underline hover:text-[#ccff00]"
            >
              View Order History →
            </button>
          </div>

          <div className="bg-[#0c0c0c] border border-neutral-800 p-6 space-y-3">
            <h3 className="font-mono text-xs font-bold uppercase text-neutral-400">
              WISHLIST SAVED
            </h3>
            <p className="font-display text-2xl font-bold uppercase text-white">
              {wishlistedProducts.length} ITEMS
            </p>
            <button
              onClick={() => setActiveTab('wishlist')}
              className="text-xs font-mono text-white underline hover:text-[#ccff00]"
            >
              View Wishlist Archive →
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="py-12 text-center text-xs font-mono text-neutral-400">
              QUERYING FIRESTORE ARCHIVE...
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-[#0c0c0c] border border-neutral-800 p-12 text-center">
              <Package className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <h3 className="font-display text-lg font-bold uppercase text-white mb-2">
                NO ORDERS FOUND YET
              </h3>
              <p className="text-xs font-mono text-neutral-400 mb-6">
                When you place orders via checkout, your live fulfillment status will appear here.
              </p>
              <button
                onClick={() => onNavigate('shop')}
                className="px-6 py-3 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase"
              >
                BROWSE CATALOG
              </button>
            </div>
          ) : (
            <div className="bg-[#0c0c0c] border border-neutral-800 divide-y divide-neutral-900">
              {orders.map((order) => {
                const statusColors: Record<string, string> = {
                  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
                  confirmed: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
                  processing: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
                  shipped: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30',
                  delivered: 'text-[#ccff00] bg-[#ccff00]/10 border-[#ccff00]/30',
                  cancelled: 'text-red-400 bg-red-400/10 border-red-400/30',
                };

                return (
                  <div key={order.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-white">
                          #{order.orderNumber}
                        </span>
                        <span className={`px-2 py-0.5 border text-[10px] font-mono uppercase ${statusColors[order.status] || ''}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-neutral-400">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-neutral-300">
                        {order.items.length} item(s) • Total: <strong className="text-[#ccff00]">৳{order.total.toFixed(2)}</strong>
                      </p>
                      {order.paymentDetails?.transactionId && (
                        <p className="text-[10px] font-mono text-neutral-400">
                          {order.paymentDetails.gateway === 'bkash' ? (
                            <span className="text-[#e2136e] font-bold">bKash</span>
                          ) : (
                            <span className="text-[#f26522] font-bold">Nagad</span>
                          )} TrxID: <span className="text-white">{order.paymentDetails.transactionId}</span>
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedOrderDetails(order)}
                      className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-white uppercase flex items-center gap-1.5 transition-colors"
                    >
                      <span>INSPECT DETAILS</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlistedProducts.length === 0 ? (
            <div className="bg-[#0c0c0c] border border-neutral-800 p-12 text-center">
              <Heart className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <h3 className="font-display text-lg font-bold uppercase text-white mb-2">
                YOUR WISHLIST IS EMPTY
              </h3>
              <p className="text-xs font-mono text-neutral-400 mb-6">
                Tap the heart icon on any product to save it to your personal archive.
              </p>
              <button
                onClick={() => onNavigate('shop')}
                className="px-6 py-3 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase"
              >
                EXPLORE CATALOG
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {wishlistedProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SAVED ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0c0c0c] border border-neutral-800 p-6 space-y-3">
            <span className="text-[10px] font-mono uppercase text-[#ccff00]">DEFAULT SHIPPING ADDRESS</span>
            <h4 className="font-mono text-sm font-bold text-white uppercase">
              {user.displayName || 'Alexander Vance'}
            </h4>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              742 Evergreen Terrace, Apt 4B<br />
              New York, NY 10001<br />
              United States<br />
              Phone: +1 (555) 234-5678
            </p>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedOrderDetails(null)}
          />

          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-[#0f0f0f] border border-neutral-800 p-6 sm:p-8 space-y-6 animate-slide-up">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#ccff00]">ORDER SPECIFICATION</span>
                  <h3 className="font-display text-xl font-bold uppercase text-white">
                    ORDER #{selectedOrderDetails.orderNumber}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Status & Method */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono bg-neutral-950 p-4 border border-neutral-900">
                <div>
                  <span className="text-neutral-500 uppercase text-[10px]">CURRENT STATUS</span>
                  <p className="text-[#ccff00] font-bold uppercase">{selectedOrderDetails.status}</p>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase text-[10px]">PAYMENT</span>
                  <p className="text-white">{selectedOrderDetails.paymentMethod}</p>
                </div>
                <div>
                  <span className="text-neutral-500 uppercase text-[10px]">DATE PLACED</span>
                  <p className="text-white">{new Date(selectedOrderDetails.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase text-neutral-400">
                  PURCHASED ITEMS
                </h4>
                <div className="divide-y divide-neutral-900 border border-neutral-900 max-h-56 overflow-y-auto">
                  {selectedOrderDetails.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-10 h-12 object-cover object-center bg-neutral-950 border border-neutral-800"
                        />
                        <div>
                          <p className="text-xs font-bold text-white uppercase">{item.productName}</p>
                          <p className="text-[10px] font-mono text-neutral-400">
                            {item.color} • SIZE {item.size} • QTY: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-white">
                        ৳{item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="text-xs font-mono text-neutral-400 space-y-1">
                <span className="text-neutral-500 uppercase text-[10px]">DELIVERY ADDRESS</span>
                <p className="text-white">{selectedOrderDetails.shippingAddress.fullName}</p>
                <p>{selectedOrderDetails.shippingAddress.address}, {selectedOrderDetails.shippingAddress.city}, {selectedOrderDetails.shippingAddress.state} {selectedOrderDetails.shippingAddress.postalCode}</p>
              </div>

              <div className="border-t border-neutral-800 pt-3 flex justify-between font-mono text-sm font-bold text-white">
                <span>TOTAL:</span>
                <span className="text-[#ccff00]">৳{selectedOrderDetails.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
