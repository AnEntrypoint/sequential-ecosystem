// Collaboration conflict resolution and history UI
export class CollaborationHistoryBuilder {
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
