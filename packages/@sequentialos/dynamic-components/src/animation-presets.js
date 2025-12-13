/**
 * animation-presets.js - Animation Presets Facade
 *
 * Delegates to animation definitions module
 */

import { ANIMATION_DEFINITIONS } from './animation-definitions.js';

export class AnimationPresets {
  constructor() {
    this.presets = new Map();
    this.initializePresets();
  }

  initializePresets() {
    for (const [name, config] of Object.entries(ANIMATION_DEFINITIONS)) {
      this.createPreset(name, config);
    }
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
