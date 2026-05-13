'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingLogo } from '@/components/LoadingLogo';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      sessionStorage.setItem('redirectAfterLogin', pathname);
      router.replace('/auth/signin');
      return;
    }

    if (isAuthenticated) {
      hasRedirected.current = false;
    }
  }, [isAuthenticated, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingLogo size="md" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingLogo size="md" text="Redirecting..." />
      </div>
    );
  }

  return <>{children}</>;
}

