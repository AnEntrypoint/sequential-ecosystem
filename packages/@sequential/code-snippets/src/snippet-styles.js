/**
 * snippet-styles.js - Snippet Styles Facade
 *
 * Delegates to focused style modules:
 * - button-and-menu-styles: Button, menu, search, categories, items
 * - modal-and-form-styles: Modal, forms, inputs, buttons
 * - style-injector: Style injection utilities
 */

import { getButtonAndMenuStyles } from './button-and-menu-styles.js';
import { getModalAndFormStyles } from './modal-and-form-styles.js';
import { createStyleElement, appendStyleToHead, injectSnippetStyles as doInjectStyles } from './style-injector.js';

export function createSnippetStyles() {
  const cssContent = getButtonAndMenuStyles() + '\n' + getModalAndFormStyles();
  return createStyleElement(cssContent);
}

export function injectSnippetStyles() {
  const cssContent = getButtonAndMenuStyles() + '\n' + getModalAndFormStyles();
  appendStyleToHead(cssContent);
}
