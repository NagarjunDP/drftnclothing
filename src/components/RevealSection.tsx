'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function RevealSection() {
  const revealSectionRef = useRef<HTMLDivElement>(null);
  const artworkContainerRef = useRef<HTMLDivElement>(null);
  const topImageRef = useRef<HTMLDivElement>(null);
  const bgTextContainerRef = useRef<HTMLDivElement>(null);
  const topTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (topImageRef.current) {
        topImageRef.current.style.maskImage = 'none';
        topImageRef.current.style.webkitMaskImage = 'none';
      }
      if (topTextRef.current) {
        topTextRef.current.style.maskImage = 'none';
        topTextRef.current.style.webkitMaskImage = 'none';
      }
      return;
    }

    const revealSection = revealSectionRef.current;
    if (!revealSection) return;

    // Use gsap.context to manage React 18 strict mode double-render/cleanup safely
    const ctx = gsap.context(() => {
      // Synchronized GSAP timeline driving both color transition & upward drift
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: revealSection,
          start: 'top top',
          end: '+=40%',
          scrub: 0.5,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
        }
      });

      // 1. Mask reveal (color change)
      tl.to(topImageRef.current, {
        duration: 1,
        ease: 'none',
        onUpdate: function () {
          const progress = this.progress(); // 0 to 1
          const val = progress * 100;
          const radius = val * 1.5;
          const maskValue = `radial-gradient(circle at 50% 45%, black ${radius}%, transparent ${radius + 20}%)`;

          if (topImageRef.current) {
            topImageRef.current.style.maskImage = maskValue;
            topImageRef.current.style.webkitMaskImage = maskValue;
          }
          if (topTextRef.current) {
            topTextRef.current.style.maskImage = maskValue;
            topTextRef.current.style.webkitMaskImage = maskValue;
          }
        }
      }, 0);

      // 2. Controlled drift-up translation (50px / ~8% of visual height)
      tl.fromTo(artworkContainerRef.current, {
        y: 0
      }, {
        y: -50,
        duration: 1,
        ease: 'power1.out'
      }, 0);

      // 3. Sync background text's drift-up at half rate for 3D parallax depth
      tl.fromTo(bgTextContainerRef.current, {
        y: 0
      }, {
        y: -25,
        duration: 1,
        ease: 'power1.out'
      }, 0);
    }, revealSectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={revealSectionRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center py-0 px-6 bg-black"
      aria-label="Garment Transformation Reveal"
    >

      {/* ── Section Background Texture (bg.png with overlay) ── */}
      <div className="absolute inset-0 z-0 opacity-35 pointer-events-none">
        <Image
          src="/bg.png"
          alt="Textured Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Soft edge-blending gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      {/* ── Background Typography (Scroll-reactive & Sync-masked) ── */}
      <div
        ref={bgTextContainerRef}
        className="absolute inset-0 z-[5] overflow-hidden flex flex-col justify-center items-center pointer-events-none select-none"
      >
        {/* Base Layer: Outline/White treatment */}
        <div className="absolute w-full h-[52vh] sm:h-full top-[24vh] sm:top-0 sm:inset-0 flex flex-col justify-between py-0 sm:py-16 md:py-24 items-center">
          <div
            className="font-display font-black text-[14vw] sm:text-[15vw] md:text-[16vw] leading-[0.8] text-transparent uppercase tracking-tighter whitespace-nowrap"
            style={{ WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.12)' }}
          >
            BUILT
          </div>
          <div
            className="font-display font-black text-[14vw] sm:text-[15vw] md:text-[16vw] leading-[0.8] text-transparent uppercase tracking-tighter whitespace-nowrap"
            style={{ WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.12)' }}
          >
            DRFTN
          </div>
          <div
            className="font-display font-black text-[8.5vw] sm:text-[9.5vw] md:text-[10vw] leading-[0.8] text-transparent uppercase tracking-tighter whitespace-nowrap"
            style={{ WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.12)' }}
          >
            DIFFERENT
          </div>
        </div>

        {/* Top Layer: Solid white fill treatment (revealed by mask) */}
        <div
          ref={topTextRef}
          className="absolute w-full h-[52vh] sm:h-full top-[24vh] sm:top-0 sm:inset-0 flex flex-col justify-between py-0 sm:py-16 md:py-24 items-center transition-opacity duration-75"
          style={{
            maskImage: 'radial-gradient(circle at 50% 45%, black 0%, transparent 20%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 45%, black 0%, transparent 20%)',
          }}
        >
          <div className="font-display font-black text-[14vw] sm:text-[15vw] md:text-[16vw] leading-[0.8] text-white uppercase tracking-tighter whitespace-nowrap">
            BUILT
          </div>
          <div className="font-display font-black text-[14vw] sm:text-[15vw] md:text-[16vw] leading-[0.8] text-white uppercase tracking-tighter whitespace-nowrap">
            DRFTN
          </div>
          <div className="font-display font-black text-[8.5vw] sm:text-[9.5vw] md:text-[10vw] leading-[0.8] text-white uppercase tracking-tighter whitespace-nowrap">
            DIFFERENT
          </div>
        </div>
      </div>

      {/* ── Stacked Artwork Visual (Vertically centered, drifts on scrub) ── */}
      <div
        ref={artworkContainerRef}
        className="relative w-full max-w-[280px] h-[320px] sm:max-w-[360px] sm:h-[410px] md:max-w-[440px] md:h-[500px] z-10"
      >

        {/* Base Layer: Cream/Off-white original Stitch Hoodie (ori1.png) */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/ori1.png"
            alt="DRFTN Stitch Hoodie - Light Edition"
            fill
            priority
            sizes="(max-width: 768px) 280px, 440px"
            className="object-contain"
          />
        </div>

        {/* Top Masked Layer: Black original Stitch Hoodie (ori2.png) */}
        <div
          ref={topImageRef}
          className="absolute inset-0 w-full h-full transition-opacity duration-75"
          style={{
            maskImage: 'radial-gradient(circle at 50% 45%, black 0%, transparent 20%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 45%, black 0%, transparent 20%)',
          }}
        >
          <Image
            src="/ori2.png"
            alt="DRFTN Stitch Hoodie - Dark Edition"
            fill
            priority
            sizes="(max-width: 768px) 280px, 440px"
            className="object-contain"
          />
        </div>

      </div>

    </section>
  );
}
