'use client';

/**
 * AnnouncementTicker — Option A: Rotating single-message ticker
 *
 * One centered value-prop displayed at a time.
 * Crossfades + slides to the next message every 3.5 seconds.
 * A thin amber progress bar fills left-to-right and resets on each rotation —
 * gives a pacing indicator so the transition never feels random or glitchy.
 *
 * Messages are kept 1:1 with the old marquee content (COD, free shipping,
 * Born in Yelahanka, etc.) — only the presentation mechanism changes.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Ticker messages ─────────────────────────────────────────────────── */
const MESSAGES = [
  { label: 'COD Available', detail: 'Cash on delivery across India' },
  { label: 'Free Shipping', detail: 'On all orders above ₹999' },
  { label: 'Born in Yelahanka', detail: 'Bengaluru\'s own streetwear label' },
  { label: 'Zero Compromise', detail: 'Heavyweight unisex apparel' },
  { label: 'Easy Returns', detail: '7-day hassle-free exchange' },
  { label: 'Industrial Minimalism', detail: 'Drop-shoulder. Raw DNA.' },
];

const DURATION = 3500; // ms per message

/* ─── Progress bar animation key trick ───────────────────────────────── */
// Increment a key on each rotation so React remounts the bar,
// restarting the CSS animation cleanly without a JS timer.

/* ─── Variants ────────────────────────────────────────────────────────── */
const msgVariants = {
  enter: { opacity: 0, y: 8 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.28, ease: 'easeIn' as const },
  },
};

/* ─── Component ───────────────────────────────────────────────────────── */
export default function AnnouncementTicker() {
  const [idx, setIdx] = useState(0);
  const [barKey, setBarKey] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((p) => (p + 1) % MESSAGES.length);
      setBarKey((k) => k + 1);
    }, DURATION);
    return () => clearInterval(t);
  }, []);

  const msg = MESSAGES[idx];

  return (
    <section
      className="relative border-y border-brand-graphite bg-brand-black select-none overflow-hidden"
      aria-label="Announcement"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Dot nav — left side */}
      <div
        className="absolute left-5 inset-y-0 hidden sm:flex items-center gap-1.5 z-10"
        aria-hidden="true"
      >
        {MESSAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setIdx(i); setBarKey((k) => k + 1); }}
            className={`w-1 rounded-full transition-all duration-300 ${i === idx
                ? 'h-3.5 bg-brand-amber'
                : 'h-1 bg-brand-stone/30 hover:bg-brand-stone/60'
              }`}
            aria-label={`Go to message ${i + 1}`}
          />
        ))}
      </div>

      {/* Message area */}
      <div className="flex items-center justify-center py-3 px-16 sm:px-20 min-h-[44px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            variants={msgVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex items-center gap-2 sm:gap-3 text-center"
          >
            {/* Amber accent mark — brand-specific minimal mark, not a diamond */}
            <span className="hidden sm:inline-block text-brand-amber" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <rect x="1" y="1" width="8" height="8" stroke="currentColor" strokeWidth="1.25" transform="rotate(45 5 5)" />
              </svg>
            </span>

            <span className="font-display uppercase text-brand-offwhite text-[10px] sm:text-[11px] tracking-[0.4em] leading-none font-bold">
              {msg.label}
            </span>

            {/* Divider — small dot */}
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-brand-stone/40" aria-hidden="true" />

            <span className="text-brand-stone text-[9px] sm:text-[10px] tracking-[0.25em] uppercase font-body hidden sm:inline">
              {msg.detail}
            </span>

            <span className="hidden sm:inline-block text-brand-amber" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <rect x="1" y="1" width="8" height="8" stroke="currentColor" strokeWidth="1.25" transform="rotate(45 5 5)" />
              </svg>
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar — fills left-to-right, resets on each rotation */}
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-brand-graphite" aria-hidden="true">
        <motion.div
          key={barKey}
          className="h-full bg-brand-amber/70"
          initial={{ scaleX: 0, originX: '0%' }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: DURATION / 1000 - 0.1,
            ease: 'linear',
          }}
        />
      </div>

      {/* Edge fade-outs so content doesn't hard-cut at screen edge */}
      <div
        className="absolute inset-y-0 left-0 w-12 sm:w-20 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to right, hsl(0,0%,5%) 0%, transparent 100%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-y-0 right-0 w-12 sm:w-20 pointer-events-none z-10"
        style={{ background: 'linear-gradient(to left, hsl(0,0%,5%) 0%, transparent 100%)' }}
        aria-hidden="true"
      />
    </section>
  );
}
