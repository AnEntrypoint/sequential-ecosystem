/**
 * component-library-definitions.js - Component Library Definitions Facade
 *
 * Delegates to focused modules:
 * - button-components: Button definitions
 * - container-components: Card and section containers
 * - form-components: Form input components
 * - feedback-components: Badge, alert, metric
 * - layout-components: Grid and header layouts
 */

import { BUTTON_COMPONENTS } from './button-components.js';
import { CONTAINER_COMPONENTS } from './container-components.js';
import { FORM_COMPONENTS } from './form-components.js';
import { FEEDBACK_COMPONENTS } from './feedback-components.js';
import { LAYOUT_COMPONENTS } from './layout-components.js';

export const COMPONENT_LIBRARY = {
  buttons: BUTTON_COMPONENTS,
  containers: CONTAINER_COMPONENTS,
  forms: FORM_COMPONENTS,
  feedback: FEEDBACK_COMPONENTS,
  layout: LAYOUT_COMPONENTS
};
