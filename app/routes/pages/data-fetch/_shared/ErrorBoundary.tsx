import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

interface Props {
  children: ReactNode;
  fallback: (args: { error: Error; reset: () => void }) => ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  // When any key changes, reset the error state — mirrors the SWR revalidate/mutate pattern
  resetKeys?: readonly unknown[];
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  // Pure — only returns next state, no side effects
  static getDerivedStateFromError(error: unknown): State {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  // Side effects (toast, logging) belong here, not in getDerivedStateFromError
  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  override componentDidUpdate(prevProps: Readonly<Props>): void {
    if (this.state.error === null) return;
    const prev = prevProps.resetKeys;
    const next = this.props.resetKeys;
    if (prev === undefined || next === undefined) return;
    const changed = prev.length !== next.length || prev.some((k, i) => k !== next[i]);
    if (changed) this.reset();
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    if (this.state.error !== null) {
      return this.props.fallback({ error: this.state.error, reset: this.reset });
    }
    return this.props.children;
  }
}
