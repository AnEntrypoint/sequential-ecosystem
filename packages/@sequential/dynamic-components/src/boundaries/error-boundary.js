import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState(prevState => ({
      ...prevState,
      errorInfo
    }));
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          {this.props.fallback ? (
            this.props.fallback(this.state.error, this.state.errorInfo)
          ) : null}
        </div>
      );
    }

    return this.props.children;
  }
}

export class LoadingBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isLoading: props.initialLoading ?? false };
  }

  setLoading = (isLoading) => {
    this.setState({ isLoading });
  };

  render() {
    if (this.state.isLoading) {
      return (
        this.props.fallback || (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            Loading...
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export function OutletBoundary({ children, errorFallback, loadingFallback }) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <LoadingBoundary fallback={loadingFallback}>
        {children}
      </LoadingBoundary>
    </ErrorBoundary>
  );
}

export function ViewportBoundary({ children, width = '100%', height = '100%' }) {
  return (
    <div style={{ width, height, overflow: 'auto', position: 'relative' }}>
      {children}
    </div>
  );
}

export function MetadataBoundary({ children, metadata = {} }) {
  return (
    <div data-component-metadata={JSON.stringify(metadata)}>
      {children}
    </div>
  );
}
