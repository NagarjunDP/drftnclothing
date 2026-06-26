'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, PackageSearch, Settings, LogOut, Tag } from 'lucide-react';
import { useAuth, useUser, useClerk } from '@clerk/nextjs';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
  { label: 'Products', href: '/admin/products', icon: PackageSearch },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Discounts', href: '/admin/discounts', icon: Tag },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    if (isLoaded && pathname !== '/admin/login') {
      if (!userId) {
        router.push('/admin/login');
      } else if (user) {
        const role = user.publicMetadata?.role;
        if (role !== 'admin') {
          router.push('/admin/login?error=unauthorized');
        }
      }
    }
  }, [isLoaded, userId, user, pathname, router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/admin/login');
  };

  if (!isLoaded && pathname !== '/admin/login') {
    return <div className="min-h-screen bg-brand-black flex items-center justify-center">Loading Admin Panel...</div>;
  }

  // If we are on the login page, just render the children without the sidebar
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-brand-black">{children}</div>;
  }

  // If user metadata is loaded and role is not admin, don't render layout content while redirecting
  if (user && user.publicMetadata?.role !== 'admin') {
    return <div className="min-h-screen bg-brand-black flex items-center justify-center text-brand-red font-bold">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col md:flex-row text-brand-offwhite font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900/50 border-r border-zinc-800 flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-center">
          <Link href="/" className="text-xl font-extrabold tracking-[0.2em] text-brand-offwhite">
            D R F T N <span className="text-brand-red font-light text-xs align-top">ADMIN</span>
          </Link>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-bold tracking-wider uppercase transition-colors ${
                  isActive
                    ? 'bg-brand-red text-white'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-brand-offwhite'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded text-sm font-bold tracking-wider uppercase text-zinc-500 hover:bg-zinc-800 hover:text-brand-red transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
        <Link href="/" className="text-lg font-extrabold tracking-[0.2em] text-brand-offwhite">
          D R F T N <span className="text-brand-red font-light text-xs align-top">ADMIN</span>
        </Link>
        <button onClick={handleLogout} className="text-zinc-400 p-2">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Nav Scroller */}
      <div className="md:hidden flex overflow-x-auto border-b border-zinc-800 bg-zinc-900/30 hide-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-shrink-0 px-6 py-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-colors ${
                isActive
                  ? 'border-brand-red text-brand-offwhite'
                  : 'border-transparent text-zinc-500'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-brand-black relative animate-fade-in">
        {children}
      </main>
    </div>
  );
}
