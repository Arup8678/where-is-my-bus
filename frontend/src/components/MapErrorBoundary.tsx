"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class MapErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Map rendering error caught by boundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full bg-slate-100 rounded-xl flex flex-col items-center justify-center p-6 text-center border border-slate-200">
          <AlertTriangle className="h-10 w-10 text-amber-500 mb-2" />
          <h3 className="font-semibold text-slate-800 text-lg">Interactive Map Unavailable</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1 mb-4">
            The route map could not be loaded cleanly. You can still view the full live timetable below.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Retry Map
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
