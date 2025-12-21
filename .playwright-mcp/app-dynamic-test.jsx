/**
 * Test file: app.jsx updated to use DynamicRenderer
 * This demonstrates how to convert the static app.jsx to use dynamic rendering
 */

import React from "react";
import { DynamicRenderer, ComponentRegistry } from '@sequentialos/dynamic-react-renderer';

// Define the original card component
const Card = ({ title, children }) => (
  <div className="card">
    <h1>{title}</h1>
    {children}
  </div>
);

// Define a simple heading component
const Heading = ({ text }) => <h1>{text}</h1>;

// Register components
ComponentRegistry.register('Card', Card);
ComponentRegistry.register('Heading', Heading);

// Version 1: Using DynamicRenderer with simple component
export function AppDynamic1() {
  return (
    <div className="app-container">
      <DynamicRenderer
        type="Card"
        props={{
          title: "Dynamic Heading",
          children: <p>This card is rendered dynamically!</p>
        }}
      />
    </div>
  );
}

// Version 2: Using DynamicRenderer with nested components
export function AppDynamic2() {
  return (
    <div className="app-container">
      <DynamicRenderer
        type="Card"
        props={{
          title: "Nested Dynamic Components",
          children: {
            __dynamicComponent: true,
            type: 'Heading',
            props: { text: 'This heading is nested and dynamic!' }
          }
        }}
      />
    </div>
  );
}

// Version 3: Fully config-driven (could come from API/database)
export function AppDynamic3() {
  const componentConfig = {
    type: 'Card',
    props: {
      title: 'Config-Driven UI',
      children: 'This entire component tree comes from a config object!'
    }
  };

  return (
    <div className="app-container">
      <DynamicRenderer {...componentConfig} />
    </div>
  );
}

// Original static version for comparison
export function AppStatic() {
  return (
    <div className="app-container">
     <div className="card">
   <h1>Heading</h1>
    </div>
    </div>
  );
}

// Default export - choose which version to use
export default AppDynamic1;
