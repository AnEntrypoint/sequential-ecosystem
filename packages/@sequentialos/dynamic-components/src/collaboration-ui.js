// UI building for collaboration interface
export class CollaborationUIBuilder {
  buildCollaborationUI(sessionId, sessionManager, cursorTracker) {
    const session = sessionManager.getSession(sessionId);
    if (!session) return null;

    const cursors = cursorTracker.getCursorPositions(sessionId);

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: `Collaborators (${session.participants.size})`,
          level: 4,
          style: { margin: 0, fontSize: '14px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          },
          children: Array.from(session.participants).map(userId => {
            const cursor = cursors.find(c => c.userId === userId);
            return {
              type: 'box',
              style: {
                padding: '8px 12px',
                backgroundColor: '#fff',
                border: `2px solid ${cursor?.color || '#ddd'}`,
                borderRadius: '4px',
                fontSize: '12px'
              },
              children: [
                {
                  type: 'text',
                  content: `${userId}${cursor ? ` (${cursor.line}:${cursor.column})` : ''}`
                }
              ]
            };
          })
        }
      ]
    };
  }
}
