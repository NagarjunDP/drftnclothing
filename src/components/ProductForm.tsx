'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { ArrowLeft, Trash2, ArrowLeftRight, Upload, Sparkles, MoveLeft, MoveRight } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';

interface ProductFormProps {
  initialData?: Product | null;
  mode: 'create' | 'edit';
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
const CATEGORIES = ['tees', 'hoodies', 'joggers', 'accessories'] as const;
const GENDERS = ['unisex', 'men', 'women'] as const;

export default function ProductForm({ initialData, mode }: ProductFormProps) {
  const { addToast } = useToast();
  const router = useRouter();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(''); // in Rupees (e.g., 1299)
  const [comparePrice, setComparePrice] = useState(''); // in Rupees
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('tees');
  const [gender, setGender] = useState<typeof GENDERS[number]>('unisex');
  const [images, setImages] = useState<string[]>([]);
  const [activeSizes, setActiveSizes] = useState<string[]>(['S', 'M', 'L']);
  const [stock, setStock] = useState<Record<string, number>>({
    XS: 0,
    S: 10,
    M: 10,
    L: 10,
    XL: 0,
    XXL: 0,
  });
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Pre-populate if editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSlug(initialData.slug);
      setDescription(initialData.description || '');
      setPrice((initialData.price / 100).toString());
      setComparePrice(initialData.compare_price ? (initialData.compare_price / 100).toString() : '');
      setCategory(initialData.category as any);
      setGender(initialData.gender as any);
      setImages(initialData.images || []);
      setActiveSizes(initialData.sizes || []);
      
      const initialStock = { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
      if (initialData.stock_quantity) {
        Object.keys(initialData.stock_quantity).forEach((size) => {
          initialStock[size as keyof typeof initialStock] = Number(initialData.stock_quantity[size]);
        });
      }
      setStock(initialStock);
      setIsFeatured(initialData.is_featured);
      setIsActive(initialData.is_active);
    }
  }, [initialData]);

  // Auto-slugify name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (mode === 'create') {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSlugBlur = () => {
    const cleaned = slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(cleaned);
  };

  const toggleSize = (size: string) => {
    setActiveSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleStockChange = (size: string, value: number) => {
    setStock((prev) => ({
      ...prev,
      [size]: Math.max(0, value),
    }));
  };

  // Image Upload handler calling direct signed upload to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      addToast('Cloudinary is not configured. (Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME env)', 'error');
      setIsUploading(false);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const timestamp = Math.round(new Date().getTime() / 1000);
      const folder = 'drftn-products';

      try {
        // Fetch signature from secure backend
        const signRes = await fetch('/api/admin/cloudinary-sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            params: { timestamp, folder }
          })
        });

        if (!signRes.ok) {
          throw new Error('Failed to fetch upload signature');
        }

        const signData = await signRes.json();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', signData.apiKey);
        formData.append('timestamp', String(timestamp));
        formData.append('signature', signData.signature);
        formData.append('folder', folder);

        // Post directly to Cloudinary
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Cloudinary response error');
        }

        const uploadData = await uploadRes.json();
        // Apply Cloudinary transformations for format and quality optimizations
        const optimizedUrl = uploadData.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
        uploadedUrls.push(optimizedUrl);
      } catch (err) {
        console.error(err);
        addToast(`Failed to upload "${file.name}"`, 'error');
      }
    }

    if (uploadedUrls.length > 0) {
      setImages((prev) => [...prev, ...uploadedUrls]);
      addToast(`${uploadedUrls.length} image(s) uploaded successfully`, 'success');
    }
    setIsUploading(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    const reordered = [...images];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    setImages(reordered);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return addToast('Product name is required', 'error');
    if (!slug.trim()) return addToast('Product slug is required', 'error');
    if (!description.trim()) return addToast('Product description is required', 'error');
    if (!price || isNaN(Number(price))) return addToast('Valid product price is required', 'error');
    if (images.length === 0) return addToast('Please upload at least one product image', 'error');
    if (activeSizes.length === 0) return addToast('Please select at least one active size', 'error');

    setIsSaving(true);

    try {
      // Build stock record based on active sizes, default 0 for inactive
      const finalStock: Record<string, number> = {};
      AVAILABLE_SIZES.forEach((size) => {
        finalStock[size] = activeSizes.includes(size) ? (stock[size] || 0) : 0;
      });

      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        price: Math.round(Number(price) * 100), // convert to paise
        compare_price: comparePrice ? Math.round(Number(comparePrice) * 100) : undefined, // convert to paise
        category,
        gender,
        images,
        sizes: activeSizes,
        stock_quantity: finalStock,
        is_featured: isFeatured,
        is_active: isActive,
      };

      if (mode === 'create') {
        await db.createProduct(payload as any);
        addToast('Product created successfully', 'success');
      } else {
        if (!initialData?.id) throw new Error('Missing product ID for updates');
        await db.updateProduct(initialData.id, payload as any);
        addToast('Product updated successfully', 'success');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      console.error(err);
      addToast(mode === 'create' ? 'Failed to create product' : 'Failed to update product', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl animate-fade-in pb-16">
      
      {/* Header back */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="p-2 border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-brand-offwhite rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-widest uppercase text-brand-offwhite">
            {mode === 'create' ? 'New Product' : 'Edit Product'}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {mode === 'create' ? 'Create a new streetwear piece.' : `Modify details for ${initialData?.name || 'product'}.`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Basic Form Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Info */}
          <div className="bg-zinc-900/30 border border-zinc-800 p-6 md:p-8 space-y-6">
            <h2 className="text-sm font-bold text-brand-offwhite uppercase tracking-widest border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-red" />
              General Details
            </h2>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">Product Name</label>
              <input
                type="text"
                placeholder="e.g. Essential Black Tee"
                value={name}
                onChange={handleNameChange}
                className="w-full bg-zinc-950 border border-zinc-800 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">Slug URL path</label>
              <input
                type="text"
                placeholder="e.g. essential-black-tee"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                onBlur={handleSlugBlur}
                className="w-full bg-zinc-950 border border-zinc-800 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">Description</label>
              <textarea
                placeholder="Describe the product fit, fabric weight (e.g. 240 GSM heavy cotton), design aesthetic, details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full bg-zinc-950 border border-zinc-800 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors resize-none leading-relaxed"
                required
              />
            </div>
          </div>

          {/* Sizing & Stock */}
          <div className="bg-zinc-900/30 border border-zinc-800 p-6 md:p-8 space-y-6">
            <h2 className="text-sm font-bold text-brand-offwhite uppercase tracking-widest border-b border-zinc-800 pb-3">
              Sizes & Inventory Levels
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">Select Active Sizes</span>
                <div className="flex flex-wrap gap-3">
                  {AVAILABLE_SIZES.map((size) => {
                    const isActiveSize = activeSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`w-12 h-12 font-mono font-bold text-xs border uppercase tracking-wider flex items-center justify-center transition-all ${
                          isActiveSize
                            ? 'bg-brand-offwhite text-brand-black border-brand-offwhite'
                            : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:border-zinc-700 hover:text-brand-offwhite'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeSizes.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-zinc-900/60">
                  <span className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">Quantities in Stock</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {activeSizes.map((size) => (
                      <div key={size} className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Size {size} Qty</label>
                        <input
                          type="number"
                          value={stock[size] ?? 0}
                          onChange={(e) => handleStockChange(size, parseInt(e.target.value) || 0)}
                          className="w-full bg-zinc-950 border border-zinc-800 text-brand-offwhite px-3 py-2 text-sm focus:outline-none focus:border-brand-red font-mono"
                          min="0"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cloudinary Image Uploader */}
          <div className="bg-zinc-900/30 border border-zinc-800 p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-brand-offwhite uppercase tracking-widest">Product Media</h2>
              <p className="text-xs text-zinc-500 mt-1">Upload multiple product images. First image is used as main thumbnail.</p>
            </div>

            <div className="space-y-6">
              {/* Drop area */}
              <label className="border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/20 hover:bg-zinc-950/40 p-8 text-center rounded-lg cursor-pointer flex flex-col items-center justify-center gap-2 group transition-all duration-300">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <Upload className="w-8 h-8 text-zinc-500 group-hover:text-brand-red transition-colors" />
                <span className="text-xs font-bold uppercase tracking-wider text-brand-offwhite">
                  {isUploading ? 'Uploading to Cloudinary...' : 'Select streetwear images'}
                </span>
                <span className="text-[10px] text-zinc-500">Drag & drop files or click to browse</span>
              </label>

              {/* Preview List */}
              {images.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">Uploaded Images ({images.length})</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {images.map((url, idx) => (
                      <div key={url} className="relative aspect-[3/4] bg-zinc-950 border border-zinc-800 group rounded-md overflow-hidden">
                        <img src={url} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                        
                        {/* Indicators & controls */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="p-1.5 bg-brand-black/80 hover:bg-brand-red text-zinc-400 hover:text-white rounded transition-colors"
                              title="Delete Image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400">
                            <span>{idx === 0 ? 'COVER' : `#${idx + 1}`}</span>
                            <div className="flex gap-1">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(idx, 'left')}
                                  className="p-1 bg-brand-black/80 hover:bg-brand-offwhite hover:text-brand-black rounded transition-colors"
                                  title="Move Left"
                                >
                                  <MoveLeft className="w-3 h-3" />
                                </button>
                              )}
                              {idx < images.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => moveImage(idx, 'right')}
                                  className="p-1 bg-brand-black/80 hover:bg-brand-offwhite hover:text-brand-black rounded transition-colors"
                                  title="Move Right"
                                >
                                  <MoveRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Attributes, Publishing, and Pricing details */}
        <div className="space-y-6">
          
          {/* Pricing */}
          <div className="bg-zinc-900/30 border border-zinc-800 p-6 md:p-8 space-y-6">
            <h2 className="text-sm font-bold text-brand-offwhite uppercase tracking-widest border-b border-zinc-800 pb-3">
              Pricing Details
            </h2>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block font-mono">Retail Price (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold font-mono text-zinc-400 text-sm">₹</span>
                <input
                  type="number"
                  placeholder="e.g. 1299"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-brand-offwhite pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors font-mono"
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block font-mono">Compare Price (₹ MRP)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold font-mono text-zinc-400 text-sm">₹</span>
                <input
                  type="number"
                  placeholder="e.g. 1999"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-brand-offwhite pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors font-mono"
                  min="0"
                />
              </div>
              <p className="text-[10px] text-zinc-600 leading-normal">
                Strikethrough price. Leave blank if the product is not on discount.
              </p>
            </div>
          </div>

          {/* Classification */}
          <div className="bg-zinc-900/30 border border-zinc-800 p-6 md:p-8 space-y-6">
            <h2 className="text-sm font-bold text-brand-offwhite uppercase tracking-widest border-b border-zinc-800 pb-3">
              Classification
            </h2>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors uppercase tracking-wider font-bold"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">Gender targeting</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors uppercase tracking-wider font-bold"
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Visibility Controls */}
          <div className="bg-zinc-900/30 border border-zinc-800 p-6 md:p-8 space-y-4">
            <h2 className="text-sm font-bold text-brand-offwhite uppercase tracking-widest border-b border-zinc-800 pb-3 mb-2">
              Publishing Options
            </h2>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs uppercase font-bold text-brand-offwhite">Featured piece</span>
                <p className="text-[10px] text-zinc-500">Show on homepage featured rows</p>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-zinc-850 bg-zinc-950 text-brand-red focus:ring-brand-red w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60">
              <div className="space-y-0.5">
                <span className="text-xs uppercase font-bold text-brand-offwhite">Is Active</span>
                <p className="text-[10px] text-zinc-500">Make visible to consumers immediately</p>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-zinc-850 bg-zinc-950 text-brand-red focus:ring-brand-red w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-brand-red hover:bg-brand-red/90 text-white font-extrabold uppercase tracking-widest text-xs py-4 px-6 rounded shadow-lg shadow-brand-red/25 disabled:opacity-50 transition-all duration-300"
          >
            {isSaving ? 'Saving Piece...' : mode === 'create' ? 'Publish Piece' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
