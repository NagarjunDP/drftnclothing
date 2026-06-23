'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { Order } from '@/types';
import { Search, ChevronDown } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

export default function AdminOrders() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    try {
      const data = await db.getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load orders', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['order_status']) => {
    try {
      await db.updateOrderStatus(orderId, { order_status: newStatus });
      addToast('Order status updated', 'success');
      fetchOrders();
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const filteredOrders = orders.filter(o => 
    o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-widest uppercase text-brand-offwhite">Order Management</h1>
          <p className="text-zinc-500 text-sm mt-1">View and manage customer orders, track shipments.</p>
        </div>
      </div>

      <div className="bg-zinc-900/30 border border-zinc-800">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-700 text-brand-offwhite pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-red transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-zinc-500 text-sm">Loading orders...</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Order</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Date</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Customer</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Payment</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500 text-sm">No orders found.</td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                      <td className="p-4 font-mono text-sm text-brand-offwhite">{order.order_number}</td>
                      <td className="p-4 text-sm text-zinc-400">
                        {new Date(order.created_at || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-brand-offwhite">{order.customer_name}</p>
                        <p className="text-xs text-zinc-500">{order.customer_email}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                          order.payment_status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="relative">
                          <select
                            value={order.order_status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as Order['order_status'])}
                            className={`appearance-none bg-zinc-900 border px-3 py-1.5 pr-8 text-xs font-bold uppercase tracking-wider rounded cursor-pointer focus:outline-none ${
                              order.order_status === 'delivered' ? 'border-green-900 text-green-500' :
                              order.order_status === 'cancelled' ? 'border-red-900 text-red-500' :
                              'border-zinc-700 text-brand-offwhite'
                            }`}
                          >
                            <option value="placed">Placed</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" />
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm text-brand-offwhite">₹{order.total.toFixed(2)}</td>
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
