'use client';

import React, { useEffect, useState } from 'react';
import { dbService as db } from '@/lib/db';
import { Category } from '@/types';
import { Plus, Edit2, Trash2, Search, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';
import { useRouter } from 'next/navigation';

export default function AdminCategories() {
  const { addToast } = useToast();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategories = async () => {
    try {
      const data = await db.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load categories', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCategoryActive = async (category: Category) => {
    try {
      await db.updateCategory(category.id, { is_active: !category.is_active });
      addToast(`${category.name} is now ${!category.is_active ? 'Active' : 'Draft'}`, 'success');
      fetchCategories();
    } catch (error) {
      addToast('Failed to update category', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await db.deleteCategory(id);
      addToast(`Category "${name}" deleted successfully`, 'success');
      fetchCategories();
    } catch (error) {
      console.error(error);
      addToast('Failed to delete category', 'error');
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-widest uppercase text-brand-offwhite">Categories</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage product categories and collections.</p>
        </div>
        <button
          onClick={() => router.push('/admin/categories/new')}
          className="bg-brand-red text-white px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="bg-zinc-900/30 border border-zinc-800">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-700 text-brand-offwhite pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-brand-red transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-zinc-500 text-sm">Loading categories...</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 w-16">Image</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Details</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Order</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Status</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500 text-sm">No categories found.</td>
                  </tr>
                ) : (
                  filteredCategories.map(category => (
                    <tr key={category.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                      <td className="p-4">
                        <div className="w-16 h-12 bg-zinc-800 border border-zinc-700 overflow-hidden rounded">
                          {category.image_url ? (
                            <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-bold uppercase">No Img</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-bold text-brand-offwhite">{category.name}</p>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1 font-mono">
                          /{category.slug}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-mono text-zinc-400">
                          {(category as any).display_order || 0}
                        </span>
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => toggleCategoryActive(category)}
                          className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
                          category.is_active ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}>
                          {category.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {category.is_active ? 'Active' : 'Draft'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => router.push(`/admin/categories/${category.id}/edit`)}
                            className="p-2 text-zinc-400 hover:text-brand-offwhite transition-colors border border-zinc-800 hover:border-zinc-700 rounded bg-zinc-900"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id, category.name)}
                            className="p-2 text-zinc-400 hover:text-brand-red transition-colors border border-zinc-800 hover:border-zinc-700 rounded bg-zinc-900"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
