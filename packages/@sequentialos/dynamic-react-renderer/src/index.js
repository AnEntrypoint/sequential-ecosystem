/**
 * @sequentialos/dynamic-react-renderer
 *
 * Dynamic React component rendering system with registry pattern.
 * Allows runtime component registration and rendering without hardcoded imports.
 *
 * @example
 * // Register components
 * import ComponentRegistry from '@sequentialos/dynamic-react-renderer/ComponentRegistry';
 * import TaskList from './components/TaskList';
 *
 * ComponentRegistry.register('TaskList', TaskList);
 *
 * @example
 * // Render dynamically
 * import DynamicRenderer from '@sequentialos/dynamic-react-renderer';
 *
 * <DynamicRenderer
 *   type="TaskList"
 *   props={{ tasks: [...], onSelect: handler }}
 * />
 */

export { default as ComponentRegistry } from './ComponentRegistry.js';
export { default as DynamicRenderer } from './DynamicRenderer.js';
export { default as ErrorBoundary } from './ErrorBoundary.js';
export { default } from './DynamicRenderer.js';
