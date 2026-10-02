import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 4000);
  };

  return (
    <footer className="bg-[#050505] border-t border-neutral-800 text-neutral-300">
      {/* Newsletter Big Feature */}
      <div className="border-b border-neutral-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#ccff00]">
              INSIDER ACCESS
            </span>
            <h3 className="font-display text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white mt-2">
              SUBSCRIBE TO THE ARCHIVE
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-md">
              Receive private invitations to limited-edition drops, private showroom events, and 10% off your initial transaction.
            </p>
          </div>

          <div>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER YOUR EMAIL FOR EARLY ACCESS"
                className="flex-1 bg-[#101010] border border-neutral-700 px-4 py-3.5 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#ccff00]"
              />
              <button
                type="submit"
                className="px-8 py-3.5 bg-[#ccff00] hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors shrink-0"
              >
                {subscribed ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>SUBSCRIBED</span>
                  </>
                ) : (
                  <>
                    <span>JOIN</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
            {subscribed && (
              <p className="text-[11px] font-mono text-[#ccff00] mt-2">
                Welcome to ZiiNi. Use code <span className="font-bold">ZIINI10</span> at checkout.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2">
            <span className="font-display text-3xl font-black tracking-tighter text-white">
              ZiiNi<span className="text-[#ccff00]">.</span>
            </span>
            <p className="text-xs text-neutral-400 mt-3 max-w-sm leading-relaxed">
              Engineered street aesthetic crafted at the intersection of technical performance, heavy architectural silhouettes, and luxury fabrication.
            </p>
            <div className="mt-6 flex items-center gap-4 text-xs font-mono text-neutral-400">
              <span className="hover:text-white cursor-pointer transition-colors">INSTAGRAM</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer transition-colors">TIKTOK</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer transition-colors">YOUTUBE</span>
              <span>•</span>
              <span className="hover:text-white cursor-pointer transition-colors">DISCORD</span>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white mb-4">
              SHOP
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-mono">
              <li>
                <button onClick={() => onNavigate('shop', { gender: 'men' })} className="hover:text-[#ccff00] transition-colors">
                  Men's Clothing
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { gender: 'women' })} className="hover:text-[#ccff00] transition-colors">
                  Women's Line
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { gender: 'boys' })} className="hover:text-[#ccff00] transition-colors">
                  Boys / Youth
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { category: 'footwear' })} className="hover:text-[#ccff00] transition-colors">
                  Footwear & Sneakers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { category: 'accessories' })} className="hover:text-[#ccff00] transition-colors">
                  Accessories & Bags
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('shop', { isSale: true })} className="hover:text-[#ccff00] transition-colors text-[#ccff00]">
                  Archive Sale
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white mb-4">
              CLIENT CARE
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-mono">
              <li>
                <button onClick={() => onNavigate('account')} className="hover:text-white transition-colors">
                  Order Status
                </button>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Complimentary Returns
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Size Guide & Fit
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Material Care
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Direct Concierge
                </span>
              </li>
            </ul>
          </div>

          {/* House / Brand */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-white mb-4">
              THE HOUSE
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-mono">
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Brand Philosophy
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Sustainability
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Tokyo Showroom
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  NYC Flagship
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Careers & Press
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-neutral-500 gap-4">
          <p>© 2026 ZiiNi APPAREL GROUP. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <span className="hover:text-neutral-400 cursor-pointer">PRIVACY POLICY</span>
            <span className="hover:text-neutral-400 cursor-pointer">TERMS OF SALE</span>
            <span className="hover:text-neutral-400 cursor-pointer">COOKIE PREFERENCES</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
