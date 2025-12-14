export function validateRequest(req, schema) {
  if (!schema) return { valid: true };

  const errors = [];
  const body = req.body || {};

  for (const [field, rules] of Object.entries(schema)) {
    if (rules.required && (body[field] === undefined || body[field] === null)) {
      errors.push(`${field} is required`);
    }
    if (body[field] !== undefined && rules.type) {
      if (typeof body[field] !== rules.type) {
        errors.push(`${field} must be of type ${rules.type}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export default { validateRequest };
