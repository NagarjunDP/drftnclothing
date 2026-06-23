'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { Order, Product } from '@/types';
import { IndianRupee, ShoppingBag, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedOrders, fetchedProducts] = await Promise.all([
          db.getOrders(),
          db.getProducts(),
        ]);
        setOrders(fetchedOrders);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-zinc-500 font-bold uppercase tracking-widest text-sm animate-pulse">Loading Dashboard...</div>;
  }

  // Calculate Metrics
  const totalRevenue = orders.filter(o => o.payment_status === 'paid').reduce((acc, curr) => acc + curr.total, 0);
  const totalOrders = orders.length;
  const recentOrders = orders.slice(0, 5);

  // Find low stock items (any size <= 2)
  const lowStockItems = products.filter(p => {
    return Object.values(p.stock_quantity).some(qty => qty <= 2);
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-widest uppercase text-brand-offwhite">Dashboard Overview</h1>
          <p className="text-zinc-500 text-sm mt-1">Welcome back. Here&apos;s what&apos;s happening with your store.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/30 border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Revenue</h3>
            <IndianRupee className="w-5 h-5 text-brand-red" />
          </div>
          <p className="text-3xl font-mono font-bold text-brand-offwhite">₹{totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Orders</h3>
            <ShoppingBag className="w-5 h-5 text-brand-red" />
          </div>
          <p className="text-3xl font-mono font-bold text-brand-offwhite">{totalOrders}</p>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Active Products</h3>
            <Package className="w-5 h-5 text-brand-red" />
          </div>
          <p className="text-3xl font-mono font-bold text-brand-offwhite">{products.filter(p => p.is_active).length}</p>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Avg. Order Value</h3>
            <TrendingUp className="w-5 h-5 text-brand-red" />
          </div>
          <p className="text-3xl font-mono font-bold text-brand-offwhite">
            ₹{totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString() : 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-offwhite">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-brand-red hover:text-red-400 font-bold uppercase tracking-wider">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Order</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Customer</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-zinc-500 text-sm">No recent orders</td>
                  </tr>
                ) : (
                  recentOrders.map(order => (
                    <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                      <td className="p-4 font-mono text-sm text-brand-offwhite">{order.order_number}</td>
                      <td className="p-4 text-sm text-zinc-400">{order.customer_name}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                          order.order_status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                          order.order_status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                          'bg-zinc-800 text-zinc-300'
                        }`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-sm text-brand-offwhite">₹{order.total.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-zinc-900/30 border border-zinc-800">
          <div className="p-6 border-b border-zinc-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-offwhite">Low Stock Alerts</h2>
          </div>
          <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
            {lowStockItems.length === 0 ? (
              <p className="text-zinc-500 text-sm">All inventory levels are looking good.</p>
            ) : (
              lowStockItems.map(item => (
                <div key={item.id} className="flex gap-4 items-center p-3 border border-zinc-800/50 bg-zinc-900/50 rounded-lg">
                  <div className="w-10 h-12 bg-zinc-800 flex-shrink-0">
                    {item.images[0] && <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-brand-offwhite truncate">{item.name}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {Object.entries(item.stock_quantity).map(([size, qty]) => {
                        if (qty > 2) return null;
                        return (
                          <span key={size} className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-950/50 text-red-400 border border-red-900">
                            {size}: {qty}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
