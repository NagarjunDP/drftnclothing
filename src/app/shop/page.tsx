'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronDown, Search, SlidersHorizontal, Grid3X3, Grid2X2, ArrowUpDown, X, Sparkles, Plus, ShoppingBag } from 'lucide-react';
import { dbService } from '@/lib/db';
import { Product, Category } from '@/types';
import { useCartStore } from '@/lib/cartStore';
import { useAnimationStore } from '@/lib/animationStore';
import { toast } from '@/lib/toast';
import { ProductGridSkeleton } from '@/components/Skeletons';

const CATEGORY_VISUALS: Record<string, { label: string; image: string }> = {
  all: {
    label: 'All Drops',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&q=80',
  },
  't-shirts': {
    label: 'Tees',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=400&fit=crop&q=80',
  },
  shirts: {
    label: 'Shirts',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop&q=80',
  },
  denims: {
    label: 'Denims',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&q=80',
  },
  'formal-pants': {
    label: 'Trousers',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=400&fit=crop&q=80',
  },
  sweatshirts: {
    label: 'Sweats',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&h=400&fit=crop&q=80',
  },
  hoodies: {
    label: 'Hoodies',
    image: 'https://images.unsplash.com/photo-1556821840-47b2c0d5c829?w=400&h=400&fit=crop&q=80',
  },
  jackets: {
    label: 'Jackets',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&q=80',
  },
};

// Suspense boundary for search params
export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="py-16 md:py-24 px-8 md:px-12 max-w-screen-2xl mx-auto w-full">
        <div className="h-10 shimmer w-1/4 mb-10" />
        <ProductGridSkeleton count={8} />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}

/* ─────────────────────────────────────────────────────
   SHOP PRODUCT CARD — logic unchanged, visual upgrade
   ───────────────────────────────────────────────────── */
function ShopProductCard({
  prod,
  onQuickAdd,
  aspectClass = 'aspect-[3/4]'
}: {
  prod: Product;
  onQuickAdd: (e: React.MouseEvent, p: Product) => void;
  aspectClass?: string;
}) {
  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding) return;
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 900);
    onQuickAdd(e, prod);
  };

  return (
    <Link
      href={`/shop/${prod.slug}`}
      className="group flex flex-col product-card"
      aria-label={`View ${prod.name} — ₹${(prod.price / 100).toLocaleString('en-IN')}`}
    >
      {/* Image Container */}
      <div className={`product-card-image bg-brand-graphite relative overflow-hidden ${aspectClass}`}>
        <Image
          src={prod.images[0] || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800'}
          alt={`${prod.name} — ${prod.category} by DRFTN Clothing`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-luxury"
        />
        <div className="product-card-overlay" aria-hidden="true" />

        {/* Sale Badge */}
        {prod.compare_price && prod.compare_price > prod.price && (
          <span className="absolute top-3 left-3 border border-brand-offwhite/30 text-brand-offwhite text-[9px] tracking-[0.2em] font-semibold py-1 px-2.5 uppercase bg-brand-black/60 backdrop-blur-sm z-10">
            Sale
          </span>
        )}

        {/* Corner-Anchored Quick Add */}
        <div className="absolute bottom-3 right-3 z-10">
          <button
            onClick={handleQuickAddClick}
            disabled={isAdding}
            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 shadow-lg group/btn relative ${
              isAdding 
                ? 'bg-brand-red border-brand-red text-white' 
                : 'bg-brand-black/90 border-zinc-800 hover:border-brand-offwhite text-brand-offwhite hover:bg-brand-offwhite hover:text-brand-black'
            } opacity-100 scale-100 md:opacity-0 md:scale-95 group-hover:md:opacity-100 group-hover:md:scale-100`}
            aria-label={`Quick add ${prod.name} to cart`}
          >
            <span className="absolute bottom-12 right-0 bg-brand-black border border-zinc-800 text-brand-offwhite text-[9px] tracking-widest uppercase py-1 px-2 opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
              {isAdding ? 'Added' : 'Quick Add'}
            </span>
            {isAdding ? (
              <span className="text-xs font-bold font-mono">✓</span>
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="pt-3 space-y-1">
        <p className="text-[9px] text-brand-stone uppercase tracking-[0.2em] font-semibold">
          {prod.category}
        </p>
        <h3 className="text-xs font-medium text-brand-offwhite tracking-wide uppercase line-clamp-1 group-hover:text-brand-amber transition-colors duration-200 font-body">
          {prod.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-brand-offwhite font-body">
            ₹{(prod.price / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
          </span>
          {prod.compare_price && prod.compare_price > prod.price && (
            <span className="text-[10px] text-brand-stone line-through">
              ₹{(prod.compare_price / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────────────
   MAIN SHOP CONTENT — all filter/sort/routing logic unchanged
   ───────────────────────────────────────────────────── */
function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);

  // Filter States — all unchanged
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number>(3000);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const lastScrollY = useRef(0);

  const searchQuery = searchParams.get('search') || '';

  // Scroll Position Listener for Sticky/Shrink Header + Directional show/hide matching Navbar
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsSticky(y > 120);

      if (y > lastScrollY.current && y > 80) {
        setHideHeader(true);
      } else {
        setHideHeader(false);
      }
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Synchronize from URL — unchanged
  useEffect(() => {
    const cat = searchParams.get('category');
    setSelectedCategory(cat || 'all');
    const subcat = searchParams.get('subcategory');
    setSelectedSubcategory(subcat || 'all');
  }, [searchParams]);

  // Fetch products & categories — dynamic database load
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prods, cats] = await Promise.all([
          dbService.getProducts(),
          dbService.getCategories()
        ]);
        setProducts(prods);
        setCategoriesList(cats);
      } catch (err) {
        console.error('Failed to load shop page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Category handlers — unchanged
  const handleCategoryChange = (catSlug: string) => {
    setSelectedCategory(catSlug);
    setSelectedSubcategory('all');
    setVisibleCount(12);
    const params = new URLSearchParams(window.location.search);
    if (catSlug === 'all') { params.delete('category'); } else { params.set('category', catSlug); }
    params.delete('subcategory');
    router.push(`/shop?${params.toString()}`);
  };

  const handleSubcategoryChange = (subcatSlug: string) => {
    setSelectedSubcategory(subcatSlug);
    setVisibleCount(12);
    const params = new URLSearchParams(window.location.search);
    if (subcatSlug === 'all') { params.delete('subcategory'); } else { params.set('subcategory', subcatSlug); }
    router.push(`/shop?${params.toString()}`);
  };

  // Filter and Sort Logic — updated with search query support
  useEffect(() => {
    let result = [...products];
    if (selectedCategory !== 'all') result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    if (selectedSubcategory !== 'all') result = result.filter((p) => p.subcategory && p.subcategory.toLowerCase() === selectedSubcategory.toLowerCase());
    if (selectedGender !== 'all') result = result.filter((p) => p.gender.toLowerCase() === selectedGender.toLowerCase() || p.gender.toLowerCase() === 'unisex');
    if (selectedSize !== 'all') result = result.filter((p) => p.sizes.includes(selectedSize));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => 
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q))
      );
    }
    result = result.filter((p) => (p.price / 100) <= priceRange);
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    else if (sortBy === 'price-low-high') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high-low') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'featured') result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    setFilteredProducts(result);
    setVisibleCount(12); // reset visible on filter change
  }, [products, selectedCategory, selectedSubcategory, selectedGender, selectedSize, priceRange, sortBy, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedGender('all');
    setSelectedSize('all');
    setPriceRange(3000);
    setSortBy('featured');
    setVisibleCount(12);
    router.push('/shop');
  };

  // Quick add — logic unchanged
  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const availableSizes = product.sizes.filter(s => (product.stock_quantity[s] || 0) > 0);
    if (availableSizes.length === 0) { toast.error('This product is completely sold out!'); return; }
    const defaultSize = availableSizes.includes('M') ? 'M' : availableSizes[0];
    addItem({
      id: product.id, name: product.name, slug: product.slug, price: product.price,
      compare_price: product.compare_price,
      image: product.images[0] || '', size: defaultSize,
    }, 1);
    let cartEl = document.getElementById('navbar-cart-btn');
    if (!cartEl || cartEl.getBoundingClientRect().width === 0) cartEl = document.getElementById('mobile-cart-trigger');
    if (cartEl) {
      const cartRect = cartEl.getBoundingClientRect();
      const endX = cartRect.left + cartRect.width / 2;
      const endY = cartRect.top + cartRect.height / 2;
      const cardEl = e.currentTarget.closest('.product-card');
      const imgEl = cardEl?.querySelector('img');
      const sourceRect = imgEl ? imgEl.getBoundingClientRect() : e.currentTarget.getBoundingClientRect();
      useAnimationStore.getState().addFlyingItem({
        imageUrl: product.images[0] || '',
        start: { x: sourceRect.left + sourceRect.width / 2, y: sourceRect.top + sourceRect.height / 2 },
        end: { x: endX, y: endY },
      });
    } else {
      useAnimationStore.getState().triggerCartPulse();
    }
    toast.cartSuccess(product.name, product.images[0] || '');
  };

  const MAIN_CATEGORIES = [
    { slug: 'all', label: 'All' },
    ...categoriesList
      .filter((c) => !c.parent_id && c.is_active)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      .map((c) => ({ slug: c.slug, label: c.name }))
  ];

  const SUBCATEGORIES = categoriesList.reduce((acc, cat) => {
    if (cat.parent_id) {
      const parent = categoriesList.find((p) => p.id === cat.parent_id);
      if (parent) {
        const parentSlug = parent.slug;
        if (!acc[parentSlug]) acc[parentSlug] = [];
        acc[parentSlug].push({ slug: cat.slug, label: cat.name });
      }
    }
    return acc;
  }, {} as Record<string, Array<{ slug: string; label: string }>>);

  const genders = ['all', 'unisex', 'men', 'women'];
  const sizes = ['all', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Count active filters (for the mobile badge)
  const activeFilterCount = [
    selectedCategory !== 'all',
    selectedSubcategory !== 'all',
    selectedGender !== 'all',
    selectedSize !== 'all',
    priceRange !== 3000,
    sortBy !== 'featured',
  ].filter(Boolean).length;

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <div className="w-full flex flex-col">
      {/* ── Page Header ── */}
      <div className="border-b border-brand-graphite bg-brand-black">
        <div className="max-w-screen-2xl mx-auto px-8 md:px-12 pt-16 pb-12">
          <span className="eyebrow mb-3 block">The Archive</span>
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-brand-offwhite leading-none font-display uppercase" style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)' }}>
              Collection
            </h1>
            <p className="text-brand-stone text-[10px] tracking-[0.2em] uppercase font-body font-semibold mb-1 shrink-0">
              {loading ? '—' : `${filteredProducts.length} Items`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Sticky Category Pill Bar ── */}
      <div className={`sticky transition-all duration-500 ease-in-out z-40 bg-brand-black/95 backdrop-blur-md border-b border-brand-graphite ${hideHeader ? 'top-0' : 'top-16'}`}>
        <div className={`max-w-screen-2xl mx-auto px-8 md:px-12 transition-all duration-300 ease-in-out ${isSticky ? 'py-1.5' : 'py-3'}`}>
          
          {/* Main Controls Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Category horizontal scroll container */}
            <div className="w-full overflow-x-auto scrollbar-none py-1.5">
              {/* Unified Visual Story-Style Capsule Cards — shrinks smoothly when sticky, renders in color on all viewports */}
              <div className="flex gap-3.5 pb-px px-1 justify-start md:justify-center" role="tablist" aria-label="Filter by category">
                {MAIN_CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.slug;
                  const dbCat = categoriesList.find((c) => c.slug === cat.slug);
                  const visual = dbCat?.image_url
                    ? { label: dbCat.name, image: dbCat.image_url }
                    : CATEGORY_VISUALS[cat.slug] || CATEGORY_VISUALS['all'];
                  return (
                    <div key={cat.slug} className="flex flex-col items-center shrink-0">
                      <button
                        onClick={() => handleCategoryChange(cat.slug)}
                        role="tab"
                        aria-selected={isActive}
                        className={`group relative overflow-hidden aspect-square border transition-all duration-300 ease-in-out rounded-full ${
                          isSticky
                            ? 'w-12 h-12 md:w-14 md:h-14'
                            : 'w-[72px] h-[72px] md:w-[86px] md:h-[86px]'
                        } ${
                          isActive
                            ? 'border-brand-amberLight bg-brand-amberLight/10 scale-105 shadow-[0_0_12px_rgba(232,228,220,0.15)]'
                            : 'border-brand-graphite bg-brand-charcoal/40 hover:border-brand-stone'
                        }`}
                      >
                        {/* Background Visual Image (Grayscale filter removed, colorized) */}
                        <div className="absolute inset-0 z-[1] transition-transform duration-500 group-hover:scale-110">
                          <Image
                            src={visual.image || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&q=80'}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 72px, 86px"
                            className="object-cover filter brightness-[0.55] transition-all duration-300 group-hover:brightness-[0.7]"
                          />
                          <div className="absolute inset-0 bg-brand-black/10" aria-hidden="true" />
                        </div>

                        {/* Active indicator dot */}
                        {isActive && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-amberLight z-10 animate-fade-in" aria-hidden="true" />
                        )}

                        {/* Subcategory alert badge */}
                        {isActive && selectedSubcategory !== 'all' && (
                          <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-brand-amberLight z-10 animate-fade-in" aria-hidden="true" />
                        )}
                      </button>

                      {/* Overlaid Label text — below the circle, hides smoothly when sticky */}
                      {!isSticky && (
                        <span className={`mt-2.5 font-bold tracking-[0.16em] uppercase text-center px-1 font-body leading-none text-[8.5px] md:text-[9.5px] transition-colors ${
                          isActive ? 'text-brand-offwhite' : 'text-brand-stone'
                        }`}>
                          {visual.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop Only Sort + Reset triggers */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <label htmlFor="sort-select" className="sr-only">Sort products by</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-[10px] uppercase tracking-[0.15em] font-bold bg-brand-graphite text-brand-silver border border-brand-muted py-2 px-3 cursor-pointer focus:border-brand-amber"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low-high">Price ↑</option>
                <option value="price-high-low">Price ↓</option>
              </select>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-brand-amber hover:text-brand-offwhite transition-colors border border-brand-amber/30 px-3 py-2"
                  aria-label="Reset all filters"
                >
                  <X className="w-3 h-3" aria-hidden="true" /> Reset ({activeFilterCount})
                </button>
              )}
            </div>

            {/* Mobile Only: Small Filter & Sort button positioned below the visual bubbles row */}
            <div className={`flex md:hidden items-center justify-between gap-2 border-t border-brand-graphite/35 transition-all duration-300 ease-in-out ${
              isSticky ? 'pt-1.5 pb-0.5 mt-0.5' : 'pt-3 pb-1 mt-1'
            } w-full`}>
              <span className="text-[9px] uppercase tracking-[0.2em] text-brand-stone font-bold font-body">
                {filteredProducts.length} Pieces Found
              </span>
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-brand-stone hover:text-brand-offwhite border border-brand-graphite px-3.5 py-1.5 bg-brand-charcoal/20 relative font-body animate-scale-in"
                aria-label={`Filters and sort${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
                aria-expanded={mobileFiltersOpen}
              >
                <SlidersHorizontal className="w-3 h-3 text-brand-stone" aria-hidden="true" />
                Filter & Sort
                {activeFilterCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 bg-brand-amber text-brand-black text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center leading-none"
                    aria-label={`${activeFilterCount} filters active`}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Subcategory pills (shows when a category with subcats is selected) */}
          {selectedCategory !== 'all' && SUBCATEGORIES[selectedCategory] && (
            <div className="flex gap-2 overflow-x-auto scrollbar-none pt-2 pb-px mt-1">
              <button
                onClick={() => handleSubcategoryChange('all')}
                className={`filter-pill shrink-0 text-[9px] ${selectedSubcategory === 'all' ? 'active' : ''}`}
              >
                All {MAIN_CATEGORIES.find(c => c.slug === selectedCategory)?.label}
              </button>
              {SUBCATEGORIES[selectedCategory].map((sub) => (
                <button
                  key={sub.slug}
                  onClick={() => handleSubcategoryChange(sub.slug)}
                  className={`filter-pill shrink-0 text-[9px] ${selectedSubcategory === sub.slug ? 'active' : ''}`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="max-w-screen-2xl mx-auto px-8 md:px-12 py-16 md:py-24 w-full flex-1">
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : filteredProducts.length === 0 ? (
          /* Empty state — proper, editorial design */
          <div className="flex flex-col items-center justify-center text-center py-24 space-y-6" role="status" aria-live="polite">
            <div className="w-16 h-16 border border-brand-graphite flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-brand-muted stroke-[1]" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-display uppercase tracking-wider text-brand-offwhite">
                No Pieces Found
              </h2>
              <p className="text-brand-stone text-xs tracking-wider uppercase max-w-xs mx-auto font-body">
                {activeFilterCount > 0
                  ? 'No products match your current filters. Try adjusting or resetting.'
                  : 'New drops are coming. Check back soon.'}
              </p>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="btn-outline text-[10px] py-3 px-8 tracking-widest"
              >
                Reset All Filters
              </button>
            )}
            <Link href="/" className="text-[10px] tracking-[0.2em] uppercase text-brand-stone hover:text-brand-offwhite transition-colors font-body border-animate pb-0.5">
              Return Home
            </Link>
          </div>
        ) : (
          <>
            {/* Product grid: 2-col mobile, 3-col tablet, 4-col desktop */}
            <div
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 lg:gap-8"
              role="list"
              aria-label={`${filteredProducts.length} products`}
            >
              {visibleProducts.map((prod) => (
                <div key={prod.id} role="listitem">
                  <ShopProductCard
                    prod={prod}
                    onQuickAdd={handleQuickAdd}
                    aspectClass="aspect-[3/4]"
                  />
                </div>
              ))}
            </div>

            {/* Load More */}
            {visibleCount < filteredProducts.length && (
              <div className="text-center mt-14">
                <p className="text-brand-stone text-[10px] tracking-[0.2em] uppercase font-body mb-4">
                  Showing {visibleCount} of {filteredProducts.length}
                </p>
                <button
                  onClick={() => setVisibleCount(c => c + 12)}
                  className="btn-outline py-3.5 px-12 text-[10px] tracking-[0.2em]"
                  aria-label={`Load more products, currently showing ${visibleCount} of ${filteredProducts.length}`}
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Mobile Filter Bottom-Sheet Drawer ── */}
      <div
        className={`filter-drawer-backdrop ${mobileFiltersOpen ? 'open' : ''}`}
        onClick={() => setMobileFiltersOpen(false)}
        aria-hidden="true"
      />
      <div
        className={`filter-drawer ${mobileFiltersOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filters and sort"
        id="mobile-filter-drawer"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-brand-muted" aria-hidden="true" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-graphite">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-offwhite font-display flex items-center gap-2">
            Filter & Sort
            {activeFilterCount > 0 && (
              <span className="text-[10px] font-body bg-brand-amber text-brand-black px-1.5 py-0.5 rounded font-black">
                {activeFilterCount} active
              </span>
            )}
          </h2>
          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="p-1 text-brand-stone hover:text-brand-offwhite transition-colors"
            aria-label="Close filter drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Sections */}
        <div className="px-5 py-5 space-y-7">
          {/* Sort */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-stone">Sort By</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'featured', label: 'Featured' },
                { value: 'newest', label: 'Newest' },
                { value: 'price-low-high', label: 'Price ↑' },
                { value: 'price-high-low', label: 'Price ↓' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`filter-pill justify-center py-2.5 ${sortBy === opt.value ? 'active' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-stone">Category</h3>
            <div className="flex flex-wrap gap-2">
              {MAIN_CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`filter-pill ${selectedCategory === cat.slug ? 'active' : ''}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {selectedCategory !== 'all' && SUBCATEGORIES[selectedCategory] && (
              <div className="flex flex-wrap gap-2 pl-2 pt-1 border-l border-brand-amber/20">
                <button
                  onClick={() => handleSubcategoryChange('all')}
                  className={`filter-pill text-[9px] ${selectedSubcategory === 'all' ? 'active' : ''}`}
                >
                  All
                </button>
                {SUBCATEGORIES[selectedCategory].map((sub) => (
                  <button
                    key={sub.slug}
                    onClick={() => handleSubcategoryChange(sub.slug)}
                    className={`filter-pill text-[9px] ${selectedSubcategory === sub.slug ? 'active' : ''}`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-stone">Gender</h3>
            <div className="flex flex-wrap gap-2">
              {genders.map((gen) => (
                <button
                  key={gen}
                  onClick={() => setSelectedGender(gen)}
                  className={`filter-pill ${selectedGender === gen ? 'active' : ''}`}
                >
                  {gen}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-stone">Size</h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-10 h-10 text-[10px] border uppercase font-bold flex items-center justify-center transition-all ${
                    selectedSize === size
                      ? 'border-brand-amber bg-brand-amber/10 text-brand-offwhite'
                      : 'border-brand-muted text-brand-stone hover:border-brand-stone'
                  }`}
                  aria-pressed={selectedSize === size}
                >
                  {size === 'all' ? 'All' : size}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-stone">Max Price</h3>
              <span className="text-xs font-bold text-brand-offwhite">₹{priceRange}</span>
            </div>
            <label htmlFor="mobile-price-range" className="sr-only">Maximum price: ₹{priceRange}</label>
            <input
              id="mobile-price-range"
              type="range"
              min="500"
              max="3000"
              step="100"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-brand-amber bg-brand-graphite border-0 h-1 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-brand-stone font-bold uppercase tracking-widest">
              <span>₹500</span><span>₹3000</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-brand-graphite grid grid-cols-2 gap-3">
          <button
            onClick={handleResetFilters}
            className="btn-outline py-3 text-[10px] tracking-widest"
          >
            Reset All
          </button>
          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="btn-primary py-3 text-[10px] tracking-widest"
          >
            <span>View {filteredProducts.length} Items</span>
          </button>
        </div>
      </div>
    </div>
  );
}
