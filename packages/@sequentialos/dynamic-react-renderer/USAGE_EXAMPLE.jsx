/**
 * USAGE EXAMPLE for @sequentialos/dynamic-react-renderer
 *
 * This file demonstrates how to use the dynamic-react-renderer package
 * in a React application. Note: This is JSX code and requires a build system.
 */

import React, { useState } from 'react';
import DynamicRenderer, { ComponentRegistry } from '@sequentialos/dynamic-react-renderer';

// ============================================================================
// STEP 1: Define your React components
// ============================================================================

const TaskList = ({ tasks, onSelect }) => (
  <div className="task-list">
    <h2>Tasks</h2>
    <ul>
      {tasks.map(task => (
        <li key={task.id} onClick={() => onSelect(task)}>
          {task.name}
        </li>
      ))}
    </ul>
  </div>
);

const TaskDetails = ({ task }) => (
  <div className="task-details">
    <h3>{task.name}</h3>
    <p>Status: {task.status}</p>
    <p>Priority: {task.priority}</p>
  </div>
);

const Dashboard = ({ header, sidebar, content }) => (
  <div className="dashboard">
    <div className="header">{header}</div>
    <div className="layout">
      <div className="sidebar">{sidebar}</div>
      <div className="content">{content}</div>
    </div>
  </div>
);

const Header = ({ title, subtitle }) => (
  <header>
    <h1>{title}</h1>
    {subtitle && <p>{subtitle}</p>}
  </header>
);

// ============================================================================
// STEP 2: Register components at app initialization
// ============================================================================

const registerComponents = () => {
  ComponentRegistry.register('TaskList', TaskList);
  ComponentRegistry.register('TaskDetails', TaskDetails);
  ComponentRegistry.register('Dashboard', Dashboard);
  ComponentRegistry.register('Header', Header);

  console.log('Registered components:', ComponentRegistry.list());
  // Output: ['TaskList', 'TaskDetails', 'Dashboard', 'Header']
};

// ============================================================================
// STEP 3: Use DynamicRenderer to render components by name
// ============================================================================

const App = () => {
  const [selectedTask, setSelectedTask] = useState(null);

  const tasks = [
    { id: 1, name: 'Build feature', status: 'in-progress', priority: 'high' },
    { id: 2, name: 'Write tests', status: 'pending', priority: 'medium' },
    { id: 3, name: 'Review PR', status: 'pending', priority: 'low' }
  ];

  // Example 1: Simple dynamic rendering
  return (
    <div className="app">
      <DynamicRenderer
        type="TaskList"
        props={{
          tasks: tasks,
          onSelect: setSelectedTask
        }}
      />

      {selectedTask && (
        <DynamicRenderer
          type="TaskDetails"
          props={{ task: selectedTask }}
        />
      )}
    </div>
  );
};

// ============================================================================
// STEP 4: Advanced usage with nested components
// ============================================================================

const AdvancedApp = () => {
  const tasks = [
    { id: 1, name: 'Build feature', status: 'in-progress', priority: 'high' },
    { id: 2, name: 'Write tests', status: 'pending', priority: 'medium' }
  ];

  // Using descriptor objects for nested dynamic components
  return (
    <DynamicRenderer
      type="Dashboard"
      props={{
        header: {
          __dynamicComponent: true,
          type: 'Header',
          props: {
            title: 'My Dashboard',
            subtitle: 'Task Management System'
          }
        },
        sidebar: {
          __dynamicComponent: true,
          type: 'TaskList',
          props: {
            tasks: tasks.filter(t => t.priority === 'high'),
            onSelect: (task) => console.log('High priority:', task)
          }
        },
        content: {
          __dynamicComponent: true,
          type: 'TaskList',
          props: {
            tasks: tasks,
            onSelect: (task) => console.log('Selected:', task)
          }
        }
      }}
    />
  );
};

// ============================================================================
// STEP 5: Dynamic component loading based on config
// ============================================================================

const ConfigDrivenApp = () => {
  // This could come from an API, database, or config file
  const pageConfig = {
    type: 'Dashboard',
    props: {
      header: {
        __dynamicComponent: true,
        type: 'Header',
        props: { title: 'Config-Driven UI' }
      },
      content: {
        __dynamicComponent: true,
        type: 'TaskList',
        props: {
          tasks: [
            { id: 1, name: 'Dynamic task 1' },
            { id: 2, name: 'Dynamic task 2' }
          ],
          onSelect: (task) => alert(`Selected: ${task.name}`)
        }
      }
    }
  };

  return <DynamicRenderer {...pageConfig} />;
};

// ============================================================================
// STEP 6: Error handling examples
// ============================================================================

const ErrorHandlingExample = () => (
  <div>
    {/* Component not found - shows built-in error UI */}
    <DynamicRenderer
      type="NonExistentComponent"
      props={{}}
    />

    {/* Custom error fallback */}
    <DynamicRenderer
      type="AnotherMissingComponent"
      props={{}}
      notFoundFallback={
        <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
          <p>This component could not be loaded.</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      }
    />

    {/* Custom render error fallback */}
    <DynamicRenderer
      type="TaskList"
      props={{ tasks: null }} // Will cause error
      fallback={
        <div style={{ padding: '20px', color: 'red' }}>
          <p>Error rendering component</p>
        </div>
      }
    />
  </div>
);

// ============================================================================
// STEP 7: Initialize and render
// ============================================================================

const init = () => {
  // Register all components first
  registerComponents();

  // Then render your app (using ReactDOM.render or similar)
  // ReactDOM.render(<App />, document.getElementById('root'));
};

// Export for use in other modules
export {
  App,
  AdvancedApp,
  ConfigDrivenApp,
  ErrorHandlingExample,
  init
};
