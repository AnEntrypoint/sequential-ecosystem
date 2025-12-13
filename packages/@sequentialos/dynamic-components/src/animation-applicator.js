// Component animation application and sequencing
export class AnimationApplicator {
  constructor(presets) {
    this.presets = presets;
  }

  applyAnimation(componentDef, animationName, options = {}) {
    const animation = this.presets.presets.get(animationName);
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

    animationNames.forEach((name) => {
      const animation = this.presets.presets.get(name);
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
      const animDef = this.presets.presets.get(animation);
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
}
