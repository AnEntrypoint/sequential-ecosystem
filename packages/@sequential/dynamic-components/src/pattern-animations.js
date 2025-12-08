class PatternAnimations {
  constructor() {
    this.animations = new Map();
    this.presets = new Map();
    this.activeAnimations = new Map();
    this.initializePresets();
  }

  initializePresets() {
    this.createPreset('fadeIn', {
      keyframes: [
        { offset: 0, opacity: 0 },
        { offset: 1, opacity: 1 }
      ],
      duration: 300,
      easing: 'ease-in-out'
    });

    this.createPreset('slideInLeft', {
      keyframes: [
        { offset: 0, transform: 'translateX(-100%)', opacity: 0 },
        { offset: 1, transform: 'translateX(0)', opacity: 1 }
      ],
      duration: 400,
      easing: 'ease-out'
    });

    this.createPreset('slideInRight', {
      keyframes: [
        { offset: 0, transform: 'translateX(100%)', opacity: 0 },
        { offset: 1, transform: 'translateX(0)', opacity: 1 }
      ],
      duration: 400,
      easing: 'ease-out'
    });

    this.createPreset('slideInUp', {
      keyframes: [
        { offset: 0, transform: 'translateY(100%)', opacity: 0 },
        { offset: 1, transform: 'translateY(0)', opacity: 1 }
      ],
      duration: 400,
      easing: 'ease-out'
    });

    this.createPreset('slideInDown', {
      keyframes: [
        { offset: 0, transform: 'translateY(-100%)', opacity: 0 },
        { offset: 1, transform: 'translateY(0)', opacity: 1 }
      ],
      duration: 400,
      easing: 'ease-out'
    });

    this.createPreset('zoomIn', {
      keyframes: [
        { offset: 0, transform: 'scale(0.8)', opacity: 0 },
        { offset: 1, transform: 'scale(1)', opacity: 1 }
      ],
      duration: 300,
      easing: 'ease-in-out'
    });

    this.createPreset('zoomOut', {
      keyframes: [
        { offset: 0, transform: 'scale(1)', opacity: 1 },
        { offset: 1, transform: 'scale(0.8)', opacity: 0 }
      ],
      duration: 300,
      easing: 'ease-in-out'
    });

    this.createPreset('pulse', {
      keyframes: [
        { offset: 0, opacity: 1 },
        { offset: 0.5, opacity: 0.7 },
        { offset: 1, opacity: 1 }
      ],
      duration: 1000,
      easing: 'ease-in-out',
      iterations: 'infinite'
    });

    this.createPreset('shake', {
      keyframes: [
        { offset: 0, transform: 'translateX(0)' },
        { offset: 0.1, transform: 'translateX(-5px)' },
        { offset: 0.2, transform: 'translateX(5px)' },
        { offset: 0.3, transform: 'translateX(-5px)' },
        { offset: 0.4, transform: 'translateX(5px)' },
        { offset: 1, transform: 'translateX(0)' }
      ],
      duration: 400,
      easing: 'ease-in-out'
    });

    this.createPreset('bounce', {
      keyframes: [
        { offset: 0, transform: 'translateY(0)' },
        { offset: 0.5, transform: 'translateY(-20px)' },
        { offset: 1, transform: 'translateY(0)' }
      ],
      duration: 600,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      iterations: 'infinite'
    });

    this.createPreset('rotate', {
      keyframes: [
        { offset: 0, transform: 'rotate(0deg)' },
        { offset: 1, transform: 'rotate(360deg)' }
      ],
      duration: 800,
      easing: 'linear',
      iterations: 'infinite'
    });
  }

  createPreset(name, config) {
    const preset = {
      name,
      keyframes: config.keyframes,
      duration: config.duration || 300,
      easing: config.easing || 'ease-in-out',
      delay: config.delay || 0,
      iterations: config.iterations || 1,
      direction: config.direction || 'normal',
      fillMode: config.fillMode || 'both'
    };

    this.presets.set(name, preset);
    return preset;
  }

  createCustom(name, keyframes, duration = 300, easing = 'ease-in-out') {
    return this.createPreset(name, { keyframes, duration, easing });
  }

  getKeyframeCSS(animationName, animation) {
    let css = `@keyframes ${animationName} {\n`;

    animation.keyframes.forEach(frame => {
      const percent = Math.round(frame.offset * 100);
      css += `  ${percent}% {\n`;

      Object.entries(frame).forEach(([key, value]) => {
        if (key !== 'offset') {
          const cssKey = this.toCSSPropertyName(key);
          css += `    ${cssKey}: ${value};\n`;
        }
      });

      css += `  }\n`;
    });

    css += `}\n`;
    return css;
  }

  toCSSPropertyName(jsName) {
    return jsName.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  applyAnimation(componentDef, animationName, options = {}) {
    const animation = this.presets.get(animationName);
    if (!animation) return componentDef;

    const styled = JSON.parse(JSON.stringify(componentDef));

    if (!styled.style) {
      styled.style = {};
    }

    const duration = options.duration || animation.duration;
    const easing = options.easing || animation.easing;
    const delay = options.delay || animation.delay;
    const iterations = options.iterations || animation.iterations;

    styled.style.animation = `${animationName} ${duration}ms ${easing} ${delay}ms ${iterations}`;

    if (!styled.animations) {
      styled.animations = [];
    }

    styled.animations.push({
      name: animationName,
      duration,
      easing,
      delay,
      iterations,
      keyframes: animation.keyframes
    });

    return styled;
  }

  chainAnimations(componentDef, animationNames) {
    let result = JSON.parse(JSON.stringify(componentDef));
    let totalDuration = 0;

    animationNames.forEach((name, idx) => {
      const animation = this.presets.get(name);
      if (!animation) return;

      const delay = totalDuration;
      result = this.applyAnimation(result, name, { delay });
      totalDuration += animation.duration + delay;
    });

    return result;
  }

  createSequence(componentDef, sequence) {
    let result = JSON.parse(JSON.stringify(componentDef));
    let totalDuration = 0;

    sequence.forEach(({ animation, duration, delay }) => {
      const animDef = this.presets.get(animation);
      if (!animDef) return;

      const actualDelay = (delay || 0) + totalDuration;
      result = this.applyAnimation(result, animation, {
        duration: duration || animDef.duration,
        delay: actualDelay
      });

      totalDuration = actualDelay + (duration || animDef.duration);
    });

    result.sequenceDuration = totalDuration;
    return result;
  }

  buildAnimationPreview(animationName) {
    const animation = this.presets.get(animationName);
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
    const presetNames = Array.from(this.presets.keys());

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

  getPresetConfig(name) {
    return this.presets.get(name);
  }

  getAllPresets() {
    return Array.from(this.presets.entries()).map(([name, config]) => ({
      name,
      duration: config.duration,
      easing: config.easing,
      keyframes: config.keyframes.length
    }));
  }

  exportAnimations() {
    return {
      presets: Array.from(this.presets.entries()).map(([name, config]) => ({
        name,
        ...config
      })),
      exportedAt: new Date().toISOString()
    };
  }
}

function createPatternAnimations() {
  return new PatternAnimations();
}

export { PatternAnimations, createPatternAnimations };
