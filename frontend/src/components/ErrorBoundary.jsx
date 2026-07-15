import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-ink-50 px-4 text-center">
          <p className="text-lg font-semibold text-ink-900">Something went wrong</p>
          <p className="mt-1 text-sm text-ink-500">Try refreshing the page.</p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-5">
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
