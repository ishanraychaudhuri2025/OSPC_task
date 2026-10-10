import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, RefreshCw, LogIn, CalendarDays, Mail, FileText, Clock3, ListChecks } from 'lucide-react';
import { Link } from '../router/Router';
import { useAuth } from '../context/AuthContext';
import { getRecaptchaEnterpriseToken } from '../lib/recaptchaEnterprise';

type FormStatus = 'idle' | 'submitting' | 'success' | 'already_subscribed' | 'error';
type ActivityRecord = {
  id: string;
  title: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  detail: string | null;
};

type CommunityActivity = {
  accountEmail: string;
  subscriptions: ActivityRecord[];
  applications: ActivityRecord[];
  waitlist: ActivityRecord[];
  emailDeliveryEnabled: boolean;
  activityUpdatedAt: string;
};

function formatActivityDate(value: string | null): string {
  if (!value) return 'Date not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date not available';
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function ActivityRecordCard({ record }: { record: ActivityRecord }) {
  return (
    <article className="border border-[#D8D0C3] bg-[#FFFEFA] p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <h4 className="font-serif-display text-xl font-normal text-[#1B1A17]">{record.title}</h4>
          <p className="text-xs leading-relaxed text-[#777268]">{record.detail || 'A record is associated with your account.'}</p>
        </div>
        <span className="inline-flex w-fit shrink-0 items-center gap-2 border border-[#B4A286]/60 bg-[#F2EFE8] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#64523C]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#92795B]" aria-hidden="true" />
          {record.status}
        </span>
      </div>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#E4DED3] pt-3 text-[11px] text-[#777268]">
        {record.createdAt && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            Recorded {formatActivityDate(record.createdAt)}
          </span>
        )}
        {record.updatedAt && record.updatedAt !== record.createdAt && (
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            Updated {formatActivityDate(record.updatedAt)}
          </span>
        )}
      </div>
    </article>
  );
}


export function CommunityPage() {
  const { user, loading: authLoading } = useAuth();
  const [activity, setActivity] = useState<CommunityActivity | null>(null);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState('');

  const loadActivity = useCallback(async () => {
    if (!user) {
      setActivity(null);
      setActivityError('');
      setActivityLoading(false);
      return;
    }

    setActivityLoading(true);
    setActivityError('');
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/community-activity', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const data = await response.json() as CommunityActivity & { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.message || 'Your activity could not be loaded.');
      }
      setActivity(data);
    } catch (error) {
      setActivityError(error instanceof Error ? error.message : 'Your activity could not be loaded.');
      setActivity(null);
    } finally {
      setActivityLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void loadActivity();
  }, [authLoading, loadActivity]);

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [interest, setInterest] = useState<'Purpose' | 'Leadership' | 'Trust & Teams' | 'Infinite Mindset' | ''>('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // Honeypot field

  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; consent?: string }>({});

  const validateForm = () => {
    const errors: { email?: string; consent?: string } = {};
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address (e.g., name@example.com).';
    }

    if (!consent) {
      errors.consent = 'You must acknowledge the independent project consent to proceed.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      setStatus('idle');
      return;
    }

    setStatus('submitting');

    try {
      const recaptchaToken = await getRecaptchaEnterpriseToken('NEWSLETTER_SIGNUP');
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim() || undefined,
          interest: interest || undefined,
          consent: true,
          website: website, // Honeypot
          recaptchaToken,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        setStatus('success');
        if (user?.email?.trim().toLowerCase() === email.trim().toLowerCase()) void loadActivity();
      } else if (response.status === 200 && data.status === 'already_subscribed') {
        setStatus('already_subscribed');
        if (user?.email?.trim().toLowerCase() === email.trim().toLowerCase()) void loadActivity();
      } else if (response.status === 400) {
        setStatus('error');
        setErrorMessage(data.message || 'Please check the information provided.');
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'An unexpected error occurred. Please try again later.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Could not complete the signup request or its anti-abuse verification. Please refresh the page and try again.');
    }
  };

  const handleResetForm = () => {
    setEmail('');
    setFirstName('');
    setInterest('');
    setConsent(false);
    setWebsite('');
    setStatus('idle');
    setErrorMessage('');
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-6 sm:px-8 lg:px-12">
        {/* Intro */}
        <div className="border-b border-[#D8D8CF] pb-10">
          <div className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-[#666D68]">
            <span>Independent Study List</span>
            <span aria-hidden="true">/</span>
            <span>Non-Commercial Opt-In</span>
          </div>

          <h1 className="mt-4 font-serif-display text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#171B1B]">
            Notes on WHY
          </h1>

          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#666D68]">
            An independent, occasional learning note exploring actionable reflections on purpose, stewardship, and organizational trust.
          </p>
        </div>

        {/* Form Container */}
        <div className="mt-10 border border-[#D8D8CF] bg-[#FFFEFA] p-8 sm:p-12 shadow-sm">
          {status === 'success' ? (
            /* Accessible Success State */
            <div
              className="space-y-6 text-center py-6"
              role="alert"
              aria-live="polite"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-none border border-[#236344] bg-[#DCE5D8] text-[#236344]">
                <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
              </div>

              <div className="space-y-2">
                <h2 className="font-serif-display text-2xl sm:text-3xl font-normal text-[#171B1B]">
                  Your interest has been recorded
                </h2>
                <p className="mx-auto max-w-md text-sm text-[#666D68] leading-relaxed">
                  Thank you for joining our independent reflection group. Your opt-in has been durably stored in our database. Note that this MVP records your interest and does not dispatch automated marketing mailings.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/ideas"
                  className="inline-flex items-center justify-center gap-2 border border-[#171B1B] bg-[#171B1B] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#FFFEFA] hover:bg-[#D64B37] hover:border-[#D64B37] transition-colors"
                >
                  <span>Explore Ideas Library</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="inline-flex items-center justify-center border border-[#D8D8CF] bg-transparent px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#171B1B] hover:bg-[#D8D8CF]/30 transition-colors"
                >
                  Submit Another Note
                </button>
              </div>
            </div>
          ) : status === 'already_subscribed' ? (
            /* Accessible Already Subscribed State */
            <div
              className="space-y-6 text-center py-6"
              role="alert"
              aria-live="polite"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-none border border-[#171B1B] bg-[#F6F3EC] text-[#171B1B]">
                <ShieldCheck className="h-8 w-8 text-[#171B1B]" aria-hidden="true" />
              </div>

              <div className="space-y-2">
                <h2 className="font-serif-display text-2xl sm:text-3xl font-normal text-[#171B1B]">
                  Already on the study list
                </h2>
                <p className="mx-auto max-w-md text-sm text-[#666D68] leading-relaxed">
                  The email <span className="font-medium text-[#171B1B]">{email}</span> has already been registered in our database. There is no need to register again.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/ideas"
                  className="inline-flex items-center justify-center gap-2 border border-[#171B1B] bg-[#171B1B] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#FFFEFA] hover:bg-[#D64B37] hover:border-[#D64B37] transition-colors"
                >
                  <span>Browse the Ideas Library</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="inline-flex items-center justify-center border border-[#D8D8CF] bg-transparent px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#171B1B] hover:bg-[#D8D8CF]/30 transition-colors"
                >
                  Enter a different email
                </button>
              </div>
            </div>
          ) : (
            /* Active Form */
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              {/* Top Form Header */}
              <div className="space-y-1">
                <h2 className="font-serif-display text-2xl font-normal text-[#171B1B]">
                  Join the study notes
                </h2>
                <p className="text-xs text-[#666D68]">
                  Fields marked with an asterisk (*) are required.
                </p>
              </div>

              {/* Server or Global Error Banner */}
              {status === 'error' && (
                <div
                  className="flex items-start gap-3 border border-[#A32F2F] bg-[#A32F2F]/10 p-4 text-xs sm:text-sm text-[#A32F2F]"
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong className="font-semibold">Unable to process signup:</strong>{' '}
                    <span>{errorMessage || 'Please correct the highlighted fields and try again.'}</span>
                  </div>
                </div>
              )}

              {/* Honeypot field (hidden from screen and screen readers) */}
              <div
                style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
                aria-hidden="true"
              >
                <label htmlFor="hp-website">Website (leave blank)</label>
                <input
                  type="text"
                  id="hp-website"
                  name="website"
                  tabIndex={-1}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Email Field (Required) */}
                <div className="sm:col-span-2 space-y-2">
                  <label
                    htmlFor="subscriber-email"
                    className="block text-xs font-bold uppercase tracking-wider text-[#171B1B]"
                  >
                    Email Address <span className="text-[#D64B37]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="subscriber-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                      }}
                      placeholder="e.g., student@university.edu"
                      aria-required="true"
                      aria-invalid={fieldErrors.email ? 'true' : 'false'}
                      aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                      className={`w-full border bg-[#FFFEFA] px-4 py-3 text-sm text-[#171B1B] placeholder-[#666D68]/60 transition-colors focus:outline-none ${
                        fieldErrors.email
                          ? 'border-[#A32F2F] focus:border-[#A32F2F]'
                          : 'border-[#D8D8CF] focus:border-[#171B1B]'
                      }`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p id="email-error" className="text-xs text-[#A32F2F]" role="alert">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* First Name Field (Optional) */}
                <div className="space-y-2">
                  <label
                    htmlFor="subscriber-firstName"
                    className="block text-xs font-bold uppercase tracking-wider text-[#171B1B]"
                  >
                    First Name <span className="text-[#666D68] font-normal normal-case">(optional)</span>
                  </label>
                  <input
                    id="subscriber-firstName"
                    type="text"
                    name="firstName"
                    autoComplete="given-name"
                    maxLength={80}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g., Avery"
                    className="w-full border border-[#D8D8CF] bg-[#FFFEFA] px-4 py-3 text-sm text-[#171B1B] placeholder-[#666D68]/60 focus:border-[#171B1B] focus:outline-none"
                  />
                </div>

                {/* Primary Topic Interest (Optional) */}
                <div className="space-y-2">
                  <label
                    htmlFor="subscriber-interest"
                    className="block text-xs font-bold uppercase tracking-wider text-[#171B1B]"
                  >
                    Primary Focus <span className="text-[#666D68] font-normal normal-case">(optional)</span>
                  </label>
                  <select
                    id="subscriber-interest"
                    name="interest"
                    value={interest}
                    onChange={(e) => setInterest(e.target.value as any)}
                    className="w-full border border-[#D8D8CF] bg-[#FFFEFA] px-4 py-3 text-sm text-[#171B1B] focus:border-[#171B1B] focus:outline-none"
                  >
                    <option value="">Select an area of interest...</option>
                    <option value="Purpose">Purpose (Why & The Golden Circle)</option>
                    <option value="Leadership">Leadership (Empathy & Service)</option>
                    <option value="Trust & Teams">Trust & Teams (Circle of Safety)</option>
                    <option value="Infinite Mindset">Infinite Mindset (Just Cause & Long Horizon)</option>
                  </select>
                </div>
              </div>

              {/* Explicit Consent Checkbox (Required) */}
              <div className="pt-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-5 items-center">
                    <input
                      id="subscriber-consent"
                      name="consent"
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(e) => {
                        setConsent(e.target.checked);
                        if (fieldErrors.consent) setFieldErrors({ ...fieldErrors, consent: undefined });
                      }}
                      aria-required="true"
                      aria-invalid={fieldErrors.consent ? 'true' : 'false'}
                      aria-describedby={fieldErrors.consent ? 'consent-error' : undefined}
                      className="h-4 w-4 rounded-none border-[#D8D8CF] text-[#D64B37] focus:ring-[#D64B37]"
                    />
                  </div>
                  <div className="text-xs text-[#171B1B]/80 leading-relaxed">
                    <label htmlFor="subscriber-consent" className="cursor-pointer select-none">
                      <span className="font-semibold text-[#171B1B]">Required Consent: </span>
                      I understand that WHY, PRACTICED is an independent student academic project and not an official newsletter from Simon Sinek or The Optimism Company. I consent to my email being stored for this study. <span className="text-[#D64B37]">*</span>
                    </label>
                  </div>
                </div>
                {fieldErrors.consent && (
                  <p id="consent-error" className="mt-2 text-xs text-[#A32F2F]" role="alert">
                    {fieldErrors.consent}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-[#D8D8CF] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className={`inline-flex items-center justify-center gap-2 border border-[#171B1B] px-8 py-4 text-xs font-semibold uppercase tracking-wider text-[#FFFEFA] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D64B37] ${
                    status === 'submitting'
                      ? 'bg-[#171B1B]/70 cursor-not-allowed'
                      : 'bg-[#171B1B] hover:bg-[#D64B37] hover:border-[#D64B37] active:translate-y-0.5'
                  }`}
                >
                  {status === 'submitting' ? (
                    <>
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                      <span>Recording Subscription...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Subscription</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-[#666D68]">
                  Zero spam · No data sharing · Deterministic deduplication
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Personal subscriptions, applications, and waitlist activity */}
        <section className="mt-12 overflow-hidden border border-[#D8D0C3] bg-[#FAF8F3] shadow-sm" aria-labelledby="account-activity-title">
          <div className="bg-[#1E201C] px-6 py-7 text-[#F8F5EF] sm:px-9 sm:py-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#C7B08B]">Private account overview</p>
                <h2 id="account-activity-title" className="font-serif-display text-3xl font-normal sm:text-4xl">Your activity</h2>
                <p className="max-w-xl text-xs leading-relaxed text-[#D3C9BA] sm:text-sm">
                  Review study-list subscriptions and any application or waitlist records associated with your account.
                </p>
              </div>
              {user && (
                <button
                  type="button"
                  onClick={() => void loadActivity()}
                  disabled={activityLoading}
                  className="inline-flex w-fit items-center justify-center gap-2 border border-[#C7B08B]/60 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F8F5EF] transition-colors hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${activityLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                  Refresh activity
                </button>
              )}
            </div>
          </div>

          <div className="space-y-8 p-5 sm:p-8">
            {authLoading || activityLoading ? (
              <div className="flex items-center gap-3 py-6 text-sm text-[#777268]" role="status" aria-live="polite">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#92795B] border-r-transparent" aria-hidden="true" />
                Loading your private activity…
              </div>
            ) : !user ? (
              <div className="flex flex-col gap-5 border border-[#D8D0C3] bg-[#FFFEFA] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#D8D0C3] bg-[#F2EFE8] text-[#92795B]">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-serif-display text-2xl text-[#1B1A17]">Sign in to view your records</h3>
                    <p className="max-w-xl text-xs leading-relaxed text-[#777268]">
                      For privacy, personal subscription, application, and waitlist details are only shown after signing in. The public signup form above remains available without an account.
                    </p>
                  </div>
                </div>
                <Link
                  to="/auth"
                  className="inline-flex w-fit shrink-0 items-center justify-center gap-2 border border-[#1E201C] bg-[#1E201C] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F8F5EF] transition-colors hover:bg-[#92795B]"
                >
                  <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                  Sign in
                </Link>
              </div>
            ) : activityError ? (
              <div className="flex flex-col gap-4 border border-[#A32F2F]/40 bg-[#A32F2F]/5 p-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
                <div className="flex items-start gap-3 text-sm text-[#7C2929]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">Activity could not be loaded</p>
                    <p className="mt-1 text-xs leading-relaxed">{activityError}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void loadActivity()}
                  className="inline-flex w-fit items-center gap-2 border border-[#A32F2F]/40 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-[#7C2929] hover:bg-[#A32F2F]/5"
                >
                  Try again <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : activity ? (
              <>
                <div className="flex flex-col gap-2 border-b border-[#D8D0C3] pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-[#777268]">
                    Records matched securely to <span className="font-semibold text-[#1B1A17]">{activity.accountEmail}</span>
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#8B806F]">
                    Refreshed {formatActivityDate(activity.activityUpdatedAt)}
                  </p>
                </div>

                <section className="space-y-4" aria-labelledby="your-subscriptions-title">
                  <div className="flex flex-col gap-2 border-b border-[#D8D0C3] pb-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center border border-[#D8D0C3] text-[#92795B]">
                        <Mail className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 id="your-subscriptions-title" className="font-serif-display text-2xl text-[#1B1A17]">Subscriptions</h3>
                        <p className="text-[11px] text-[#777268]">Opt-ins recorded for this account</p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-[#77664F]">{activity.subscriptions.length} record{activity.subscriptions.length === 1 ? '' : 's'}</span>
                  </div>

                  {activity.subscriptions.length ? (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      {activity.subscriptions.map((record) => <ActivityRecordCard key={record.id} record={record} />)}
                    </div>
                  ) : (
                    <div className="border border-dashed border-[#D8D0C3] bg-[#FFFEFA] p-6">
                      <div className="flex items-start gap-3">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#92795B]" aria-hidden="true" />
                        <div className="space-y-1">
                          <p className="font-serif-display text-xl text-[#1B1A17]">No subscription records found</p>
                          <p className="text-xs leading-relaxed text-[#777268]">
                            Join Notes on WHY using your signed-in account email. We only show records belonging to that email here.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!activity.emailDeliveryEnabled && (
                    <p className="flex items-start gap-2 text-[11px] leading-relaxed text-[#777268]">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#92795B]" aria-hidden="true" />
                      Notes on WHY currently records opt-ins for this independent study list; automated email delivery is not enabled.
                    </p>
                  )}
                </section>

                <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
                  <section className="space-y-4" aria-labelledby="your-applications-title">
                    <div className="flex items-center justify-between border-b border-[#D8D0C3] pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center border border-[#D8D0C3] text-[#92795B]">
                          <FileText className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 id="your-applications-title" className="font-serif-display text-2xl text-[#1B1A17]">Applications</h3>
                          <p className="text-[11px] text-[#777268]">Submitted requests and their status</p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.14em] text-[#77664F]">{activity.applications.length}</span>
                    </div>
                    {activity.applications.length ? (
                      <div className="space-y-3">
                        {activity.applications.map((record) => <ActivityRecordCard key={record.id} record={record} />)}
                      </div>
                    ) : (
                      <div className="h-full min-h-36 border border-dashed border-[#D8D0C3] bg-[#FFFEFA] p-5">
                        <p className="font-serif-display text-xl text-[#1B1A17]">No application records</p>
                        <p className="mt-2 text-xs leading-relaxed text-[#777268]">
                          No application records are linked to this account in this site. Applications submitted on other websites will not appear here automatically.
                        </p>
                      </div>
                    )}
                  </section>

                  <section className="space-y-4" aria-labelledby="your-waitlist-title">
                    <div className="flex items-center justify-between border-b border-[#D8D0C3] pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center border border-[#D8D0C3] text-[#92795B]">
                          <ListChecks className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 id="your-waitlist-title" className="font-serif-display text-2xl text-[#1B1A17]">Waitlist</h3>
                          <p className="text-[11px] text-[#777268]">Waitlist entries and progress</p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.14em] text-[#77664F]">{activity.waitlist.length}</span>
                    </div>
                    {activity.waitlist.length ? (
                      <div className="space-y-3">
                        {activity.waitlist.map((record) => <ActivityRecordCard key={record.id} record={record} />)}
                      </div>
                    ) : (
                      <div className="h-full min-h-36 border border-dashed border-[#D8D0C3] bg-[#FFFEFA] p-5">
                        <p className="font-serif-display text-xl text-[#1B1A17]">No waitlist records</p>
                        <p className="mt-2 text-xs leading-relaxed text-[#777268]">
                          No waitlist entries are linked to this account in this site. If a waitlist is introduced here, its status can appear in this panel.
                        </p>
                      </div>
                    )}
                  </section>
                </div>
              </>
            ) : null}
          </div>
        </section>

        {/* Privacy & Non-commercial Disclosure */}
        <div className="mt-12 space-y-4 rounded-none border border-[#D8D8CF] bg-[#F6F3EC] p-6 text-xs text-[#666D68]">
          <h3 className="font-bold uppercase tracking-wider text-[#171B1B]">
            Data Handling & Privacy Statement
          </h3>
          <p className="leading-relaxed">
            Submitting this form stores the email address you provide, and any optional name/topic preference, so this independent student project can maintain an opt-in interest list. This form does not automatically send an email. This project is not affiliated with Simon Sinek or The Optimism Company. Do not submit sensitive personal information.
          </p>
          <p className="leading-relaxed">
            To request removal of your record, you may contact the academic maintainer at <span className="font-mono text-[#171B1B]">ishan.raychaudhuri2025@vitstudent.ac.in</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
