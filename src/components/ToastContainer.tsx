'use client';

import React, { useEffect, useState } from 'react';
import { toast, ToastMessage } from '../lib/toast';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

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
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((t) => {
        const bgColor = 'bg-brand-charcoal';
        let borderColor = 'border-zinc-800';
        let Icon = Info;
        let iconColor = 'text-blue-400';

        if (t.type === 'success') {
          borderColor = 'border-emerald-500/30';
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
            className={`flex items-center justify-between p-4 rounded-md shadow-2xl border ${bgColor} ${borderColor} glass-panel animate-in slide-in-from-bottom-5 duration-300`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 ${iconColor}`} />
              <p className="text-sm font-medium text-brand-offwhite">{t.message}</p>
            </div>
            <button
              onClick={() => {
                // Toasts dismiss themselves, but user can manually close them
                setToasts((prev) => prev.filter((item) => item.id !== t.id));
              }}
              className="text-zinc-500 hover:text-brand-offwhite transition-colors ml-4"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
