'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; errorMessage?: string };

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[EarthStack UI Error Boundary]', { error, errorInfo });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-lg w-full border border-red-500/40 bg-red-950/30 rounded-xl p-6 space-y-4">
          <h1 className="text-xl font-semibold">Application Error</h1>
          <p className="text-sm text-slate-300">A rendering error occurred in the interface.</p>
          {this.state.errorMessage ? <p className="text-xs text-red-200">{this.state.errorMessage}</p> : null}
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-red-500 hover:bg-red-400 text-white px-4 py-2 text-sm"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
