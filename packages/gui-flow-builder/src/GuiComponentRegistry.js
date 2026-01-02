/**
 * GuiComponentRegistry - Register GUI components with DynamicRenderer
 *
 * Initializes and registers all gui-flow-builder components with the
 * DynamicRenderer's ComponentRegistry for dynamic composition.
 *
 * This enables configuration-driven UI where flows can be visualized
 * and executed purely from data configurations.
 */

import { defaultRegistry as componentRegistry } from 'dynamic-react-renderer';
import FlowVisualizer from './FlowVisualizer.js';
import ExecutionMonitor from './ExecutionMonitor.js';
import ComponentPalette from './ComponentPalette.js';
import FlowCanvas from './FlowCanvas.js';
import StateMachineVisualizer from './StateMachineVisualizer.js';

const GuiComponentRegistry = {
  register() {
    try {
      componentRegistry.register('FlowVisualizer', FlowVisualizer);
      componentRegistry.register('ExecutionMonitor', ExecutionMonitor);
      componentRegistry.register('ComponentPalette', ComponentPalette);
      componentRegistry.register('FlowCanvas', FlowCanvas);
      componentRegistry.register('StateMachineVisualizer', StateMachineVisualizer);

      return {
        success: true,
        registeredCount: 5,
        components: [
          'FlowVisualizer',
          'ExecutionMonitor',
          'ComponentPalette',
          'FlowCanvas',
          'StateMachineVisualizer'
        ]
      };
    } catch (error) {
      throw new Error(`Failed to register GUI components: ${error.message}`);
    }
  },

  unregister() {
    try {
      componentRegistry.unregister('FlowVisualizer');
      componentRegistry.unregister('ExecutionMonitor');
      componentRegistry.unregister('ComponentPalette');
      componentRegistry.unregister('FlowCanvas');
      componentRegistry.unregister('StateMachineVisualizer');

      return {
        success: true,
        unregisteredCount: 5
      };
    } catch (error) {
      throw new Error(`Failed to unregister GUI components: ${error.message}`);
    }
  },

  list() {
    const registered = componentRegistry.list();
    const guiComponents = registered.filter(name =>
      ['FlowVisualizer', 'ExecutionMonitor', 'ComponentPalette', 'FlowCanvas', 'StateMachineVisualizer'].includes(name)
    );
    return guiComponents;
  },

  has(name) {
    return componentRegistry.has(name);
  },

  get(name) {
    return componentRegistry.get(name);
  }
};

export default GuiComponentRegistry;
