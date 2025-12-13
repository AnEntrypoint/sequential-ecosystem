/**
 * layout-factory.js - Layout component factory
 *
 * Factory function to create layout components from definitions
 */

import { LAYOUT_COMPONENTS } from './layout-components-def.js';

export const createLayoutComponent = (type, props) => {
  const component = LAYOUT_COMPONENTS[type];
  if (!component) {
    throw new Error(`Layout component "${type}" not found`);
  }
  return { name: type, ...component };
};
