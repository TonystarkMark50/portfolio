import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-error-100 dark:bg-error-900/30 mb-6">
              <AlertTriangle className="w-8 h-8 text-error-500" />
            </div>

            <h2 className="text-2xl font-bold text-theme-primary mb-2">
              {this.props.sectionName ? `${this.props.sectionName} Error` : 'Something went wrong'}
            </h2>

            <p className="text-theme-muted mb-6">
              This section encountered an unexpected error. You can try again or navigate elsewhere.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 rounded-lg bg-error-50 dark:bg-error-900/20 text-left overflow-auto max-h-40">
                <div className="flex items-center gap-2 text-error-600 dark:text-error-400 text-sm font-mono mb-2">
                  <Bug className="w-4 h-4" />
                  Error Details
                </div>
                <pre className="text-xs text-error-700 dark:text-error-300 whitespace-pre-wrap">
                  {this.state.error.message}
                </pre>
                {this.state.errorInfo && (
                  <pre className="text-xs text-error-600 dark:text-error-400 mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack?.slice(0, 200)}
                  </pre>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-card text-theme-secondary font-medium hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
              >
                <Home className="w-4 h-4" />
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
