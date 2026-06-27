'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Package, Truck, User } from 'lucide-react';
import { useCartStore } from '../lib/cartStore';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';

const TAB_ITEMS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/shop', icon: ShoppingBag, label: 'Shop' },
  { href: '/track', icon: Truck, label: 'Track' },
];

export default function MobileNavbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();
  const getCartCount = useCartStore((state) => state.getCartCount);
  const setIsOpen = useCartStore((state) => state.setIsOpen);
  const cartCount = getCartCount();

  const isAdminPage = pathname?.startsWith('/admin');
  const isCheckoutPage = pathname === '/checkout';
  if (isAdminPage || isCheckoutPage) return null;

  return (
    <nav
      className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-50 bg-black/70 backdrop-blur-md rounded-full border border-white/10 shadow-2xl shadow-black/80 transition-transform duration-300"
    >
      <div className="flex items-center justify-between px-2.5 py-2">

        {/* Navigation Items */}
        {TAB_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-300 ${
                active ? 'bg-brand-red/10 text-brand-offwhite' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className={`w-4 h-4 stroke-[1.8] transition-transform duration-300 ${active ? 'stroke-brand-red scale-105' : 'stroke-zinc-500'}`} />
              <span className={`text-[8.5px] tracking-[0.12em] uppercase font-body font-bold transition-colors duration-300 ${active ? 'text-brand-offwhite' : 'text-zinc-500'}`}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* Cart */}
        <button
          id="mobile-cart-trigger"
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center gap-1 px-3 py-1.5 text-zinc-500 hover:text-zinc-300 transition-all duration-300 rounded-full relative"
        >
          <div className="relative">
            <Package className="w-4 h-4 stroke-[1.8] stroke-zinc-500" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-brand-red text-white text-[7.5px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center animate-scale-in">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[8.5px] tracking-[0.12em] uppercase font-body font-bold text-zinc-500">Bag</span>
        </button>

        {/* Account / Profile */}
        <div className="flex flex-col items-center justify-center px-3 py-1 rounded-full">
          {isLoaded && !isSignedIn && (
            <SignInButton mode="modal">
              <button className="flex flex-col items-center gap-1 text-zinc-500 hover:text-zinc-300 transition-colors">
                <User className="w-4 h-4 stroke-[1.8] stroke-zinc-500" />
                <span className="text-[8.5px] tracking-[0.12em] uppercase font-body font-bold">Sign In</span>
              </button>
            </SignInButton>
          )}
          {isLoaded && isSignedIn && (
            <div className="flex flex-col items-center gap-0.5">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'w-4 h-4 border border-zinc-700 rounded-full hover:border-brand-red transition-colors',
                  },
                }}
              />
              <span className="text-[8.5px] tracking-[0.12em] uppercase font-body font-bold text-zinc-500">Profile</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
