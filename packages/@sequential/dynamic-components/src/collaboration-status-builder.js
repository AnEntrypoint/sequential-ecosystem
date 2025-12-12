// Collaboration status UI components
export class CollaborationStatusBuilder {
  constructor(manager) {
    this.manager = manager;
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
}
