import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await loginWithEmail(email, password);
        showToast('Successfully signed in', 'success');
        onClose();
      } else {
        await signupWithEmail(email, password, name || 'Customer');
        showToast('Account created successfully', 'success');
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      showToast('Signed in with Google', 'success');
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google Sign-In failed or popup was closed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-[#0f0f0f] border border-neutral-800 shadow-2xl p-6 sm:p-8 animate-slide-up">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <span className="font-display text-2xl font-black tracking-tight text-white">
              ZiiNi<span className="text-[#ccff00]">.</span>
            </span>
            <p className="text-xs font-mono uppercase tracking-widest text-neutral-400 mt-1">
              {mode === 'signin' ? 'MEMBER SIGN IN' : 'CREATE AN ACCOUNT'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Sign-in */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors mb-4"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>CONTINUE WITH GOOGLE</span>
          </button>

          <div className="relative my-4 flex items-center justify-center">
            <span className="w-full border-t border-neutral-800"></span>
            <span className="absolute bg-[#0f0f0f] px-3 text-[10px] font-mono text-neutral-500 uppercase">
              OR EMAIL
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ALEX MERCER"
                    className="w-full bg-neutral-900 border border-neutral-800 pl-9 pr-3 py-2.5 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-[#ccff00]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="YOU@EXAMPLE.COM"
                  className="w-full bg-neutral-900 border border-neutral-800 pl-9 pr-3 py-2.5 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-[#ccff00]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-900 border border-neutral-800 pl-9 pr-3 py-2.5 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-[#ccff00]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#ccff00] hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <span>{mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle mode */}
          <div className="mt-5 text-center text-xs font-mono">
            {mode === 'signin' ? (
              <p className="text-neutral-400">
                Not a member yet?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-[#ccff00] underline font-bold"
                >
                  Join the Archive
                </button>
              </p>
            ) : (
              <p className="text-neutral-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-[#ccff00] underline font-bold"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
