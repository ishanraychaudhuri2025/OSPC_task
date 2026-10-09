import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from '../router/Router';

type FormStatus = 'idle' | 'submitting' | 'success' | 'already_subscribed' | 'error';

export function CommunityPage() {
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
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        setStatus('success');
      } else if (response.status === 200 && data.status === 'already_subscribed') {
        setStatus('already_subscribed');
      } else if (response.status === 400) {
        setStatus('error');
        setErrorMessage(data.message || 'Please check the information provided.');
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'An unexpected error occurred. Please try again later.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage('Could not connect to the registration service. Please verify your internet connection and try again.');
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
