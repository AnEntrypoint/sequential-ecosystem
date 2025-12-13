/**
 * conditional-builders.js
 *
 * Build conditional and switch state definitions
 */

export function createConditionalState(name, condition, truePath, falsePath, options = {}) {
  return {
    name,
    type: 'conditional',
    condition,
    onTrue: truePath,
    onFalse: falsePath,
    metadata: {
      createdAt: new Date().toISOString(),
      ...options
    }
  };
}

export function createSwitchState(name, selector, cases, defaultPath) {
  return {
    name,
    type: 'switch',
    selector,
    cases,
    default: defaultPath,
    metadata: {
      createdAt: new Date().toISOString()
    }
  };
}
