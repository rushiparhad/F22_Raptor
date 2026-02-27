import { Component, type ErrorInfo, type ReactNode } from "react";

interface AppErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  details: string;
}

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    details: "",
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      details: error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[AppErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
          <p className="font-semibold">{this.props.fallbackTitle ?? "Something crashed in this section."}</p>
          <p className="mt-1">{this.props.fallbackMessage ?? "Please refresh and try again."}</p>
          {this.state.details ? <p className="mt-2 text-xs opacity-90">{this.state.details}</p> : null}
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
