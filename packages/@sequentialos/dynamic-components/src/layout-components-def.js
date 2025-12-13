/**
 * Layout Components Definition Facade
 * JSX code templates for layout components
 *
 * Delegates to:
 * - layout-basic-components: box, flex, grid - foundational layouts
 * - layout-stack-spacer-components: stack, hstack, divider, spacer - directional/spacing
 * - layout-semantic-components: container, section, card - semantic containers
 */

import { BASIC_LAYOUT_COMPONENTS } from './layout-basic-components.js';
import { STACK_SPACER_COMPONENTS } from './layout-stack-spacer-components.js';
import { SEMANTIC_COMPONENTS } from './layout-semantic-components.js';

export const LAYOUT_COMPONENTS = {
  ...BASIC_LAYOUT_COMPONENTS,
  ...STACK_SPACER_COMPONENTS,
  ...SEMANTIC_COMPONENTS
};
