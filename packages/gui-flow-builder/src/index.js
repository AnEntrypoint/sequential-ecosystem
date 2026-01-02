/**
 * gui-flow-builder
 *
 * Comprehensive GUI for building, visualizing, and executing flows
 * Integrates with DynamicRenderer for composable React components
 *
 * Features:
 * - Visual flow composition with drag-drop
 * - Real-time execution monitoring
 * - State machine visualization
 * - Component palette for available tasks, flows, tools
 * - xstate machine integration
 *
 * @example
 * import FlowVisualizer, { ExecutionMonitor, ComponentPalette } from 'gui-flow-builder';
 * import GuiComponentRegistry from 'gui-flow-builder/GuiComponentRegistry';
 *
 * // Register components with DynamicRenderer
 * GuiComponentRegistry.register();
 *
 * <FlowVisualizer flow={flowConfig} execution={executionData} />
 * <ExecutionMonitor execution={executionData} onRetry={handler} />
 */

export { default as FlowVisualizer } from './FlowVisualizer.js';
export { default as ExecutionMonitor } from './ExecutionMonitor.js';
export { default as ComponentPalette } from './ComponentPalette.js';
export { default as FlowCanvas } from './FlowCanvas.js';
export { default as StateMachineVisualizer } from './StateMachineVisualizer.js';
export { default as GuiComponentRegistry } from './GuiComponentRegistry.js';
