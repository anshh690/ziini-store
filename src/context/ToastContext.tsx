import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full px-4">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 border shadow-2xl backdrop-blur-md transition-all duration-300 animate-slide-up ${
              t.type === 'success'
                ? 'bg-[#121212]/95 border-[#ccff00]/40 text-neutral-100'
                : t.type === 'error'
                ? 'bg-[#181111]/95 border-red-500/40 text-red-100'
                : 'bg-[#141414]/95 border-neutral-700 text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#ccff00] shrink-0" />}
              {t.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-neutral-400 shrink-0" />}
              <p className="text-xs uppercase tracking-wider font-semibold leading-relaxed">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-neutral-400 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
