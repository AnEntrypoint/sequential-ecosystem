export function formatValidationError(toolName, validation) {
  if (validation.valid) {
    return null;
  }

  const lines = [];
  lines.push('Tool invocation validation failed for: ' + toolName);

  if (validation.errors.length > 0) {
    lines.push('Errors:');
    for (const err of validation.errors) {
      const msg = '  - ' + err.field + ': ' + err.issue;
      lines.push(msg);
      if (err.expected) {
        lines.push('    Expected: ' + JSON.stringify(err.expected));
      }
      if (err.received) {
        lines.push('    Received: ' + JSON.stringify(err.received));
      }
    }
  }

  if (validation.warnings.length > 0) {
    lines.push('Warnings:');
    for (const warn of validation.warnings) {
      lines.push('  - ' + warn.field + ': ' + warn.issue);
    }
  }

  return lines.join('\n');
}

export function suggestFix(error) {
  if (!error || !error.field) {
    return null;
  }

  const suggestions = [];

  if (error.issue === 'missing required parameter') {
    suggestions.push('Add required parameter: ' + error.field);
    suggestions.push('Expected type: ' + error.expected);
  }

  if (error.issue === 'type mismatch') {
    suggestions.push('Change ' + error.field + ' type from ' + error.received + ' to ' + error.expected);
  }

  if (error.issue === 'invalid enum value') {
    const validValues = Array.isArray(error.expected) ? error.expected.join(', ') : error.expected;
    suggestions.push('Change ' + error.field + ' to one of: ' + validValues);
  }

  if (error.issue === 'string too short') {
    suggestions.push('Increase ' + error.field + ' length (minimum: ' + error.expected + ')');
  }

  if (error.issue === 'string too long') {
    suggestions.push('Decrease ' + error.field + ' length (maximum: ' + error.expected + ')');
  }

  if (error.issue === 'value too small') {
    suggestions.push('Increase ' + error.field + ' value (minimum: ' + error.expected + ')');
  }

  if (error.issue === 'value too large') {
    suggestions.push('Decrease ' + error.field + ' value (maximum: ' + error.expected + ')');
  }

  return suggestions.length > 0 ? suggestions : null;
}
