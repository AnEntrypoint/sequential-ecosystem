// Collaboration UI rendering
export class CollaborationUIBuilder {
  constructor(manager) {
    this.manager = manager;
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
    const connected = this.manager?.isConnected?.() ?? false;
    const status = connected ? 'Connected' : 'Disconnected';
    const color = connected ? '#4CAF50' : '#F44336';

    return {
      type: 'box',
      style: {
        padding: '12px',
        borderRadius: '6px',
        background: '#f5f5f5',
        minWidth: '200px'
      },
      children: [
        {
          type: 'flex',
          direction: 'row',
          style: { alignItems: 'center', gap: '8px', marginBottom: '12px' },
          children: [
            {
              type: 'box',
              style: {
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: color,
                animation: connected ? 'none' : 'pulse 1s infinite'
              }
            },
            { type: 'text', content: status, style: { fontWeight: '600' } }
          ]
        }
      ]
    };
  }

  buildActiveSession() {
    const session = this.manager?.getSession?.();
    if (!session) {
      return {
        type: 'box',
        style: { padding: '12px' },
        children: [{ type: 'text', content: 'No active session' }]
      };
    }

    return {
      type: 'box',
      style: { padding: '12px', flex: 1 },
      children: [
        { type: 'heading', content: `Session: ${session.name}`, level: 4, style: { margin: 0 } }
      ]
    };
  }

  buildCollaborators() {
    const session = this.manager?.getSession?.();
    const collaborators = session?.participants || [];

    return {
      type: 'box',
      style: {
        padding: '12px',
        minWidth: '200px',
        borderLeft: '1px solid #ddd'
      },
      children: [
        { type: 'heading', content: 'Collaborators', level: 4, style: { margin: 0 } },
        ...collaborators.map(collab => ({
          type: 'flex',
          direction: 'row',
          style: { marginTop: '8px', gap: '8px' },
          children: [
            {
              type: 'box',
              style: {
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: collab.color || '#667eea'
              }
            },
            { type: 'text', content: collab.name }
          ]
        }))
      ]
    };
  }

  buildConflictResolutionUI(change1, change2) {
    return {
      type: 'box',
      style: { padding: '16px', border: '2px solid #FF9800' },
      children: [
        { type: 'heading', content: 'Conflict Detected', level: 3 },
        {
          type: 'flex',
          direction: 'row',
          style: { gap: '20px' },
          children: [
            {
              type: 'box',
              style: { flex: 1, padding: '12px', background: '#f5f5f5' },
              children: [
                { type: 'text', content: 'Version A' },
                { type: 'code', content: JSON.stringify(change1.updates, null, 2), language: 'json' }
              ]
            },
            {
              type: 'box',
              style: { flex: 1, padding: '12px', background: '#f5f5f5' },
              children: [
                { type: 'text', content: 'Version B' },
                { type: 'code', content: JSON.stringify(change2.updates, null, 2), language: 'json' }
              ]
            }
          ]
        }
      ]
    };
  }

  buildChangeHistoryUI(changes) {
    return {
      type: 'box',
      style: { padding: '12px' },
      children: [
        { type: 'heading', content: 'Change History', level: 4 },
        ...changes.map((change, idx) => ({
          type: 'box',
          style: {
            padding: '8px',
            marginTop: '8px',
            borderLeft: '3px solid #667eea',
            paddingLeft: '12px'
          },
          children: [
            { type: 'text', content: `Change #${idx + 1}`, style: { fontWeight: '600' } },
            { type: 'text', content: new Date(change.timestamp).toISOString(), style: { fontSize: '12px' } }
          ]
        }))
      ]
    };
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}
