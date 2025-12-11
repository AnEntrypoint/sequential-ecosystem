/**
 * composition-validator.js
 *
 * Validate task compositions for structure and correctness
 */

export function validateComposition(composition) {
  const issues = [];

  if (!composition.name || typeof composition.name !== 'string') {
    issues.push('Composition must have a name (string)');
  }

  if (!composition.subtasks || composition.subtasks.length === 0) {
    issues.push('Composition must have at least one subtask');
  }

  if (composition.subtasks) {
    const seen = new Set();
    composition.subtasks.forEach((task, idx) => {
      if (typeof task !== 'string' && typeof task !== 'function') {
        issues.push(`Subtask ${idx} must be a string name or function`);
      }

      const taskName = typeof task === 'string' ? task : task.name;
      if (seen.has(taskName)) {
        issues.push(`Duplicate subtask: ${taskName}`);
      }
      seen.add(taskName);
    });
  }

  return {
    valid: issues.length === 0,
    issues
  };
}
