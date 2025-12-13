/**
 * conditional-executors.js
 *
 * Execute conditional and switch selectors
 */

export function executeConditional(condition, context) {
  if (typeof condition === 'function') {
    return condition(context);
  }
  if (typeof condition === 'string') {
    try {
      const fn = new Function('context', `return ${condition}`);
      return fn(context);
    } catch (error) {
      throw new Error(`Invalid condition: ${condition} - ${error.message}`);
    }
  }
  return !!condition;
}

export function executeSwitch(selector, context) {
  if (typeof selector === 'function') {
    return selector(context);
  }
  if (typeof selector === 'string') {
    try {
      const fn = new Function('context', `return ${selector}`);
      return fn(context);
    } catch (error) {
      throw new Error(`Invalid selector: ${selector} - ${error.message}`);
    }
  }
  return selector;
}
