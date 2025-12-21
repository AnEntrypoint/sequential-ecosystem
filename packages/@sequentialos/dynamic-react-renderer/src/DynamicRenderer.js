/**
 * DynamicRenderer - React component for dynamically rendering registered components
 *
 * Renders components from the ComponentRegistry based on a 'type' prop.
 * Includes error boundary and recursive rendering support for nested dynamic components.
 */

import React from 'react';
import ComponentRegistry from './ComponentRegistry.js';
import ErrorBoundary from './ErrorBoundary.js';

/**
 * DynamicRenderer Component
 *
 * @param {Object} props
 * @param {string} props.type - Name of the component to render (must be registered)
 * @param {Object} props.props - Props to pass to the rendered component
 * @param {React.ReactNode} props.fallback - Custom fallback UI for errors
 * @param {React.ReactNode} props.notFoundFallback - Custom UI when component not found
 */
const DynamicRenderer = ({ type, props = {}, fallback, notFoundFallback }) => {
  // Validate type prop
  if (!type || typeof type !== 'string') {
    return (
      <div style={{
        padding: '16px',
        border: '1px solid #d97706',
        borderRadius: '4px',
        backgroundColor: '#fffbeb',
        color: '#92400e'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
          Invalid Component Type
        </h3>
        <p style={{ margin: 0, fontSize: '12px' }}>
          The 'type' prop must be a non-empty string. Received: {JSON.stringify(type)}
        </p>
      </div>
    );
  }

  // Get component from registry
  const Component = ComponentRegistry.get(type);

  // Handle component not found
  if (!Component) {
    if (notFoundFallback) {
      return notFoundFallback;
    }

    return (
      <div style={{
        padding: '16px',
        border: '1px solid #d97706',
        borderRadius: '4px',
        backgroundColor: '#fffbeb',
        color: '#92400e'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
          Component Not Found
        </h3>
        <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>
          Component "{type}" is not registered.
        </p>
        <details style={{ fontSize: '12px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 500 }}>
            Available components ({ComponentRegistry.size})
          </summary>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            {ComponentRegistry.list().map(name => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </details>
      </div>
    );
  }

  // Process props to support nested DynamicRenderer components
  const processedProps = processNestedComponents(props);

  // Render component with error boundary
  return (
    <ErrorBoundary fallback={fallback}>
      <Component {...processedProps} />
    </ErrorBoundary>
  );
};

/**
 * Process props to recursively render nested dynamic components
 * @param {Object} props - Props object to process
 * @returns {Object} Processed props with nested DynamicRenderer components
 */
const processNestedComponents = (props) => {
  if (!props || typeof props !== 'object') {
    return props;
  }

  const processed = {};

  for (const [key, value] of Object.entries(props)) {
    // Check if value is a dynamic component descriptor
    if (
      value &&
      typeof value === 'object' &&
      value.__dynamicComponent === true &&
      value.type
    ) {
      processed[key] = (
        <DynamicRenderer
          type={value.type}
          props={value.props || {}}
        />
      );
    }
    // Recursively process nested objects
    else if (value && typeof value === 'object' && !React.isValidElement(value)) {
      if (Array.isArray(value)) {
        processed[key] = value.map(item =>
          item && typeof item === 'object' ? processNestedComponents(item) : item
        );
      } else {
        processed[key] = processNestedComponents(value);
      }
    }
    // Keep primitive values and React elements as-is
    else {
      processed[key] = value;
    }
  }

  return processed;
};

export default DynamicRenderer;
