import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  ShoppingBag, 
  AlertCircle,
  Clock,
  Package,
  MapPin,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShippingAddress, Order, OrderItem, PaymentDetails } from '../types';
import { createOrderTransaction } from '../lib/storeService';
import { BkashModal } from '../components/BkashModal';
import { NagadModal } from '../components/NagadModal';

interface CheckoutViewProps {
  onNavigate: (view: string, params?: any) => void;
  onOrderCompleted?: (order: Order) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onNavigate, onOrderCompleted }) => {
  const { items, subtotal, shippingFee, discount, total, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Form State
  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: 'Dhaka',
    state: 'Dhaka Division',
    postalCode: '1212',
    country: 'Bangladesh',
    deliveryInstructions: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'cod'>('bkash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // MFS Modals
  const [bkashModalOpen, setBkashModalOpen] = useState(false);
  const [nagadModalOpen, setNagadModalOpen] = useState(false);

  // Temporary generated invoice ref for MFS screens
  const [pendingInvoiceNumber] = useState(() => `ZN-${Math.floor(100000 + Math.random() * 900000)}`);

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (items.length === 0) {
      showToast('Your cart is empty', 'error');
      return false;
    }
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.address.trim() || !formData.city.trim() || !formData.phone.trim()) {
      setErrorMsg('Please complete all required contact & shipping fields before proceeding.');
      return false;
    }
    return true;
  };

  const executeOrderCreation = async (paymentDetailsObj?: PaymentDetails) => {
    setIsProcessing(true);
    try {
      const orderItems: OrderItem[] = items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        color: item.selectedColor,
        colorCode: item.colorCode,
        size: item.selectedSize,
        image: item.image,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.unitPrice * item.quantity,
        sku: item.sku
      }));

      const isPaid = paymentDetailsObj?.paymentStatus === 'PAID';

      const newOrder = await createOrderTransaction({
        customerId: user?.uid,
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: formData,
        items: orderItems,
        subtotal,
        shippingFee,
        discount,
        total,
        status: isPaid ? 'confirmed' : 'pending',
        paymentMethod: paymentMethod === 'bkash' 
          ? 'bKash (MFS)' 
          : paymentMethod === 'nagad' 
          ? 'Nagad (MFS)' 
          : 'Cash on Delivery (COD)',
        paymentDetails: paymentDetailsObj || {
          gateway: 'cod',
          paymentStatus: 'PENDING',
          paidAt: new Date().toISOString()
        },
        couponCode: appliedCoupon?.code
      });

      setCompletedOrder(newOrder);
      clearCart();
      showToast(`Order #${newOrder.orderNumber} successfully confirmed!`, 'success');
      if (onOrderCompleted) onOrderCompleted(newOrder);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'Failed to complete order. Please check variant stock.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!validateForm()) return;

    if (paymentMethod === 'bkash') {
      setBkashModalOpen(true);
    } else if (paymentMethod === 'nagad') {
      setNagadModalOpen(true);
    } else {
      // Cash on delivery
      executeOrderCreation({
        gateway: 'cod',
        paymentStatus: 'PENDING',
        paidAt: new Date().toISOString()
      });
    }
  };

  const handleMfsSuccess = (result: {
    transactionId: string;
    accountNumber: string;
    gateway: 'bkash' | 'nagad';
  }) => {
    setBkashModalOpen(false);
    setNagadModalOpen(false);

    executeOrderCreation({
      gateway: result.gateway,
      transactionId: result.transactionId,
      accountNumber: result.accountNumber,
      paymentStatus: 'PAID',
      paidAt: new Date().toISOString()
    });
  };

  // ORDER CONFIRMATION VIEW
  if (completedOrder) {
    const isBkash = completedOrder.paymentDetails?.gateway === 'bkash';
    const isNagad = completedOrder.paymentDetails?.gateway === 'nagad';
    const isPaid = completedOrder.paymentDetails?.paymentStatus === 'PAID';

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8 animate-fade-in">
        <div className="w-16 h-16 bg-[#ccff00]/10 border border-[#ccff00] text-[#ccff00] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#ccff00]">
            ORDER CONFIRMED & DISPATCH READY
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-black uppercase text-white mt-1">
            THANK YOU FOR YOUR ORDER
          </h1>
          <p className="font-mono text-sm text-neutral-400 mt-2">
            Order Reference: <strong className="text-white">{completedOrder.orderNumber}</strong>
          </p>
          <p className="text-xs text-neutral-500 font-mono mt-1">
            A confirmation invoice has been sent to {completedOrder.customerEmail}
          </p>
        </div>

        {/* MFS Payment Verification Card */}
        {isPaid && (
          <div className={`p-5 border text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isBkash 
              ? 'bg-[#e2136e]/10 border-[#e2136e]/40' 
              : 'bg-[#f26522]/10 border-[#f26522]/40'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-xs font-mono shadow-md ${
                isBkash ? 'bg-[#e2136e]' : 'bg-[#f26522]'
              }`}>
                {isBkash ? 'bKash' : 'নগদ'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold uppercase ${
                    isBkash ? 'text-[#e2136e]' : 'text-[#f26522]'
                  }`}>
                    {isBkash ? 'bKash Direct Gateway' : 'Nagad MFS Gateway'}
                  </span>
                  <span className="bg-green-950 text-green-400 border border-green-800 text-[9px] font-mono px-1.5 py-0.5 font-bold">
                    PAID ৳{completedOrder.total.toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-neutral-300 mt-0.5">
                  TrxID: <strong className="text-white font-mono">{completedOrder.paymentDetails?.transactionId}</strong>
                  {completedOrder.paymentDetails?.accountNumber && (
                    <span className="text-neutral-400 ml-2">({completedOrder.paymentDetails.accountNumber})</span>
                  )}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono text-neutral-400 bg-black/40 px-2.5 py-1 border border-neutral-800">
              Verified by MFS Core Switch
            </span>
          </div>
        )}

        {/* Status Timeline */}
        <div className="bg-[#0e0e0e] border border-neutral-800 p-6 text-left space-y-4">
          <div className="flex items-center justify-between text-xs font-mono border-b border-neutral-800 pb-3">
            <span className="text-neutral-400 uppercase">FULFILLMENT TIMELINE</span>
            <span className="text-[#ccff00] uppercase font-bold">STATUS: {completedOrder.status}</span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[10px] font-mono">
            <div className="space-y-1">
              <div className="w-6 h-6 rounded-full bg-[#ccff00] text-black font-bold flex items-center justify-center mx-auto">
                ✓
              </div>
              <p className="text-white font-bold">Confirmed</p>
            </div>
            <div className="space-y-1 opacity-70">
              <div className="w-6 h-6 rounded-full border border-neutral-700 text-neutral-400 flex items-center justify-center mx-auto">
                2
              </div>
              <p className="text-neutral-400">Processing</p>
            </div>
            <div className="space-y-1 opacity-50">
              <div className="w-6 h-6 rounded-full border border-neutral-700 text-neutral-400 flex items-center justify-center mx-auto">
                3
              </div>
              <p className="text-neutral-400">Dispatched</p>
            </div>
            <div className="space-y-1 opacity-40">
              <div className="w-6 h-6 rounded-full border border-neutral-700 text-neutral-400 flex items-center justify-center mx-auto">
                4
              </div>
              <p className="text-neutral-400">Delivered</p>
            </div>
          </div>
        </div>

        {/* Order Items Summary */}
        <div className="bg-[#0c0c0c] border border-neutral-800 p-6 text-left space-y-4">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-2">
            ORDER CONTENTS ({completedOrder.items.length} ITEMS)
          </h3>
          <div className="divide-y divide-neutral-900">
            {completedOrder.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-12 h-14 object-cover object-center bg-neutral-950 border border-neutral-800"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase">{item.productName}</h4>
                    <p className="text-[10px] font-mono text-neutral-400">
                      {item.color} • SIZE {item.size} • QTY {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-white">
                  ৳{item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-800 pt-3 text-xs font-mono text-neutral-300 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-white">৳{completedOrder.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span className="text-white">৳{completedOrder.shippingFee.toFixed(2)}</span>
            </div>
            {completedOrder.discount > 0 && (
              <div className="flex justify-between text-[#ccff00]">
                <span>Discount:</span>
                <span>-৳{completedOrder.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
              <span>Total Paid:</span>
              <span className="text-[#ccff00]">৳{completedOrder.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Navigation CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button
            onClick={() => onNavigate('account', { tab: 'orders' })}
            className="px-6 py-3.5 bg-[#ccff00] text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"
          >
            VIEW IN MY ORDERS
          </button>
          <button
            onClick={() => onNavigate('shop')}
            className="px-6 py-3.5 bg-neutral-900 border border-neutral-700 text-white font-mono font-bold text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
          >
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    );
  }

  // CHECKOUT FORM VIEW
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#ccff00]">
          SECURE CHECKOUT • BANGLADESH
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-black uppercase text-white tracking-tight mt-1">
          SHIPPING & MFS PAYMENT
        </h1>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-950/80 border border-red-800 text-red-200 text-xs font-mono flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SHIPPING FORM (7 COLS) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Contact Details */}
          <div className="bg-[#0c0c0c] border border-neutral-800 p-6 space-y-4">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-[#ccff00] text-black text-[11px] font-bold flex items-center justify-center">
                1
              </span>
              CONTACT INFORMATION
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="TANVIR HOSSAIN"
                  className="w-full bg-neutral-900 border border-neutral-800 p-3 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-[#ccff00]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="TANVIR@ARCHIVE.BD"
                  className="w-full bg-neutral-900 border border-neutral-800 p-3 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-[#ccff00]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                  Contact Mobile Number * (e.g. 017XXXXXXXX)
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="01712345678"
                  className="w-full bg-neutral-900 border border-neutral-800 p-3 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-[#ccff00]"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-[#0c0c0c] border border-neutral-800 p-6 space-y-4">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
              <span className="w-5 h-5 bg-[#ccff00] text-black text-[11px] font-bold flex items-center justify-center">
                2
              </span>
              DELIVERY ADDRESS (BANGLADESH)
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                  Road / House / Flat / Area *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="HOUSE 42, ROAD 11, BLOCK D, BANANI"
                  className="w-full bg-neutral-900 border border-neutral-800 p-3 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-[#ccff00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                    City / District *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 p-3 text-xs font-mono text-white focus:outline-none focus:border-[#ccff00]"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barisal">Barisal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                    <option value="Comilla">Comilla</option>
                    <option value="Gazipur">Gazipur</option>
                    <option value="Narayanganj">Narayanganj</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                    Division / Area *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="Gulshan / Banani / Uttara"
                    className="w-full bg-neutral-900 border border-neutral-800 p-3 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-[#ccff00]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="1212"
                    className="w-full bg-neutral-900 border border-neutral-800 p-3 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-[#ccff00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                  Delivery Notes / Special Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={formData.deliveryInstructions}
                  onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
                  placeholder="Call before arrival or leave with security"
                  className="w-full bg-neutral-900 border border-neutral-800 p-3 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-[#ccff00]"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector (bKash, Nagad, COD) */}
          <div className="bg-[#0c0c0c] border border-neutral-800 p-6 space-y-4">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 bg-[#ccff00] text-black text-[11px] font-bold flex items-center justify-center">
                  3
                </span>
                <span>SELECT PAYMENT METHOD (BANGLADESH)</span>
              </div>
              <span className="text-[10px] font-mono text-[#ccff00] font-bold">BDT (৳)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* bKash Option */}
              <label 
                className={`p-4 border cursor-pointer flex flex-col justify-between transition-all relative overflow-hidden ${
                  paymentMethod === 'bkash' 
                    ? 'border-[#e2136e] bg-[#e2136e]/10 shadow-lg shadow-[#e2136e]/10' 
                    : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                      className="accent-[#e2136e]"
                    />
                    <span className="font-bold text-xs text-white">bKash</span>
                  </div>
                  <div className="w-6 h-6 bg-[#e2136e] text-white rounded-full flex items-center justify-center text-[10px] font-black">
                    ৳
                  </div>
                </div>

                <div className="mt-3">
                  <span className="inline-block px-1.5 py-0.5 bg-[#e2136e] text-white text-[9px] font-mono font-bold uppercase">
                    DIRECT PGW
                  </span>
                  <p className="text-[10px] font-mono text-neutral-400 mt-1">
                    Instant account verification & PIN payment
                  </p>
                </div>
              </label>

              {/* Nagad Option */}
              <label 
                className={`p-4 border cursor-pointer flex flex-col justify-between transition-all relative overflow-hidden ${
                  paymentMethod === 'nagad' 
                    ? 'border-[#f26522] bg-[#f26522]/10 shadow-lg shadow-[#f26522]/10' 
                    : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'nagad'}
                      onChange={() => setPaymentMethod('nagad')}
                      className="accent-[#f26522]"
                    />
                    <span className="font-bold text-xs text-white">নগদ (Nagad)</span>
                  </div>
                  <div className="w-6 h-6 bg-[#f26522] text-white rounded-full flex items-center justify-center text-[10px] font-black">
                    ৳
                  </div>
                </div>

                <div className="mt-3">
                  <span className="inline-block px-1.5 py-0.5 bg-[#f26522] text-white text-[9px] font-mono font-bold uppercase">
                    DIRECT PGW
                  </span>
                  <p className="text-[10px] font-mono text-neutral-400 mt-1">
                    Bangladesh Post Office MFS instant pay
                  </p>
                </div>
              </label>

              {/* Cash on Delivery Option */}
              <label 
                className={`p-4 border cursor-pointer flex flex-col justify-between transition-all relative overflow-hidden ${
                  paymentMethod === 'cod' 
                    ? 'border-[#ccff00] bg-neutral-900 shadow-lg shadow-[#ccff00]/10' 
                    : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-[#ccff00]"
                    />
                    <span className="font-bold text-xs text-white">Cash on Delivery</span>
                  </div>
                  <Truck className="w-4 h-4 text-[#ccff00]" />
                </div>

                <div className="mt-3">
                  <span className="inline-block px-1.5 py-0.5 bg-neutral-800 text-neutral-300 text-[9px] font-mono uppercase">
                    PAY ON ARRIVAL
                  </span>
                  <p className="text-[10px] font-mono text-neutral-400 mt-1">
                    Pay courier agent in cash upon parcel delivery
                  </p>
                </div>
              </label>
            </div>

            {/* Payment method explanation note */}
            <div className="p-4 bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-400 flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-[#ccff00] shrink-0" />
              <div>
                {paymentMethod === 'bkash' && (
                  <p>
                    You will be directed to the official <strong className="text-[#e2136e]">bKash Direct Gateway</strong> modal to verify via OTP and PIN. Your order will be confirmed immediately with a verified Transaction ID.
                  </p>
                )}
                {paymentMethod === 'nagad' && (
                  <p>
                    You will be directed to the official <strong className="text-[#f26522]">Nagad Payment Gateway</strong> modal to authorize payment with your 4-digit PIN. Your order will be confirmed immediately.
                  </p>
                )}
                {paymentMethod === 'cod' && (
                  <p>
                    Pay cash directly to the courier delivery agent when you inspect and receive your parcel at your doorstep.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ORDER REVIEW SIDEBAR (5 COLS) */}
        <div className="lg:col-span-5 bg-[#0e0e0e] border border-neutral-800 p-6 space-y-6 sticky top-24">
          <h2 className="font-display text-lg font-bold uppercase text-white tracking-wider pb-3 border-b border-neutral-800">
            ORDER SUMMARY
          </h2>

          <div className="max-h-72 overflow-y-auto divide-y divide-neutral-900 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex gap-3">
                <img
                  src={item.image}
                  alt={item.productName}
                  className="w-14 h-18 object-cover object-center bg-neutral-950 border border-neutral-800 shrink-0"
                />
                <div className="flex-1 text-xs">
                  <h4 className="font-bold text-white uppercase line-clamp-1">{item.productName}</h4>
                  <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
                    {item.selectedColor} • {item.selectedSize} • QTY: {item.quantity}
                  </p>
                  <p className="font-mono text-xs text-white font-bold mt-1">
                    ৳{(item.unitPrice * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-800 pt-4 space-y-2 text-xs font-mono text-neutral-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-white">৳{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#ccff00]">
                <span>Coupon Applied</span>
                <span>-৳{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-white">
                {shippingFee === 0 ? 'COMPLIMENTARY' : `৳${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-neutral-800">
              <span>TOTAL DUE</span>
              <span className="text-lg text-[#ccff00]">৳{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Button based on chosen gateway */}
          <button
            type="submit"
            disabled={isProcessing}
            className={`w-full py-4 font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-xl ${
              paymentMethod === 'bkash' 
                ? 'bg-[#e2136e] hover:bg-[#c20d5c] text-white shadow-[#e2136e]/20' 
                : paymentMethod === 'nagad' 
                ? 'bg-[#f26522] hover:bg-[#d85213] text-white shadow-[#f26522]/20' 
                : 'bg-[#ccff00] hover:bg-white text-black shadow-[#ccff00]/10'
            }`}
          >
            {isProcessing ? (
              <span>RESERVING PIECES IN INVENTORY...</span>
            ) : paymentMethod === 'bkash' ? (
              <>
                <span>PAY WITH bKash (৳{total.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : paymentMethod === 'nagad' ? (
              <>
                <span>PAY WITH NAGAD (৳{total.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>CONFIRM ORDER (COD ৳{total.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-neutral-500 pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>DIRECT BANGLADESH MFS GATEWAY ENCRYPTION</span>
          </div>
        </div>
      </form>

      {/* Official bKash Gateway Modal */}
      <BkashModal
        isOpen={bkashModalOpen}
        amount={total}
        orderNumber={pendingInvoiceNumber}
        onClose={() => setBkashModalOpen(false)}
        onSuccess={handleMfsSuccess}
      />

      {/* Official Nagad Gateway Modal */}
      <NagadModal
        isOpen={nagadModalOpen}
        amount={total}
        orderNumber={pendingInvoiceNumber}
        onClose={() => setNagadModalOpen(false)}
        onSuccess={handleMfsSuccess}
      />
    </div>
  );
};
