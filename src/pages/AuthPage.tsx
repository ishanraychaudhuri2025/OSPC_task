import React, { useState } from 'react';
import { useAuth, getFriendlyAuthErrorMessage } from '../context/AuthContext';
import { useRouter } from '../router/Router';
import { ShieldCheck, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'reset';

export function AuthPage() {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const { navigate } = useRouter();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // If already logged in, redirect to dashboard
  if (user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F6F3EC] px-6 py-20">
        <div className="max-w-md w-full border border-[#D8D8CF] bg-[#FFFEFA] p-8 text-center space-y-4 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-none bg-[#DCE5D8] text-[#236344]">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="font-serif-display text-2xl font-normal text-[#171B1B]">
            You are signed in
          </h1>
          <p className="text-sm text-[#666D68]">
            Signed in as <span className="font-semibold text-[#171B1B]">{user.email}</span>
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full border border-[#171B1B] bg-[#171B1B] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#FFFEFA] hover:bg-[#D64B37] hover:border-[#D64B37] transition-colors"
            >
              Go to Your Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(getFriendlyAuthErrorMessage(err?.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (mode !== 'reset' && !password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        navigate('/dashboard');
      } else if (mode === 'signup') {
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName);
        navigate('/dashboard');
      } else if (mode === 'reset') {
        await resetPassword(email);
        setSuccessMsg('A password reset link has been dispatched to your email address.');
      }
    } catch (err: any) {
      setErrorMsg(getFriendlyAuthErrorMessage(err?.code || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3EC] py-16 sm:py-24">
      <div className="mx-auto max-w-md px-6">
        {/* Header */}
        <div className="text-center space-y-3 pb-8">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#666D68]">
            <span>Account Access</span>
            <span aria-hidden="true">/</span>
            <span>Practice Lab</span>
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-normal text-[#171B1B]">
            {mode === 'signin'
              ? 'Sign in to your practice'
              : mode === 'signup'
              ? 'Create a study account'
              : 'Reset your password'}
          </h1>
          <p className="text-xs sm:text-sm text-[#666D68] leading-relaxed">
            {mode === 'signin'
              ? 'Save your Golden Circle canvases and bookmark podcast reflections.'
              : mode === 'signup'
              ? 'Join to persist your purpose reflections with private, owner-only access.'
              : 'Enter your registered email address to receive password instructions.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="border border-[#D8D8CF] bg-[#FFFEFA] p-8 shadow-sm space-y-6">
          {/* Status Banners */}
          {errorMsg && (
            <div
              className="flex items-start gap-3 border border-[#A32F2F] bg-[#A32F2F]/10 p-3.5 text-xs text-[#A32F2F]"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              className="flex items-start gap-3 border border-[#236344] bg-[#DCE5D8] p-3.5 text-xs text-[#236344]"
              role="alert"
              aria-live="polite"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Google Sign In */}
          {mode !== 'reset' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 border border-[#D8D8CF] bg-[#FFFEFA] py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[#171B1B] hover:bg-[#F6F3EC] hover:border-[#171B1B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D64B37]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-[#D8D8CF]" />
                <span className="bg-[#FFFEFA] px-3 text-[10px] uppercase tracking-widest text-[#666D68]">
                  or email
                </span>
              </div>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label
                  htmlFor="auth-displayName"
                  className="block text-[11px] font-bold uppercase tracking-wider text-[#171B1B]"
                >
                  Full Name
                </label>
                <input
                  id="auth-displayName"
                  type="text"
                  autoComplete="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., Avery Taylor"
                  className="w-full border border-[#D8D8CF] bg-[#FFFEFA] px-3.5 py-2.5 text-xs text-[#171B1B] focus:border-[#171B1B] focus:outline-none"
                />
              </div>
            )}

            <div className="space-y-1">
              <label
                htmlFor="auth-email"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#171B1B]"
              >
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full border border-[#D8D8CF] bg-[#FFFEFA] px-3.5 py-2.5 text-xs text-[#171B1B] focus:border-[#171B1B] focus:outline-none"
              />
            </div>

            {mode !== 'reset' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="auth-password"
                    className="block text-[11px] font-bold uppercase tracking-wider text-[#171B1B]"
                  >
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('reset');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="text-[11px] text-[#666D68] hover:text-[#D64B37] underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <input
                  id="auth-password"
                  type="password"
                  required
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-[#D8D8CF] bg-[#FFFEFA] px-3.5 py-2.5 text-xs text-[#171B1B] focus:border-[#171B1B] focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 border border-[#171B1B] bg-[#171B1B] py-3 text-xs font-semibold uppercase tracking-wider text-[#FFFEFA] hover:bg-[#D64B37] hover:border-[#D64B37] transition-all disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D64B37]"
            >
              {loading ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                  <span>Processing...</span>
                </>
              ) : mode === 'signin' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </>
              ) : mode === 'signup' ? (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="pt-2 border-t border-[#D8D8CF] text-center text-xs text-[#666D68]">
            {mode === 'signin' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="font-semibold text-[#171B1B] hover:text-[#D64B37] underline"
                >
                  Create one here
                </button>
              </p>
            ) : mode === 'signup' ? (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="font-semibold text-[#171B1B] hover:text-[#D64B37] underline"
                >
                  Sign in instead
                </button>
              </p>
            ) : (
              <p>
                Remembered your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="font-semibold text-[#171B1B] hover:text-[#D64B37] underline"
                >
                  Back to Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
