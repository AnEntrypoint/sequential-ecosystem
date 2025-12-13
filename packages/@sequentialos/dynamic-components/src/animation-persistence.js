// Animation export and persistence
export class AnimationPersistence {
  constructor(presets) {
    this.presets = presets;
  }

  exportAnimations() {
    return {
      presets: Array.from(this.presets.presets.entries()).map(([name, config]) => ({
        name,
        ...config
      })),
      exportedAt: new Date().toISOString()
    };
  }
}
