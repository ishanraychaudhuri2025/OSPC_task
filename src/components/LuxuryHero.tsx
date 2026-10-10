import React, { useEffect, useRef } from 'react';
import { Link } from '../router/Router';
import { ArrowDown, ArrowRight } from 'lucide-react';

export function LuxuryHero() {
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const root = document.documentElement;

    // Reveal supporting editorial sections only as they enter the viewport.
    let revealObserver: IntersectionObserver | null = null;
    if (!reducedMotion.matches && 'IntersectionObserver' in window) {
      root.classList.add('wp-couture-scroll-ready');
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('wp-is-visible');
            revealObserver?.unobserve(entry.target);
          }
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

      document.querySelectorAll<HTMLElement>('.wp-scroll-reveal').forEach((element) => {
        revealObserver?.observe(element);
      });
    }

    // Scroll-linked transition: the copy retreats while the monogram panel eases
    // in the opposite direction. CSS variables avoid React renders per scroll tick.
    if (reducedMotion.matches) {
      return () => {
        revealObserver?.disconnect();
        root.classList.remove('wp-couture-scroll-ready');
      };
    }

    let frame = 0;
    const header = document.querySelector<HTMLElement>('header');
    const headerOffset = header?.offsetHeight ?? 80;
    const heroDocumentTop = hero.getBoundingClientRect().top + window.scrollY;
    const updateScrollProgress = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const distance = Math.max(1, hero.offsetHeight * 0.76);
        const progress = Math.min(1, Math.max(0,
          (window.scrollY - Math.max(0, heroDocumentTop - headerOffset)) / distance
        ));

        hero.style.setProperty('--couture-progress', String(progress));
        hero.style.setProperty('--couture-copy-y', String(-progress * 92) + 'px');
        hero.style.setProperty('--couture-copy-opacity', String(1 - progress * 0.88));
        hero.style.setProperty('--couture-art-y', String(progress * 112) + 'px');
        hero.style.setProperty('--couture-art-scale', String(1 - progress * 0.13));
        hero.style.setProperty('--couture-art-rotate', String(progress * -2.5) + 'deg');
        hero.style.setProperty('--couture-progress-width', String(progress * 100) + '%');
      });
    };

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
      if (frame) window.cancelAnimationFrame(frame);
      revealObserver?.disconnect();
      root.classList.remove('wp-couture-scroll-ready');
    };
  }, []);

  return (
    <section
      ref={heroRef}
      aria-labelledby="homepage-hero-title"
      className="wp-couture-hero relative isolate overflow-hidden"
    >
      <div className="wp-couture-grain" aria-hidden="true" />
      <div className="wp-couture-content relative z-10 mx-auto grid w-full max-w-[1500px] grid-cols-1 items-center gap-10 px-6 py-12 sm:px-10 lg:grid-cols-12 lg:gap-12 lg:px-16 xl:px-24">
        <div className="wp-couture-copy lg:col-span-7">
          <h1 id="homepage-hero-title" className="wp-couture-title mt-0 wp-couture-enter wp-couture-enter--title">
            The quiet power
            <span className="wp-couture-title-italic">of purpose.</span>
          </h1>

          <p className="wp-couture-description mt-7 max-w-[490px] wp-couture-enter wp-couture-enter--body">
            An independent study of leadership, trust, and the long view—made meaningful through the choices we make every day.
          </p>

          <div className="wp-couture-actions mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center wp-couture-enter wp-couture-enter--actions">
            <Link
              to="/ideas"
              className="wp-couture-button inline-flex min-h-12 items-center justify-center gap-5 px-6 py-4"
            >
              <span>Explore the journal</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/practice" className="wp-couture-text-link inline-flex items-center gap-2">
              <span>Enter the practice lab</span>
              <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="wp-couture-signature mt-12 wp-couture-enter wp-couture-enter--signature">
            <span className="wp-couture-signature-rule" aria-hidden="true" />
            <span>Reflect with intention</span>
            <span className="wp-couture-dot" aria-hidden="true">·</span>
            <span>Learn with curiosity</span>
          </div>
        </div>

        <div className="wp-couture-art-wrap relative mx-auto w-full max-w-[480px] lg:col-span-5 lg:max-w-none">
          <div className="wp-couture-art">
            <div className="wp-couture-art-top">
              <span>WHY, PRACTICED</span>
              <span>STUDY No. 01</span>
            </div>
            <svg viewBox="0 0 520 620" className="wp-couture-emblem block h-auto w-full" role="img" aria-labelledby="couture-emblem-title">
              <title id="couture-emblem-title">A refined WP monogram inside a fine oval, with a small star mark at its upper right</title>
              <defs>
                <linearGradient id="couture-ink" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#201F1B" />
                  <stop offset="100%" stopColor="#514638" />
                </linearGradient>
                <linearGradient id="couture-bronze" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#B49A78" />
                  <stop offset="100%" stopColor="#82684A" />
                </linearGradient>
              </defs>

              <rect x="30" y="24" width="460" height="572" fill="none" stroke="#8D7A62" strokeOpacity="0.28" strokeWidth="0.7" />
              <path d="M72 90H164 M356 90H448" stroke="#A48D6E" strokeOpacity="0.42" strokeWidth="0.8" />
              <text x="260" y="94" textAnchor="middle" fill="#8B7A66" fontSize="8" letterSpacing="3.4">A STUDY IN PURPOSE</text>

              <ellipse cx="260" cy="315" rx="135" ry="177" fill="none" stroke="#A48B6C" strokeWidth="1.05" />
              <ellipse cx="260" cy="315" rx="122" ry="164" fill="none" stroke="#A48B6C" strokeOpacity="0.3" strokeWidth="0.7" />
              <path d="M260 126V149 M260 481V504" stroke="#A48B6C" strokeOpacity="0.5" strokeWidth="0.8" />

              <text x="232" y="337" textAnchor="middle" fontFamily="'Cormorant Garamond', Didot, Georgia, serif" fontSize="158" fontWeight="500" fill="url(#couture-ink)" letterSpacing="-16">W</text>
              <text x="326" y="380" textAnchor="middle" fontFamily="'Cormorant Garamond', Didot, Georgia, serif" fontSize="139" fontWeight="500" fill="url(#couture-bronze)" letterSpacing="-12">P</text>

              <path d="M414 147L418 158L429 162L418 166L414 177L410 166L399 162L410 158Z" fill="#9A7B56" />
              <circle cx="414" cy="162" r="18" fill="none" stroke="#A48B6C" strokeOpacity="0.32" strokeWidth="0.7" />

              <text x="260" y="548" textAnchor="middle" fill="#7D6D58" fontSize="9" letterSpacing="4">REFLECT · LEARN · GROW</text>
              <path d="M183 566H337" stroke="#A48B6C" strokeOpacity="0.4" strokeWidth="0.7" />
            </svg>
            <div className="wp-couture-art-bottom">
              <span>A more considered way to lead.</span>
              <span className="wp-couture-bottom-index">W / P</span>
            </div>
          </div>
          <div className="wp-couture-art-shadow" aria-hidden="true" />
        </div>
      </div>

      <div className="wp-couture-bottomline relative z-10 mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 pb-5 sm:px-10 lg:px-16 xl:px-24">
        <span>Independent · Reflective · Practical</span>
        <a
          href="#learning-lenses"
          className="wp-couture-scroll-cue inline-flex items-center gap-3"
          onClick={(event) => {
            event.preventDefault();
            const target = document.getElementById('learning-lenses');
            if (!target) return;
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
          }}
        >
          <span>Discover the approach</span>
          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
      <div className="wp-couture-progress-track" aria-hidden="true"><span /></div>
    </section>
  );
}
