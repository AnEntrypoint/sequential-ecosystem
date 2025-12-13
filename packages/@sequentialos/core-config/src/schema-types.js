/**
 * schema-types.js
 *
 * Environment variable type definitions
 */

export const EnvType = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  URL: 'url',
  PORT: 'port',
  ENUM: 'enum',
  OPTIONAL: 'optional'
};

export class ValidationError extends Error {
  constructor(messages) {
    super(messages.join('\n'));
    this.name = 'ValidationError';
    this.messages = messages;
  }
}
