/**
 * animation-definitions.js - Built-in animation preset definitions
 *
 * Keyframe definitions for common animations
 */

export const ANIMATION_DEFINITIONS = {
  fadeIn: {
    keyframes: [
      { offset: 0, opacity: 0 },
      { offset: 1, opacity: 1 }
    ],
    duration: 300,
    easing: 'ease-in-out'
  },
  slideInLeft: {
    keyframes: [
      { offset: 0, transform: 'translateX(-100%)', opacity: 0 },
      { offset: 1, transform: 'translateX(0)', opacity: 1 }
    ],
    duration: 400,
    easing: 'ease-out'
  },
  slideInRight: {
    keyframes: [
      { offset: 0, transform: 'translateX(100%)', opacity: 0 },
      { offset: 1, transform: 'translateX(0)', opacity: 1 }
    ],
    duration: 400,
    easing: 'ease-out'
  },
  slideInUp: {
    keyframes: [
      { offset: 0, transform: 'translateY(100%)', opacity: 0 },
      { offset: 1, transform: 'translateY(0)', opacity: 1 }
    ],
    duration: 400,
    easing: 'ease-out'
  },
  slideInDown: {
    keyframes: [
      { offset: 0, transform: 'translateY(-100%)', opacity: 0 },
      { offset: 1, transform: 'translateY(0)', opacity: 1 }
    ],
    duration: 400,
    easing: 'ease-out'
  },
  zoomIn: {
    keyframes: [
      { offset: 0, transform: 'scale(0.8)', opacity: 0 },
      { offset: 1, transform: 'scale(1)', opacity: 1 }
    ],
    duration: 300,
    easing: 'ease-in-out'
  },
  zoomOut: {
    keyframes: [
      { offset: 0, transform: 'scale(1)', opacity: 1 },
      { offset: 1, transform: 'scale(0.8)', opacity: 0 }
    ],
    duration: 300,
    easing: 'ease-in-out'
  },
  pulse: {
    keyframes: [
      { offset: 0, opacity: 1 },
      { offset: 0.5, opacity: 0.7 },
      { offset: 1, opacity: 1 }
    ],
    duration: 1000,
    easing: 'ease-in-out',
    iterations: 'infinite'
  },
  shake: {
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
  },
  bounce: {
    keyframes: [
      { offset: 0, transform: 'translateY(0)' },
      { offset: 0.5, transform: 'translateY(-20px)' },
      { offset: 1, transform: 'translateY(0)' }
    ],
    duration: 600,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    iterations: 'infinite'
  },
  rotate: {
    keyframes: [
      { offset: 0, transform: 'rotate(0deg)' },
      { offset: 1, transform: 'rotate(360deg)' }
    ],
    duration: 800,
    easing: 'linear',
    iterations: 'infinite'
  }
};
