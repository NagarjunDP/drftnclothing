'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { StoreSettings } from '@/types';
import { Save } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

export default function AdminSettings() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await db.getSettings();
        setSettings(data);
      } catch (error) {
        console.error(error);
        addToast('Failed to load settings', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    const { name, value, type } = e.target;
    setSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    
    setIsSaving(true);
    try {
      await db.updateSettings(settings);
      addToast('Settings updated successfully', 'success');
    } catch (error) {
      console.error(error);
      addToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return <div className="p-8 text-zinc-500 font-bold uppercase tracking-widest text-sm animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-widest uppercase text-brand-offwhite">Store Settings</h1>
          <p className="text-zinc-500 text-sm mt-1">Configure global store preferences and API keys.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* General Details */}
        <div className="bg-zinc-900/30 border border-zinc-800 p-6 md:p-8">
          <h2 className="text-lg font-bold text-brand-offwhite mb-6 uppercase tracking-wider border-b border-zinc-800 pb-2">General Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">Store Name</label>
              <input
                type="text"
                name="store_name"
                value={settings.store_name}
                onChange={handleChange}
                className="w-full bg-zinc-900/80 border border-zinc-700 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">Contact Number</label>
              <input
                type="text"
                name="contact_number"
                value={settings.contact_number}
                onChange={handleChange}
                className="w-full bg-zinc-900/80 border border-zinc-700 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">Instagram Handle</label>
              <input
                type="text"
                name="instagram_handle"
                value={settings.instagram_handle}
                onChange={handleChange}
                className="w-full bg-zinc-900/80 border border-zinc-700 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Shipping Preferences */}
        <div className="bg-zinc-900/30 border border-zinc-800 p-6 md:p-8">
          <h2 className="text-lg font-bold text-brand-offwhite mb-6 uppercase tracking-wider border-b border-zinc-800 pb-2">Shipping Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">Free Shipping Threshold (₹)</label>
              <input
                type="number"
                name="free_shipping_threshold"
                value={settings.free_shipping_threshold}
                onChange={handleChange}
                className="w-full bg-zinc-900/80 border border-zinc-700 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">Default Shipping Charge (₹)</label>
              <input
                type="number"
                name="default_shipping_charge"
                value={settings.default_shipping_charge}
                onChange={handleChange}
                className="w-full bg-zinc-900/80 border border-zinc-700 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors"
              />
            </div>
          </div>
        </div>

        {/* API Integrations */}
        <div className="bg-zinc-900/30 border border-zinc-800 p-6 md:p-8">
          <h2 className="text-lg font-bold text-brand-offwhite mb-6 uppercase tracking-wider border-b border-zinc-800 pb-2">API Keys (Integrations)</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">Razorpay Key ID</label>
              <input
                type="password"
                name="razorpay_key_id"
                value={settings.razorpay_key_id}
                onChange={handleChange}
                placeholder="rzp_test_..."
                className="w-full bg-zinc-900/80 border border-zinc-700 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">Razorpay Key Secret</label>
              <input
                type="password"
                name="razorpay_key_secret"
                value={settings.razorpay_key_secret}
                onChange={handleChange}
                placeholder="Secret Key"
                className="w-full bg-zinc-900/80 border border-zinc-700 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">NimbusPost API Key</label>
              <input
                type="password"
                name="nimbuspost_api_key"
                value={settings.nimbuspost_api_key}
                onChange={handleChange}
                placeholder="NimbusPost Token"
                className="w-full bg-zinc-900/80 border border-zinc-700 text-brand-offwhite px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors font-mono"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-900 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-brand-red text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
            {!isSaving && <Save className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}
