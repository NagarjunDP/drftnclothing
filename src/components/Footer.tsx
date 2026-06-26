'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-brand-charcoal border-t border-brand-graphite text-brand-gray text-sm mt-auto">
      {/* ── Main Footer Grid ── */}
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-16 md:py-20 grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-12">

        {/* Brand Column — spans 2 cols on md */}
        <div className="col-span-2 space-y-5">
          <div>
            <Link
              href="/"
              className="block text-brand-offwhite font-bold tracking-[0.4em] mb-1 hover:text-brand-cream transition-colors"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem' }}
            >
              DRFTN
            </Link>
            <span className="block text-[10px] tracking-[0.3em] text-brand-gold uppercase font-body font-medium">
              Clothing — Drift in Style
            </span>
          </div>
          <p className="text-brand-gray text-xs leading-relaxed max-w-xs font-body font-light">
            Born in Yelahanka, Bengaluru. Premium, imported streetwear and unisex fashion
            crafted for those who move with intention.
          </p>

          {/* Socials */}
          <div className="flex items-center gap-3 pt-1">
            <a
              href="https://instagram.com/drftnclothing"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center border border-brand-muted hover:border-brand-gold text-brand-gray hover:text-brand-gold transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://wa.me/917406164512"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center border border-brand-muted hover:border-brand-gold text-brand-gray hover:text-brand-gold transition-colors text-[10px] font-bold tracking-wider"
              aria-label="WhatsApp"
            >
              WA
            </a>
          </div>
        </div>

        {/* Shop Column */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-offwhite font-body mb-5">
            Shop
          </h4>
          <ul className="space-y-3">
            {[
              { label: 'All Drops', href: '/shop' },
              { label: 'Tees', href: '/shop?category=tees' },
              { label: 'Hoodies', href: '/shop?category=hoodies' },
              { label: 'Joggers', href: '/shop?category=joggers' },
              { label: 'Accessories', href: '/shop?category=accessories' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs tracking-wider text-brand-gray hover:text-brand-offwhite transition-colors font-body"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Support Column */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-offwhite font-body mb-5">
            Support
          </h4>
          <ul className="space-y-3">
            {[
              { label: 'Track Order', href: '/track' },
              { label: 'About Us', href: '/about' },
              { label: 'Contact', href: '/contact' },
              { label: 'FAQ', href: '/contact' },
              { label: 'Returns', href: '/contact' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs tracking-wider text-brand-gray hover:text-brand-offwhite transition-colors font-body"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Column */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-offwhite font-body mb-5">
            Reach Us
          </h4>
          <ul className="space-y-3.5">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-3.5 h-3.5 text-brand-gold mt-0.5 shrink-0" />
              <span className="text-xs text-brand-gray font-body font-light leading-relaxed">
                Yelahanka, Bengaluru<br />Karnataka, India
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-3.5 h-3.5 text-brand-gold shrink-0" />
              <a
                href="tel:+917406164512"
                className="text-xs text-brand-gray hover:text-brand-offwhite transition-colors font-body"
              >
                +91 74061 64512
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-3.5 h-3.5 text-brand-gold shrink-0" />
              <a
                href="mailto:support@drftn.in"
                className="text-xs text-brand-gray hover:text-brand-offwhite transition-colors font-body"
              >
                support@drftn.in
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-brand-graphite">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-brand-gray tracking-[0.15em] font-body">
            © {new Date().getFullYear()} DRFTN CLOTHING. All Rights Reserved.
          </p>
          <p className="text-[10px] text-brand-gray tracking-[0.25em] uppercase font-body">
            Made in Bengaluru · Drift in Style
          </p>
        </div>
      </div>
    </footer>
  );
}
