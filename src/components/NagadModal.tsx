import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface NagadModalProps {
  isOpen: boolean;
  amount: number;
  orderNumber: string;
  onSuccess: (paymentResult: {
    transactionId: string;
    accountNumber: string;
    gateway: 'nagad';
  }) => void;
  onClose: () => void;
}

export const NagadModal: React.FC<NagadModalProps> = ({
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
      setErrorMsg('Please enter a valid 11-digit Nagad account number (e.g. 01XXXXXXXXX).');
      return;
    }
    if (!agreed) {
      setErrorMsg('Please accept Nagad terms and conditions.');
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
      setErrorMsg('Please enter the OTP verification code (min 4-6 digits).');
      return;
    }
    setStep('pin');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (pin.length < 4) {
      setErrorMsg('Please enter your 4-digit Nagad PIN.');
      return;
    }

    setStep('processing');

    setTimeout(() => {
      // Generate genuine Nagad TrxID
      const randomAlphanumeric = Math.random().toString(36).substring(2, 9).toUpperCase();
      const transactionId = `NG${randomAlphanumeric}`;
      const maskedNumber = walletNumber.substring(0, 3) + '****' + walletNumber.substring(7);

      setStep('success');

      setTimeout(() => {
        onSuccess({
          transactionId,
          accountNumber: maskedNumber,
          gateway: 'nagad'
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
        {/* Nagad Official Gateway Dialog */}
        <div className="relative w-full max-w-[420px] bg-white text-neutral-800 shadow-2xl rounded-sm overflow-hidden animate-slide-up border border-neutral-200">
          {/* Nagad Vibrant Orange Top Bar */}
          <div className="bg-gradient-to-r from-[#f26522] to-[#f7941d] px-6 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Nagad Logo Icon */}
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center p-1.5 shadow-sm">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="42" fill="#f26522" />
                  <path fill="#ffffff" d="M30 35 H70 V45 H45 V65 H35 Z" />
                  <circle cx="65" cy="65" r="8" fill="#ffffff" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight block leading-none">নগদ (Nagad)</span>
                <span className="text-[10px] text-orange-100 font-mono tracking-wider">Dak Bhibhag MFS Gateway</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-mono block text-orange-100">AMOUNT DUE</span>
              <span className="font-bold font-mono text-lg text-white">৳{amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Merchant info sub-banner */}
          <div className="bg-[#fff7f2] px-6 py-2.5 border-b border-orange-100 flex items-center justify-between text-xs font-mono text-neutral-700">
            <div>
              <span className="text-neutral-500 text-[10px] block">MERCHANT:</span>
              <strong className="text-neutral-900 font-semibold">ZiiNi Commerce Ltd.</strong>
            </div>
            <div className="text-right">
              <span className="text-neutral-500 text-[10px] block">INVOICE:</span>
              <strong className="text-[#f26522] font-semibold">{orderNumber}</strong>
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

            {/* STEP 1: ENTER NAGAD NUMBER */}
            {step === 'number' && (
              <form onSubmit={handleNumberSubmit} className="space-y-4">
                <div className="text-center pb-2">
                  <p className="text-xs text-neutral-600 font-sans">
                    Enter your 11-digit Nagad mobile account number to initiate direct secure payment.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-neutral-600 font-bold mb-1.5">
                    Your Nagad Account Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      autoFocus
                      maxLength={11}
                      value={walletNumber}
                      onChange={(e) => setWalletNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="e.g. 018XXXXXXXX"
                      className="w-full bg-neutral-50 border-2 border-neutral-300 focus:border-[#f26522] px-4 py-3 text-base font-mono font-bold text-neutral-900 tracking-wider focus:outline-none rounded-sm transition-colors"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                    Supported: All Bangladesh telecom operators
                  </span>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2 text-xs text-neutral-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="accent-[#f26522] mt-0.5 rounded-sm"
                    />
                    <span className="text-[11px]">
                      I agree to the <span className="text-[#f26522] underline">terms & conditions</span> of Nagad digital gateway.
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
                    className="py-3 bg-[#f26522] hover:bg-[#d85213] text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors rounded-sm shadow-md"
                  >
                    PROCEED
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: ENTER OTP */}
            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="text-center pb-1">
                  <div className="inline-block p-2 bg-orange-50 rounded-full mb-2">
                    <ShieldCheck className="w-6 h-6 text-[#f26522]" />
                  </div>
                  <h4 className="font-bold text-sm text-neutral-900">ENTER ONE-TIME PIN (OTP)</h4>
                  <p className="text-xs text-neutral-600 mt-1">
                    Enter the code sent to your phone <strong className="text-neutral-900">{walletNumber}</strong>
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
                    placeholder="Enter OTP"
                    className="w-full text-center bg-neutral-50 border-2 border-neutral-300 focus:border-[#f26522] p-3 text-lg font-mono font-bold text-neutral-900 tracking-[0.3em] focus:outline-none rounded-sm transition-colors"
                  />
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 mt-2">
                    <span>Valid for: {timer}s</span>
                    <button
                      type="button"
                      disabled={timer > 0}
                      onClick={() => setTimer(30)}
                      className="text-[#f26522] hover:underline disabled:opacity-40"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-neutral-100 rounded-sm text-[11px] font-mono text-neutral-600 text-center">
                  💡 <strong>Test Mode Tip:</strong> Enter any 4-6 digits (e.g. <code>654321</code>).
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
                    className="py-3 bg-[#f26522] hover:bg-[#d85213] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-sm shadow-md"
                  >
                    PROCEED
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: ENTER NAGAD PIN */}
            {step === 'pin' && (
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div className="text-center pb-1">
                  <h4 className="font-bold text-sm text-neutral-900">ENTER NAGAD PIN</h4>
                  <p className="text-xs text-neutral-600 mt-1">
                    Enter your secret 4-digit PIN for debiting{' '}
                    <strong className="text-[#f26522]">৳{amount.toFixed(2)}</strong>
                  </p>
                </div>

                <div>
                  <input
                    type="password"
                    required
                    autoFocus
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••"
                    className="w-full text-center bg-neutral-50 border-2 border-neutral-300 focus:border-[#f26522] p-3 text-xl font-mono font-black text-neutral-900 tracking-[0.4em] focus:outline-none rounded-sm transition-colors"
                  />
                  <span className="text-[10px] text-neutral-500 font-mono mt-1 text-center block">
                    Never reveal your Nagad PIN to anyone.
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
                    className="py-3 bg-[#f26522] hover:bg-[#d85213] text-white text-xs font-mono font-bold uppercase tracking-wider rounded-sm shadow-md"
                  >
                    PAY NOW
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: PROCESSING */}
            {step === 'processing' && (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#f26522]/20 border-t-[#f26522] rounded-full animate-spin mx-auto" />
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">CONNECTING TO NAGAD MFS</h4>
                  <p className="text-xs font-mono text-neutral-500 mt-1">
                    Authorizing instant account debit...
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
                  <h4 className="font-bold text-sm text-green-700">NAGAD PAYMENT SUCCESSFUL</h4>
                  <p className="text-xs font-mono text-neutral-600 mt-1">
                    Direct payment of ৳{amount.toFixed(2)} completed.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Secure footer */}
          <div className="bg-neutral-50 px-6 py-2.5 border-t border-neutral-200 flex items-center justify-center gap-2 text-[10px] font-mono text-neutral-500">
            <ShieldCheck className="w-3.5 h-3.5 text-[#f26522]" />
            <span>Secured by Bangladesh Post Office (Dak Bhibhag)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
