import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/Router';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export function Header() {
  const { currentPath } = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change or ESC key
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPath]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Home', path: '/' as const },
    { label: 'Ideas Library', path: '/ideas' as const },
    { label: 'Community', path: '/community' as const },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D8D8CF] bg-[#F6F3EC]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
        {/* Wordmark */}
        <Link
          to="/"
          className="group flex flex-col justify-center text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D64B37]"
          aria-label="WHY, PRACTICED — Return to homepage"
        >
          <span className="font-serif-display text-xl sm:text-2xl font-bold tracking-tight text-[#171B1B] transition-colors group-hover:text-[#D64B37]">
            WHY, PRACTICED
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#666D68]">
            An Editorial Study
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {navLinks.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative py-1 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-[#171B1B] font-semibold'
                    : 'text-[#666D68] hover:text-[#171B1B]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-[#D64B37]"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            to="/community"
            className="inline-flex items-center gap-1.5 rounded-none border border-[#171B1B] bg-[#171B1B] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FFFEFA] transition-all hover:bg-[#D64B37] hover:border-[#D64B37] active:translate-y-0.5"
          >
            <span>Notes on WHY</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 text-[#171B1B] hover:text-[#D64B37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D64B37]"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="border-b border-[#D8D8CF] bg-[#FFFEFA] px-6 py-6 md:hidden shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <nav className="flex flex-col space-y-4" aria-label="Mobile navigation links">
            {navLinks.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between border-b border-[#D8D8CF]/50 pb-3 text-base ${
                    isActive
                      ? 'font-bold text-[#D64B37]'
                      : 'font-medium text-[#171B1B] hover:text-[#D64B37]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="text-xs uppercase tracking-widest text-[#D64B37]">Current</span>}
                </Link>
              );
            })}
            <div className="pt-2">
              <Link
                to="/community"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 border border-[#171B1B] bg-[#171B1B] px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#FFFEFA] transition-colors hover:bg-[#D64B37] hover:border-[#D64B37]"
              >
                <span>Join Notes on WHY</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
