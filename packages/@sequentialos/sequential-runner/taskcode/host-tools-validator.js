function validateParams(params, required) {
  const missing = required.filter(key => !(key in params));
  if (missing.length > 0) {
    throw new Error(`Missing required parameters: ${missing.join(', ')}`);
  }
}

module.exports = { validateParams };
