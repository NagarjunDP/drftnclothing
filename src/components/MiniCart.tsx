'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingCart, Tag } from 'lucide-react';
import { useCartStore } from '../lib/cartStore';
import { toast } from '@/lib/toast';

export default function MiniCart() {
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const setIsOpen = useCartStore((state) => state.setIsOpen);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getCartTotal = useCartStore((state) => state.getCartTotal);
  const discountCode = useCartStore((state) => state.discountCode);
  const applyDiscount = useCartStore((state) => state.applyDiscount);

  const [promoInput, setPromoInput] = useState('');
  
  const subtotal = getCartTotal();
  
  let discountAmount = 0;
  if (discountCode) {
    if (discountCode.discount_type === 'percent') {
      discountAmount = Math.round(subtotal * (discountCode.discount_value / 100));
    } else {
      discountAmount = discountCode.discount_value;
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput, subtotal }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        toast.error(data.message || 'Invalid promo code!');
        return;
      }

      applyDiscount({
        id: 'applied-coupon',
        code: promoInput.toUpperCase().trim(),
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        min_order_value: 0,
        used_count: 0,
        is_active: true
      });
      toast.success(data.message || `Promo code applied successfully!`);
      setPromoInput('');
    } catch (err) {
      toast.error('Error applying coupon.');
      console.error(err);
    }
  };

  const handleRemovePromo = () => {
    applyDiscount(null);
    toast.info('Promo code removed.');
  };

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
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      />

      {/* Cart Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 bg-brand-black border-l border-zinc-900 shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
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
                        ₹{((item.price * item.quantity) / 100).toFixed(2)}
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
          <div className="p-6 border-t border-zinc-900 bg-zinc-950/60 space-y-4">
            
            {/* Promo code box */}
            <div className="space-y-2 mb-2">
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Promo Code"
                  className="flex-1 bg-zinc-900 border border-zinc-800 text-brand-offwhite py-2 px-3 text-xs rounded uppercase font-bold tracking-wider"
                />
                <button
                  type="submit"
                  className="bg-brand-offwhite text-brand-black hover:bg-brand-red hover:text-brand-offwhite font-bold text-xs uppercase tracking-wider py-2 px-3 rounded transition-colors"
                >
                  Apply
                </button>
              </form>
              
              {discountCode && (
                <div className="flex justify-between items-center text-emerald-400 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3 h-3" />
                    <span className="uppercase font-bold">{discountCode.code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">-₹{(discountAmount / 100).toFixed(2)}</span>
                    <button
                      onClick={handleRemovePromo}
                      className="text-zinc-500 hover:text-brand-red text-[10px] uppercase font-bold tracking-widest border border-zinc-800 rounded px-1.5 py-0.5"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-xs text-zinc-400">
              <span className="uppercase tracking-widest font-bold">Subtotal</span>
              <span className="font-mono">₹{(subtotal / 100).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center mb-6 pt-2 border-t border-zinc-800">
              <span className="text-sm uppercase tracking-widest text-zinc-300 font-bold">Estimated Total</span>
              <span className="text-lg font-extrabold text-brand-offwhite">₹{(finalTotal / 100).toFixed(2)}</span>
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
