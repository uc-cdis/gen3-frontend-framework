import React, { Component } from 'react';

// Error boundary to surface render crashes instead of silent white-screen
class PanelErrorBoundary extends Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="rounded-lg border border-utility-error bg-utility-error bg-opacity-10 p-3 text-xs text-utility-error">
          <p className="font-semibold">Panel render error</p>
          <pre className="mt-1 whitespace-pre-wrap text-sm">
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default PanelErrorBoundary;
