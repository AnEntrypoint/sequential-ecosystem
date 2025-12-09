export class SerializedError {
  constructor(error) {
    this.message = error?.message || 'Unknown error';
    this.name = error?.name || 'Error';
    this.stack = error?.stack || '';
    this.code = error?.code || null;
    this.statusCode = error?.statusCode || 500;
  }

  toJSON() {
    return {
      message: this.message,
      name: this.name,
      code: this.code,
      statusCode: this.statusCode
    };
  }

  toString() {
    return `${this.name}: ${this.message}`;
  }

  getStack(limit = 5) {
    return this.stack
      .split('\n')
      .slice(0, limit)
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }
}

export function serializeError(error) {
  if (error instanceof SerializedError) {
    return error;
  }
  return new SerializedError(normalizeError(error));
}

export function normalizeError(input) {
  if (!input) {
    return new Error('Unknown error');
  }

  if (typeof input === 'string') {
    return new Error(input);
  }

  if (input instanceof Error) {
    return input;
  }

  if (typeof input === 'object' && input.message) {
    const error = new Error(input.message);
    Object.assign(error, input);
    return error;
  }

  return new Error(String(input));
}

export function getStackTrace(error, limit = 5) {
  if (!error || !error.stack) return [];

  return error.stack
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(0, limit);
}
