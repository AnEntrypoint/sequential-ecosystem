class PatternCollaborationUI {
  constructor(collaborationManager) {
    this.manager = collaborationManager;
    this.currentSessionId = null;
    this.editingPatternId = null;
    this.showCollaborators = false;
    this.updateQueue = [];
  }

  buildMainUI() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        gap: '12px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        this.buildConnectionStatus(),
        this.buildActiveSession(),
        this.buildCollaborators()
      ]
    };
  }

  buildConnectionStatus() {
    const status = this.manager.isConnected ? 'connected' : 'disconnected';
    const color = this.manager.isConnected ? '#4ade80' : '#ef4444';

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        background: '#2d2d30',
        borderRadius: '4px',
        minWidth: '200px'
      },
      children: [
        {
          type: 'heading',
          content: 'Connection',
          level: 4,
          style: {
            margin: 0,
            fontSize: '11px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          },
          children: [
            {
              type: 'box',
              style: {
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: color,
                boxShadow: `0 0 8px ${color}`
              }
            },
            {
              type: 'paragraph',
              content: status.charAt(0).toUpperCase() + status.slice(1),
              style: {
                margin: 0,
                fontSize: '10px',
                color
              }
            }
          ]
        },
        {
          type: 'paragraph',
          content: `Reconnects: ${this.manager.reconnectAttempts}/${this.manager.maxReconnectAttempts}`,
          style: {
            margin: '4px 0 0 0',
            fontSize: '9px',
            color: '#858585'
          }
        }
      ]
    };
  }

  buildActiveSession() {
    const session = this.currentSessionId ? this.manager.sessions.get(this.currentSessionId) : null;

    if (!session) {
      return {
        type: 'box',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '12px',
          background: '#2d2d30',
          borderRadius: '4px',
          minWidth: '200px'
        },
        children: [
          {
            type: 'heading',
            content: 'Active Session',
            level: 4,
            style: {
              margin: 0,
              fontSize: '11px',
              color: '#e0e0e0',
              textTransform: 'uppercase'
            }
          },
          {
            type: 'paragraph',
            content: 'No session active',
            style: {
              margin: 0,
              fontSize: '10px',
              color: '#858585',
              fontStyle: 'italic'
            }
          }
        ]
      };
    }

    const stats = this.manager.getSessionStats(this.currentSessionId);

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        background: '#2d2d30',
        borderRadius: '4px',
        minWidth: '200px'
      },
      children: [
        {
          type: 'heading',
          content: 'Active Session',
          level: 4,
          style: {
            margin: 0,
            fontSize: '11px',
            color: '#667eea',
            textTransform: 'uppercase'
          }
        },
        {
          type: 'paragraph',
          content: `Pattern: ${session.patternId}`,
          style: {
            margin: 0,
            fontSize: '10px',
            color: '#d4d4d4',
            wordBreak: 'break-all'
          }
        },
        {
          type: 'paragraph',
          content: `Changes: ${stats.totalChanges}`,
          style: {
            margin: '4px 0 0 0',
            fontSize: '9px',
            color: '#858585'
          }
        },
        {
          type: 'paragraph',
          content: `Duration: ${this.formatDuration(stats.duration)}`,
          style: {
            margin: '2px 0 0 0',
            fontSize: '9px',
            color: '#858585'
          }
        },
        ...(stats.conflictedChanges > 0 ? [{
          type: 'box',
          style: {
            padding: '4px 6px',
            background: '#ef4444',
            borderRadius: '3px',
            marginTop: '6px'
          },
          children: [{
            type: 'paragraph',
            content: `⚠️ ${stats.conflictedChanges} conflict${stats.conflictedChanges > 1 ? 's' : ''}`,
            style: {
              margin: 0,
              fontSize: '9px',
              color: '#fff'
            }
          }]
        }] : [])
      ]
    };
  }

  buildCollaborators() {
    const session = this.currentSessionId ? this.manager.sessions.get(this.currentSessionId) : null;
    const collaborators = session ? this.manager.getSessionCollaborators(this.currentSessionId) : Array.from(this.manager.activeUsers.values()).slice(0, 10);

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        background: '#2d2d30',
        borderRadius: '4px',
        minWidth: '200px'
      },
      children: [
        {
          type: 'heading',
          content: `Collaborators (${collaborators.length})`,
          level: 4,
          style: {
            margin: 0,
            fontSize: '11px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          },
          children: collaborators.map(user => ({
            type: 'box',
            style: {
              padding: '6px 8px',
              background: '#3e3e42',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            },
            children: [
              {
                type: 'box',
                style: {
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#667eea'
                }
              },
              {
                type: 'paragraph',
                content: user.id === this.manager.localUserId ? '(You)' : user.id.substring(0, 20),
                style: {
                  margin: 0,
                  fontSize: '9px',
                  color: '#d4d4d4',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }
              }
            ]
          }))
        }
      ]
    };
  }

  buildConflictResolutionUI(change1, change2) {
    const conflict = this.manager.resolveConflict(change1, change2);

    return {
      type: 'box',
      style: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#1e1e1e',
        borderRadius: '6px',
        border: '1px solid #ef4444',
        padding: '20px',
        zIndex: 10000,
        maxWidth: '500px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      },
      children: [
        {
          type: 'heading',
          content: '⚠️ Conflict Detected',
          level: 2,
          style: {
            margin: '0 0 12px 0',
            color: '#ef4444',
            fontSize: '14px'
          }
        },
        {
          type: 'paragraph',
          content: `Conflicting fields: ${conflict.conflictingFields ? conflict.conflictingFields.join(', ') : 'Unknown'}`,
          style: {
            margin: '0 0 12px 0',
            fontSize: '11px',
            color: '#d4d4d4'
          }
        },
        {
          type: 'heading',
          content: 'Change 1',
          level: 4,
          style: {
            margin: '12px 0 6px 0',
            fontSize: '11px',
            color: '#667eea'
          }
        },
        {
          type: 'paragraph',
          content: JSON.stringify(change1.updates, null, 2),
          style: {
            margin: 0,
            padding: '8px',
            background: '#2d2d30',
            borderRadius: '4px',
            fontSize: '9px',
            color: '#d4d4d4',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: '150px',
            overflow: 'auto'
          }
        },
        {
          type: 'heading',
          content: 'Change 2',
          level: 4,
          style: {
            margin: '12px 0 6px 0',
            fontSize: '11px',
            color: '#667eea'
          }
        },
        {
          type: 'paragraph',
          content: JSON.stringify(change2.updates, null, 2),
          style: {
            margin: 0,
            padding: '8px',
            background: '#2d2d30',
            borderRadius: '4px',
            fontSize: '9px',
            color: '#d4d4d4',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: '150px',
            overflow: 'auto'
          }
        },
        {
          type: 'paragraph',
          content: `Resolution Strategy: ${conflict.strategy}`,
          style: {
            margin: '12px 0 0 0',
            fontSize: '10px',
            color: '#858585',
            fontStyle: 'italic'
          }
        }
      ]
    };
  }

  buildChangeHistoryUI(sessionId) {
    const changes = sessionId
      ? this.manager.changeHistory.filter(c => c.sessionId === sessionId)
      : this.manager.changeHistory.slice(-20);

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '📝 Change History',
          level: 3,
          style: {
            margin: 0,
            fontSize: '12px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            maxHeight: '300px',
            overflow: 'auto'
          },
          children: changes.length > 0
            ? changes.slice().reverse().map(change => ({
              type: 'box',
              style: {
                padding: '8px 12px',
                background: '#2d2d30',
                borderRadius: '3px',
                borderLeft: `3px solid ${change.applied ? '#4ade80' : '#ef4444'}`,
                fontSize: '9px'
              },
              children: [
                {
                  type: 'paragraph',
                  content: `${change.userId === this.manager.localUserId ? 'You' : change.userId.substring(0, 15)}: ${Object.keys(change.updates).join(', ')}`,
                  style: {
                    margin: 0,
                    color: '#d4d4d4'
                  }
                },
                {
                  type: 'paragraph',
                  content: new Date(change.isoTime).toLocaleTimeString(),
                  style: {
                    margin: '2px 0 0 0',
                    color: '#858585'
                  }
                }
              ]
            }))
            : [{
              type: 'paragraph',
              content: 'No changes yet',
              style: {
                margin: 0,
                fontSize: '10px',
                color: '#858585',
                textAlign: 'center',
                padding: '12px'
              }
            }]
        }
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

  startEditingPattern(patternId, patternDef) {
    this.currentSessionId = this.manager.startEditingPattern(patternId, patternDef);
    this.editingPatternId = patternId;
  }

  updatePattern(updates, metadata = {}) {
    if (!this.currentSessionId) return null;
    return this.manager.updatePattern(this.currentSessionId, updates, metadata);
  }

  lockPattern(lockKey) {
    if (!this.editingPatternId) return null;
    return this.manager.lockPattern(this.editingPatternId, lockKey);
  }

  unlockPattern(lockId) {
    if (!this.editingPatternId) return null;
    return this.manager.unlockPattern(this.editingPatternId, lockId);
  }
}

function createPatternCollaborationUI(collaborationManager) {
  return new PatternCollaborationUI(collaborationManager);
}

export { PatternCollaborationUI, createPatternCollaborationUI };
