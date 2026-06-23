'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Lock, User } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

export default function AdminLoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && supabase) {
        // Real Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        if (data.session) {
          addToast('Logged in successfully', 'success');
          router.push('/admin');
        }
      } else {
        // Mock Auth Fallback
        if (email === 'admin@drftn.in' && password === 'admin123') {
          localStorage.setItem('drftn_admin_token', 'mock-admin-token');
          addToast('Logged in successfully (Mock Mode)', 'success');
          router.push('/admin');
        } else {
          throw new Error('Invalid credentials. Use admin@drftn.in / admin123');
        }
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error(err);
      addToast(err.message || 'Failed to login', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-[0.2em] text-brand-offwhite uppercase mb-2">
            DRFTN <span className="text-brand-red font-light text-sm align-top">ADMIN</span>
          </h1>
          <p className="text-zinc-500 text-xs tracking-widest uppercase">Authorized Personnel Only</p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-none">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900/80 border border-zinc-800 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors"
                placeholder="admin@drftn.in"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900/80 border border-zinc-800 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors"
                placeholder="••••••••"
              />
            </div>

            {!process.env.NEXT_PUBLIC_SUPABASE_URL && (
              <div className="bg-blue-900/20 border border-blue-900/50 p-3 text-xs text-blue-400 font-mono text-center">
                Mock Mode: Use admin@drftn.in / admin123
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-red text-white py-4 font-bold uppercase tracking-widest text-sm hover:bg-red-600 transition-colors disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
