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
  if (isAdminPage) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 glass-panel border-t border-brand-graphite"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-2 py-2.5">

        {/* Home */}
        {TAB_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${active ? 'text-brand-offwhite' : 'text-brand-gray hover:text-brand-silver'
                }`}
            >
              <Icon className={`w-5 h-5 stroke-[1.5] ${active ? 'stroke-brand-offwhite' : ''}`} />
              <span className={`text-[9px] tracking-[0.15em] uppercase font-body font-medium ${active ? 'text-brand-gold' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* Cart */}
        <button
          id="mobile-cart-trigger"
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center gap-1 px-4 py-1 text-brand-gray hover:text-brand-silver transition-colors relative"
        >
          <div className="relative">
            <Package className="w-5 h-5 stroke-[1.5]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-brand-red text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[9px] tracking-[0.15em] uppercase font-body font-medium">Bag</span>
        </button>

        {/* Account */}
        <div className="flex flex-col items-center gap-1 px-4 py-1">
          {isLoaded && !isSignedIn && (
            <SignInButton mode="modal">
              <button className="flex flex-col items-center gap-1 text-brand-gray hover:text-brand-silver transition-colors">
                <User className="w-5 h-5 stroke-[1.5]" />
                <span className="text-[9px] tracking-[0.15em] uppercase font-body font-medium">Sign In</span>
              </button>
            </SignInButton>
          )}
          {isLoaded && isSignedIn && (
            <>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: 'w-5 h-5 border border-brand-muted rounded-full hover:border-brand-gold transition-colors',
                  },
                }}
              />
              <span className="text-[9px] tracking-[0.15em] uppercase font-body font-medium text-brand-gray">Profile</span>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
