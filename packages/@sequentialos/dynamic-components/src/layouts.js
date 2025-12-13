/**
 * layouts.js - Layout Components Facade
 *
 * Delegates to focused modules:
 * - layout-components-def: Component definitions
 * - layout-factory: Component factory function
 */

export { LAYOUT_COMPONENTS } from './layout-components-def.js';
export { createLayoutComponent } from './layout-factory.js';
