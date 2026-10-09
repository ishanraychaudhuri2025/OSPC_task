import React from 'react';
import { Link } from '../router/Router';
import { ExternalLink, ArrowUpRight, Compass, BookOpen, Users, Shield } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#D8D8CF] bg-[#171B1B] text-[#F6F3EC]" role="contentinfo">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Brand & Editorial Mission */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-1">
              <span className="font-serif-display text-2xl font-bold tracking-tight text-[#FFFEFA]">
                WHY, PRACTICED
              </span>
              <p className="text-xs uppercase tracking-[0.2em] text-[#D8D8CF]/70">
                Independent Editorial Study
              </p>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[#D8D8CF]">
              A non-commercial student project dedicated to translating foundational concepts of purpose, stewardship, mutual trust, and the infinite mindset into practical personal reflections.
            </p>
            <div className="pt-2">
              <Link
                to="/community"
                className="inline-flex items-center gap-2 border border-[#D8D8CF]/30 bg-transparent px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FFFEFA] transition-colors hover:border-[#D64B37] hover:bg-[#D64B37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D64B37]"
              >
                <span>Read Notes on WHY</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Site Navigation */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFFEFA]">
              Pages
            </h3>
            <ul className="space-y-3 text-sm text-[#D8D8CF]">
              <li>
                <Link to="/" className="transition-colors hover:text-[#D64B37]">
                  Editorial Home
                </Link>
              </li>
              <li>
                <Link to="/ideas" className="transition-colors hover:text-[#D64B37]">
                  Curated Ideas Library
                </Link>
              </li>
              <li>
                <Link to="/community" className="transition-colors hover:text-[#D64B37]">
                  Notes on WHY Opt-In
                </Link>
              </li>
            </ul>
          </div>

          {/* Verified Official References */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFFEFA]">
              Verified Official Sources
            </h3>
            <ul className="space-y-3 text-sm text-[#D8D8CF]">
              <li>
                <a
                  href="https://simonsinek.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-[#D64B37]"
                >
                  <span>Simon Sinek Official Website</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://simonsinek.com/our-why/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-[#D64B37]"
                >
                  <span>Simon's Stated Purpose (Our WHY)</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://simonsinek.com/books"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-[#D64B37]"
                >
                  <span>Official Books Catalogue</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                </a>
              </li>
              <li>
                <a
                  href="https://simonsinek.com/books/start-with-why"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-[#D64B37]"
                >
                  <span>Start with Why Book Details</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Brand Disclaimer */}
        <div className="mt-14 border-t border-[#D8D8CF]/20 pt-8">
          <div className="rounded-none border-l-2 border-[#D64B37] bg-[#171B1B]/40 p-4">
            <p className="text-xs leading-relaxed text-[#D8D8CF]">
              WHY, PRACTICED is an independent student project inspired by publicly available ideas from Simon Sinek. It is not affiliated with, endorsed by, or operated by Simon Sinek or The Optimism Company. Names and marks belong to their respective owners.
            </p>
          </div>
          <div className="mt-6 flex flex-col items-start justify-between gap-4 text-xs text-[#D8D8CF]/60 sm:flex-row sm:items-center">
            <p>© {currentYear} WHY, PRACTICED. Built for independent study and reflection.</p>
            <p>Non-commercial academic initiative.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
