'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { toast } from '@/lib/toast';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

// Payment method SVG icons
const PaymentIcons = () => (
  <div className="flex items-center gap-2 flex-wrap" aria-label="Accepted payment methods">
    {/* Razorpay */}
    <div className="h-5 px-2 bg-brand-graphite border border-brand-muted/40 rounded flex items-center">
      <span className="text-[8px] font-bold tracking-wider text-brand-silver">RAZORPAY</span>
    </div>
    {/* UPI */}
    <div className="h-5 px-2 bg-brand-graphite border border-brand-muted/40 rounded flex items-center">
      <span className="text-[8px] font-bold tracking-wider text-brand-silver">UPI</span>
    </div>
    {/* Visa */}
    <div className="h-5 px-2 bg-brand-graphite border border-brand-muted/40 rounded flex items-center">
      <span className="text-[8px] font-bold tracking-wider text-blue-400">VISA</span>
    </div>
    {/* Mastercard */}
    <div className="h-5 px-2 bg-brand-graphite border border-brand-muted/40 rounded flex items-center">
      <span className="text-[8px] font-bold tracking-wider text-brand-silver">MC</span>
    </div>
    {/* COD */}
    <div className="h-5 px-2 bg-brand-graphite border border-brand-muted/40 rounded flex items-center">
      <span className="text-[8px] font-bold tracking-wider text-brand-amber">COD</span>
    </div>
  </div>
);

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');

  if (pathname?.startsWith('/admin')) return null;

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("You're on the list! Welcome to the inner circle.");
    setEmail('');
  };

  return (
    <footer className="bg-brand-charcoal border-t border-brand-graphite text-brand-gray text-sm mt-auto">

      {/* ── Newsletter Strip ── */}
      <div className="border-b border-brand-graphite">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-[10px] tracking-[0.3em] uppercase text-brand-amber font-body font-semibold">
              Inner Circle
            </p>
            <p className="text-brand-offwhite font-display text-xl uppercase font-bold">
              Be First to the Drop
            </p>
          </div>
          <form
            onSubmit={handleNewsletterSubmit}
            className="flex gap-2 w-full sm:w-auto sm:min-w-[340px]"
            aria-label="Newsletter signup"
          >
            <label htmlFor="footer-email" className="sr-only">Email address</label>
            <input
              id="footer-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-2.5 text-xs bg-brand-graphite border border-brand-muted text-brand-offwhite placeholder-brand-gray focus:border-brand-amber focus:outline-none font-body"
            />
            <button
              type="submit"
              className="btn-primary px-5 py-2.5 text-[10px] tracking-widest whitespace-nowrap"
              aria-label="Subscribe to newsletter"
            >
              <span>Join</span>
              <ArrowRight className="w-3 h-3 relative z-10" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      {/* ── Main Footer Grid ── */}
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-14 md:py-20 grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-12">

        {/* Brand Column — spans 2 cols */}
        <div className="col-span-2 space-y-5">
          {/* Logo — fixed: no negative margin hack */}
          <Link
            href="/"
            className="inline-block"
            aria-label="DRFTN Clothing — Home"
          >
            <div className="relative w-36 h-18">
              <Image
                src="/logo.png?v=3"
                alt="DRFTN Clothing"
                fill
                sizes="144px"
                className="object-contain object-left opacity-90 hover:opacity-100 transition-opacity"
              />
            </div>
          </Link>

          <p className="text-brand-stone text-xs leading-relaxed max-w-xs font-body font-light">
            Born in Yelahanka, Bengaluru. Premium, imported streetwear and unisex fashion
            crafted for those who move with intention.
          </p>

          {/* Socials */}
          <div className="flex items-center gap-2.5 pt-1" aria-label="Social media links">
            <a
              href="https://instagram.com/drftnclothing"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center border border-brand-muted hover:border-brand-amber text-brand-gray hover:text-brand-amber transition-colors"
              aria-label="Follow DRFTN on Instagram"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://wa.me/917406164512"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center border border-brand-muted hover:border-brand-amber text-brand-gray hover:text-brand-amber transition-colors"
              aria-label="Chat with DRFTN on WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Shop Column */}
        <nav aria-label="Shop links">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-offwhite font-body mb-5">
            Shop
          </h2>
          <ul className="space-y-3">
            {[
              { label: 'All Drops', href: '/shop' },
              { label: 'T-Shirts', href: '/shop?category=t-shirts' },
              { label: 'Hoodies', href: '/shop?category=hoodies' },
              { label: 'Denims', href: '/shop?category=denims' },
              { label: 'Jackets', href: '/shop?category=jackets' },
              { label: 'Accessories', href: '/shop?category=accessories' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs tracking-wider text-brand-stone hover:text-brand-offwhite transition-colors font-body"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Support Column */}
        <nav aria-label="Support links">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-offwhite font-body mb-5">
            Support
          </h2>
          <ul className="space-y-3">
            {[
              { label: 'Track Order', href: '/track' },
              { label: 'About Us', href: '/about' },
              { label: 'Contact', href: '/contact' },
              { label: 'FAQ', href: '/contact' },
              { label: 'Returns', href: '/contact' },
            ].map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-xs tracking-wider text-brand-stone hover:text-brand-offwhite transition-colors font-body"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact Column */}
        <address className="space-y-4 not-italic" aria-label="Contact information">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-offwhite font-body mb-5">
            Reach Us
          </h2>
          <ul className="space-y-3.5">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-3.5 h-3.5 text-brand-amber mt-0.5 shrink-0" aria-hidden="true" />
              <span className="text-xs text-brand-stone font-body font-light leading-relaxed">
                Yelahanka, Bengaluru<br />Karnataka, India
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-3.5 h-3.5 text-brand-amber shrink-0" aria-hidden="true" />
              <a
                href="tel:+917406164512"
                className="text-xs text-brand-stone hover:text-brand-offwhite transition-colors font-body"
              >
                +91 74061 64512
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-3.5 h-3.5 text-brand-amber shrink-0" aria-hidden="true" />
              <a
                href="mailto:support@drftn.in"
                className="text-xs text-brand-stone hover:text-brand-offwhite transition-colors font-body"
              >
                support@drftn.in
              </a>
            </li>
          </ul>
        </address>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-brand-graphite">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-brand-stone/60 tracking-[0.15em] font-body">
            © {new Date().getFullYear()} DRFTN CLOTHING. All Rights Reserved.
          </p>
          <PaymentIcons />
          <p className="text-[10px] text-brand-stone/60 tracking-[0.25em] uppercase font-body">
            Made in Bengaluru · Drift in Style
          </p>
        </div>
      </div>
    </footer>
  );
}
