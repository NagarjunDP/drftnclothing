'use client';

import React, { useEffect, useState } from 'react';
import { toast, ToastMessage } from '../lib/toast';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import Image from 'next/image';

export const useToast = () => {
  return {
    addToast: (message: string, type: ToastMessage['type'] = 'success') => toast.show(message, type),
  };
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return toast.subscribe((newToasts) => {
      setToasts(newToasts);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 left-4 md:left-auto z-50 flex flex-col gap-2 max-w-sm w-auto md:w-full">
      {toasts.map((t) => {
        // Dismiss handler
        const handleDismiss = () => {
          setToasts((prev) => prev.filter((item) => item.id !== t.id));
        };

        // Render custom Product Add-to-Cart toast
        if (t.productImage && t.productName) {
          return (
            <div
              key={t.id}
              className="bg-brand-black border border-brand-offwhite/20 p-3.5 shadow-2xl relative flex items-center gap-3.5 text-brand-offwhite w-full rounded-none animate-in slide-in-from-bottom-5 md:slide-in-from-right-5 duration-300"
            >
              {/* Product Thumbnail */}
              <div className="relative w-12 h-16 bg-brand-charcoal shrink-0 border border-white/5">
                <Image
                  src={t.productImage}
                  alt={t.productName}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>

              {/* Toast Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between h-14 py-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] tracking-[0.2em] text-brand-red font-bold uppercase font-body">
                    Added to Bag
                  </span>
                  <div className="relative w-[40px] h-[40px] -my-[14px] shrink-0 opacity-40">
                    <Image
                      src="/logo.png?v=3"
                      alt="DRFTN"
                      fill
                      sizes="40px"
                      className="object-contain object-right"
                    />
                  </div>
                </div>
                <h4 className="text-xs font-semibold text-brand-offwhite font-body truncate leading-normal">
                  {t.productName}
                </h4>
              </div>

              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="text-brand-silver hover:text-brand-offwhite transition-colors self-start p-1"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        }

        // Standard Alert Styling
        const bgColor = 'bg-brand-charcoal';
        let borderColor = 'border-brand-muted';
        let Icon = Info;
        let iconColor = 'text-brand-silver';

        if (t.type === 'success') {
          borderColor = 'border-emerald-500/20';
          Icon = CheckCircle;
          iconColor = 'text-emerald-400';
        } else if (t.type === 'error') {
          borderColor = 'border-brand-red/30';
          Icon = AlertCircle;
          iconColor = 'text-brand-red';
        }

        return (
          <div
            key={t.id}
            className={`flex items-center justify-between p-4 shadow-2xl border ${bgColor} ${borderColor} rounded-none animate-in slide-in-from-bottom-5 md:slide-in-from-right-5 duration-300`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 ${iconColor}`} />
              <p className="text-xs font-medium text-brand-offwhite font-body leading-normal">{t.message}</p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-brand-silver hover:text-brand-offwhite transition-colors ml-4"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
