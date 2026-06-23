'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '../lib/cartStore';

export default function Navbar() {
  const pathname = usePathname();
  const getCartCount = useCartStore((state) => state.getCartCount);
  const setIsOpen = useCartStore((state) => state.setIsOpen);
  const cartCount = getCartCount();

  // Hide standard navbar inside admin section for clean admin layouts
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) return null;

  return (
    <header className="w-full z-40 relative">
      {/* Announcement Bar */}
      <div className="bg-brand-red text-brand-offwhite text-xs font-semibold py-2 px-4 text-center tracking-wider uppercase select-none">
        Free shipping above ₹999 | COD Available | Bengaluru&apos;s Own Streetwear
      </div>

      {/* Main Glass Nav */}
      <nav className="w-full sticky top-0 glass-nav py-4 px-6 md:px-12 flex items-center justify-between z-30">
        {/* Nav Links - Desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest font-medium">
          <Link
            href="/shop"
            className={`hover:text-brand-red transition-colors ${
              pathname === '/shop' ? 'text-brand-red font-bold' : 'text-brand-offwhite/85'
            }`}
          >
            Shop
          </Link>
          <Link
            href="/about"
            className={`hover:text-brand-red transition-colors ${
              pathname === '/about' ? 'text-brand-red font-bold' : 'text-brand-offwhite/85'
            }`}
          >
            About
          </Link>
          <Link
            href="/contact"
            className={`hover:text-brand-red transition-colors ${
              pathname === '/contact' ? 'text-brand-red font-bold' : 'text-brand-offwhite/85'
            }`}
          >
            Contact
          </Link>
        </div>

        {/* DRFTN Logo */}
        <Link
          href="/"
          className="text-2xl md:text-3xl font-extrabold tracking-[0.3em] text-brand-offwhite hover:opacity-90 transition-opacity flex items-center select-none"
        >
          D R F T N
        </Link>

        {/* Right side icons */}
        <div className="flex items-center gap-6">
          {/* Cart Trigger */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 text-brand-offwhite hover:text-brand-red transition-colors group"
            aria-label="Open Cart"
          >
            <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-red text-brand-offwhite text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-black animate-scale-in">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
