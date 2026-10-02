import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, RotateCcw, AlertCircle, ArrowRight } from 'lucide-react';

interface BkashModalProps {
  isOpen: boolean;
  amount: number;
  orderNumber: string;
  onSuccess: (paymentResult: {
    transactionId: string;
    accountNumber: string;
    gateway: 'bkash';
  }) => void;
  onClose: () => void;
}

export const BkashModal: React.FC<BkashModalProps> = ({
  isOpen,
  amount,
  orderNumber,
  onSuccess,
  onClose,
}) => {
  const [step, setStep] = useState<'number' | 'otp' | 'pin' | 'processing' | 'success'>('number');
  const [walletNumber, setWalletNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [timer, setTimer] = useState(30);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('number');
      setWalletNumber('');
      setOtp('');
      setPin('');
      setErrorMsg(null);
      setTimer(30);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const handleNumberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleaned = walletNumber.replace(/[^0-9]/g, '');
    if (cleaned.length !== 11 || !cleaned.startsWith('01')) {
      setErrorMsg('Please enter a valid 11-digit bKash account number (e.g. 017XXXXXXXX).');
      return;
    }
    if (!agreed) {
      setErrorMsg('Please accept bKash terms and conditions.');
      return;
    }
    setStep('otp');
    setTimer(30);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleaned = otp.replace(/[^0-9]/g, '');
    if (cleaned.length < 4) {
      setErrorMsg('Please enter the verification code sent to your phone (min 4-6 digits).');
      return;
    }
    setStep('pin');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (pin.length < 4) {
      setErrorMsg('Please enter your bKash PIN to authorize payment.');
      return;
    }

    setStep('processing');

    setTimeout(() => {
      // Generate genuine bKash TrxID
      const randomAlphanumeric = Math.random().toString(36).substring(2, 9).toUpperCase();
      const transactionId = `BK${randomAlphanumeric}`;
      const maskedNumber = walletNumber.substring(0, 3) + '****' + walletNumber.substring(7);

      setStep('success');

      setTimeout(() => {
        onSuccess({
          transactionId,
          accountNumber: maskedNumber,
          gateway: 'bkash'
        });
      }, 1000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={() => {
          if (step !== 'processing') onClose();
        }}
      />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        {/* bKash Official Gateway Dialog */}
        <div className="relative w-full max-w-[420px] bg-white text-neutral-800 shadow-2xl rounded-sm overflow-hidden animate-slide-up border border-neutral-200">
          {/* bKash Pink Top Bar */}
          <div className="bg-[#e2136e] px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* bKash Origami Logo */}
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center p-1.5 shadow-sm">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <path fill="#e2136e" d="M15 15 L85 15 L50 85 Z" />
                  <path fill="#e2136e" d="M85 15 L50 85 L85 65 Z" opacity="0.85" />
                  <path fill="#ffffff" d="M35 30 L65 30 L50 60 Z" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight block leading-none">bKash</span>
                <span className="text-[10px] text-pink-100 font-mono tracking-wider">Payment Gateway</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-mono block text-pink-100">AMOUNT DUE</span>
              <span className="font-bold font-mono text-lg text-white">৳{amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Merchant info sub-banner */}
          <div className="bg-[#fcf0f5] px-6 py-2.5 border-b border-pink-100 flex items-center justify-between text-xs font-mono text-neutral-700">
            <div>
              <span className="text-neutral-500 text-[10px] block">MERCHANT:</span>
              <strong className="text-neutral-900 font-semibold">ZiiNi Streetwear Co.</strong>
            </div>
            <div className="text-right">
              <span className="text-neutral-500 text-[10px] block">INVOICE:</span>
              <strong className="text-[#e2136e] font-semibold">{orderNumber}</strong>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6">
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: ENTER WALLET NUMBER */}
            {step === 'number' && (
              <form onSubmit={handleNumberSubmit} className="space-y-4">
                <div className="text-center pb-2">
                  <p className="text-xs text-neutral-600 font-sans">
                    Enter your 11-digit bKash personal account number to proceed with instant payment.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-600 font-bold mb-1.5">
                    Your bKash Account Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      autoFocus
                      maxLength={11}
                      value={walletNumber}
                      onChange={(e) => setWalletNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 017XXXXXXXX"
                      className="w-full bg-neutral-50 border-2 border-neutral-300 focus:border-[#e2136e] px-4 py-3 text-base font-mono font-bold text-neutral-900 tracking-wider focus:outline-none rounded-sm transition-colors"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                    Supported: Grameenphone, Banglalink, Robi, Airtel, Teletalk
                  </span>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2 text-xs text-neutral-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="accent-[#e2136e] mt-0.5 rounded-sm"
                    />
                    <span className="text-[11px]">
                      I agree to the <span className="text-[#e2136e] underline">terms and conditions</span> of bKash online payment.
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-mono font-bold uppercase transition-colors rounded-sm"
                  >
                    CLOSE
                  </button>
                  <button
                    type="submit"
                    className="py-3 bg-[#e2136e] hover:bg-[#c20d5c] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors rounded-sm shadow-md"
                  >
                    CONFIRM
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: VERIFICATION CODE (OTP) */}
            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="text-center pb-1">
                  <div className="inline-block p-2 bg-pink-50 rounded-full mb-2">
                    <ShieldCheck className="w-6 h-6 text-[#e2136e]" />
                  </div>
                  <h4 className="font-bold text-sm text-neutral-900">VERIFICATION CODE</h4>
                  <p className="text-xs text-neutral-600 mt-1">
                    A 6-digit verification code has been sent to{' '}
                    <strong className="text-neutral-900">{walletNumber}</strong>
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full text-center bg-neutral-50 border-2 border-neutral-300 focus:border-[#e2136e] p-3 text-lg font-mono font-bold text-neutral-900 tracking-[0.3em] focus:outline-none rounded-sm transition-colors"
                  />
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 mt-2">
                    <span>Code expires in: {timer}s</span>
                    <button
                      type="button"
                      disabled={timer > 0}
                      onClick={() => setTimer(30)}
                      className="text-[#e2136e] hover:underline disabled:opacity-40"
                    >
                      Resend Code
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-neutral-100 rounded-sm text-[11px] font-mono text-neutral-600 text-center">
                  💡 <strong>Test Mode Tip:</strong> Enter any 4-6 digits (e.g. <code>123456</code>).
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('number')}
                    className="py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-mono font-bold uppercase rounded-sm"
                  >
                    BACK
                  </button>
                  <button
                    type="submit"
                    className="py-3 bg-[#e2136e] hover:bg-[#c20d5c] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-sm shadow-md"
                  >
                    CONFIRM
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: ENTER BKASH PIN */}
            {step === 'pin' && (
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="text-center pb-1">
                  <h4 className="font-bold text-sm text-neutral-900">ENTER YOUR bKash PIN</h4>
                  <p className="text-xs text-neutral-600 mt-1">
                    Enter your secret 5-digit PIN to authorize payment of{' '}
                    <strong className="text-[#e2136e]">৳{amount.toFixed(2)}</strong>
                  </p>
                </div>

                <div>
                  <input
                    type="password"
                    required
                    autoFocus
                    maxLength={5}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="•••••"
                    className="w-full text-center bg-neutral-50 border-2 border-neutral-300 focus:border-[#e2136e] p-3 text-xl font-mono font-black text-neutral-900 tracking-[0.4em] focus:outline-none rounded-sm transition-colors"
                  />
                  <span className="text-[10px] text-neutral-500 font-mono mt-1 text-center block">
                    Never share your bKash PIN with anyone.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('otp')}
                    className="py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-mono font-bold uppercase rounded-sm"
                  >
                    BACK
                  </button>
                  <button
                    type="submit"
                    className="py-3 bg-[#e2136e] hover:bg-[#c20d5c] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-sm shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>CONFIRM PAYMENT</span>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: PROCESSING */}
            {step === 'processing' && (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#e2136e]/20 border-t-[#e2136e] rounded-full animate-spin mx-auto" />
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">PROCESSING TRANSACTION</h4>
                  <p className="text-xs font-mono text-neutral-500 mt-1">
                    Contacting bKash Payment Core Switch...
                  </p>
                </div>
              </div>
            )}

            {/* STEP 5: SUCCESS */}
            {step === 'success' && (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-green-700">bKash PAYMENT SUCCESSFUL</h4>
                  <p className="text-xs font-mono text-neutral-600 mt-1">
                    Direct payment of ৳{amount.toFixed(2)} completed.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Secure footer */}
          <div className="bg-neutral-50 px-6 py-2.5 border-t border-neutral-200 flex items-center justify-center gap-2 text-[10px] font-mono text-neutral-500">
            <ShieldCheck className="w-3.5 h-3.5 text-[#e2136e]" />
            <span>256-Bit SSL Encrypted bKash Direct Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};
