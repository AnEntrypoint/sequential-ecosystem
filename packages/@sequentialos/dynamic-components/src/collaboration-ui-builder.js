// Collaboration UI rendering facade
import { CollaborationStatusBuilder } from './collaboration-status-builder.js';
import { CollaborationHistoryBuilder } from './collaboration-history-builder.js';

export class CollaborationUIBuilder {
  constructor(manager) {
    this.manager = manager;
    this.statusBuilder = new CollaborationStatusBuilder(manager);
    this.historyBuilder = new CollaborationHistoryBuilder();
  }

  buildMainUI() {
    return {
      type: 'flex',
      direction: 'row',
      style: { height: '100%', gap: '12px' },
      children: [
        this.buildConnectionStatus(),
        this.buildActiveSession(),
        this.buildCollaborators()
      ]
    };
  }

  buildConnectionStatus() {
    return this.statusBuilder.buildConnectionStatus();
  }

  buildActiveSession() {
    return this.statusBuilder.buildActiveSession();
  }

  buildCollaborators() {
    return this.statusBuilder.buildCollaborators();
  }

  buildConflictResolutionUI(change1, change2) {
    return this.historyBuilder.buildConflictResolutionUI(change1, change2);
  }

  buildChangeHistoryUI(changes) {
    return this.historyBuilder.buildChangeHistoryUI(changes);
  }

  formatDuration(ms) {
    return this.historyBuilder.formatDuration(ms);
  }
}
