'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { dbService } from '@/lib/db';
import { Product, Category } from '@/types';
import { useCartStore } from '@/lib/cartStore';
import { toast } from '@/lib/toast';

export default function Homepage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function loadData() {
      try {
        const [prods, cats] = await Promise.all([
          dbService.getProducts(),
          dbService.getCategories(),
        ]);
        setFeaturedProducts(prods.filter((p) => p.is_featured).slice(0, 4));
        setCategories(cats.slice(0, 4));
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Pick the first available size in stock, or default to S/M
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
      image: product.images[0] || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800',
      size: defaultSize,
    }, 1);
    
    toast.success(`Added ${product.name} (Size ${defaultSize}) to bag!`);
  };

  return (
    <div className="w-full flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-[80vh] md:h-[90vh] bg-black flex items-center justify-center overflow-hidden border-b border-zinc-900">
        {/* Animated Background Image Grid Overlay */}
        <div className="absolute inset-0 opacity-40 select-none">
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/70 to-transparent z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1600&auto=format&fit=crop&q=80"
            alt="Hero Background"
            className="w-full h-full object-cover scale-105 filter grayscale contrast-125"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl space-y-6">
          <p className="text-brand-red text-xs md:text-sm font-bold uppercase tracking-[0.4em] animate-fade-in">
            NEW DROP / STREETWEAR ARCHIVE
          </p>
          <h1 className="text-5xl md:text-8xl font-black tracking-[0.25em] text-brand-offwhite uppercase select-none drop-shadow-2xl">
            D R F T N
          </h1>
          <p className="text-zinc-400 text-sm md:text-lg tracking-widest uppercase italic font-light">
            &quot;Drift in Style&quot;
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="btn-electric w-full sm:w-auto bg-brand-offwhite text-brand-black hover:bg-brand-red hover:text-brand-offwhite font-bold text-xs uppercase tracking-widest py-4 px-8 rounded shadow-lg transition-all duration-300"
            >
              Shop Collection
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto border border-zinc-800 text-brand-offwhite hover:border-brand-offwhite font-bold text-xs uppercase tracking-widest py-4 px-8 rounded transition-all duration-300"
            >
              The Story
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY GRID */}
      <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <span className="text-brand-red text-xs font-bold uppercase tracking-widest">DRFTN DEPTS</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-wide uppercase text-brand-offwhite mt-1">
              SHOP BY CATEGORY
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-widest text-brand-offwhite hover:text-brand-red transition-colors flex items-center gap-2 group"
          >
            Browse All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative h-64 md:h-80 rounded overflow-hidden border border-zinc-900 bg-zinc-950 flex items-end p-6"
            >
              {/* Bg Image */}
              <div className="absolute inset-0 opacity-60 group-hover:opacity-75 transition-opacity duration-500">
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-transparent"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 w-full">
                <h3 className="text-lg font-bold uppercase tracking-wider text-brand-offwhite group-hover:text-brand-red transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">Explore Dept</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <section className="py-20 px-6 md:px-12 bg-zinc-950/40 border-y border-zinc-900 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-lg mx-auto mb-16 space-y-2">
            <span className="text-brand-red text-xs font-bold uppercase tracking-widest">DRFTN EXCLUSIVES</span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-wide uppercase text-brand-offwhite">
              HOTTEST DROPS
            </h2>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-sm mx-auto">
              Our curated street essentials featuring heavyweight fabric, oversized cuts, and drop-shoulder silhouettes.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-zinc-900 border border-zinc-800 rounded-md"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((prod) => (
                <Link
                  key={prod.id}
                  href={`/shop/${prod.slug}`}
                  className="group flex flex-col h-full border border-zinc-900/60 rounded-md overflow-hidden bg-brand-black/40 hover:border-zinc-800 transition-all duration-300 relative"
                >
                  {/* Image Container */}
                  <div className="aspect-[3/4] bg-zinc-950 relative overflow-hidden">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter grayscale hover:filter-none"
                    />
                    
                    {/* Discount Badge */}
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

                  {/* Product details */}
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
                        ₹{prod.price}
                      </span>
                      {prod.compare_price && (
                        <span className="text-xs text-zinc-600 line-through">
                          ₹{prod.compare_price}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. BRAND STORY SECTION */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <span className="text-brand-red text-xs font-bold uppercase tracking-widest">ABOUT DRFTN</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-wide uppercase text-brand-offwhite leading-tight">
            BORN IN YELAHANKA.<br/>BUILT FOR THE STREETS.
          </h2>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-lg">
            DRFTN CLOTHING is a premium D2C brand that represents the spirit of youth culture in Yelahanka, Bengaluru. Inspired by industrial minimalism and global streetwear, we build apparel that balances durability with a relaxed unisex fit.
          </p>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-lg">
            Every garment we produce is created using curated heavyweight fabrics, drop shoulder tailoring, and bold graphic expressions. We don&apos;t follow trends—we set the drift.
          </p>
          <div className="pt-2">
            <Link
              href="/about"
              className="text-xs font-bold uppercase tracking-widest text-brand-offwhite hover:text-brand-red transition-colors flex items-center gap-2 group"
            >
              Read Our Full Philosophy <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Story Illustration Grid */}
        <div className="grid grid-cols-2 gap-4 h-96">
          <div className="h-full bg-zinc-900 rounded overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=500&auto=format&fit=crop&q=80"
              alt="Streetwear model"
              className="w-full h-full object-cover filter grayscale hover:filter-none transition-all duration-500"
            />
          </div>
          <div className="h-full bg-zinc-900 rounded overflow-hidden mt-6">
            <img
              src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop&q=80"
              alt="Clothing detail"
              className="w-full h-full object-cover filter grayscale hover:filter-none transition-all duration-500"
            />
          </div>
        </div>
      </section>

      {/* 5. INSTAGRAM FEED SECTION */}
      <section className="py-20 px-6 md:px-12 bg-zinc-950/60 border-t border-zinc-900 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 space-y-1">
            <span className="text-brand-red text-xs font-bold uppercase tracking-widest">DRFTN LOOKBOOK</span>
            <h2 className="text-2xl md:text-3xl font-extrabold uppercase text-brand-offwhite">
              DRIFT WITH US ON INSTAGRAM
            </h2>
            <a
              href="https://instagram.com/drftnclothing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 hover:text-brand-red transition-colors font-semibold uppercase tracking-widest block pt-1"
            >
              @drftnclothing
            </a>
          </div>

          {/* 6 Grid Squares */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=400',
              'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400',
              'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?w=400',
              'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
              'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
              'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=400'
            ].map((url, i) => (
              <a
                key={i}
                href="https://instagram.com/drftnclothing"
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square bg-zinc-900 rounded overflow-hidden border border-zinc-900/60 block relative group"
              >
                <img
                  src={url}
                  alt={`Lookbook photo ${i}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter grayscale"
                />
                <div className="absolute inset-0 bg-brand-red/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
