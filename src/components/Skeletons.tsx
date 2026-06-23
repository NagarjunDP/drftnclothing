import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="w-full animate-pulse border border-zinc-900 bg-brand-charcoal/20 rounded-md overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-[3/4] bg-zinc-900/60 w-full"></div>
      {/* Details skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-zinc-900/60 rounded w-1/3"></div>
        <div className="h-5 bg-zinc-900/60 rounded w-3/4"></div>
        <div className="flex gap-2 pt-1">
          <div className="h-4 bg-zinc-900/60 rounded w-1/4"></div>
          <div className="h-4 bg-zinc-900/60 rounded w-1/6"></div>
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 animate-pulse">
      {/* Left: Gallery */}
      <div className="space-y-4">
        <div className="aspect-[3/4] bg-zinc-900/60 rounded-md w-full"></div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-zinc-900/60 rounded-md"></div>
          ))}
        </div>
      </div>
      
      {/* Right: Info */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-4 bg-zinc-900/60 rounded w-1/4"></div>
          <div className="h-8 bg-zinc-900/60 rounded w-3/4"></div>
        </div>
        <div className="flex gap-3 items-center">
          <div className="h-6 bg-zinc-900/60 rounded w-20"></div>
          <div className="h-4 bg-zinc-900/60 rounded w-16"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-zinc-900/60 rounded w-1/3"></div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-10 h-10 bg-zinc-900/60 rounded-md"></div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-zinc-900/60 rounded w-1/4"></div>
          <div className="h-12 bg-zinc-900/60 rounded w-12"></div>
        </div>
        <div className="space-y-3 pt-4">
          <div className="h-12 bg-zinc-900/60 rounded w-full"></div>
          <div className="h-12 bg-zinc-900/60 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-zinc-900/60 border border-zinc-900 rounded-md"></div>
        ))}
      </div>
      <div className="h-96 bg-zinc-900/60 border border-zinc-900 rounded-md w-full"></div>
    </div>
  );
}
