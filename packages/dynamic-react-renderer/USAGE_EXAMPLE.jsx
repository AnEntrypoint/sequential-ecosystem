/**
 * USAGE EXAMPLE for dynamic-react-renderer
 *
 * This file demonstrates how to use the dynamic-react-renderer package
 * in a React application. Note: This is JSX code and requires a build system.
 */

import React, { useState } from 'react';
import DynamicRenderer, { ComponentRegistry } from '"dynamic-react-renderer';

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

export default App;
