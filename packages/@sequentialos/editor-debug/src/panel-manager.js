/**
 * panel-manager.js
 *
 * Execution panel visibility and status badge management
 */

export function createPanelManager(config) {
  return {
    openPanel() {
      const panel = document.getElementById(config.executionPanelId);
      if (panel) {
        panel.style.display = 'flex';
        this.updateStatusBadge('paused');
      }
    },

    closePanel() {
      const panel = document.getElementById(config.executionPanelId);
      if (panel) {
        panel.style.display = 'none';
      }
    },

    updateStatusBadge(status) {
      const badge = document.getElementById(config.statusBadgeId);
      if (badge) {
        badge.className = 'status-badge ' + status;
        badge.textContent = status.toUpperCase();
      }
    },

    updateControlButtons(status) {
      if (status === 'paused') {
        if (config.pauseBtn) {
          document.getElementById(config.pauseBtn).style.display = 'none';
        }
        if (config.resumeBtn) {
          document.getElementById(config.resumeBtn).style.display = 'flex';
        }
      } else if (status === 'running') {
        if (config.pauseBtn) {
          document.getElementById(config.pauseBtn).style.display = 'flex';
        }
        if (config.resumeBtn) {
          document.getElementById(config.resumeBtn).style.display = 'none';
        }
      }
    }
  };
}
