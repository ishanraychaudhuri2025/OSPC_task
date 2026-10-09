import React, { useState, useEffect } from 'react';
import { useRouter, Link, RoutePath } from '../router/Router';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ArrowUpRight, User, LogIn } from 'lucide-react';

export function Header() {
  const { currentPath } = useRouter();
  const { user } = useAuth();
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

  const navLinks: { label: string; path: RoutePath }[] = [
    { label: 'Home', path: '/' },
    { label: 'Ideas Library', path: '/ideas' },
    { label: 'Practice Lab', path: '/practice' },
    { label: 'Podcast', path: '/podcast' },
    { label: 'Notes on WHY', path: '/community' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D8D8CF] bg-[#F6F3EC]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
        {/* Brand mark and wordmark */}
        <Link
          to="/"
          className="group flex items-center gap-2.5 sm:gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D64B37]"
          aria-label="WHY, PRACTICED — Return to homepage"
        >
          <svg
            viewBox="0 0 64 64"
            width="44"
            height="44"
            className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 transition-transform duration-300 group-hover:scale-[1.02]"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M18 53A26 26 0 1 1 48 10" fill="none" stroke="#9B7658" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M4.5 19L10.7 43L17.2 19L23.8 43L30.3 19" fill="none" stroke="#191919" strokeWidth="3.1" strokeLinecap="square" strokeLinejoin="miter" />
            <path d="M36 48V19H43.1C50.1 19 54.5 22.8 54.5 29C54.5 35.1 50.1 39 43.1 39H40.7V48Z" fill="#9B7658" />
            <path d="M40.7 23.5V34.5H43C47.1 34.5 49.2 32.7 49.2 29C49.2 25.4 47.1 23.5 43 23.5Z" fill="#F6F3EC" />
          </svg>
          <span className="flex flex-col justify-center">
            <span className="font-serif-display text-lg sm:text-[1.35rem] font-normal tracking-[0.015em] text-[#171B1B] transition-colors group-hover:text-[#9B7658]">
              WHY<span className="text-[#9B7658]">,</span> PRACTICED
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-[#666D68]">
              An Editorial Study
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {navLinks.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative py-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'text-[#171B1B]'
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

        {/* Right Auth / Action Controls */}
        <div className="hidden items-center gap-3 sm:flex">
          {user ? (
            <Link
              to="/dashboard"
              className={`inline-flex items-center gap-1.5 border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                currentPath === '/dashboard'
                  ? 'border-[#171B1B] bg-[#171B1B] text-[#FFFEFA]'
                  : 'border-[#D8D8CF] bg-[#FFFEFA] text-[#171B1B] hover:border-[#171B1B]'
              }`}
            >
              <User className="h-3.5 w-3.5 text-[#D64B37]" aria-hidden="true" />
              <span>Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className={`inline-flex items-center gap-1.5 border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                currentPath === '/auth'
                  ? 'border-[#171B1B] bg-[#171B1B] text-[#FFFEFA]'
                  : 'border-[#D8D8CF] bg-[#FFFEFA] text-[#171B1B] hover:border-[#171B1B]'
              }`}
            >
              <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sign In</span>
            </Link>
          )}

          <Link
            to="/practice"
            className="inline-flex items-center gap-1.5 border border-[#171B1B] bg-[#171B1B] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#FFFEFA] hover:bg-[#D64B37] hover:border-[#D64B37] transition-all"
          >
            <span>Launch Canvas</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
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
          className="border-b border-[#D8D8CF] bg-[#FFFEFA] px-6 py-6 lg:hidden shadow-lg"
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
                  className={`flex items-center justify-between border-b border-[#D8D8CF]/50 pb-3 text-sm uppercase tracking-wider ${
                    isActive
                      ? 'font-bold text-[#D64B37]'
                      : 'font-semibold text-[#171B1B] hover:text-[#D64B37]'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="text-[10px] text-[#D64B37]">Current</span>}
                </Link>
              );
            })}

            <div className="pt-2 flex flex-col gap-2.5">
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 border border-[#171B1B] bg-[#171B1B] py-3 text-xs font-semibold uppercase tracking-wider text-[#FFFEFA]"
                >
                  <User className="h-4 w-4 text-[#D64B37]" aria-hidden="true" />
                  <span>My Dashboard</span>
                </Link>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 border border-[#D8D8CF] bg-[#F6F3EC] py-3 text-xs font-semibold uppercase tracking-wider text-[#171B1B]"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  <span>Sign In / Create Account</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
