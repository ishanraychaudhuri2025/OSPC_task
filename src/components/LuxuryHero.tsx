import React, { useEffect, useRef } from 'react';
import { Link } from '../router/Router';
import { ArrowDown, ArrowRight, Sparkles } from 'lucide-react';

export function LuxuryHero() {
  const heroRef = useRef<HTMLElement | null>(null);

  // A restrained scroll-linked parallax makes the art drift at a different speed
  // from the copy. It writes CSS variables rather than triggering React renders.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) return;

    let frame = 0;
    const updateScrollProgress = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const progress = Math.min(
          1,
          Math.max(0, -hero.getBoundingClientRect().top / Math.max(hero.offsetHeight, 1))
        );

        hero.style.setProperty('--hero-progress', String(progress));
        hero.style.setProperty('--hero-copy-y', String(-progress * 26) + 'px');
        hero.style.setProperty('--hero-copy-opacity', String(1 - progress * 0.24));
        hero.style.setProperty('--hero-art-y', String(progress * 48) + 'px');
        hero.style.setProperty('--hero-art-scale', String(1 - progress * 0.035));
        hero.style.setProperty('--hero-progress-width', String(progress * 100) + '%');
      });
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      aria-labelledby="homepage-hero-title"
      className="wp-luxury-hero relative isolate overflow-hidden border-b border-[#77644F]"
    >
      <div className="wp-hero-grid" aria-hidden="true" />
      <div className="wp-hero-ambient wp-hero-ambient--one" aria-hidden="true" />
      <div className="wp-hero-ambient wp-hero-ambient--two" aria-hidden="true" />

      <div className="wp-hero-inner relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-14 sm:px-8 sm:py-16 lg:grid-cols-12 lg:gap-5 lg:px-12 lg:py-16">
        <div className="wp-hero-copy relative z-10 lg:col-span-6">
          <div className="wp-hero-enter inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#C5AE8A] sm:text-xs">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#9B7658]/70 font-serif-display text-sm tracking-normal text-[#E8D7BA]">W/P</span>
            <span className="h-px w-8 bg-[#9B7658]" aria-hidden="true" />
            <span>Independent study in purpose</span>
          </div>

          <h1
            id="homepage-hero-title"
            className="wp-hero-enter wp-hero-enter--title mt-8 max-w-3xl font-serif-display text-[clamp(3.25rem,7vw,6.7rem)] font-normal leading-[0.98] tracking-[-0.045em] text-[#F7F0E4]"
          >
            Lead with purpose.
            <span className="wp-hero-title-accent mt-2 block italic font-normal">Build what lasts.</span>
          </h1>

          <p className="wp-hero-enter wp-hero-enter--body mt-7 max-w-xl text-sm leading-7 text-[#D2C7B5] sm:text-base sm:leading-8">
            A considered space for exploring the ideas behind meaningful leadership—and turning reflection into everyday practice.
          </p>

          <div className="wp-hero-enter wp-hero-enter--actions mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/ideas"
              className="wp-hero-primary inline-flex min-h-12 items-center justify-center gap-3 border border-[#D6BD94] bg-[#D6BD94] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#171B1B] transition-all duration-300 hover:border-[#F0DFC0] hover:bg-[#F0DFC0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0DFC0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121714]"
            >
              Explore the ideas
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/practice"
              className="inline-flex min-h-12 items-center justify-center gap-3 border border-[#F7F0E4]/30 bg-transparent px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F7F0E4] transition-all duration-300 hover:border-[#D6BD94] hover:bg-[#D6BD94]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6BD94]"
            >
              Enter the practice lab
            </Link>
          </div>

          <div className="wp-hero-enter wp-hero-enter--meta mt-12 flex max-w-xl items-center gap-4 border-t border-[#F7F0E4]/15 pt-5">
            <div className="flex items-center gap-2 text-[#C5AE8A]" aria-hidden="true">
              <Sparkles className="h-4 w-4" strokeWidth={1.4} />
              <span className="h-px w-8 bg-[#9B7658]" />
            </div>
            <p className="text-[9px] uppercase leading-relaxed tracking-[0.2em] text-[#AFA494] sm:text-[10px]">
              Reflect with intention <span className="mx-2 text-[#9B7658]">·</span> Learn with curiosity <span className="mx-2 text-[#9B7658]">·</span> Grow with purpose
            </p>
          </div>
        </div>

        <div className="wp-hero-art relative mx-auto w-full max-w-[570px] lg:col-span-6 lg:max-w-none" role="img" aria-label="A gold-line emblem representing purpose, clarity, and lasting leadership.">
          <div className="wp-hero-art-frame relative mx-auto w-full">
            <svg
              viewBox="0 0 640 640"
              className="wp-hero-orbit-art block h-auto w-full overflow-visible"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <radialGradient id="wp-hero-halo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#C7A879" stopOpacity="0.22" />
                  <stop offset="55%" stopColor="#98734F" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#121714" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="wp-hero-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6F5138" />
                  <stop offset="48%" stopColor="#E5D0A9" />
                  <stop offset="100%" stopColor="#94704F" />
                </linearGradient>
                <linearGradient id="wp-hero-medallion" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#252C26" />
                  <stop offset="100%" stopColor="#101411" />
                </linearGradient>
              </defs>

              <circle cx="320" cy="320" r="300" fill="url(#wp-hero-halo)" />
              <circle cx="320" cy="320" r="276" fill="none" stroke="url(#wp-hero-gold)" strokeOpacity="0.56" strokeWidth="0.9" />
              <circle cx="320" cy="320" r="247" fill="none" stroke="#C5AE8A" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="2 9" />
              <circle cx="320" cy="320" r="213" fill="none" stroke="url(#wp-hero-gold)" strokeOpacity="0.52" strokeWidth="1" />
              <circle cx="320" cy="320" r="178" fill="none" stroke="#C5AE8A" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="1 8" />
              <ellipse cx="320" cy="320" rx="130" ry="248" fill="none" stroke="#C5AE8A" strokeOpacity="0.24" strokeWidth="1" transform="rotate(38 320 320)" />
              <ellipse cx="320" cy="320" rx="130" ry="248" fill="none" stroke="#C5AE8A" strokeOpacity="0.2" strokeWidth="1" transform="rotate(-38 320 320)" />
              <path d="M320 28V121 M320 519V612 M28 320H121 M519 320H612" stroke="#C5AE8A" strokeOpacity="0.4" strokeWidth="1" />
              <path d="M112 112L154 154 M486 486L528 528 M528 112L486 154 M154 486L112 528" stroke="#C5AE8A" strokeOpacity="0.24" strokeWidth="1" />

              <circle cx="320" cy="320" r="139" fill="#C7A879" fillOpacity="0.05" />
              <circle cx="320" cy="320" r="118" fill="url(#wp-hero-medallion)" stroke="url(#wp-hero-gold)" strokeWidth="1.5" />
              <circle cx="320" cy="320" r="106" fill="none" stroke="#C5AE8A" strokeOpacity="0.35" strokeWidth="0.8" />

              <text x="286" y="338" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="108" fill="#F7F0E4" letterSpacing="-13">W</text>
              <text x="361" y="371" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="96" fill="#B08A64" letterSpacing="-9">P</text>

              <path d="M320 168L327 185L344 192L327 199L320 216L313 199L296 192L313 185Z" fill="#DCC6A0" />
              <path d="M508 245L513 257L525 262L513 267L508 279L503 267L491 262L503 257Z" fill="#C5AE8A" fillOpacity="0.72" />
              <path d="M132 386L137 398L149 403L137 408L132 420L127 408L115 403L127 398Z" fill="#C5AE8A" fillOpacity="0.58" />

              <text x="320" y="72" textAnchor="middle" fill="#C5AE8A" fontSize="10" letterSpacing="4.1">A PHILOSOPHY OF PURPOSE</text>
              <text x="320" y="579" textAnchor="middle" fill="#C5AE8A" fontSize="10" letterSpacing="4.5">REFLECT • LEARN • GROW</text>
            </svg>

            <div className="wp-hero-art-caption absolute left-0 top-[19%] hidden max-w-[138px] border-l border-[#B08A64] bg-[#121714]/80 py-2 pl-4 backdrop-blur-sm sm:block">
              <span className="block text-[9px] uppercase tracking-[0.2em] text-[#AFA494]">The starting point</span>
              <span className="mt-1 block font-serif-display text-xl text-[#F7F0E4]">Why</span>
            </div>
            <div className="wp-hero-art-caption wp-hero-art-caption--second absolute bottom-[17%] right-0 hidden max-w-[166px] border-r border-[#B08A64] bg-[#121714]/85 py-2 pr-4 text-right backdrop-blur-sm sm:block">
              <span className="block text-[9px] uppercase tracking-[0.2em] text-[#AFA494]">The way forward</span>
              <span className="mt-1 block font-serif-display text-xl text-[#F7F0E4]">How · What</span>
            </div>

            <div className="wp-hero-floating-note absolute bottom-[5%] left-[6%] max-w-[250px] border border-[#D6BD94]/40 bg-[#171D18]/95 p-4 shadow-2xl shadow-black/30 sm:bottom-[8%] sm:left-[2%] sm:p-5">
              <div className="flex items-center justify-between gap-5 border-b border-[#F7F0E4]/15 pb-3">
                <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#C5AE8A]">A lasting mindset</span>
                <span className="font-serif-display text-sm text-[#B08A64]">01 / 03</span>
              </div>
              <p className="mt-3 font-serif-display text-lg leading-snug text-[#F7F0E4] sm:text-xl">
                Purpose gives ambition its direction.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="wp-hero-footer relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 pb-5 sm:px-8 lg:px-12">
        <span className="text-[9px] uppercase tracking-[0.23em] text-[#AFA494] sm:text-[10px]">Independent · Reflective · Practical</span>
        <a
          href="#learning-lenses"
          className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#C5AE8A] transition-colors hover:text-[#F7F0E4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6BD94]"
          onClick={(event) => {
            event.preventDefault();
            const target = document.getElementById('learning-lenses');
            if (target) {
              const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
              target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
            }
          }}
        >
          <span>Discover the approach</span>
          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      <div className="wp-hero-scroll-progress" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}
