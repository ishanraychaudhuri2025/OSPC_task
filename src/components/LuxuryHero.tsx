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
          <div className="wp-couture-kicker wp-couture-enter">
            <span className="wp-couture-monogram-small" aria-hidden="true">W<span>P</span></span>
            <span className="wp-couture-kicker-rule" aria-hidden="true" />
            <span>Independent thought · Purpose in practice</span>
          </div>

          <h1 id="homepage-hero-title" className="wp-couture-title mt-8 wp-couture-enter wp-couture-enter--title">
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
              <title id="couture-emblem-title">A refined WP monogram framed by a single fine oval</title>
              <defs>
                <linearGradient id="couture-ink" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#25231F" />
                  <stop offset="100%" stopColor="#514538" />
                </linearGradient>
              </defs>
              <rect x="23" y="20" width="474" height="580" fill="none" stroke="#82725F" strokeOpacity="0.54" strokeWidth="0.8" />
              <rect x="35" y="32" width="450" height="556" fill="none" stroke="#82725F" strokeOpacity="0.24" strokeWidth="0.6" />
              <ellipse cx="260" cy="292" rx="148" ry="194" fill="none" stroke="#9A856C" strokeWidth="1" />
              <ellipse cx="260" cy="292" rx="132" ry="178" fill="none" stroke="#9A856C" strokeOpacity="0.32" strokeWidth="0.7" />
              <path d="M260 70V116 M260 468V514" stroke="#9A856C" strokeWidth="0.8" />
              <path d="M230 92L260 62L290 92" fill="none" stroke="#9A856C" strokeWidth="0.8" />
              <text x="232" y="321" textAnchor="middle" fontFamily="'Bodoni Moda', Didot, Georgia, serif" fontSize="164" fill="url(#couture-ink)" letterSpacing="-18">W</text>
              <text x="324" y="365" textAnchor="middle" fontFamily="'Bodoni Moda', Didot, Georgia, serif" fontSize="142" fill="#A38765" letterSpacing="-15">P</text>
              <path d="M260 166L266 181L281 187L266 193L260 208L254 193L239 187L254 181Z" fill="#A38765" />
              <text x="260" y="545" textAnchor="middle" fill="#71614D" fontSize="9" letterSpacing="4.2">REFLECT · LEARN · GROW</text>
              <text x="58" y="305" fill="#8B7A66" fontSize="8" letterSpacing="2.6" transform="rotate(-90 58 305)">AN EXERCISE IN CLARITY</text>
              <text x="462" y="280" fill="#8B7A66" fontSize="8" letterSpacing="2.2" transform="rotate(90 462 280)">PURPOSE &amp; STEWARDSHIP</text>
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
