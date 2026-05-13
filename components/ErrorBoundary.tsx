'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError } from '@/lib/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/** After a new deploy, old tabs still reference removed `/_next/static/chunks/*.js` files. */
function isStaleChunkOrModuleError(error: Error | undefined): boolean {
  if (!error) return false;
  const msg = error.message || '';
  return (
    error.name === 'ChunkLoadError' ||
    /Loading chunk \d+ failed/i.test(msg) ||
    /Failed to load chunk/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /dynamically imported module/i.test(msg) ||
    /from module \d+/i.test(msg)
  );
}

/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, 'ErrorBoundary');
    console.error('Error details:', errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  /** Resetting React state cannot fix a missing JS chunk; must fetch a fresh document. */
  handleTryAgain = () => {
    const err = this.state.error;
    if (isStaleChunkOrModuleError(err)) {
      window.location.reload();
      return;
    }
    this.handleReset();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const staleChunk = isStaleChunkOrModuleError(this.state.error);

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {staleChunk ? 'App updated — reload needed' : 'Something went wrong'}
            </h2>
            <p
              className={`text-muted-foreground text-sm ${
                staleChunk && this.state.error?.message ? 'mb-2' : 'mb-6'
              }`}
            >
              {staleChunk
                ? 'This tab is still using an old build. Reload to load the latest version.'
                : this.state.error?.message || 'An unexpected error occurred'}
            </p>
            {staleChunk && this.state.error?.message && (
              <p className="text-xs text-gray-500 mb-6 break-all">{this.state.error.message}</p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleTryAgain}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {staleChunk ? 'Reload page' : 'Try Again'}
              </button>
              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary wrapper
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

