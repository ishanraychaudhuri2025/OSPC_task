import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../router/Router';
import { GoldenCircleIllustration } from '../components/GoldenCircleIllustration';
import { saveUserCanvas, deleteUserCanvas, PurposeCanvasItem, getUserCanvases } from '../lib/userData';
import {
  Save,
  RotateCcw,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FolderOpen,
  Trash2,
  HelpCircle,
} from 'lucide-react';

export function PracticePage() {
  const { user } = useAuth();
  const { navigate } = useRouter();

  const [activeRing, setActiveRing] = useState<'why' | 'how' | 'what'>('why');
  const [title, setTitle] = useState('');
  const [whyText, setWhyText] = useState('');
  const [howText, setHowText] = useState('');
  const [whatText, setWhatText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [savedCanvases, setSavedCanvases] = useState<PurposeCanvasItem[]>([]);
  const [loadingCanvases, setLoadingCanvases] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load user's saved canvases if authenticated
  useEffect(() => {
    if (user) {
      setLoadingCanvases(true);
      getUserCanvases(user.uid)
        .then((items) => setSavedCanvases(items))
        .catch(() => {})
        .finally(() => setLoadingCanvases(false));
    } else {
      setSavedCanvases([]);
    }
  }, [user]);

  const handleSelectSaved = (canvas: PurposeCanvasItem) => {
    setEditingId(canvas.id);
    setTitle(canvas.title);
    setWhyText(canvas.why);
    setHowText(canvas.how);
    setWhatText(canvas.what);
    setStatusMsg({ type: 'success', text: `Loaded canvas "${canvas.title}"` });
  };

  const handleClear = () => {
    setEditingId(null);
    setTitle('');
    setWhyText('');
    setHowText('');
    setWhatText('');
    setStatusMsg(null);
  };

  const handleSave = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!whyText.trim() && !howText.trim() && !whatText.trim()) {
      setStatusMsg({ type: 'error', text: 'Please fill in at least one section of the canvas before saving.' });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      const saved = await saveUserCanvas(user.uid, {
        id: editingId || undefined,
        title: title.trim() || 'Untitled Purpose Canvas',
        why: whyText,
        how: howText,
        what: whatText,
      });

      setEditingId(saved.id);
      setStatusMsg({ type: 'success', text: 'Canvas saved successfully to your Practice Lab!' });

      // Refresh list
      const updated = await getUserCanvases(user.uid);
      setSavedCanvases(updated);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Could not save canvas. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCurrent = async () => {
    if (!user || !editingId) return;
    if (!window.confirm('Are you sure you want to delete this canvas?')) return;

    try {
      await deleteUserCanvas(user.uid, editingId);
      handleClear();
      setStatusMsg({ type: 'success', text: 'Canvas deleted.' });
      const updated = await getUserCanvases(user.uid);
      setSavedCanvases(updated);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Failed to delete canvas.' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Intro Header */}
        <div className="border-b border-[#D8D8CF] pb-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#666D68]">
                <span>Interactive Studio</span>
                <span aria-hidden="true">/</span>
                <span>The Golden Circle</span>
              </div>
              <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-normal text-[#171B1B]">
                The Purpose Canvas
              </h1>
              <p className="text-sm sm:text-base text-[#666D68] leading-relaxed">
                Articulate your initiative from the inside out: Why, How, and What. Work live as a guest or sign in to persist and manage multiple canvases in your dashboard.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={handleDeleteCurrent}
                  className="inline-flex items-center gap-1.5 border border-[#A32F2F]/30 bg-[#A32F2F]/10 px-3.5 py-2.5 text-xs font-semibold text-[#A32F2F] hover:bg-[#A32F2F] hover:text-[#FFFEFA] transition-colors"
                  title="Delete this canvas"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Delete</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 border border-[#D8D8CF] bg-[#FFFEFA] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#171B1B] hover:bg-[#D8D8CF]/30 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>New Canvas</span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 border border-[#171B1B] bg-[#171B1B] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FFFEFA] hover:bg-[#D64B37] hover:border-[#D64B37] transition-all disabled:opacity-70"
              >
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{saving ? 'Saving...' : user ? 'Save Canvas' : 'Sign In to Save'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div
            className={`mt-6 flex items-start gap-3 border p-4 text-xs sm:text-sm ${
              statusMsg.type === 'success'
                ? 'border-[#236344] bg-[#DCE5D8] text-[#236344]'
                : 'border-[#A32F2F] bg-[#A32F2F]/10 text-[#A32F2F]'
            }`}
            role="alert"
            aria-live="polite"
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Guest Callout if not signed in */}
        {!user && (
          <div className="mt-6 flex items-center justify-between border border-[#D8D8CF] bg-[#FFFEFA] p-4 text-xs text-[#666D68]">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#D64B37]" aria-hidden="true" />
              <span>
                You are designing in <strong>Guest Mode</strong>. Your work is live in this session. Sign in to keep it stored permanently.
              </span>
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="font-semibold text-[#171B1B] hover:text-[#D64B37] underline underline-offset-4"
            >
              Sign in or create account →
            </button>
          </div>
        )}

        {/* Main Canvas Grid: Left (Inputs & Prompts), Right (Interactive Visual Preview) */}
        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left: Input Fields */}
          <div className="lg:col-span-7 space-y-6">
            {/* Title */}
            <div className="border border-[#D8D8CF] bg-[#FFFEFA] p-6 shadow-sm space-y-3">
              <label
                htmlFor="canvas-title"
                className="block text-xs font-bold uppercase tracking-wider text-[#171B1B]"
              >
                Canvas Title / Project Name
              </label>
              <input
                id="canvas-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Student Leadership Initiative 2026"
                className="w-full border border-[#D8D8CF] bg-[#FFFEFA] px-4 py-3 text-sm text-[#171B1B] placeholder-[#666D68]/50 focus:border-[#171B1B] focus:outline-none"
              />
            </div>

            {/* Stepped Ring Tabs */}
            <div className="border border-[#D8D8CF] bg-[#FFFEFA] shadow-sm">
              <div className="flex border-b border-[#D8D8CF] bg-[#F6F3EC]/50 text-xs font-semibold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setActiveRing('why')}
                  className={`flex-1 py-3 text-center border-r border-[#D8D8CF] transition-colors ${
                    activeRing === 'why'
                      ? 'bg-[#FFFEFA] text-[#D64B37] border-b-2 border-b-[#D64B37]'
                      : 'text-[#666D68] hover:text-[#171B1B]'
                  }`}
                >
                  1. Why (Purpose)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRing('how')}
                  className={`flex-1 py-3 text-center border-r border-[#D8D8CF] transition-colors ${
                    activeRing === 'how'
                      ? 'bg-[#FFFEFA] text-[#171B1B] border-b-2 border-b-[#171B1B]'
                      : 'text-[#666D68] hover:text-[#171B1B]'
                  }`}
                >
                  2. How (Process)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRing('what')}
                  className={`flex-1 py-3 text-center transition-colors ${
                    activeRing === 'what'
                      ? 'bg-[#FFFEFA] text-[#171B1B] border-b-2 border-b-[#171B1B]'
                      : 'text-[#666D68] hover:text-[#171B1B]'
                  }`}
                >
                  3. What (Result)
                </button>
              </div>

              {/* Active Tab Panel */}
              <div className="p-6 sm:p-8 space-y-4">
                {activeRing === 'why' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#D64B37]">
                        Core Purpose & Belief
                      </span>
                      <span className="text-[11px] text-[#666D68]">The center of the circle</span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#666D68]">
                      Why does your initiative exist? Why do you get out of bed in the morning, and why should anyone care? (Avoid mentioning money or revenue; those are outcomes).
                    </p>
                    <textarea
                      rows={5}
                      value={whyText}
                      onChange={(e) => setWhyText(e.target.value)}
                      placeholder="We exist to..."
                      className="w-full border border-[#D8D8CF] bg-[#FFFEFA] p-4 text-sm text-[#171B1B] placeholder-[#666D68]/40 focus:border-[#171B1B] focus:outline-none"
                    />
                  </div>
                )}

                {activeRing === 'how' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#171B1B]">
                        Guiding Values & Process
                      </span>
                      <span className="text-[11px] text-[#666D68]">The middle circle</span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#666D68]">
                      How do you bring that Why to life? What are your non-negotiable principles, strengths, and cultural guardrails that determine how decisions are made?
                    </p>
                    <textarea
                      rows={5}
                      value={howText}
                      onChange={(e) => setHowText(e.target.value)}
                      placeholder="We practice this by..."
                      className="w-full border border-[#D8D8CF] bg-[#FFFEFA] p-4 text-sm text-[#171B1B] placeholder-[#666D68]/40 focus:border-[#171B1B] focus:outline-none"
                    />
                  </div>
                )}

                {activeRing === 'what' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#171B1B]">
                        Tangible Offerings & Outcomes
                      </span>
                      <span className="text-[11px] text-[#666D68]">The outer circle</span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#666D68]">
                      What do you actually produce as tangible proof of that Why? What are the observable products, services, events, or deliverables?
                    </p>
                    <textarea
                      rows={5}
                      value={whatText}
                      onChange={(e) => setWhatText(e.target.value)}
                      placeholder="Our visible deliverables are..."
                      className="w-full border border-[#D8D8CF] bg-[#FFFEFA] p-4 text-sm text-[#171B1B] placeholder-[#666D68]/40 focus:border-[#171B1B] focus:outline-none"
                    />
                  </div>
                )}

                {/* Navigation helpers between rings */}
                <div className="flex items-center justify-between pt-4 border-t border-[#D8D8CF]">
                  {activeRing !== 'why' ? (
                    <button
                      type="button"
                      onClick={() => setActiveRing(activeRing === 'what' ? 'how' : 'why')}
                      className="text-xs font-semibold text-[#666D68] hover:text-[#171B1B]"
                    >
                      ← Previous Ring
                    </button>
                  ) : <div />}

                  {activeRing !== 'what' ? (
                    <button
                      type="button"
                      onClick={() => setActiveRing(activeRing === 'why' ? 'how' : 'what')}
                      className="text-xs font-semibold text-[#171B1B] hover:text-[#D64B37]"
                    >
                      Next Ring →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSave}
                      className="text-xs font-semibold text-[#D64B37] hover:underline"
                    >
                      Finish & Save Canvas →
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Saved Canvases Drawer if user is signed in */}
            {user && savedCanvases.length > 0 && (
              <div className="border border-[#D8D8CF] bg-[#FFFEFA] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#171B1B]">
                    Your Saved Canvases ({savedCanvases.length})
                  </h3>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-xs text-[#D64B37] hover:underline"
                  >
                    Manage all in Dashboard →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedCanvases.map((canvas) => (
                    <button
                      key={canvas.id}
                      type="button"
                      onClick={() => handleSelectSaved(canvas)}
                      className={`text-left p-3 border transition-colors ${
                        editingId === canvas.id
                          ? 'border-[#D64B37] bg-[#DCE5D8]/30'
                          : 'border-[#D8D8CF] hover:border-[#171B1B]'
                      }`}
                    >
                      <p className="text-xs font-semibold text-[#171B1B] truncate">{canvas.title}</p>
                      <p className="mt-1 text-[11px] text-[#666D68] line-clamp-1">Why: {canvas.why || 'Not specified'}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Live Interactive Golden Circle Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 border border-[#D8D8CF] bg-[#FFFEFA] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-[#D8D8CF] pb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-serif-display text-xl font-normal text-[#171B1B]">
                    Live Visual Preview
                  </h2>
                  <p className="text-xs text-[#666D68]">
                    Concentric ring alignment
                  </p>
                </div>
                <span className="text-[10px] font-mono uppercase bg-[#F6F3EC] px-2 py-1 border border-[#D8D8CF]">
                  {editingId ? 'Saved' : 'Draft'}
                </span>
              </div>

              {/* Custom Interactive Concentric Ring SVG */}
              <GoldenCircleIllustration
                activeRing={activeRing}
                onRingSelect={(ring) => setActiveRing(ring)}
                whyText={whyText}
                howText={howText}
                whatText={whatText}
              />

              {/* Summary Digest */}
              <div className="space-y-3 pt-2 text-xs border-t border-[#D8D8CF]">
                <div>
                  <strong className="text-[#D64B37] font-semibold">Why: </strong>
                  <span className="text-[#171B1B]">{whyText.trim() || <span className="text-[#666D68] italic">Unwritten</span>}</span>
                </div>
                <div>
                  <strong className="text-[#171B1B] font-semibold">How: </strong>
                  <span className="text-[#171B1B]">{howText.trim() || <span className="text-[#666D68] italic">Unwritten</span>}</span>
                </div>
                <div>
                  <strong className="text-[#171B1B] font-semibold">What: </strong>
                  <span className="text-[#171B1B]">{whatText.trim() || <span className="text-[#666D68] italic">Unwritten</span>}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
