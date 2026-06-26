'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Plus, Minus, ShoppingBag, CreditCard, Ruler, Info, X } from 'lucide-react';
import { dbService } from '@/lib/db';
import { Product } from '@/types';
import { useCartStore } from '@/lib/cartStore';
import { toast } from '@/lib/toast';
import { ProductDetailSkeleton } from '@/components/Skeletons';

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const router = useRouter();
  const slug = params.slug;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Gallery & Detail State
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'details' | 'shipping' | 'returns'>('details');
  const [sizeChartOpen, setSizeChartOpen] = useState<boolean>(false);

  // Cart operations
  const addItem = useCartStore((state) => state.addItem);

  // Load product data
  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const prod = await dbService.getProductBySlug(slug);
        if (!prod) {
          setProduct(null);
          return;
        }
        setProduct(prod);
        setActiveImage(prod.images[0] || '');

        // Fetch related products
        const allProds = await dbService.getProducts();
        const related = allProds
          .filter((p) => p.category === prod.category && p.id !== prod.id)
          .slice(0, 4);
        setRelatedProducts(related);
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-12 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-6 space-y-4">
        <Info className="w-16 h-16 text-brand-red stroke-[1]" />
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-brand-offwhite">PRODUCT NOT FOUND</h2>
          <p className="text-zinc-500 text-xs mt-1">This drop might have ended or is currently archived.</p>
        </div>
        <Link
          href="/shop"
          className="btn-electric bg-brand-offwhite text-brand-black font-bold text-xs tracking-widest uppercase py-3.5 px-8 rounded shadow"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  // Stock check helpers
  const getStockForSize = (size: string) => {
    return product.stock_quantity[size] || 0;
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size first!');
      return;
    }

    const stock = getStockForSize(selectedSize);
    if (stock <= 0) {
      toast.error(`Size ${selectedSize} is out of stock!`);
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compare_price: product.compare_price,
      image: product.images[0] || '',
      size: selectedSize,
    }, quantity);

    toast.success(`Added ${quantity} x ${product.name} (Size ${selectedSize}) to bag!`);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error('Please select a size first!');
      return;
    }

    const stock = getStockForSize(selectedSize);
    if (stock <= 0) {
      toast.error(`Size ${selectedSize} is out of stock!`);
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compare_price: product.compare_price,
      image: product.images[0] || '',
      size: selectedSize,
    }, quantity);

    router.push('/checkout');
  };

  return (
    <div className="py-8 md:py-12 px-6 md:px-12 max-w-7xl mx-auto w-full flex-1 flex flex-col">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-8">
        <Link href="/" className="hover:text-brand-offwhite">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/shop" className="hover:text-brand-offwhite">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-400 line-clamp-1">{product.name}</span>
      </div>

      {/* Main product columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-20">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          {/* Main frame */}
          <div className="aspect-[3/4] bg-zinc-950 rounded-md overflow-hidden border border-zinc-900/60 relative group">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover select-none transition-transform duration-500 hover:scale-110"
            />
            {product.compare_price && product.compare_price > product.price && (
              <span className="absolute top-4 left-4 bg-brand-red text-brand-offwhite text-[10px] font-bold py-1 px-3 rounded uppercase tracking-wider">
                Sale
              </span>
            )}
          </div>
          {/* Thumbnails row */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2.5">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square bg-zinc-950 rounded border overflow-hidden transition-all ${
                    activeImage === img ? 'border-brand-red' : 'border-zinc-900/60 hover:border-zinc-700'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover filter grayscale hover:filter-none" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info Details */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-xs text-brand-red font-bold uppercase tracking-[0.2em]">{product.category}</span>
              <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-wide text-brand-offwhite mt-1">
                {product.name}
              </h1>
            </div>

            {/* Pricing */}
            <div className="flex items-center gap-3">
              <span className="text-xl md:text-2xl font-black text-brand-offwhite">₹{(product.price / 100).toFixed(2)}</span>
              {product.compare_price && (
                <span className="text-sm md:text-base text-zinc-500 line-through">₹{(product.compare_price / 100).toFixed(2)}</span>
              )}
            </div>

            <div className="border-t border-zinc-900 my-4"></div>

            {/* Description Summary */}
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-6 pt-4">
            {/* Size Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-zinc-400">Select Size:</span>
                <button
                  onClick={() => setSizeChartOpen(true)}
                  className="text-brand-offwhite hover:text-brand-red transition-colors flex items-center gap-1.5"
                >
                  <Ruler className="w-3.5 h-3.5 text-brand-red" />
                  Sizing Guide
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const stock = getStockForSize(size);
                  const isOutOfStock = stock <= 0;

                  return (
                    <button
                      key={size}
                      disabled={isOutOfStock}
                      onClick={() => {
                        setSelectedSize(size);
                        setQuantity(1);
                      }}
                      className={`min-w-[3rem] h-12 px-3 text-xs border uppercase font-extrabold flex items-center justify-center rounded transition-all relative ${
                        isOutOfStock
                          ? 'border-zinc-900 text-zinc-700 bg-zinc-950 cursor-not-allowed line-through'
                          : selectedSize === size
                          ? 'border-brand-red bg-brand-red text-brand-offwhite shadow-lg shadow-brand-red/10'
                          : 'border-zinc-800 text-brand-offwhite hover:border-zinc-500'
                      }`}
                    >
                      {size}
                      {stock > 0 && stock <= 3 && (
                        <span className="absolute -top-1.5 -right-1 bg-brand-red text-[8px] text-brand-offwhite px-1 rounded scale-90">
                          {stock}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity selector */}
            {selectedSize && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Quantity</span>
                <div className="flex items-center border border-zinc-800 rounded bg-zinc-950 max-w-[120px]">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="p-2.5 text-zinc-500 hover:text-brand-offwhite disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs px-2 text-brand-offwhite font-bold flex-1 text-center select-none">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= getStockForSize(selectedSize)}
                    onClick={() => setQuantity((prev) => Math.min(getStockForSize(selectedSize), prev + 1))}
                    className="p-2.5 text-zinc-500 hover:text-brand-offwhite disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Actions Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="btn-electric flex-1 flex items-center justify-center gap-2.5 bg-brand-offwhite text-brand-black hover:bg-brand-red hover:text-brand-offwhite font-bold text-xs uppercase tracking-widest py-4 px-6 rounded shadow-lg transition-all duration-300"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Bag
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-2.5 border border-zinc-800 hover:border-brand-offwhite text-brand-offwhite font-bold text-xs uppercase tracking-widest py-4 px-6 rounded transition-all duration-300"
              >
                <CreditCard className="w-4 h-4 text-brand-red" />
                Buy It Now
              </button>
            </div>
          </div>

          {/* Description Tabs */}
          <div className="pt-8 border-t border-zinc-900">
            {/* Tabs Headers */}
            <div className="flex border-b border-zinc-900 mb-4 text-xs font-bold uppercase tracking-widest">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2 pr-6 border-b-2 transition-colors ${
                  activeTab === 'details' ? 'border-brand-red text-brand-offwhite' : 'border-transparent text-zinc-500 hover:text-brand-offwhite'
                }`}
              >
                Specs
              </button>
              <button
                onClick={() => setActiveTab('shipping')}
                className={`pb-2 px-6 border-b-2 transition-colors ${
                  activeTab === 'shipping' ? 'border-brand-red text-brand-offwhite' : 'border-transparent text-zinc-500 hover:text-brand-offwhite'
                }`}
              >
                Shipping
              </button>
              <button
                onClick={() => setActiveTab('returns')}
                className={`pb-2 px-6 border-b-2 transition-colors ${
                  activeTab === 'returns' ? 'border-brand-red text-brand-offwhite' : 'border-transparent text-zinc-500 hover:text-brand-offwhite'
                }`}
              >
                Returns
              </button>
            </div>

            {/* Tabs Content */}
            <div className="text-zinc-500 text-xs leading-relaxed min-h-[60px]">
              {activeTab === 'details' && (
                <ul className="list-disc pl-4 space-y-1.5">
                  <li>Oversized, drop-shoulder streetwear fit.</li>
                  <li>Curated heavyweight organic knit fabrics.</li>
                  <li>High-density graphics/puff print details.</li>
                  <li>Double-stitched seams for shape retention.</li>
                  <li>Pre-shrunk and silicone softened.</li>
                </ul>
              )}
              {activeTab === 'shipping' && (
                <p>
                  Express delivery across India. Orders processed in Bengaluru within 24 hours. Estimated delivery: 2-3 days for Southern India / Metro Cities, 4-6 days for rest of India. Free delivery above ₹999.
                </p>
              )}
              {activeTab === 'returns' && (
                <p>
                  Easy 7-day returns & size exchange policy. Products must be returned in original conditions with swing tags attached. Drop us a message on WhatsApp (+91 7406164512) to register returns.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-zinc-900 pt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-wider text-brand-offwhite">
              RELATED DROPS
            </h2>
            <Link href="/shop" className="text-xs font-bold text-zinc-500 hover:text-brand-red uppercase tracking-wider">
              View Shop
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                href={`/shop/${p.slug}`}
                className="group flex flex-col border border-zinc-900 bg-zinc-950/20 rounded-md overflow-hidden hover:border-zinc-800 transition-all duration-300"
              >
                <div className="aspect-[3/4] bg-zinc-950 overflow-hidden">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 filter grayscale"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="text-xs font-bold text-brand-offwhite uppercase line-clamp-1 group-hover:text-brand-red transition-colors">
                    {p.name}
                  </h4>
                  <p className="text-xs font-bold text-brand-offwhite">₹{(p.price / 100).toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* SIZING CHART DIALOG */}
      {sizeChartOpen && (
        <>
          <div
            onClick={() => setSizeChartOpen(false)}
            className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm transition-opacity"
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-lg w-[90%] z-50 bg-brand-black border border-zinc-900 rounded-md p-6 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-offwhite flex items-center gap-2">
                <Ruler className="w-4 h-4 text-brand-red" />
                STREETWEAR SIZING CHART
              </h3>
              <button
                onClick={() => setSizeChartOpen(false)}
                className="text-zinc-500 hover:text-brand-offwhite transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-400 border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-brand-offwhite uppercase tracking-wider font-extrabold bg-zinc-950">
                    <th className="p-3">SIZE</th>
                    <th className="p-3">CHEST (INCHES)</th>
                    <th className="p-3">LENGTH (INCHES)</th>
                    <th className="p-3">SLEEVE (INCHES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40">
                  <tr className="hover:bg-zinc-950/40">
                    <td className="p-3 font-bold text-brand-offwhite">XS</td>
                    <td className="p-3">40&quot;</td>
                    <td className="p-3">26&quot;</td>
                    <td className="p-3">8&quot;</td>
                  </tr>
                  <tr className="hover:bg-zinc-950/40">
                    <td className="p-3 font-bold text-brand-offwhite">S</td>
                    <td className="p-3">42&quot;</td>
                    <td className="p-3">27&quot;</td>
                    <td className="p-3">8.5&quot;</td>
                  </tr>
                  <tr className="hover:bg-zinc-950/40 bg-zinc-950/20">
                    <td className="p-3 font-bold text-brand-offwhite">M</td>
                    <td className="p-3">44&quot;</td>
                    <td className="p-3">28&quot;</td>
                    <td className="p-3">9&quot;</td>
                  </tr>
                  <tr className="hover:bg-zinc-950/40">
                    <td className="p-3 font-bold text-brand-offwhite">L</td>
                    <td className="p-3">46&quot;</td>
                    <td className="p-3">29&quot;</td>
                    <td className="p-3">9.5&quot;</td>
                  </tr>
                  <tr className="hover:bg-zinc-950/40">
                    <td className="p-3 font-bold text-brand-offwhite">XL</td>
                    <td className="p-3">48&quot;</td>
                    <td className="p-3">30&quot;</td>
                    <td className="p-3">10&quot;</td>
                  </tr>
                  <tr className="hover:bg-zinc-950/40 bg-zinc-950/20">
                    <td className="p-3 font-bold text-brand-offwhite">XXL</td>
                    <td className="p-3">50&quot;</td>
                    <td className="p-3">31&quot;</td>
                    <td className="p-3">10.5&quot;</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-zinc-600 mt-6 leading-relaxed bg-zinc-950 p-3 rounded">
              * Note: Our garments are designed with a modern oversized/boxy drop shoulder silhouette. If you prefer a standard fit, we recommend ordering one size down from your usual choice.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
