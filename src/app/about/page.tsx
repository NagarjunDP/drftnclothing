import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 py-24 md:py-32 animate-fade-in">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-widest text-brand-offwhite uppercase mb-4">
          About DRFTN
        </h1>
        <p className="text-white font-bold uppercase tracking-widest text-sm">
          Drift in Style. Built for the Streets.
        </p>
      </div>

      <div className="prose prose-invert prose-zinc max-w-none space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lg leading-relaxed text-zinc-300">
              Born in the vibrant streets of Yelahanka, Bengaluru, DRFTN CLOTHING is more than just a brand — it&apos;s a movement. We bring premium, imported streetwear and unisex fashion to those who refuse to blend in.
            </p>
            <p className="mt-4 text-zinc-400 leading-relaxed">
              Our mission is to bridge the gap between high-end international streetwear culture and the local scene. Every piece in our collection is carefully curated, ensuring top-tier quality, heavyweight fabrics, and designs that speak louder than words.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-8 flex items-center justify-center aspect-square">
            <div className="text-center">
              <span className="text-6xl font-extrabold tracking-[0.3em] text-zinc-800 block mb-4 select-none">
                EST.
              </span>
              <span className="text-4xl font-bold text-brand-offwhite font-mono">2024</span>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-zinc-900 mt-12">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-brand-offwhite mb-6">Our Philosophy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-900/30 p-6 border border-zinc-800">
              <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-3">Premium Quality</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We source only the best imported materials. Heavyweight cottons, durable prints, and fits that actually make sense for a streetwear silhouette.
              </p>
            </div>
            <div className="bg-zinc-900/30 p-6 border border-zinc-800">
              <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-3">Unisex by Default</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Fashion has no boundaries. Our entire catalog is designed to look incredible on anyone, focusing on oversized and relaxed fits.
              </p>
            </div>
            <div className="bg-zinc-900/30 p-6 border border-zinc-800">
              <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-3">Community First</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We&apos;re building a culture in Bengaluru. DRFTN is for the skaters, the artists, the drifters, and everyone in between.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 text-center">
          <Link href="/shop" className="bg-brand-offwhite text-brand-black px-10 py-4 font-bold uppercase tracking-widest text-sm hover:bg-zinc-300 transition-colors inline-block">
            Explore the Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
