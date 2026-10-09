import React from 'react';
import { Link } from '../router/Router';
import { TOPICS } from '../data/topics';
import { ArrowRight, Compass, Shield, Users, Sparkles, BookOpen, ExternalLink } from 'lucide-react';

export function HomePage() {
  // Select 3 featured ideas for the homepage preview
  const featuredTopics = TOPICS.slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Full-width signature artwork — the same artwork is used in the README. */}
      <section
        aria-label="WHY, PRACTICED brand banner"
        className="w-full overflow-hidden border-b border-[#D8D8CF] bg-[#F6F3EC]"
      >
        <img
          src="/why-practiced-brand-banner.webp"
          alt="WHY, PRACTICED — Reflect, Learn, Grow. An Independent Editorial Study."
          width="1672"
          height="941"
          fetchPriority="high"
          decoding="async"
          className="block h-auto w-full"
        />
      </section>

      {/* Editorial Hero Section */}
      <section className="relative overflow-hidden border-b border-[#D8D8CF] bg-[#F6F3EC] py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Column: Bold Editorial Typography */}
            <div className="lg:col-span-8 space-y-8">
              <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#666D68]">
                <span>An Independent Study</span>
                <span aria-hidden="true">/</span>
                <span>Philosophy & Stewardship</span>
              </div>

              <h1 className="font-serif-display text-4xl font-normal tracking-tight text-[#171B1B] sm:text-6xl lg:text-7xl leading-[1.08]">
                A better question can change the way you lead.
              </h1>

              <p className="max-w-2xl text-lg sm:text-xl font-normal leading-relaxed text-[#666D68]">
                Explore publicly available ideas about purpose, mutual trust, and the infinite mindset—and translate high-level inspiration into daily, observable practice.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  to="/ideas"
                  className="inline-flex items-center justify-center gap-2 rounded-none border border-[#171B1B] bg-[#171B1B] px-7 py-4 text-xs font-semibold uppercase tracking-wider text-[#FFFEFA] transition-all hover:bg-[#D64B37] hover:border-[#D64B37] active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D64B37]"
                >
                  <span>Explore the Ideas Library</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/community"
                  className="inline-flex items-center justify-center gap-2 rounded-none border border-[#171B1B] bg-transparent px-7 py-4 text-xs font-semibold uppercase tracking-wider text-[#171B1B] transition-all hover:bg-[#D8D8CF]/40 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D64B37]"
                >
                  <span>Join Notes on WHY</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Editorial Graphic / Statement Block */}
            <div className="lg:col-span-4">
              <div className="relative border border-[#D8D8CF] bg-[#FFFEFA] p-8 sm:p-10 shadow-sm">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#D8D8CF] pb-4">
                    <span className="text-xs uppercase tracking-widest text-[#666D68]">
                      Core Premise
                    </span>
                    <span className="font-serif-display text-base font-semibold text-[#D64B37]">
                      01 / 03
                    </span>
                  </div>

                  <blockquote className="font-serif-display text-xl leading-snug text-[#171B1B]">
                    "People don’t buy what you do; they buy why you do it."
                  </blockquote>

                  <p className="text-xs leading-relaxed text-[#666D68]">
                    A reminder that clarity of cause creates resonance. When leaders articulate the belief behind their work, loyalty replaces coercion.
                  </p>

                  <div className="pt-2 border-t border-[#D8D8CF] flex items-center justify-between text-xs text-[#666D68]">
                    <span>Reference: Public Talk & Text</span>
                    <Link to="/ideas" className="font-semibold text-[#171B1B] hover:text-[#D64B37] underline underline-offset-4">
                      Study the concept
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Three Learning Lenses */}
      <section className="border-b border-[#D8D8CF] bg-[#FFFEFA] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D64B37]">
              Framework for Inquiry
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-normal tracking-tight text-[#171B1B]">
              Three lenses for intentional action
            </h2>
            <p className="text-base text-[#666D68] leading-relaxed">
              These three pillars structure our independent learning notes. They are not an official curriculum, but an editorial scaffold for daily reflection.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Lens 1: Purpose */}
            <div className="group border border-[#D8D8CF] bg-[#F6F3EC] p-8 transition-all hover:border-[#171B1B]">
              <div className="flex h-12 w-12 items-center justify-center border border-[#171B1B] bg-[#171B1B] text-[#FFFEFA]">
                <Compass className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-6 font-serif-display text-2xl font-normal text-[#171B1B]">
                01. Purpose
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#666D68]">
                Articulating the fundamental belief that justifies the work. Before features, metrics, or tactics, purpose defines why anyone should care.
              </p>
              <div className="mt-6 pt-4 border-t border-[#D8D8CF]">
                <span className="text-xs text-[#171B1B] font-medium">Practice: Clarify your 'Why' before assigning a task</span>
              </div>
            </div>

            {/* Lens 2: People */}
            <div className="group border border-[#D8D8CF] bg-[#F6F3EC] p-8 transition-all hover:border-[#171B1B]">
              <div className="flex h-12 w-12 items-center justify-center border border-[#171B1B] bg-[#171B1B] text-[#FFFEFA]">
                <Shield className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-6 font-serif-display text-2xl font-normal text-[#171B1B]">
                02. People & Trust
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#666D68]">
                Cultivating a circle of safety where team members feel protected from internal politics, so they can direct their courage toward solving shared challenges.
              </p>
              <div className="mt-6 pt-4 border-t border-[#D8D8CF]">
                <span className="text-xs text-[#171B1B] font-medium">Practice: Prioritize human safety over blame</span>
              </div>
            </div>

            {/* Lens 3: Practice */}
            <div className="group border border-[#D8D8CF] bg-[#F6F3EC] p-8 transition-all hover:border-[#171B1B]">
              <div className="flex h-12 w-12 items-center justify-center border border-[#171B1B] bg-[#171B1B] text-[#FFFEFA]">
                <Users className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-6 font-serif-display text-2xl font-normal text-[#171B1B]">
                03. Infinite Horizon
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#666D68]">
                Adopting the perspective that leadership is a continuum without a final whistle. Success is measured by resilience and stewardship rather than a single quarter.
              </p>
              <div className="mt-6 pt-4 border-t border-[#D8D8CF]">
                <span className="text-xs text-[#171B1B] font-medium">Practice: Build for continuity over temporary scoreboards</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Curated Topics */}
      <section className="border-b border-[#D8D8CF] bg-[#F6F3EC] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D64B37]">
                Curated Selection
              </p>
              <h2 className="font-serif-display text-3xl sm:text-4xl font-normal tracking-tight text-[#171B1B]">
                Featured ideas & reflections
              </h2>
              <p className="text-sm text-[#666D68]">
                Brief summaries of foundational concepts paired with actionable daily practices.
              </p>
            </div>
            <Link
              to="/ideas"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#171B1B] hover:text-[#D64B37] transition-colors"
            >
              <span>View all 8 topics</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {featuredTopics.map((topic) => (
              <div
                key={topic.id}
                className="flex flex-col justify-between border border-[#D8D8CF] bg-[#FFFEFA] p-8 shadow-sm transition-all hover:border-[#171B1B]"
              >
                <div className="space-y-4">
                  {/* Clean unboxed metadata with typographic separator (Zero-pill discipline) */}
                  <div className="flex items-center gap-2 text-xs text-[#666D68]">
                    <span className="font-medium text-[#D64B37]">{topic.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{topic.readTime}</span>
                  </div>

                  <h3 className="font-serif-display text-2xl font-normal text-[#171B1B]">
                    {topic.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-[#666D68]">
                    {topic.summary}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-[#D8D8CF] space-y-4">
                  <div className="rounded-none bg-[#DCE5D8]/50 p-3.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#171B1B]">
                      Daily Practice
                    </p>
                    <p className="mt-1 text-xs text-[#171B1B]/80 leading-relaxed">
                      {topic.practicePrompt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <a
                      href={topic.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#666D68] hover:text-[#171B1B] transition-colors"
                    >
                      <span>{topic.sourceLabel}</span>
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>

                    <Link
                      to="/ideas"
                      className="font-semibold text-[#171B1B] hover:text-[#D64B37] transition-colors"
                    >
                      Read Guide →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Practical Action Banner */}
      <section className="bg-[#171B1B] py-20 sm:py-24 text-[#FFFEFA]">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs uppercase tracking-[0.25em] text-[#D8D8CF]/70">
                Independent Practice
              </span>
              <h2 className="font-serif-display text-3xl sm:text-5xl font-normal tracking-tight text-[#FFFEFA]">
                Turn passive admiration into intentional practice.
              </h2>
              <p className="max-w-xl text-base text-[#D8D8CF] leading-relaxed">
                Receive occasional, thoughtful study notes with real-world leadership prompts and reflection frameworks. Free, independent, and always non-commercial.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">
              <Link
                to="/community"
                className="inline-flex items-center justify-center gap-2 rounded-none border border-[#FFFEFA] bg-[#FFFEFA] px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#171B1B] transition-all hover:bg-[#D64B37] hover:border-[#D64B37] hover:text-[#FFFEFA] active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D64B37]"
              >
                <span>Subscribe to Notes on WHY</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/ideas"
                className="inline-flex items-center justify-center gap-2 rounded-none border border-[#D8D8CF]/40 bg-transparent px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#FFFEFA] transition-all hover:border-[#FFFEFA] active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D64B37]"
              >
                <span>Browse Ideas Library</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
