import React, { useState, useEffect, useMemo } from 'react';
import { PODCAST_EPISODES, PODCAST_TOPICS, PodcastTopic, PodcastEpisode } from '../data/podcasts';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../router/Router';
import { getUserBookmarks, toggleUserBookmark } from '../lib/userData';
import {
  Bookmark,
  BookmarkCheck,
  Search,
  ExternalLink,
  Headphones,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export function PodcastPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();

  const [selectedTopic, setSelectedTopic] = useState<PodcastTopic>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [bookmarkFeedback, setBookmarkFeedback] = useState<string | null>(null);

  // Load user's bookmarks if authenticated
  useEffect(() => {
    if (user) {
      setLoadingBookmarks(true);
      getUserBookmarks(user.uid)
        .then((items) => {
          setBookmarkedIds(new Set(items.map((i) => i.episodeId)));
        })
        .catch(() => {})
        .finally(() => setLoadingBookmarks(false));
    } else {
      setBookmarkedIds(new Set());
    }
  }, [user]);

  const handleToggleBookmark = async (episode: PodcastEpisode) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    try {
      const added = await toggleUserBookmark(user.uid, episode.id, episode.title);
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (added) {
          next.add(episode.id);
          setBookmarkFeedback(`Saved "${episode.title}" to your bookmarks`);
        } else {
          next.delete(episode.id);
          setBookmarkFeedback(`Removed "${episode.title}" from bookmarks`);
        }
        return next;
      });

      setTimeout(() => setBookmarkFeedback(null), 3000);
    } catch (err: any) {
      console.error('[Bookmark Error]:', err);
    }
  };

  const filteredEpisodes = useMemo(() => {
    return PODCAST_EPISODES.filter((ep) => {
      const matchesTopic = selectedTopic === 'All' || ep.topic === selectedTopic;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        ep.title.toLowerCase().includes(query) ||
        ep.guest.toLowerCase().includes(query) ||
        ep.summary.toLowerCase().includes(query) ||
        ep.keyTakeaway.toLowerCase().includes(query);
      const matchesBookmark = !showBookmarkedOnly || bookmarkedIds.has(ep.id);

      return matchesTopic && matchesSearch && matchesBookmark;
    });
  }, [selectedTopic, searchQuery, showBookmarkedOnly, bookmarkedIds]);

  const handleResetFilters = () => {
    setSelectedTopic('All');
    setSearchQuery('');
    setShowBookmarkedOnly(false);
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Intro */}
        <div className="border-b border-[#D8D8CF] pb-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#666D68]">
              <span>Curated Audio Reference</span>
              <span aria-hidden="true">/</span>
              <span>Official Conversations</span>
            </div>
            <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-normal text-[#171B1B]">
              A Bit of Optimism
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-[#666D68]">
              An editorial directory for Simon Sinek's official podcast. Explore curated conversations with scientists, leaders, and thinkers, with direct links to official streaming platforms and private bookmarking.
            </p>
          </div>
        </div>

        {/* Feedback Alert for bookmarking */}
        {bookmarkFeedback && (
          <div
            className="mt-6 border border-[#236344] bg-[#DCE5D8] p-3 text-xs text-[#236344] flex items-center justify-between"
            role="status"
            aria-live="polite"
          >
            <span>{bookmarkFeedback}</span>
            <button
              onClick={() => setBookmarkFeedback(null)}
              className="text-[#236344] font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter and Search Controls */}
        <div className="mt-10 space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Category Filter Buttons */}
            <div
              className="flex flex-wrap items-center gap-1.5 p-1 bg-[#D8D8CF]/30 border border-[#D8D8CF]"
              role="group"
              aria-label="Filter episodes by topic"
            >
              {PODCAST_TOPICS.map((topic) => {
                const isActive = selectedTopic === topic;
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setSelectedTopic(topic)}
                    aria-pressed={isActive}
                    className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D64B37] ${
                      isActive
                        ? 'bg-[#171B1B] text-[#FFFEFA] shadow-sm'
                        : 'bg-transparent text-[#171B1B] hover:bg-[#FFFEFA]/60'
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>

            {/* Bookmarks Toggle & Search */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Bookmark Filter Toggle */}
              {user && (
                <button
                  type="button"
                  onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                  className={`inline-flex items-center gap-1.5 border px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    showBookmarkedOnly
                      ? 'border-[#D64B37] bg-[#D64B37] text-[#FFFEFA]'
                      : 'border-[#D8D8CF] bg-[#FFFEFA] text-[#171B1B] hover:bg-[#D8D8CF]/30'
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Saved ({bookmarkedIds.size})</span>
                </button>
              )}

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search
                  className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#666D68]"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search episode or guest..."
                  aria-label="Search episode or guest"
                  className="w-full border border-[#D8D8CF] bg-[#FFFEFA] py-2.5 pl-9 pr-3 text-xs text-[#171B1B] placeholder-[#666D68] focus:border-[#171B1B] focus:outline-none"
                />
              </div>

              {(selectedTopic !== 'All' || searchQuery.trim() || showBookmarkedOnly) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 border border-[#D8D8CF] bg-[#FFFEFA] px-3 py-2.5 text-xs font-medium text-[#171B1B] hover:bg-[#D8D8CF]/30 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-[#D64B37]" aria-hidden="true" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          <div className="text-xs text-[#666D68]">
            Showing <span className="font-semibold text-[#171B1B]">{filteredEpisodes.length}</span> of{' '}
            <span className="font-semibold text-[#171B1B]">{PODCAST_EPISODES.length}</span> episodes
          </div>
        </div>

        {/* Podcast Cards Grid */}
        {filteredEpisodes.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredEpisodes.map((ep) => {
              const isBookmarked = bookmarkedIds.has(ep.id);
              return (
                <article
                  key={ep.id}
                  className="flex flex-col justify-between border border-[#D8D8CF] bg-[#FFFEFA] p-8 transition-all hover:border-[#171B1B] hover:shadow-sm"
                >
                  <div className="space-y-4">
                    {/* Header line: Episode number, Topic metadata, Bookmark button */}
                    <div className="flex items-center justify-between text-xs text-[#666D68]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#D64B37]">
                          EP {ep.episodeNumber.toString().padStart(2, '0')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-[#171B1B]">{ep.topic}</span>
                        <span aria-hidden="true">·</span>
                        <span>{ep.duration}</span>
                      </div>

                      {/* Bookmark Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleBookmark(ep)}
                        className={`p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D64B37] ${
                          isBookmarked
                            ? 'text-[#D64B37] hover:text-[#9E2D21]'
                            : 'text-[#666D68] hover:text-[#171B1B]'
                        }`}
                        title={
                          user
                            ? isBookmarked
                              ? 'Remove bookmark'
                              : 'Bookmark episode'
                            : 'Sign in to bookmark'
                        }
                        aria-label={`${isBookmarked ? 'Remove bookmark for' : 'Bookmark'} ${ep.title}`}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="h-4 w-4 fill-current" aria-hidden="true" />
                        ) : (
                          <Bookmark className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>

                    <h2 className="font-serif-display text-2xl font-normal text-[#171B1B]">
                      {ep.title}
                    </h2>

                    <p className="text-xs font-semibold text-[#D64B37]">
                      Conversation with {ep.guest}
                    </p>

                    <p className="text-sm leading-relaxed text-[#666D68]">
                      {ep.summary}
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-[#D8D8CF] space-y-4">
                    {/* Key Takeaway */}
                    <div className="rounded-none bg-[#DCE5D8]/40 p-3.5 text-xs text-[#171B1B] leading-relaxed">
                      <strong className="block text-[10px] font-bold uppercase tracking-wider text-[#171B1B]/70 mb-1">
                        Core Takeaway
                      </strong>
                      "{ep.keyTakeaway}"
                    </div>

                    {/* Official Audio Outbound Links */}
                    <div className="space-y-2 pt-1 text-xs">
                      <span className="text-[10px] uppercase tracking-wider text-[#666D68] block">
                        Official Listening Destinations:
                      </span>
                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href={ep.appleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-[#171B1B] hover:text-[#D64B37] transition-colors"
                        >
                          <span>Apple</span>
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                        <span className="text-[#D8D8CF]">|</span>
                        <a
                          href={ep.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-[#171B1B] hover:text-[#D64B37] transition-colors"
                        >
                          <span>Spotify</span>
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                        <span className="text-[#D8D8CF]">|</span>
                        <a
                          href={ep.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-[#171B1B] hover:text-[#D64B37] transition-colors"
                        >
                          <span>Official Portal</span>
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="mt-12 border border-dashed border-[#D8D8CF] bg-[#FFFEFA] p-12 text-center">
            <div className="mx-auto max-w-md space-y-4">
              <Headphones className="mx-auto h-8 w-8 text-[#666D68]" aria-hidden="true" />
              <h2 className="font-serif-display text-2xl font-normal text-[#171B1B]">
                No podcast episodes matched
              </h2>
              <p className="text-sm text-[#666D68]">
                {showBookmarkedOnly
                  ? "You haven't bookmarked any episodes matching this criteria yet."
                  : `No conversations found matching "${searchQuery}" under ${selectedTopic}.`}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 border border-[#171B1B] bg-[#171B1B] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FFFEFA] hover:bg-[#D64B37] hover:border-[#D64B37] transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
