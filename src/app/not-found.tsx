import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-brand-black" role="main">
      {/* 404 Large background Display */}
      <div className="relative select-none" aria-hidden="true">
        <h1 className="text-[10rem] md:text-[16rem] font-display font-extrabold tracking-tighter text-brand-charcoal leading-none">
          404
        </h1>
      </div>

      <div className="-mt-10 md:-mt-16 z-10 space-y-6 max-w-md">
        <h2 className="text-2xl md:text-4xl font-display font-bold uppercase tracking-wider text-brand-offwhite">
          Lost in the Sauce
        </h2>
        <p className="text-brand-stone text-xs md:text-sm leading-relaxed font-body font-light">
          The pieces you&apos;re looking for don&apos;t exist or have been moved. Let&apos;s get you back to the streets.
        </p>
        <div className="pt-6">
          <Link href="/shop" className="btn-primary">
            <span>Back to Shop</span>
            <ArrowRight className="w-3.5 h-3.5 relative z-10" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}
