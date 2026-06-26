'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Minus, Trash2, Tag, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/cartStore';
import { dbService } from '@/lib/db';
import { toast } from '@/lib/toast';
import { StoreSettings } from '@/types';

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getCartTotal = useCartStore((state) => state.getCartTotal);
  const discountCode = useCartStore((state) => state.discountCode);
  const applyDiscount = useCartStore((state) => state.applyDiscount);

  const [promoInput, setPromoInput] = useState('');
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Load store settings (shipping thresholds, etc.)
  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await dbService.getSettings();
        setStoreSettings(settings);
      } catch (err) {
        console.error('Failed to load store settings:', err);
      } finally {
        setLoadingSettings(false);
      }
    }
    loadSettings();
  }, []);

  const subtotal = getCartTotal();
  const freeShippingThreshold = storeSettings?.free_shipping_threshold ?? 99900;
  const defaultShippingCharge = storeSettings?.default_shipping_charge ?? 9900;

  // Calculate shipping
  const shippingCharge = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : defaultShippingCharge;

  // Calculate discount amount
  let discountAmount = 0;
  if (discountCode) {
    if (discountCode.discount_type === 'percent') {
      discountAmount = Math.round(subtotal * (discountCode.discount_value / 100));
    } else {
      discountAmount = discountCode.discount_value;
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCharge);

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

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-24 px-6 space-y-6">
        <div className="p-6 border border-zinc-900 bg-zinc-950/20 rounded-full flex items-center justify-center animate-bounce">
          <ShoppingBag className="w-16 h-16 text-zinc-700 stroke-[1]" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-wider text-brand-offwhite">YOUR BAG IS EMPTY</h2>
          <p className="text-zinc-500 text-xs max-w-sm mx-auto">
            You haven&apos;t added any items to your shopping bag yet. Explore the shop to get driftin.
          </p>
        </div>
        <Link
          href="/shop"
          className="btn-electric bg-brand-offwhite text-brand-black font-extrabold text-xs uppercase tracking-widest py-4 px-8 rounded shadow-lg transition-all duration-300"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 px-6 md:px-12 max-w-7xl mx-auto w-full flex-1 flex flex-col">
      <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-brand-offwhite mb-8 border-b border-zinc-900 pb-6">
        YOUR BAG
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Cart Items Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-zinc-900 bg-zinc-950/20 rounded-md overflow-hidden divide-y divide-zinc-900/60">
            {items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="p-6 flex flex-col sm:flex-row gap-6">
                {/* Image */}
                <div className="relative w-24 h-28 bg-zinc-950 rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="object-cover w-full h-full filter grayscale hover:filter-none transition-all duration-350"
                  />
                </div>

                {/* Info & Quantity controls */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-brand-red font-bold uppercase tracking-widest">
                        DRFTN STAPLE
                      </span>
                      <h3 className="text-base font-bold text-brand-offwhite uppercase tracking-wider mt-0.5">
                        {item.name}
                      </h3>
                      <p className="text-xs text-zinc-500 font-bold uppercase mt-1">SIZE: {item.size}</p>
                    </div>
                    <span className="text-base font-extrabold text-brand-offwhite">
                      ₹{((item.price * item.quantity) / 100).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-zinc-800 rounded bg-zinc-950">
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                        className="p-2 text-zinc-500 hover:text-brand-offwhite transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs px-3 text-brand-offwhite font-bold w-8 text-center select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                        className="p-2 text-zinc-500 hover:text-brand-offwhite transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => {
                        removeItem(item.id, item.size);
                        toast.info(`Removed ${item.name} from bag.`);
                      }}
                      className="text-zinc-600 hover:text-brand-red transition-colors flex items-center gap-1 text-xs uppercase tracking-widest font-bold"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue shopping link */}
          <div className="text-left">
            <Link
              href="/shop"
              className="text-xs uppercase tracking-widest text-zinc-500 hover:text-brand-offwhite font-extrabold transition-colors"
            >
              &larr; Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary & Discount code */}
        <div className="space-y-6">
          <div className="border border-zinc-900 bg-zinc-950/40 rounded-md p-6 glass-panel space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-offwhite border-b border-zinc-900 pb-4">
              ORDER SUMMARY
            </h3>

            {/* Calculations lines */}
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center text-zinc-500">
                <span>Bag Subtotal</span>
                <span className="font-semibold text-brand-offwhite">₹{(subtotal / 100).toFixed(2)}</span>
              </div>

              {/* Promo code line */}
              {discountCode && (
                <div className="flex justify-between items-center text-emerald-400">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span className="uppercase font-bold">VOUCHER: {discountCode.code}</span>
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

              <div className="flex justify-between items-center text-zinc-500">
                <span>Shipping Fee</span>
                {shippingCharge === 0 ? (
                  <span className="font-extrabold text-emerald-400 uppercase tracking-widest text-[10px]">
                    FREE
                  </span>
                ) : (
                  <span className="font-semibold text-brand-offwhite">₹{(shippingCharge / 100).toFixed(2)}</span>
                )}
              </div>

              {/* Threshold indicator */}
              {shippingCharge > 0 && !loadingSettings && (
                <p className="text-[10px] text-zinc-500 bg-zinc-950 p-2.5 rounded leading-relaxed border border-zinc-900">
                  Add <strong className="text-brand-offwhite">₹{((freeShippingThreshold - subtotal) / 100).toFixed(2)}</strong> more to your bag to unlock <strong className="text-emerald-400">FREE SHIPPING</strong>.
                </p>
              )}
            </div>

            <div className="border-t border-zinc-900 my-4"></div>

            {/* Total line */}
            <div className="flex justify-between items-center text-sm font-bold uppercase tracking-wider">
              <span className="text-brand-offwhite">Estimated Total</span>
              <span className="text-xl font-extrabold text-brand-offwhite">₹{(finalTotal / 100).toFixed(2)}</span>
            </div>

            {/* Proceed CTA */}
            <Link
              href="/checkout"
              className="btn-electric w-full flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red/90 text-brand-offwhite font-bold text-xs uppercase tracking-widest py-4 px-6 rounded-md shadow-lg shadow-brand-red/25 transition-all duration-300"
            >
              PROCEED TO CHECKOUT
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Promo code box */}
          <div className="border border-zinc-900 bg-zinc-950/20 rounded-md p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-brand-red" />
              Apply Promo Code
            </h4>
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="DRFTN10 / BLRSTREET"
                className="flex-1 bg-zinc-950 border border-zinc-900 text-brand-offwhite py-2.5 px-4 text-xs rounded uppercase font-bold tracking-wider"
              />
              <button
                type="submit"
                className="bg-brand-offwhite text-brand-black hover:bg-brand-red hover:text-brand-offwhite font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded transition-colors"
              >
                Apply
              </button>
            </form>
            <p className="text-[9px] text-zinc-600 leading-normal">
              * Promo codes cannot be combined. Min order values apply. Try codes: <strong className="text-zinc-500">DRFTN10</strong> (10% off) or <strong className="text-zinc-500">BLRSTREET</strong> (₹250 off on orders &gt; ₹1499).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
