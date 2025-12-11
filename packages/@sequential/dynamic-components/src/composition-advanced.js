// Facade maintaining 100% backward compatibility with focused modules
export { ComponentConstraints } from './component-constraints.js';
export { ComponentVariants } from './component-variants.js';
export { ComponentLibrary } from './component-library-manager.js';
export { ComponentPattern } from './component-pattern.js';
export { ComponentComposer } from './component-composer.js';

import { ComponentComposer } from './component-composer.js';
import { ComponentConstraints } from './component-constraints.js';
import { ComponentVariants } from './component-variants.js';
import { ComponentLibrary } from './component-library-manager.js';
import { ComponentPattern } from './component-pattern.js';

export const createComposer = (registry) => new ComponentComposer(registry);
export const createConstraints = () => new ComponentConstraints();
export const createVariants = (registry) => new ComponentVariants(registry);
export const createLibrary = (registry) => new ComponentLibrary(registry);
export const createPattern = (name, description) => new ComponentPattern(name, description);
