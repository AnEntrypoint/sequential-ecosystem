export function formatAjvErrors(errors) {
  if (!errors || !Array.isArray(errors)) return [];

  return errors.map(e => {
    const path = e.instancePath || '/';
    const keyword = e.keyword;
    const params = e.params || {};

    let message = `${path}: `;

    switch (keyword) {
      case 'pattern':
        message += 'contains invalid characters';
        break;
      case 'maxLength':
        message += `exceeds maximum length of ${params.limit}`;
        break;
      case 'minLength':
        message += `must be at least ${params.limit} characters`;
        break;
      case 'type':
        message += `must be a ${params.type}`;
        break;
      case 'format':
        message += `invalid ${params.format} format`;
        break;
      case 'enum':
        message += `must be one of: ${params.allowedValues.join(', ')}`;
        break;
      case 'required':
        message += `is missing required property '${params.missingProperty}'`;
        break;
      case 'minimum':
        message += `must be >= ${params.limit}`;
        break;
      case 'maximum':
        message += `must be <= ${params.limit}`;
        break;
      default:
        message += e.message || 'validation failed';
    }

    return message;
  });
}

export function formatFieldValidationError(field, issue, expected, received) {
  const lines = [];
  lines.push(`Field '${field}': ${issue}`);
  if (expected !== undefined) {
    lines.push(`  Expected: ${JSON.stringify(expected)}`);
  }
  if (received !== undefined) {
    lines.push(`  Received: ${JSON.stringify(received)}`);
  }
  return lines.join('\n');
}

export function formatValidationErrors(errors) {
  if (!Array.isArray(errors)) {
    return String(errors);
  }
  return errors.map(e => {
    if (typeof e === 'string') return e;
    if (e.field && e.issue) {
      return formatFieldValidationError(e.field, e.issue, e.expected, e.received);
    }
    return String(e);
  }).join('\n');
}
