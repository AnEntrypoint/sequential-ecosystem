// Pattern animations facade - maintains 100% backward compatibility
import { AnimationPresets } from './animation-presets.js';
import { AnimationCSSGenerator } from './animation-css-generator.js';
import { AnimationApplicator } from './animation-applicator.js';
import { AnimationUIBuilder } from './animation-ui-builder.js';
import { AnimationPersistence } from './animation-persistence.js';

class PatternAnimations {
  constructor() {
    this.presets = new AnimationPresets();
    this.cssGenerator = new AnimationCSSGenerator();
    this.applicator = new AnimationApplicator(this.presets);
    this.uiBuilder = new AnimationUIBuilder(this.presets);
    this.persistence = new AnimationPersistence(this.presets);

    // Expose for backward compatibility
    this.animations = new Map();
    this.activeAnimations = new Map();
  }

  // Delegate to presets
  initializePresets() {
    this.presets.initializePresets();
  }

  createPreset(name, config) {
    return this.presets.createPreset(name, config);
  }

  createCustom(name, keyframes, duration = 300, easing = 'ease-in-out') {
    return this.presets.createCustom(name, keyframes, duration, easing);
  }

  getPresetConfig(name) {
    return this.presets.getPresetConfig(name);
  }

  getAllPresets() {
    return this.presets.getAllPresets();
  }

  // Delegate to CSS generator
  getKeyframeCSS(animationName, animation) {
    return this.cssGenerator.getKeyframeCSS(animationName, animation);
  }

  toCSSPropertyName(jsName) {
    return this.cssGenerator.toCSSPropertyName(jsName);
  }

  // Delegate to applicator
  applyAnimation(componentDef, animationName, options = {}) {
    return this.applicator.applyAnimation(componentDef, animationName, options);
  }

  chainAnimations(componentDef, animationNames) {
    return this.applicator.chainAnimations(componentDef, animationNames);
  }

  createSequence(componentDef, sequence) {
    return this.applicator.createSequence(componentDef, sequence);
  }

  // Delegate to UI builder
  buildAnimationPreview(animationName) {
    return this.uiBuilder.buildAnimationPreview(animationName);
  }

  buildAnimationControls() {
    return this.uiBuilder.buildAnimationControls();
  }

  // Delegate to persistence
  exportAnimations() {
    return this.persistence.exportAnimations();
  }
}

function createPatternAnimations() {
  return new PatternAnimations();
}

export { PatternAnimations, createPatternAnimations };
