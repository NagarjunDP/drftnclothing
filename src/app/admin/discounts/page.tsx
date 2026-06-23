'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { DiscountCode } from '@/types';
import { Plus, CheckCircle2, XCircle, Search } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

export default function AdminDiscounts() {
  const { addToast } = useToast();
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDiscounts = async () => {
    try {
      const data = await db.getDiscountCodes();
      setDiscounts(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load discount codes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDiscountActive = async (discount: DiscountCode) => {
    try {
      await db.updateDiscountCode(discount.id, { is_active: !discount.is_active });
      addToast(`${discount.code} is now ${!discount.is_active ? 'Active' : 'Inactive'}`, 'success');
      fetchDiscounts();
    } catch (error) {
      addToast('Failed to update discount', 'error');
    }
  };

  const filteredDiscounts = discounts.filter(d => 
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-widest uppercase text-brand-offwhite">Discount Codes</h1>
          <p className="text-zinc-500 text-sm mt-1">Create and manage promotional codes and sales.</p>
        </div>
        <button
          onClick={() => addToast('Create discount modal would open here', 'success')}
          className="bg-brand-red text-white px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Code
        </button>
      </div>

      <div className="bg-zinc-900/30 border border-zinc-800">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-700 text-brand-offwhite pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-red transition-colors uppercase"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-zinc-500 text-sm">Loading discount codes...</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Code</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Value</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Min. Order</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Usage</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiscounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500 text-sm">No discount codes found.</td>
                  </tr>
                ) : (
                  filteredDiscounts.map(discount => (
                    <tr key={discount.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                      <td className="p-4 font-mono font-bold text-brand-offwhite">{discount.code}</td>
                      <td className="p-4 text-sm text-brand-offwhite">
                        {discount.discount_type === 'percent' ? `${discount.discount_value}%` : `₹${discount.discount_value}`} OFF
                      </td>
                      <td className="p-4 font-mono text-sm text-zinc-400">
                        {discount.min_order_value > 0 ? `₹${discount.min_order_value}` : 'None'}
                      </td>
                      <td className="p-4 text-sm text-zinc-400">
                        {discount.used_count} {discount.usage_limit ? `/ ${discount.usage_limit}` : 'used'}
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => toggleDiscountActive(discount)}
                          className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
                          discount.is_active ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}>
                          {discount.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {discount.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
