/**
 * hot-reload-ui.js - Hot Reload UI Facade
 *
 * Delegates to focused UI builder modules
 */

import { buildPreviewUI, buildPreviewHeader } from './hot-reload-preview-builder.js';
import { buildPreviewFooter } from './hot-reload-footer-builder.js';
import { buildHistoryPanel } from './hot-reload-history-builder.js';

export class HotReloadUI {
  buildPreviewUI(currentComponent, metrics) {
    return buildPreviewUI(currentComponent, metrics, buildPreviewHeader, () => this.buildPreviewFooter());
  }

  buildPreviewHeader(metrics) {
    return buildPreviewHeader(metrics);
  }

  buildPreviewFooter(canUndo, canRedo, onUndo, onRedo, onRefresh) {
    return buildPreviewFooter(canUndo, canRedo, onUndo, onRedo, onRefresh);
  }

  buildHistoryPanel(history) {
    return buildHistoryPanel(history);
  }
}
