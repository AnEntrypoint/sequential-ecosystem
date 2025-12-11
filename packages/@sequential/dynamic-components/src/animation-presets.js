// Animation preset management
export class AnimationPresets {
  constructor() {
    this.presets = new Map();
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
}
