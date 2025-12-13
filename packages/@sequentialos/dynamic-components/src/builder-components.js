// Facade maintaining 100% backward compatibility with component builders
import { buildResponsiveGrid } from './responsive-grid-builder.js';
import { buildModalOverlay } from './modal-builder.js';
import { buildTabInterface } from './tab-interface-builder.js';
import { buildDataTable } from './data-table-builder.js';
import { buildSearchableList } from './searchable-list-builder.js';
import { buildNotification } from './notification-builder.js';

export class BuilderComponents {
  constructor(themeEngine) {
    this.themeEngine = themeEngine;
  }

  buildResponsiveGrid(items, options = {}) {
    return buildResponsiveGrid(this.themeEngine, items, options);
  }

  buildModalOverlay(content, options = {}) {
    return buildModalOverlay(this.themeEngine, content, options);
  }

  buildTabInterface(tabs, options = {}) {
    return buildTabInterface(this.themeEngine, tabs, options);
  }

  buildDataTable(columns, rows, options = {}) {
    return buildDataTable(this.themeEngine, columns, rows, options);
  }

  buildSearchableList(items, options = {}) {
    return buildSearchableList(this.themeEngine, items, options);
  }

  buildNotification(message, type = 'info', options = {}) {
    return buildNotification(this.themeEngine, message, type, options);
  }
}
