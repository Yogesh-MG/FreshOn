import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.fallback) {
        return this.fallback;
      }
      
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-500">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground">Something went wrong</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            We're sorry, but the application encountered a runtime error.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-forest-foreground"
          >
            <RefreshCw className="h-4 w-4" /> Reload App
          </button>
          {process.env.NODE_ENV === "development" && (
            <pre className="mt-8 max-w-full overflow-auto rounded-lg bg-surface p-4 text-left text-[10px] text-red-600">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
