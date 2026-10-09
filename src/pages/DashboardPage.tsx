import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../router/Router';
import {
  getUserCanvases,
  deleteUserCanvas,
  PurposeCanvasItem,
  getUserBookmarks,
  toggleUserBookmark,
  PodcastBookmarkItem,
} from '../lib/userData';
import { PODCAST_EPISODES } from '../data/podcasts';
import {
  User,
  Compass,
  Bookmark,
  LogOut,
  Trash2,
  ExternalLink,
  Edit3,
  Plus,
  ShieldCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export function DashboardPage() {
  const { user, profile, loading, signOutUser, sendVerification } = useAuth();
  const { navigate } = useRouter();

  const [canvases, setCanvases] = useState<PurposeCanvasItem[]>([]);
  const [bookmarks, setBookmarks] = useState<PodcastBookmarkItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading]);

  const loadUserData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const [cList, bList] = await Promise.all([
        getUserCanvases(user.uid),
        getUserBookmarks(user.uid),
      ]);
      setCanvases(cList);
      setBookmarks(bList);
    } catch (err: any) {
      console.error('[Dashboard Error]:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const handleDeleteCanvas = async (canvasId: string, canvasTitle: string) => {
    if (!user) return;
    if (!window.confirm(`Are you sure you want to delete "${canvasTitle}"?`)) return;

    try {
      await deleteUserCanvas(user.uid, canvasId);
      setCanvases((prev) => prev.filter((c) => c.id !== canvasId));
      setFeedback({ type: 'success', text: `Canvas "${canvasTitle}" was removed.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to delete canvas.' });
    }
  };

  const handleRemoveBookmark = async (episodeId: string) => {
    if (!user) return;
    try {
      await toggleUserBookmark(user.uid, episodeId, '');
      setBookmarks((prev) => prev.filter((b) => b.episodeId !== episodeId));
      setFeedback({ type: 'success', text: 'Bookmark removed.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', text: 'Could not remove bookmark.' });
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/');
  };

  if (loading || (!user && loading)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F6F3EC]">
        <div className="flex items-center gap-3 text-sm text-[#666D68]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#171B1B] border-r-transparent" />
          <span>Restoring session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-[#F6F3EC] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Header with User Info & Sign Out */}
        <div className="border-b border-[#D8D8CF] pb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#666D68]">
              <span>Private Dashboard</span>
              <span aria-hidden="true">/</span>
              <span>Owner Isolated</span>
            </div>
            <h1 className="font-serif-display text-4xl sm:text-5xl font-normal text-[#171B1B]">
              Welcome, {user.displayName || user.email?.split('@')[0]}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#666D68]">
              <span>Account: {user.email}</span>
              <span aria-hidden="true">·</span>
              <span>UID: {user.uid.slice(0, 8)}...</span>
              {user.emailVerified ? (
                <span className="inline-flex items-center gap-1 text-[#236344]">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Email Verified</span>
                </span>
              ) : (
                <button
                  onClick={() => {
                    sendVerification();
                    setFeedback({ type: 'success', text: 'Verification email sent. Check your inbox.' });
                  }}
                  className="text-[#D64B37] underline hover:text-[#9E2D21]"
                >
                  Send verification email
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/practice')}
              className="inline-flex items-center gap-1.5 border border-[#171B1B] bg-[#171B1B] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FFFEFA] hover:bg-[#D64B37] hover:border-[#D64B37] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>New Canvas</span>
            </button>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 border border-[#D8D8CF] bg-[#FFFEFA] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#171B1B] hover:bg-[#D8D8CF]/30 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mt-6 flex items-center justify-between border p-3.5 text-xs sm:text-sm ${
              feedback.type === 'success'
                ? 'border-[#236344] bg-[#DCE5D8] text-[#236344]'
                : 'border-[#A32F2F] bg-[#A32F2F]/10 text-[#A32F2F]'
            }`}
            role="alert"
          >
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              className="font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dashboard Sections */}
        <div className="mt-12 space-y-16">
          {/* Section 1: Saved Purpose Canvases */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#D8D8CF] pb-3">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-[#D64B37]" aria-hidden="true" />
                <h2 className="font-serif-display text-2xl font-normal text-[#171B1B]">
                  Your Purpose Canvases ({canvases.length})
                </h2>
              </div>
              <button
                onClick={() => navigate('/practice')}
                className="text-xs font-semibold text-[#D64B37] hover:underline"
              >
                Open Studio →
              </button>
            </div>

            {loadingData ? (
              <p className="text-xs text-[#666D68]">Loading your saved work...</p>
            ) : canvases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {canvases.map((canvas) => (
                  <article
                    key={canvas.id}
                    className="flex flex-col justify-between border border-[#D8D8CF] bg-[#FFFEFA] p-6 shadow-sm hover:border-[#171B1B] transition-colors"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif-display text-xl font-normal text-[#171B1B]">
                          {canvas.title}
                        </h3>
                        <button
                          onClick={() => handleDeleteCanvas(canvas.id, canvas.title)}
                          className="text-[#666D68] hover:text-[#A32F2F] transition-colors p-1"
                          title="Delete canvas"
                          aria-label={`Delete canvas ${canvas.title}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="space-y-2 text-xs text-[#666D68]">
                        <p className="line-clamp-2">
                          <strong className="text-[#D64B37] font-semibold">Why: </strong>
                          {canvas.why || 'Unspecified'}
                        </p>
                        <p className="line-clamp-2">
                          <strong className="text-[#171B1B] font-semibold">How: </strong>
                          {canvas.how || 'Unspecified'}
                        </p>
                        <p className="line-clamp-2">
                          <strong className="text-[#171B1B] font-semibold">What: </strong>
                          {canvas.what || 'Unspecified'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#D8D8CF] flex items-center justify-between text-[11px] text-[#666D68]">
                      <span>Updated: {new Date(canvas.updatedAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => navigate('/practice')}
                        className="inline-flex items-center gap-1 font-semibold text-[#171B1B] hover:text-[#D64B37] transition-colors"
                      >
                        <Edit3 className="h-3 w-3" aria-hidden="true" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-[#D8D8CF] bg-[#FFFEFA] p-10 text-center space-y-4">
                <Compass className="mx-auto h-8 w-8 text-[#666D68]" aria-hidden="true" />
                <h3 className="font-serif-display text-xl text-[#171B1B]">
                  No canvases created yet
                </h3>
                <p className="text-xs text-[#666D68] max-w-sm mx-auto">
                  Translate your project's Why, How, and What into an intentional charter using the interactive Golden Circle canvas.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/practice')}
                    className="inline-flex items-center gap-2 border border-[#171B1B] bg-[#171B1B] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FFFEFA] hover:bg-[#D64B37] hover:border-[#D64B37] transition-colors"
                  >
                    <span>Launch Purpose Canvas</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Section 2: Bookmarked Podcast Episodes */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#D8D8CF] pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-[#171B1B]" aria-hidden="true" />
                <h2 className="font-serif-display text-2xl font-normal text-[#171B1B]">
                  Saved Podcast Episodes ({bookmarks.length})
                </h2>
              </div>
              <button
                onClick={() => navigate('/podcast')}
                className="text-xs font-semibold text-[#D64B37] hover:underline"
              >
                Browse Directory →
              </button>
            </div>

            {loadingData ? (
              <p className="text-xs text-[#666D68]">Loading bookmarks...</p>
            ) : bookmarks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks.map((bm) => {
                  const episode = PODCAST_EPISODES.find((ep) => ep.id === bm.episodeId);
                  return (
                    <article
                      key={bm.episodeId}
                      className="flex flex-col justify-between border border-[#D8D8CF] bg-[#FFFEFA] p-6 shadow-sm hover:border-[#171B1B] transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#D64B37]">
                            {episode ? `EP ${episode.episodeNumber}` : 'Episode'}
                          </span>
                          <button
                            onClick={() => handleRemoveBookmark(bm.episodeId)}
                            className="text-[#666D68] hover:text-[#A32F2F] p-1"
                            title="Remove bookmark"
                            aria-label={`Remove bookmark for ${bm.title}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>

                        <h3 className="font-serif-display text-lg font-normal text-[#171B1B]">
                          {episode?.title || bm.title}
                        </h3>

                        {episode && (
                          <p className="text-xs text-[#666D68] line-clamp-2">
                            {episode.summary}
                          </p>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#D8D8CF] flex items-center justify-between text-xs">
                        <span className="text-[11px] text-[#666D68]">
                          {episode ? episode.guest : 'Simon Sinek'}
                        </span>
                        <a
                          href={episode?.officialUrl || 'https://simonsinek.com/podcast/'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-[#171B1B] hover:text-[#D64B37]"
                        >
                          <span>Listen</span>
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="border border-dashed border-[#D8D8CF] bg-[#FFFEFA] p-10 text-center space-y-4">
                <Bookmark className="mx-auto h-8 w-8 text-[#666D68]" aria-hidden="true" />
                <h3 className="font-serif-display text-xl text-[#171B1B]">
                  No saved conversations
                </h3>
                <p className="text-xs text-[#666D68] max-w-sm mx-auto">
                  Bookmark episodes from the curated podcast directory to revisit key leadership insights whenever you need them.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/podcast')}
                    className="inline-flex items-center gap-2 border border-[#171B1B] bg-[#171B1B] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FFFEFA] hover:bg-[#D64B37] hover:border-[#D64B37] transition-colors"
                  >
                    <span>Browse Podcast Episodes</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
