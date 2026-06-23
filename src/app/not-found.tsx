import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <h1 className="text-[8rem] md:text-[12rem] font-extrabold tracking-tighter text-zinc-900 leading-none select-none">
        404
      </h1>
      <div className="-mt-12 md:-mt-20 z-10 space-y-6">
        <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-widest text-brand-offwhite">
          Lost in the Sauce
        </h2>
        <p className="text-zinc-500 max-w-md mx-auto text-sm leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back to the streets.
        </p>
        <div className="pt-8">
          <Link href="/shop" className="bg-brand-red text-white px-10 py-4 font-bold uppercase tracking-widest text-sm hover:bg-red-600 transition-colors inline-block">
            Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
