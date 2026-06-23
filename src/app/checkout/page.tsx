'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/cartStore';
import { db } from '@/lib/db';
import { ChevronLeft, Lock, CheckCircle, Package } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

export default function CheckoutPage() {
  const { items, getCartTotal, discountCode, clearCart } = useCartStore();
  const { addToast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successOrderInfo, setSuccessOrderInfo] = useState<{ number: string; total: number } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculateTotal = () => {
    const subtotal = getCartTotal();
    let discount = 0;

    if (discountCode) {
      if (discountCode.discount_type === 'percent') {
        discount = subtotal * (discountCode.discount_value / 100);
      } else {
        discount = discountCode.discount_value;
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const shippingCharge = discountedSubtotal >= 1499 ? 0 : 100; // Hardcoded default based on seed settings

    return {
      subtotal,
      discount,
      shippingCharge,
      total: discountedSubtotal + shippingCharge,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      addToast('Your cart is empty', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const totals = calculateTotal();

      // SIMULATE RAZORPAY PAYMENT GATEWAY DELAY
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newOrderData = {
        customer_name: `${formData.firstName} ${formData.lastName}`.trim(),
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: {
          line1: formData.line1,
          line2: formData.line2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        items: items,
        subtotal: totals.subtotal,
        shipping_charge: totals.shippingCharge,
        total: totals.total,
        payment_status: 'paid' as const,
        payment_id: `pay_mock_${Date.now()}`,
        order_status: 'placed' as const,
      };

      const createdOrder = await db.createOrder(newOrderData);

      setSuccessOrderInfo({ number: createdOrder.order_number, total: createdOrder.total });
      clearCart();
      window.scrollTo(0, 0);

    } catch (error: unknown) {
      const err = error as Error;
      addToast(err.message || 'Failed to apply code', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-brand-black" />;

  if (successOrderInfo) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-widest text-brand-offwhite mb-4 uppercase">Order Confirmed</h1>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">
          Thank you for choosing DRFTN CLOTHING. Your order <span className="text-brand-offwhite font-bold">{successOrderInfo.number}</span> has been placed successfully.
        </p>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 w-full max-w-sm mb-8">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-zinc-500">Total Paid</span>
            <span className="text-brand-offwhite font-bold font-mono">₹{successOrderInfo.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500">Payment Status</span>
            <span className="text-green-500 font-bold">Successful</span>
          </div>
        </div>
        <div className="flex gap-4">
          <Link href="/shop" className="bg-brand-red text-white px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-red-600 transition-colors">
            Continue Shopping
          </Link>
          <Link href="/track" className="bg-transparent border border-zinc-700 text-brand-offwhite px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-colors">
            Track Order
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Package className="w-16 h-16 text-zinc-800 mb-6" />
        <h2 className="text-2xl font-bold text-brand-offwhite mb-4 uppercase tracking-wider">Cart is Empty</h2>
        <p className="text-zinc-500 mb-8 max-w-md mx-auto">
          You have no items in your cart to checkout. Head back to the shop to find your style.
        </p>
        <Link href="/shop" className="bg-brand-red text-white px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-red-600 transition-colors">
          Return to Shop
        </Link>
      </div>
    );
  }

  const { subtotal, discount, shippingCharge, total } = calculateTotal();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <Link href="/cart" className="inline-flex items-center text-xs uppercase tracking-wider font-bold text-zinc-500 hover:text-brand-offwhite transition-colors mb-8">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Cart
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Col: Shipping Form */}
        <div className="lg:col-span-7 xl:col-span-8">
          <h1 className="text-3xl font-extrabold tracking-widest uppercase mb-8 pb-4 border-b border-zinc-900">Checkout</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Info */}
            <section>
              <h2 className="text-lg font-bold text-brand-offwhite mb-4 uppercase tracking-wider">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red focus:bg-zinc-900 transition-colors"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red focus:bg-zinc-900 transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Shipping Info */}
            <section>
              <h2 className="text-lg font-bold text-brand-offwhite mb-4 uppercase tracking-wider">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red focus:bg-zinc-900 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red focus:bg-zinc-900 transition-colors"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">Address Line 1</label>
                  <input
                    type="text"
                    name="line1"
                    required
                    value={formData.line1}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red focus:bg-zinc-900 transition-colors"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">Apartment, suite, etc. (optional)</label>
                  <input
                    type="text"
                    name="line2"
                    value={formData.line2}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red focus:bg-zinc-900 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red focus:bg-zinc-900 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">State</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red focus:bg-zinc-900 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">PIN Code</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red focus:bg-zinc-900 transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Payment Info */}
            <section>
              <h2 className="text-lg font-bold text-brand-offwhite mb-4 uppercase tracking-wider">Payment</h2>
              <div className="bg-zinc-900/30 border border-zinc-800 p-6 flex flex-col items-center justify-center text-center">
                <Lock className="w-8 h-8 text-zinc-500 mb-3" />
                <p className="text-sm text-brand-offwhite mb-1 font-bold">Secure Payment (Mocked)</p>
                <p className="text-xs text-zinc-500 max-w-sm">
                  Clicking &quot;Pay Now&quot; will simulate a Razorpay transaction and automatically mark the order as paid.
                </p>
              </div>
            </section>

            {/* Submit */}
            <div className="pt-4 border-t border-zinc-900">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-brand-red text-white py-4 font-bold uppercase tracking-widest text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Processing Secure Payment...' : `Pay ₹${total.toFixed(2)}`}
                {!isProcessing && <Lock className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Order Summary Sidebar */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
          <div className="bg-zinc-900/30 border border-zinc-800 p-6 md:p-8">
            <h2 className="text-lg font-bold text-brand-offwhite mb-6 uppercase tracking-wider">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-4">
                  <div className="w-16 h-20 bg-zinc-900 flex-shrink-0 relative border border-zinc-800">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute -top-2 -right-2 bg-zinc-800 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-zinc-700">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-brand-offwhite truncate">{item.name}</h4>
                    <p className="text-xs text-zinc-500 mt-1">Size: {item.size}</p>
                    <p className="text-sm text-zinc-400 font-mono mt-1">₹{item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-800 pt-6 space-y-3 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-mono">₹{subtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>Discount ({discountCode?.code})</span>
                  <span className="font-mono">-₹{discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span className="font-mono">{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge.toFixed(2)}`}</span>
              </div>
              
              <div className="pt-3 border-t border-zinc-800 flex justify-between items-center mt-3">
                <p className="text-zinc-500 text-xs mt-1 font-bold uppercase tracking-widest">&quot;Drift in Style&quot;</p>
                <span className="text-brand-offwhite font-bold uppercase tracking-wider text-base">Total</span>
                <span className="text-brand-offwhite font-bold text-xl font-mono">₹{total.toFixed(2)}</span>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
