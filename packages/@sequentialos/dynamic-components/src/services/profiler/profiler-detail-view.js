// Profile detail view builder - displays individual profile metrics
export function buildProfileDetailView(profiler, profileId) {
  const profile = profiler.getProfile(profileId);
  if (!profile) return null;

  return {
    type: 'box',
    style: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: '#1e1e1e',
      borderRadius: '6px',
      border: '1px solid #3e3e42',
      padding: '20px',
      zIndex: 10000,
      maxWidth: '600px',
      maxHeight: '80vh',
      overflow: 'auto',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
    },
    children: [
      {
        type: 'heading',
        content: `Profile: ${profile.patternId}`,
        level: 2,
        style: {
          margin: '0 0 12px 0',
          color: '#667eea'
        }
      },
      {
        type: 'paragraph',
        content: `Duration: ${profile.metrics.duration?.toFixed(2)}ms`,
        style: {
          margin: '8px 0',
          fontSize: '11px',
          color: '#d4d4d4'
        }
      },
      {
        type: 'paragraph',
        content: `Renders: ${profile.renderCount} | Updates: ${profile.updateCount}`,
        style: {
          margin: '8px 0',
          fontSize: '11px',
          color: '#d4d4d4'
        }
      },
      {
        type: 'paragraph',
        content: `Memory Δ: ${(profile.metrics.memoryDelta?.usedDelta || 0) / 1024}KB`,
        style: {
          margin: '8px 0',
          fontSize: '11px',
          color: '#d4d4d4'
        }
      },
      profile.events.length > 0 ? {
        type: 'box',
        style: {
          marginTop: '16px'
        },
        children: [
          {
            type: 'heading',
            content: 'Events',
            level: 4,
            style: {
              margin: '0 0 8px 0',
              fontSize: '11px',
              color: '#e0e0e0'
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
            children: profile.events.map(event => ({
              type: 'paragraph',
              content: `${event.relativeTime.toFixed(2)}ms - ${event.type}`,
              style: {
                margin: 0,
                fontSize: '9px',
                color: '#858585',
                padding: '4px 8px',
                background: '#2d2d30',
                borderRadius: '2px'
              }
            }))
          }
        ]
      } : null
    ].filter(Boolean)
  };
}
