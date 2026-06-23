'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail } from 'lucide-react';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function Footer() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) return null;

  return (
    <footer className="bg-brand-black border-t border-zinc-900 text-zinc-400 text-sm mt-auto py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        {/* Brand Info */}
        <div className="space-y-4">
          <Link href="/" className="text-xl font-extrabold tracking-[0.3em] text-brand-offwhite">
            D R F T N
          </Link>
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-bold">&quot;Drift in Style&quot;</p>
          <p className="text-zinc-500 text-xs leading-relaxed">
            Born in Yelahanka. Built for the streets. Bringing imported streetwear and unisex fashion to Bengaluru and beyond.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-brand-offwhite font-bold uppercase tracking-wider text-xs mb-4">Shop</h4>
          <ul className="space-y-2 text-xs uppercase tracking-wider">
            <li><Link href="/shop" className="hover:text-brand-red transition-colors">All Streetwear</Link></li>
            <li><Link href="/shop?category=tees" className="hover:text-brand-red transition-colors">Tees</Link></li>
            <li><Link href="/shop?category=hoodies" className="hover:text-brand-red transition-colors">Hoodies</Link></li>
            <li><Link href="/shop?category=joggers" className="hover:text-brand-red transition-colors">Joggers</Link></li>
            <li><Link href="/shop?category=accessories" className="hover:text-brand-red transition-colors">Accessories</Link></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="text-brand-offwhite font-bold uppercase tracking-wider text-xs mb-4">Support</h4>
          <ul className="space-y-2 text-xs uppercase tracking-wider">
            <li><Link href="/track" className="hover:text-brand-red transition-colors">Track Order</Link></li>
            <li><Link href="/about" className="hover:text-brand-red transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-brand-red transition-colors">Contact Support</Link></li>
          </ul>
        </div>

        {/* Contact info & Socials */}
        <div className="space-y-4">
          <h4 className="text-brand-offwhite font-bold uppercase tracking-wider text-xs">Reach Us</h4>
          <ul className="space-y-2.5 text-xs text-zinc-500">
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-red" />
              <span>Yelahanka, Bengaluru, India</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-red" />
              <a href="tel:+917406164512" className="hover:text-brand-offwhite transition-colors">+91 7406164512</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-red" />
              <a href="mailto:support@drftn.in" className="hover:text-brand-offwhite transition-colors">support@drftn.in</a>
            </li>
          </ul>
          <div className="pt-2 flex items-center gap-4">
            <a
              href="https://instagram.com/drftnclothing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-brand-offwhite transition-colors p-2 border border-zinc-900 rounded-md hover:border-zinc-800"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-zinc-900/60 mt-12 pt-6 text-center text-xs text-zinc-600 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} DRFTN CLOTHING. All Rights Reserved.</p>
        <p className="tracking-widest">DRIFT IN STYLE</p>
      </div>
    </footer>
  );
}
