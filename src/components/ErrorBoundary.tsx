import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
          <div className="card p-6 max-w-lg w-full text-left">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Something went wrong</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Please refresh the page. If the problem persists, contact support.
            </p>
            <div className="mt-6 flex gap-3">
              <button className="btn-primary" onClick={() => window.location.reload()}>
                Refresh
              </button>
              <button className="btn-secondary" onClick={() => window.location.assign('/')}>
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

export default ErrorBoundary;
