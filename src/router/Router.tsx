import React, { createContext, useContext, useEffect, useState, useTransition } from 'react';

export type RoutePath =
  | '/'
  | '/ideas'
  | '/practice'
  | '/podcast'
  | '/dashboard'
  | '/auth'
  | '/community';

interface RouterContextValue {
  currentPath: RoutePath;
  navigate: (to: RoutePath) => void;
}

const RouterContext = createContext<RouterContextValue>({
  currentPath: '/',
  navigate: () => {},
});

export function useRouter() {
  return useContext(RouterContext);
}

function normalizePath(rawPath: string): RoutePath {
  const cleaned = rawPath.replace(/\/+$/, '') || '/';
  if (cleaned === '/ideas') return '/ideas';
  if (cleaned === '/practice') return '/practice';
  if (cleaned === '/podcast') return '/podcast';
  if (cleaned === '/dashboard') return '/dashboard';
  if (cleaned === '/auth') return '/auth';
  if (cleaned === '/community') return '/community';
  return '/';
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState<RoutePath>(() =>
    normalizePath(typeof window !== 'undefined' ? window.location.pathname : '/')
  );
  const [, startTransition] = useTransition();

  useEffect(() => {
    const handlePopState = () => {
      startTransition(() => {
        setCurrentPath(normalizePath(window.location.pathname));
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: RoutePath) => {
    if (window.location.pathname !== to) {
      window.history.pushState({}, '', to);
      startTransition(() => {
        setCurrentPath(to);
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function Link({
  to,
  children,
  className = '',
  onClick,
  'aria-label': ariaLabel,
}: {
  to: RoutePath;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  'aria-label'?: string;
}) {
  const { currentPath, navigate } = useRouter();
  const isActive = currentPath === to;

  return (
    <a
      href={to}
      aria-label={ariaLabel}
      aria-current={isActive ? 'page' : undefined}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
