'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ShoppingBag, Package, Search, User, Truck, X } from 'lucide-react';
import { useCartStore } from '../lib/cartStore';
import { useAnimationStore } from '../lib/animationStore';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';

export default function MobileNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const setIsOpen = useCartStore((state) => state.setIsOpen);
  const cartCount = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));
  const cartPulseActive = useAnimationStore((state) => state.cartPulseActive);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isAdminPage = pathname?.startsWith('/admin');
  const isCheckoutPage = pathname === '/checkout';
  if (isAdminPage || isCheckoutPage) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const isHomeActive = pathname === '/';
  const isShopActive = pathname?.startsWith('/shop');

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 w-full z-50 bg-[#0A0A0A] border-t border-brand-graphite/80 shadow-[0_-4px_24px_rgba(0,0,0,0.7)]"
        aria-label="Mobile bottom navigation"
      >
        <div className="relative flex items-center justify-between px-4 py-2 pb-5">
          
          {/* 1. Home Tab */}
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 py-2 rounded-none transition-colors duration-200 flex-1 min-w-[56px] ${
              isHomeActive ? 'text-brand-offwhite' : 'text-brand-gray hover:text-brand-offwhite'
            }`}
            aria-label="Home"
            aria-current={isHomeActive ? 'page' : undefined}
          >
            <Home
              className="w-5 h-5"
              strokeWidth={isHomeActive ? 2 : 1.8}
            />
            <span className="text-[9px] tracking-[0.12em] uppercase font-body font-semibold">
              Home
            </span>
          </Link>

          {/* 2. Shop Tab */}
          <Link
            href="/shop"
            className={`flex flex-col items-center gap-1 py-2 rounded-none transition-colors duration-200 flex-1 min-w-[56px] ${
              isShopActive ? 'text-brand-offwhite' : 'text-brand-gray hover:text-brand-offwhite'
            }`}
            aria-label="Shop"
            aria-current={isShopActive ? 'page' : undefined}
          >
            <ShoppingBag
              className="w-5 h-5"
              strokeWidth={isShopActive ? 2 : 1.8}
            />
            <span className="text-[9px] tracking-[0.12em] uppercase font-body font-semibold">
              Shop
            </span>
          </Link>

          {/* 3. Search Tab */}
          <button
            onClick={() => setSearchOpen(true)}
            className={`flex flex-col items-center gap-1 py-2 rounded-none transition-colors duration-200 flex-1 min-w-[56px] ${
              searchOpen ? 'text-brand-offwhite' : 'text-brand-gray hover:text-brand-offwhite'
            }`}
            aria-label="Search items"
          >
            <Search className="w-5 h-5" strokeWidth={searchOpen ? 2 : 1.8} />
            <span className="text-[9px] tracking-[0.12em] uppercase font-body font-semibold">
              Search
            </span>
          </button>

          {/* 4. Bag Tab */}
          <button
            id="mobile-cart-trigger"
            onClick={() => setIsOpen(true)}
            className={`flex flex-col items-center gap-1 py-2 rounded-none transition-colors duration-200 flex-1 min-w-[56px] relative ${
              cartPulseActive ? 'text-brand-red' : 'text-brand-gray hover:text-brand-offwhite'
            }`}
            aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
          >
            <div className="relative">
              <Package
                className="w-5 h-5"
                strokeWidth={cartPulseActive ? 2 : 1.8}
              />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-2 bg-brand-red text-white text-[7.5px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center animate-scale-in"
                  aria-hidden="true"
                >
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[9px] tracking-[0.12em] uppercase font-body font-semibold">
              Bag
            </span>
          </button>

          {/* 5. Me Tab */}
          <div className="flex-1 flex flex-col items-center justify-center py-2 min-w-[56px]">
            {isLoaded && !isSignedIn && (
              <SignInButton mode="modal">
                <button
                  className="flex flex-col items-center gap-1 text-brand-gray hover:text-brand-offwhite transition-colors"
                  aria-label="Sign in to your account"
                >
                  <User className="w-5 h-5" strokeWidth={1.8} />
                  <span className="text-[9px] tracking-[0.12em] uppercase font-body font-semibold">Me</span>
                </button>
              </SignInButton>
            )}
            {isLoaded && isSignedIn && (
              <div className="flex flex-col items-center gap-1">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: 'w-5 h-5 rounded-full border border-brand-muted',
                    },
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Action
                      label="Track Order"
                      labelIcon={<Truck className="w-3.5 h-3.5" />}
                      onClick={() => router.push('/track')}
                    />
                  </UserButton.MenuItems>
                </UserButton>
                <span className="text-[9px] tracking-[0.12em] uppercase font-body font-semibold text-brand-gray">Me</span>
              </div>
            )}
          </div>

        </div>
      </nav>

      {/* ── Search Overlay Modal ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-brand-black/95 backdrop-blur-md flex flex-col justify-start px-6 pt-24 animate-scale-in">
          {/* Close Button */}
          <button
            onClick={() => setSearchOpen(false)}
            className="absolute top-6 right-6 p-2 text-brand-stone hover:text-brand-offwhite"
            aria-label="Close search overlay"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="w-full max-w-lg mx-auto">
            <label className="text-[10px] uppercase tracking-[0.2em] text-brand-stone font-bold block mb-2 font-body">Search Collection</label>
            <div className="relative border-b border-brand-graphite py-2 flex items-center">
              <input
                type="text"
                autoFocus
                placeholder="TYPE TO SEARCH..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xl font-display text-brand-offwhite uppercase tracking-widest focus:outline-none placeholder-brand-graphite"
              />
              <button type="submit" className="text-brand-stone hover:text-brand-offwhite p-1">
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Quick search suggestions */}
            <div className="mt-8">
              <span className="text-[9px] uppercase tracking-[0.25em] text-brand-stone/60 font-bold block mb-3.5 font-body">Quick Suggestions</span>
              <div className="flex flex-wrap gap-2.5">
                {['Hoodies', 'Jackets', 'T-Shirts', 'Denims', 'Accessories'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      router.push(`/shop?search=${encodeURIComponent(q)}`);
                      setSearchOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-full border border-brand-graphite text-[9px] font-bold tracking-[0.15em] text-brand-stone hover:text-brand-offwhite uppercase bg-brand-charcoal/30 transition-all duration-200 font-body"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
