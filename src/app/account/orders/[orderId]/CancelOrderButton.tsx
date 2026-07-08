'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContainer';
import { Loader2 } from 'lucide-react';

interface CancelOrderButtonProps {
  orderId: string;
}

export default function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? This action will return items to catalog and cannot be undone.')) {
      return;
    }

    try {
      setIsPending(true);
      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel order');
      }

      addToast('Order cancelled successfully', 'success');
      router.refresh();
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to cancel order', 'error');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isPending}
      className="border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 disabled:opacity-40 px-4 py-2 font-mono uppercase tracking-widest text-xs transition-colors flex items-center gap-2"
    >
      {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {isPending ? 'Cancelling...' : 'Cancel Order'}
    </button>
  );
}
