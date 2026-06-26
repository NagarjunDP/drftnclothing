'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, X, SlidersHorizontal, ShoppingBag } from 'lucide-react';
import { dbService } from '@/lib/db';
import { Product } from '@/types';
import { useCartStore } from '@/lib/cartStore';
import { toast } from '@/lib/toast';
import { ProductGridSkeleton } from '@/components/Skeletons';

// Wrapping the main shop content in a Suspense boundary for search params parsing
export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="py-12 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="h-10 bg-zinc-900 rounded-md w-1/4 mb-6"></div>
        <ProductGridSkeleton count={8} />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number>(3000);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Mobile Filters Toggle
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Synchronize category from URL query parameters
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await dbService.getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Filter and Sort Logic
  useEffect(() => {
    let result = [...products];

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by Gender
    if (selectedGender !== 'all') {
      result = result.filter(
        (p) => p.gender.toLowerCase() === selectedGender.toLowerCase() || p.gender.toLowerCase() === 'unisex'
      );
    }

    // Filter by Size
    if (selectedSize !== 'all') {
      result = result.filter((p) => p.sizes.includes(selectedSize));
    }

    // Filter by Price
    result = result.filter((p) => (p.price / 100) <= priceRange);

    // Sort Logic
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    } else if (sortBy === 'price-low-high') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high-low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'featured') {
      // Show featured first, then fallback to default
      result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, selectedGender, selectedSize, priceRange, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedGender('all');
    setSelectedSize('all');
    setPriceRange(3000);
    setSortBy('featured');
    // Clear URL params
    router.push('/shop');
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const availableSizes = product.sizes.filter(s => (product.stock_quantity[s] || 0) > 0);
    if (availableSizes.length === 0) {
      toast.error('This product is completely sold out!');
      return;
    }

    const defaultSize = availableSizes.includes('M') ? 'M' : availableSizes[0];
    
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compare_price: product.compare_price,
      image: product.images[0] || '',
      size: defaultSize,
    }, 1);
    
    toast.success(`Added ${product.name} (Size ${defaultSize}) to bag!`);
  };

  const categories = ['all', 'tees', 'hoodies', 'joggers', 'accessories'];
  const genders = ['all', 'unisex', 'men', 'women'];
  const sizes = ['all', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="py-12 px-6 md:px-12 max-w-7xl mx-auto w-full flex-1 flex flex-col">
      {/* Title */}
      <div className="border-b border-zinc-900 pb-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-brand-offwhite">
            THE ARCHIVE
          </h1>
          <p className="text-zinc-500 text-xs tracking-wider uppercase mt-1">
            Showing {filteredProducts.length} of {products.length} Items
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-xs uppercase tracking-widest text-zinc-500 font-bold">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs uppercase tracking-widest font-extrabold bg-zinc-950 text-brand-offwhite border border-zinc-900 py-2.5 px-4 rounded-md cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest Drops</option>
            <option value="price-low-high">Price: Low - High</option>
            <option value="price-high-low">Price: High - Low</option>
          </select>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
        {/* FILTERS SIDEBAR (DESKTOP) */}
        <aside className="hidden lg:block space-y-8 pr-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-offwhite flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-red" />
              Filter Collection
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:text-brand-red transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Category */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Category</h4>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs text-left uppercase tracking-wider py-1 hover:text-brand-red transition-colors ${
                    selectedCategory === cat ? 'text-brand-red font-bold' : 'text-zinc-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Gender</h4>
            <div className="flex flex-col gap-2">
              {genders.map((gen) => (
                <button
                  key={gen}
                  onClick={() => setSelectedGender(gen)}
                  className={`text-xs text-left uppercase tracking-wider py-1 hover:text-brand-red transition-colors ${
                    selectedGender === gen ? 'text-brand-red font-bold' : 'text-zinc-500'
                  }`}
                >
                  {gen}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Sizes</h4>
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-9 h-9 text-xs border uppercase font-bold flex items-center justify-center rounded transition-all ${
                    selectedSize === size
                      ? 'border-brand-red bg-brand-red text-brand-offwhite'
                      : 'border-zinc-800 text-zinc-500 hover:border-zinc-500'
                  }`}
                >
                  {size === 'all' ? 'All' : size}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
              <span className="text-zinc-400">Max Price</span>
              <span className="text-brand-offwhite">₹{priceRange}</span>
            </div>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-brand-red bg-zinc-900 border-0 h-1 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
              <span>₹500</span>
              <span>₹3000</span>
            </div>
          </div>
        </aside>

        {/* MOBILE FILTERS TOGGLE */}
        <div className="lg:hidden flex items-center gap-4 mb-6">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 border border-zinc-900 bg-zinc-950 py-3 rounded-md text-xs font-bold uppercase tracking-widest text-brand-offwhite active:bg-zinc-900 transition-colors"
          >
            <Filter className="w-4 h-4 text-brand-red" />
            Filters
          </button>
          {searchParams.toString() || selectedCategory !== 'all' || selectedGender !== 'all' || selectedSize !== 'all' || priceRange !== 3000 ? (
            <button
              onClick={handleResetFilters}
              className="border border-brand-red/30 text-brand-red p-3 rounded-md text-xs font-bold uppercase tracking-widest"
              title="Reset Filters"
            >
              Reset
            </button>
          ) : null}
        </div>

        {/* PRODUCT GRID */}
        <div className="lg:col-span-3 flex-1 flex flex-col justify-between">
          {loading ? (
            <ProductGridSkeleton count={6} />
          ) : filteredProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 space-y-4">
              <ShoppingBag className="w-16 h-16 text-zinc-900 stroke-[1]" />
              <div>
                <h3 className="text-lg font-bold uppercase tracking-wider text-brand-offwhite">
                  No products matched
                </h3>
                <p className="text-zinc-600 text-xs mt-1 max-w-xs mx-auto">
                  Try adjusting your filters, selecting other sizes, or resetting the view.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="btn-electric border border-brand-offwhite text-brand-offwhite font-bold text-xs uppercase tracking-widest py-3.5 px-8 rounded hover:bg-brand-offwhite hover:text-brand-black"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {filteredProducts.map((prod) => (
                <Link
                  key={prod.id}
                  href={`/shop/${prod.slug}`}
                  className="group flex flex-col border border-zinc-900 bg-zinc-950/20 rounded-md overflow-hidden hover:border-zinc-800 transition-all duration-300 relative"
                >
                  {/* Image Container */}
                  <div className="aspect-[3/4] bg-zinc-950 relative overflow-hidden">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter grayscale hover:filter-none"
                    />
                    
                    {/* Sale Badge */}
                    {prod.compare_price && prod.compare_price > prod.price && (
                      <span className="absolute top-3 left-3 bg-brand-red text-brand-offwhite text-[9px] font-bold py-1 px-2.5 rounded tracking-wider uppercase">
                        Sale
                      </span>
                    )}

                    {/* Quick Add Overlay */}
                    <div className="absolute inset-0 bg-brand-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                      <button
                        onClick={(e) => handleQuickAdd(e, prod)}
                        className="w-full bg-brand-offwhite text-brand-black text-[10px] tracking-widest font-extrabold py-3 px-4 rounded hover:bg-brand-red hover:text-brand-offwhite transition-colors duration-200 uppercase"
                      >
                        Quick Add
                      </button>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4 space-y-1 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                        {prod.category}
                      </p>
                      <h3 className="text-sm font-bold text-brand-offwhite tracking-wide uppercase line-clamp-1 group-hover:text-brand-red transition-colors">
                        {prod.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-sm font-bold text-brand-offwhite">
                        ₹{(prod.price / 100).toFixed(2)}
                      </span>
                      {prod.compare_price && (
                        <span className="text-xs text-zinc-600 line-through">
                          ₹{(prod.compare_price / 100).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTERS SIDE DRAWER */}
      {mobileFiltersOpen && (
        <>
          <div
            onClick={() => setMobileFiltersOpen(false)}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity"
          />
          <div className="fixed top-0 bottom-0 left-0 right-0 max-w-sm w-full z-50 bg-brand-black border-r border-zinc-900 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-brand-offwhite flex items-center gap-2">
                  <Filter className="w-4 h-4 text-brand-red" />
                  Filters
                </h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-zinc-500 hover:text-brand-offwhite"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Filter Sections */}
              <div className="space-y-6">
                {/* Category */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Category</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-xs uppercase tracking-wider py-1.5 px-3 border rounded transition-all ${
                          selectedCategory === cat
                            ? 'border-brand-red bg-brand-red/10 text-brand-red font-bold'
                            : 'border-zinc-900 text-zinc-500 bg-zinc-950'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Gender</h4>
                  <div className="flex flex-wrap gap-2">
                    {genders.map((gen) => (
                      <button
                        key={gen}
                        onClick={() => setSelectedGender(gen)}
                        className={`text-xs uppercase tracking-wider py-1.5 px-3 border rounded transition-all ${
                          selectedGender === gen
                            ? 'border-brand-red bg-brand-red/10 text-brand-red font-bold'
                            : 'border-zinc-900 text-zinc-500 bg-zinc-950'
                        }`}
                      >
                        {gen}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Sizes</h4>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-9 h-9 text-xs border uppercase font-bold flex items-center justify-center rounded transition-all ${
                          selectedSize === size
                            ? 'border-brand-red bg-brand-red text-brand-offwhite'
                            : 'border-zinc-900 text-zinc-500 bg-zinc-950'
                        }`}
                      >
                        {size === 'all' ? 'All' : size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                    <span className="text-zinc-400">Max Price</span>
                    <span className="text-brand-offwhite">₹{priceRange}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="3000"
                    step="100"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-brand-red bg-zinc-900 border-0 h-1 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-900 grid grid-cols-2 gap-4 mt-8">
              <button
                onClick={handleResetFilters}
                className="w-full border border-zinc-900 text-zinc-500 py-3 text-xs tracking-widest uppercase font-bold rounded-md hover:text-brand-offwhite"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full bg-brand-offwhite text-brand-black py-3 text-xs tracking-widest uppercase font-bold rounded-md"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
