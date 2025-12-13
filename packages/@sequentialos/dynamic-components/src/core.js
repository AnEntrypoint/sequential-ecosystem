// Core rendering facade - maintains 100% backward compatibility
import React from 'react';
import { DynamicComponentRegistry } from './component-registry-core.js';
import { useDynamicComponent, renderJSX } from './jsx-helpers.js';
import { AppRenderer } from './app-renderer-core.js';
import { ComponentBuilder } from './component-builder-core.js';

// Re-export all classes and functions
export { DynamicComponentRegistry } from './component-registry-core.js';
export { useDynamicComponent, renderJSX } from './jsx-helpers.js';
export { AppRenderer } from './app-renderer-core.js';
export { ComponentBuilder } from './component-builder-core.js';
