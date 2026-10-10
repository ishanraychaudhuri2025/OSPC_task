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

    if (reducedMotion.matches) {
      return () => {
        revealObserver?.disconnect();
        root.classList.remove('wp-couture-scroll-ready');
      };
    }

    let frame = 0;
    const updateScrollScene = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        // The hero is deliberately a scroll scene: text recedes while the folio
        // scales forward. A generous range makes the transition perceptible.
        const distance = Math.max(1, hero.offsetHeight * 0.86);
        const progress = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / distance));

        hero.style.setProperty('--couture-progress', String(progress));
        hero.style.setProperty('--couture-copy-y', String(-progress * 132) + 'px');
        hero.style.setProperty('--couture-copy-opacity', String(Math.max(0.02, 1 - progress * 1.16)));
        hero.style.setProperty('--couture-copy-blur', String(progress * 4) + 'px');
        hero.style.setProperty('--couture-art-y', String(-progress * 54) + 'px');
        hero.style.setProperty('--couture-art-scale', String(1 + progress * 0.11));
        hero.style.setProperty('--couture-art-rotate', String(1.4 - progress * 4.1) + 'deg');
        hero.style.setProperty('--couture-back-y', String(progress * 46) + 'px');
        hero.style.setProperty('--couture-back-rotate', String(-3 + progress * 2.5) + 'deg');
        hero.style.setProperty('--couture-progress-width', String(progress * 100) + '%');
        hero.style.setProperty('--couture-sheen-x', String(-140 + progress * 280) + '%');
      });
    };

    window.addEventListener('scroll', updateScrollScene, { passive: true });
    window.addEventListener('resize', updateScrollScene);
    updateScrollScene();

    return () => {
      window.removeEventListener('scroll', updateScrollScene);
      window.removeEventListener('resize', updateScrollScene);
      if (frame) window.cancelAnimationFrame(frame);
      revealObserver?.disconnect();
      root.classList.remove('wp-couture-scroll-ready');
    };
  }, []);

  return (
    <section ref={heroRef} aria-labelledby="homepage-hero-title" className="wp-couture-hero relative isolate overflow-hidden">
      <div className="wp-couture-atmosphere" aria-hidden="true" />
      <div className="wp-couture-grain" aria-hidden="true" />

      <div className="wp-couture-content relative z-10 mx-auto grid w-full max-w-[1560px] grid-cols-1 items-center gap-12 px-6 py-12 sm:px-10 lg:grid-cols-12 lg:gap-8 lg:px-16 xl:px-24">
        <div className="wp-couture-copy lg:col-span-6">
          <p className="wp-couture-eyebrow wp-couture-enter">
            A field guide to purpose
            <span aria-hidden="true">—</span>
            Issue No. 01
          </p>

          <h1 id="homepage-hero-title" className="wp-couture-title mt-7 wp-couture-enter wp-couture-enter--title">
            The quiet power
            <span className="wp-couture-title-italic">of purpose.</span>
          </h1>

          <p className="wp-couture-description mt-7 max-w-[490px] wp-couture-enter wp-couture-enter--body">
            An independent study of leadership, trust, and the long view—made meaningful through the choices we make every day.
          </p>

          <div className="wp-couture-actions mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center wp-couture-enter wp-couture-enter--actions">
            <Link to="/ideas" className="wp-couture-button inline-flex min-h-12 items-center justify-center gap-5 px-6 py-4">
              <span>Explore the journal</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/practice" className="wp-couture-text-link inline-flex items-center gap-2">
              <span>Enter the practice lab</span><span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="wp-couture-signature mt-12 wp-couture-enter wp-couture-enter--signature">
            <span className="wp-couture-signature-rule" aria-hidden="true" />
            <span>Reflect with intention</span>
            <span className="wp-couture-dot" aria-hidden="true">·</span>
            <span>Learn with curiosity</span>
          </div>
        </div>

        <div className="wp-couture-art-wrap relative mx-auto w-full max-w-[490px] lg:col-span-6 lg:max-w-none" aria-label="The WHY, PRACTICED editorial folio">
          <div className="wp-couture-back wp-couture-back--one" aria-hidden="true" />
          <div className="wp-couture-back wp-couture-back--two" aria-hidden="true" />

          <article className="wp-couture-art">
            <div className="wp-couture-art-sheen" aria-hidden="true" />
            <header className="wp-couture-art-top">
              <span className="wp-couture-art-wordmark">WHY, PRACTICED</span>
              <span className="wp-couture-art-issue">A STUDY IN INTENTION</span>
            </header>

            <div className="wp-couture-artwork">
              <svg viewBox="0 0 520 600" className="wp-couture-emblem" role="img" aria-labelledby="couture-emblem-title">
                <title id="couture-emblem-title">A sculptural WP monogram, gold foil star and delicate hand-drawn curves</title>
                <defs>
                  <radialGradient id="folio-glow" cx="50%" cy="43%" r="60%">
                    <stop offset="0%" stopColor="#D9C5A4" stopOpacity=".18" />
                    <stop offset="100%" stopColor="#151713" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="folio-gold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#80694E" />
                    <stop offset="38%" stopColor="#E3D0B0" />
                    <stop offset="68%" stopColor="#AA8B62" />
                    <stop offset="100%" stopColor="#6C563F" />
                  </linearGradient>
                  <linearGradient id="folio-paper" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#24251F" />
                    <stop offset="100%" stopColor="#11130F" />
                  </linearGradient>
                </defs>

                <rect x="12" y="12" width="496" height="576" fill="none" stroke="#BBA27E" strokeOpacity=".38" strokeWidth=".7" />
                <path d="M36 58H484 M36 542H484" stroke="#BBA27E" strokeOpacity=".24" strokeWidth=".7" />
                <circle cx="260" cy="296" r="205" fill="url(#folio-glow)" />
                <path className="wp-emblem-line" pathLength="1" d="M83 418C109 322 125 202 207 141C254 106 309 105 352 133C401 165 432 244 438 331" fill="none" stroke="url(#folio-gold)" strokeOpacity=".42" strokeWidth=".8" />
                <path className="wp-emblem-line wp-emblem-line--two" pathLength="1" d="M75 377C128 442 186 475 260 480C334 475 392 442 445 377" fill="none" stroke="url(#folio-gold)" strokeOpacity=".36" strokeWidth=".8" />
                <ellipse cx="260" cy="300" rx="152" ry="190" fill="none" stroke="#BBA27E" strokeOpacity=".72" strokeWidth=".85" />
                <ellipse cx="260" cy="300" rx="139" ry="177" fill="none" stroke="#BBA27E" strokeOpacity=".25" strokeWidth=".7" />
                <path d="M260 92V128 M260 472V508" stroke="#BBA27E" strokeOpacity=".5" strokeWidth=".8" />

                <text x="228" y="336" textAnchor="middle" fontFamily="'Cormorant Garamond', Didot, Georgia, serif" fontSize="174" fontWeight="500" fill="#EDE5D8" letterSpacing="-17">W</text>
                <text x="329" y="382" textAnchor="middle" fontFamily="'Cormorant Garamond', Didot, Georgia, serif" fontSize="148" fontWeight="500" fill="url(#folio-gold)" letterSpacing="-14">P</text>

                <g className="wp-emblem-star">
                  <path d="M388 175L394 191L410 197L394 203L388 219L382 203L366 197L382 191Z" fill="url(#folio-gold)" />
                  <circle cx="388" cy="197" r="24" fill="none" stroke="#BBA27E" strokeOpacity=".34" strokeWidth=".65" />
                </g>

                <path d="M90 264H125 M395 264H430" stroke="#BBA27E" strokeOpacity=".48" strokeWidth=".7" />
                <text x="260" y="64" textAnchor="middle" fill="#C7B08B" fontSize="8.5" letterSpacing="3.8">CLARITY · CONVICTION · CONTINUITY</text>
                <text x="260" y="566" textAnchor="middle" fill="#C7B08B" fontSize="9" letterSpacing="4.2">REFLECT · LEARN · GROW</text>
              </svg>
            </div>

            <footer className="wp-couture-art-bottom">
              <span className="wp-couture-art-caption">
                <span className="wp-couture-caption-kicker">A considered practice</span>
                <span className="wp-couture-caption-title">Make intention visible.</span>
              </span>
              <span className="wp-couture-art-index">W / P<br /><small>001</small></span>
            </footer>
          </article>

          <div className="wp-couture-art-shadow" aria-hidden="true" />
          <div className="wp-couture-art-orbit" aria-hidden="true"><span /><span /><span /></div>
        </div>
      </div>

      <div className="wp-couture-bottomline relative z-10 mx-auto flex w-full max-w-[1560px] items-center justify-between gap-4 px-6 pb-5 sm:px-10 lg:px-16 xl:px-24">
        <span>Independent · Reflective · Practical</span>
        <a
          href="#learning-lenses"
          className="wp-couture-scroll-cue inline-flex items-center gap-3"
          onClick={(event) => {
            event.preventDefault();
            const target = document.getElementById('learning-lenses');
            if (!target) return;
            const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
            target.scrollIntoView({ behavior, block: 'start' });
          }}
        >
          <span>Continue the story</span>
          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      <div className="wp-couture-progress-track" aria-hidden="true"><span /></div>
    </section>
  );
}
