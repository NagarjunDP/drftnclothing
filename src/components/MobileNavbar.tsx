'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ShoppingCart, Truck } from 'lucide-react';
import { useCartStore } from '../lib/cartStore';

export default function MobileNavbar() {
  const pathname = usePathname();
  const getCartCount = useCartStore((state) => state.getCartCount);
  const setIsOpen = useCartStore((state) => state.setIsOpen);
  const cartCount = getCartCount();

  // Hide on admin routes
  const isAdminPage = pathname?.startsWith('/admin');
  if (isAdminPage) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-black/95 backdrop-blur-md border-t border-zinc-900 py-2 px-6 flex items-center justify-between text-zinc-500">
      {/* Home */}
      <Link
        href="/"
        className={`flex flex-col items-center gap-1 flex-1 text-center py-1 transition-colors ${
          pathname === '/' ? 'text-brand-offwhite' : 'hover:text-zinc-300'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] uppercase font-bold tracking-wider">Home</span>
      </Link>

      {/* Shop */}
      <Link
        href="/shop"
        className={`flex flex-col items-center gap-1 flex-1 text-center py-1 transition-colors ${
          pathname === '/shop' ? 'text-brand-offwhite' : 'hover:text-zinc-300'
        }`}
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="text-[10px] uppercase font-bold tracking-wider">Shop</span>
      </Link>

      {/* Cart Drawer Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex flex-col items-center gap-1 flex-1 text-center py-1 relative transition-colors hover:text-zinc-300"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5 text-zinc-500" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-brand-red text-brand-offwhite text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Cart</span>
      </button>

      {/* Track */}
      <Link
        href="/track"
        className={`flex flex-col items-center gap-1 flex-1 text-center py-1 transition-colors ${
          pathname === '/track' ? 'text-brand-offwhite' : 'hover:text-zinc-300'
        }`}
      >
        <Truck className="w-5 h-5" />
        <span className="text-[10px] uppercase font-bold tracking-wider">Track</span>
      </Link>
    </div>
  );
}
