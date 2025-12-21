/**
 * ErrorBoundary - React error boundary for catching rendering errors
 *
 * Provides graceful error handling and user-friendly error messages
 * when components fail to render.
 */

import React from 'react';
import logger from '@sequentialos/sequential-logging';

/**
 * Error Boundary Component
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render
 * @param {React.ReactNode} props.fallback - Custom fallback UI for errors
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('DynamicRenderer Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: '16px',
          border: '1px solid #dc2626',
          borderRadius: '4px',
          backgroundColor: '#fef2f2',
          color: '#991b1b'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
            Component Rendering Error
          </h3>
          <p style={{ margin: 0, fontSize: '12px' }}>
            {this.state.error?.message || 'An error occurred while rendering this component'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
