/**
 * advanced-builders.js - Advanced Component Builders Facade
 *
 * Delegates to focused builder modules:
 * - navigation-builders: Pagination and breadcrumb
 * - display-builders: Progress, spinner, avatar
 * - layout-builders: Hero and footer
 */

export { createPagination, createBreadcrumb } from './navigation-builders.js';
export { createProgress, createSpinner, createAvatar } from './display-builders.js';
export { createHero, createFooter } from './layout-builders.js';
