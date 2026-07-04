'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { Product } from '@/types';
import { Plus, Edit2, Trash2, Search, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';
import { useRouter } from 'next/navigation';

export default function AdminProducts() {
  const { addToast } = useToast();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    try {
      const data = await db.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load products', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleProductActive = async (product: Product) => {
    try {
      await db.updateProduct(product.id, { is_active: !product.is_active });
      addToast(`${product.name} is now ${!product.is_active ? 'Active' : 'Draft'}`, 'success');
      fetchProducts();
    } catch (error) {
      addToast('Failed to update product', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await db.deleteProduct(id);
      addToast(`Product "${name}" deleted successfully`, 'success');
      fetchProducts();
    } catch (error) {
      console.error(error);
      addToast('Failed to delete product', 'error');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-widest uppercase text-brand-offwhite">Products</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your catalog, stock levels, and pricing.</p>
        </div>
        <button
          onClick={() => router.push('/admin/products/new')}
          className="bg-brand-red text-white px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="bg-zinc-900/30 border border-zinc-800">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-700 text-brand-offwhite pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-red transition-colors"
            />
          </div>
        </div>

        <div>
          {isLoading ? (
            <div className="p-8 text-center text-zinc-500 text-sm">Loading products...</div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 w-16">Image</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Details</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Price</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Stock by Size</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-zinc-500 text-sm">No products found.</td>
                      </tr>
                    ) : (
                      filteredProducts.map(product => {
                        const totalStock = Object.values(product.stock_quantity).reduce((a, b) => a + b, 0);
                        return (
                          <tr key={product.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                            <td className="p-4">
                              <div className="w-12 h-16 bg-zinc-800 border border-zinc-700">
                                {product.images[0] && (
                                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="text-sm font-bold text-brand-offwhite">{product.name}</p>
                              <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">
                                {product.category} • {product.gender}
                              </p>
                            </td>
                            <td className="p-4">
                              <div className="text-sm font-mono text-brand-offwhite">₹{(product.price / 100).toFixed(2)}</div>
                              {product.compare_price && (
                                <div className="text-xs font-mono text-zinc-500 line-through">₹{(product.compare_price / 100).toFixed(2)}</div>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1 mb-1">
                                {Object.entries(product.stock_quantity).map(([size, qty]) => (
                                  <span key={size} className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                    qty <= 2 ? 'bg-red-950/50 text-red-400 border-red-900' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                  }`}>
                                    {size}:{qty}
                                  </span>
                                ))}
                              </div>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total: {totalStock}</p>
                            </td>
                            <td className="p-4">
                              <button 
                                onClick={() => toggleProductActive(product)}
                                className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
                                product.is_active ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                              }`}>
                                {product.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {product.is_active ? 'Active' : 'Draft'}
                              </button>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                                  className="p-2 text-zinc-400 hover:text-brand-offwhite transition-colors border border-zinc-800 hover:border-zinc-700 rounded bg-zinc-900"
                                  title="Edit Product"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id, product.name)}
                                  className="p-2 text-zinc-400 hover:text-brand-red transition-colors border border-zinc-800 hover:border-zinc-700 rounded bg-zinc-900"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden divide-y divide-zinc-800">
                {filteredProducts.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 text-sm">No products found.</div>
                ) : (
                  filteredProducts.map(product => {
                    const totalStock = Object.values(product.stock_quantity).reduce((a, b) => a + b, 0);
                    return (
                      <div key={product.id} className="p-4 space-y-4">
                        {/* Upper row: Image and details */}
                        <div className="flex gap-4">
                          <div className="w-16 h-20 bg-zinc-800 border border-zinc-700 shrink-0">
                            {product.images[0] && (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-brand-offwhite truncate">{product.name}</h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                              {product.category} • {product.gender}
                            </p>
                            <div className="mt-2 flex items-baseline gap-2">
                              <span className="text-sm font-mono text-brand-offwhite">₹{(product.price / 100).toFixed(2)}</span>
                              {product.compare_price && (
                                <span className="text-xs font-mono text-zinc-500 line-through">₹{(product.compare_price / 100).toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stock quantities by size */}
                        <div className="border-t border-zinc-800/60 pt-3">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1.5">Stock by Size (Total: {totalStock})</span>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(product.stock_quantity).map(([size, qty]) => (
                              <span key={size} className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                                qty <= 2 ? 'bg-red-950/40 text-red-400 border-red-900/60' : 'bg-zinc-900 text-zinc-400 border-zinc-850'
                              }`}>
                                {size}:{qty}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Actions row */}
                        <div className="border-t border-zinc-800/60 pt-3 flex items-center justify-between gap-4">
                          {/* Status */}
                          <button 
                            onClick={() => toggleProductActive(product)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
                            product.is_active ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          }`}>
                            {product.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {product.is_active ? 'Active' : 'Draft'}
                          </button>

                          {/* Edit / Delete Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-offwhite border border-zinc-800 bg-zinc-900 transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-red border border-zinc-800 bg-zinc-900 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
