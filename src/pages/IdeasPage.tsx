import React, { useState, useMemo } from 'react';
import { TOPICS, TOPIC_CATEGORIES, TopicCategory, TopicItem } from '../data/topics';
import { Search, RotateCcw, ExternalLink, ArrowRight, BookOpen, Filter } from 'lucide-react';
import { Link } from '../router/Router';

export function IdeasPage() {
  const [selectedCategory, setSelectedCategory] = useState<TopicCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter topics based on active category and search query
  const filteredTopics = useMemo(() => {
    return TOPICS.filter((topic) => {
      const matchesCategory =
        selectedCategory === 'All' || topic.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        topic.title.toLowerCase().includes(query) ||
        topic.summary.toLowerCase().includes(query) ||
        topic.category.toLowerCase().includes(query) ||
        topic.practicePrompt.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Header / Intro */}
        <div className="border-b border-[#D8D8CF] pb-12">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#666D68]">
              <span>Curated Reference</span>
              <span aria-hidden="true">/</span>
              <span>8 Selected Principles</span>
            </div>

            <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#171B1B]">
              The Ideas Library
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-[#666D68]">
              An independent study guide surveying concepts popularized by Simon Sinek. Each card pairs an original summary with a verified source link and a small daily reflection prompt.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-10 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Interactive Category Segmented Filter (Functional Buttons with accessible styling) */}
            <div
              className="flex flex-wrap items-center gap-1.5 p-1 bg-[#D8D8CF]/30 border border-[#D8D8CF]"
              role="group"
              aria-label="Filter topics by category"
            >
              {TOPIC_CATEGORIES.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    aria-pressed={isActive}
                    className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D64B37] ${
                      isActive
                        ? 'bg-[#171B1B] text-[#FFFEFA] shadow-sm'
                        : 'bg-transparent text-[#171B1B] hover:bg-[#FFFEFA]/60'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {/* Search Input & Reset */}
            <div className="flex items-center gap-3 w-full lg:w-80">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666D68]"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ideas or prompts..."
                  aria-label="Search ideas or prompts"
                  className="w-full border border-[#D8D8CF] bg-[#FFFEFA] py-2.5 pl-10 pr-4 text-xs text-[#171B1B] placeholder-[#666D68] focus:border-[#171B1B] focus:outline-none"
                />
              </div>

              {(selectedCategory !== 'All' || searchQuery.trim().length > 0) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 border border-[#D8D8CF] bg-[#FFFEFA] px-3 py-2.5 text-xs font-medium text-[#171B1B] hover:bg-[#D8D8CF]/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D64B37]"
                  title="Reset all filters"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-[#D64B37]" aria-hidden="true" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Filter State Notice */}
          <div className="flex items-center justify-between text-xs text-[#666D68] pt-2">
            <div>
              Showing <span className="font-semibold text-[#171B1B]">{filteredTopics.length}</span> of{' '}
              <span className="font-semibold text-[#171B1B]">{TOPICS.length}</span> topics
              {selectedCategory !== 'All' && (
                <span>
                  {' '}in <span className="font-semibold text-[#171B1B]">{selectedCategory}</span>
                </span>
              )}
              {searchQuery.trim() && (
                <span>
                  {' '}matching "<span className="font-semibold text-[#171B1B]">{searchQuery}</span>"
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Topics Cards Grid */}
        {filteredTopics.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredTopics.map((topic) => (
              <article
                key={topic.id}
                className="flex flex-col justify-between border border-[#D8D8CF] bg-[#FFFEFA] p-8 transition-all hover:border-[#171B1B] hover:shadow-sm"
              >
                <div className="space-y-4">
                  {/* Clean unboxed metadata with typographic separator (Zero-pill discipline) */}
                  <div className="flex items-center gap-2 text-xs text-[#666D68]">
                    <span className="font-semibold text-[#D64B37]">{topic.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{topic.readTime}</span>
                    {topic.referencePublication && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="italic">{topic.referencePublication}</span>
                      </>
                    )}
                  </div>

                  <h2 className="font-serif-display text-2xl font-normal text-[#171B1B]">
                    {topic.title}
                  </h2>

                  <p className="text-sm leading-relaxed text-[#666D68]">
                    {topic.summary}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-[#D8D8CF] space-y-4">
                  <div className="rounded-none bg-[#DCE5D8]/50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#171B1B]">
                      Daily Practice Prompt
                    </p>
                    <p className="mt-1.5 text-xs text-[#171B1B] leading-relaxed">
                      {topic.practicePrompt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <a
                      href={topic.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-[#171B1B] hover:text-[#D64B37] transition-colors"
                      aria-label={`${topic.sourceLabel} for ${topic.title} (opens in a new tab)`}
                    >
                      <span>{topic.sourceLabel}</span>
                      <ExternalLink className="h-3 w-3 text-[#666D68]" aria-hidden="true" />
                    </a>

                    <Link
                      to="/community"
                      className="text-[#666D68] hover:text-[#D64B37] transition-colors font-medium"
                    >
                      Discuss in Notes →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="mt-12 border border-dashed border-[#D8D8CF] bg-[#FFFEFA] p-12 text-center">
            <div className="mx-auto max-w-md space-y-4">
              <h2 className="font-serif-display text-2xl font-normal text-[#171B1B]">
                No topics matched your search
              </h2>
              <p className="text-sm text-[#666D68]">
                We couldn't find any principles matching "{searchQuery}" under {selectedCategory}. Try resetting your search filters to explore the full catalog.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 border border-[#171B1B] bg-[#171B1B] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FFFEFA] transition-colors hover:bg-[#D64B37] hover:border-[#D64B37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D64B37]"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA to Community */}
        <div className="mt-20 border-t border-[#D8D8CF] pt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 bg-[#FFFEFA] p-8 border">
          <div className="space-y-1">
            <h3 className="font-serif-display text-xl text-[#171B1B]">
              Reflecting on these topics?
            </h3>
            <p className="text-sm text-[#666D68]">
              Join our independent study group for bi-weekly prompts and shared learning notes.
            </p>
          </div>
          <Link
            to="/community"
            className="inline-flex items-center justify-center gap-2 rounded-none border border-[#171B1B] bg-[#171B1B] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#FFFEFA] transition-all hover:bg-[#D64B37] hover:border-[#D64B37]"
          >
            <span>Join Notes on WHY</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
