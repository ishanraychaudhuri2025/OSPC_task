/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { RouterProvider, useRouter, Link } from './router/Router';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { IdeasPage } from './pages/IdeasPage';
import { PracticePage } from './pages/PracticePage';
import { PodcastPage } from './pages/PodcastPage';
import { DashboardPage } from './pages/DashboardPage';
import { AuthPage } from './pages/AuthPage';
import { CommunityPage } from './pages/CommunityPage';
import { ArrowLeft } from 'lucide-react';

function PageContent() {
  const { currentPath } = useRouter();

  // Dynamic document title update per route
  useEffect(() => {
    if (currentPath === '/') {
      document.title = 'WHY, PRACTICED — Independent Editorial Guide to Purpose & Leadership';
    } else if (currentPath === '/ideas') {
      document.title = 'Ideas Library — WHY, PRACTICED';
    } else if (currentPath === '/practice') {
      document.title = 'Purpose Canvas (Practice Lab) — WHY, PRACTICED';
    } else if (currentPath === '/podcast') {
      document.title = 'A Bit of Optimism Podcast Directory — WHY, PRACTICED';
    } else if (currentPath === '/dashboard') {
      document.title = 'Study Dashboard — WHY, PRACTICED';
    } else if (currentPath === '/auth') {
      document.title = 'Account Access — WHY, PRACTICED';
    } else if (currentPath === '/community') {
      document.title = 'Notes on WHY (Opt-In) — WHY, PRACTICED';
    }
  }, [currentPath]);

  if (currentPath === '/') {
    return <HomePage />;
  }

  if (currentPath === '/ideas') {
    return <IdeasPage />;
  }

  if (currentPath === '/practice') {
    return <PracticePage />;
  }

  if (currentPath === '/podcast') {
    return <PodcastPage />;
  }

  if (currentPath === '/dashboard') {
    return <DashboardPage />;
  }

  if (currentPath === '/auth') {
    return <AuthPage />;
  }

  if (currentPath === '/community') {
    return <CommunityPage />;
  }

  // 404 Fallback
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#F6F3EC] px-6 py-24 text-center">
      <div className="max-w-md space-y-6 border border-[#D8D8CF] bg-[#FFFEFA] p-10">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D64B37]">
          404 Error
        </span>
        <h1 className="font-serif-display text-3xl font-normal text-[#171B1B]">
          Page not found
        </h1>
        <p className="text-sm text-[#666D68] leading-relaxed">
          The requested page could not be located. You can return to our curated index or launch the purpose canvas.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 border border-[#171B1B] bg-[#171B1B] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FFFEFA] hover:bg-[#D64B37] hover:border-[#D64B37] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        {/* Accessible Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-[#171B1B] focus:text-[#FFFEFA] focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:uppercase focus:outline-none focus:ring-2 focus:ring-[#D64B37]"
        >
          Skip to main content
        </a>

        <div className="min-h-screen flex flex-col bg-[#F6F3EC] text-[#171B1B]">
          <Header />
          <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
            <PageContent />
          </main>
          <Footer />
        </div>
      </RouterProvider>
    </AuthProvider>
  );
}
