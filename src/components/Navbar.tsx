import React, { useState } from 'react';
import { ShoppingBag, User, LogOut, ArrowRight, Layers, ShieldCheck, Box } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { currentUser, userProfile, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/85 backdrop-blur-md border-b border-[#E5E5E5] transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('store')}
          className="text-left group flex items-center gap-2 cursor-pointer focus:outline-none"
        >
          <span className="font-display text-xl font-bold tracking-tight text-[#080808] transition-transform duration-200 group-hover:scale-[1.01]">
            NOVA CART
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#080808] inline-block opacity-80" />
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => onNavigate('store')}
            className={`cursor-pointer transition-colors relative py-1 focus:outline-none ${
              currentView === 'store'
                ? 'text-[#080808] font-semibold'
                : 'text-[#777777] hover:text-[#080808]'
            }`}
          >
            Storefront
            {currentView === 'store' && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#080808] rounded-full" />
            )}
          </button>

          <button
            onClick={() => onNavigate('visualizer')}
            className={`cursor-pointer transition-colors relative py-1 focus:outline-none ${
              currentView === 'visualizer'
                ? 'text-[#080808] font-semibold'
                : 'text-[#777777] hover:text-[#080808]'
            }`}
          >
            3D Studio
            {currentView === 'visualizer' && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#080808] rounded-full" />
            )}
          </button>

          <button
            onClick={() => onNavigate('orders')}
            className={`cursor-pointer transition-colors relative py-1 focus:outline-none ${
              currentView === 'orders'
                ? 'text-[#080808] font-semibold'
                : 'text-[#777777] hover:text-[#080808]'
            }`}
          >
            Orders
            {currentView === 'orders' && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#080808] rounded-full" />
            )}
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className={`cursor-pointer transition-colors relative py-1 focus:outline-none ${
              currentView === 'dashboard'
                ? 'text-[#080808] font-semibold'
                : 'text-[#777777] hover:text-[#080808]'
            }`}
          >
            Operations & Analytics
            {currentView === 'dashboard' && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#080808] rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Cart + Auth) */}
        <div className="flex items-center gap-4">
          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Open cart"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-[#E5E5E5] bg-[#FFFFFF] hover:border-[#080808] transition-all text-xs font-medium cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-4 h-4 text-[#080808]" />
            <span className="text-[#080808] font-mono tabular-nums">{cartCount}</span>
          </button>

          {/* User Profile or Sign In */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-[#E5E5E5] bg-[#FFFFFF] hover:border-[#171717] transition-colors cursor-pointer text-xs"
              >
                <div className="w-5 h-5 rounded-full bg-[#171717] text-[#FFFFFF] flex items-center justify-center text-[10px] font-semibold">
                  {userProfile?.displayName ? userProfile.displayName[0].toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline font-medium text-[#171717] max-w-[110px] truncate">
                  {userProfile?.displayName || currentUser.email?.split('@')[0]}
                </span>
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-lg p-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-[#F0F1F3] mb-1">
                      <p className="text-xs font-semibold text-[#080808] truncate">
                        {userProfile?.displayName || 'Nova Member'}
                      </p>
                      <p className="text-[11px] text-[#777777] truncate font-mono">
                        {currentUser.email}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#777777]">
                        <ShieldCheck className="w-3 h-3 text-[#171717]" />
                        <span>Role: {userProfile?.role || 'Customer'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('orders');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#171717] hover:bg-[#F8F9FB] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Box className="w-3.5 h-3.5 text-[#777777]" />
                      My Purchases
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-[#171717] hover:bg-[#F8F9FB] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#777777]" />
                      Merchant Console
                    </button>

                    <div className="border-t border-[#F0F1F3] my-1" />

                    <button
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-medium text-[#FFFFFF] bg-[#080808] rounded-lg hover:bg-[#171717] transition-all cursor-pointer whitespace-nowrap shadow-xs flex items-center gap-1.5"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
