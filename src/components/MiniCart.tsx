'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../lib/cartStore';

export default function MiniCart() {
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const setIsOpen = useCartStore((state) => state.setIsOpen);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getCartTotal = useCartStore((state) => state.getCartTotal);
  
  const drawerRef = useRef<HTMLDivElement>(null);

  // Prevent background scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close drawer on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsOpen]);

  return (
    <>
      {/* Dimmed Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Cart Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 bg-brand-black border-l border-zinc-900 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-brand-red" />
            <h3 className="text-lg font-bold uppercase tracking-wider text-brand-offwhite">YOUR BAG</h3>
            <span className="text-xs text-zinc-500 font-bold bg-zinc-900 py-1 px-2.5 rounded">
              {items.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:text-brand-red text-zinc-500 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <ShoppingCart className="w-12 h-12 text-zinc-800 stroke-[1]" />
              <div>
                <p className="text-brand-offwhite font-medium uppercase tracking-wider">Your bag is empty</p>
                <p className="text-zinc-500 text-xs mt-1">Add some heavy items to get driftin.</p>
              </div>
              <Link
                href="/shop"
                onClick={() => setIsOpen(false)}
                className="btn-electric border border-brand-offwhite text-brand-offwhite text-xs tracking-widest uppercase font-bold py-2.5 px-6 rounded-md hover:bg-brand-offwhite hover:text-brand-black"
              >
                Shop Collection
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-4 border-b border-zinc-900/60 pb-6 last:border-0 last:pb-0">
                {/* Image */}
                <div className="relative w-20 h-24 bg-zinc-900 rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-brand-offwhite tracking-wide uppercase line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-sm font-bold text-brand-offwhite ml-2">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium uppercase mt-0.5">SIZE: {item.size}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Qty Selector */}
                    <div className="flex items-center border border-zinc-800 rounded bg-zinc-900">
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        className="p-1 px-2 text-zinc-500 hover:text-brand-offwhite transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3. h-3" />
                      </button>
                      <span className="text-xs px-2 text-brand-offwhite font-bold w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="p-1 px-2 text-zinc-500 hover:text-brand-offwhite transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeItem(item.id, item.size)}
                      className="text-zinc-600 hover:text-brand-red transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-zinc-900 bg-zinc-950/60">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Estimated Subtotal</span>
              <span className="text-lg font-extrabold text-brand-offwhite">₹{getCartTotal()}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="text-center border border-zinc-800 text-brand-offwhite hover:border-brand-offwhite text-xs tracking-widest uppercase font-bold py-3.5 px-4 rounded-md transition-colors"
              >
                View Bag
              </Link>
              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="btn-electric text-center bg-brand-red hover:bg-brand-red/90 text-brand-offwhite text-xs tracking-widest uppercase font-bold py-3.5 px-4 rounded-md shadow-lg shadow-brand-red/20"
              >
                Checkout
              </Link>
            </div>
            
            <p className="text-[10px] text-zinc-600 text-center mt-4">
              Shipping & taxes calculated at checkout.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
