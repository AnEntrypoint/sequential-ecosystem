// CSS keyframe generation for animations
export class AnimationCSSGenerator {
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
}
