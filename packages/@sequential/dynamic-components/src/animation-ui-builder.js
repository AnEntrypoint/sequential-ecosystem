// UI components for animation preview and controls
export class AnimationUIBuilder {
  constructor(presets) {
    this.presets = presets;
  }

  buildAnimationPreview(animationName) {
    const animation = this.presets.getPresetConfig(animationName);
    if (!animation) return null;

    return {
      type: 'box',
      style: {
        padding: '20px',
        background: '#2d2d30',
        borderRadius: '6px',
        border: '1px solid #3e3e42',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '150px'
      },
      children: [{
        type: 'box',
        style: {
          width: '60px',
          height: '60px',
          background: '#667eea',
          borderRadius: '6px',
          animation: `${animationName} ${animation.duration}ms ${animation.easing} ${animation.delay}ms ${animation.iterations}`
        },
        children: []
      }]
    };
  }

  buildAnimationControls() {
    const presetNames = Array.from(this.presets.presets.keys());

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '✨ Animations',
          level: 3,
          style: { margin: 0, fontSize: '12px', color: '#e0e0e0' }
        },
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
          },
          children: presetNames.map(name => ({
            type: 'box',
            style: {
              padding: '8px 12px',
              background: '#2d2d30',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '10px',
              color: '#d4d4d4',
              textAlign: 'center'
            },
            children: [{
              type: 'paragraph',
              content: name,
              style: { margin: 0 }
            }]
          }))
        }
      ]
    };
  }
}
