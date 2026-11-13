import { Component, type ErrorInfo, type ReactNode } from 'react';

type State = { hasError: boolean };

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(_: Error, info: ErrorInfo) {
    console.error(info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <p role="alert">Something went wrong. Please reload the page.</p>;
    }
    return this.props.children;
  }
}
