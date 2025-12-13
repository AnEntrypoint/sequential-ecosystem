/**
 * Data Result Helpers
 * Utility functions for working with DataResult
 */

export function wrapResult(value, DataResult) {
  if (value instanceof DataResult) return value;
  return DataResult.ok(value);
}

export function wrapError(error, DataResult) {
  return DataResult.err(error);
}
