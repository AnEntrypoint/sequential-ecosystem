import { createValidationError } from '@sequentialos/error-handling';

const required = (value, field) => !value ? createValidationError(field, `${field} is required`) : null;
const string = (value, field) => typeof value !== 'string' ? createValidationError(field, `${field} must be a string`) : null;
const array = (value, field) => !Array.isArray(value) ? createValidationError(field, `${field} must be an array`) : null;
const object = (value, field) => typeof value !== 'object' || value === null ? createValidationError(field, `${field} must be an object`) : null;
const number = (value, field) => typeof value !== 'number' ? createValidationError(field, `${field} must be a number`) : null;
const boolean = (value, field) => typeof value !== 'boolean' ? createValidationError(field, `${field} must be a boolean`) : null;
const custom = (fn, field) => (value) => fn(value) ? null : createValidationError(field, `${field} validation failed`);
const minLength = (len, field) => (value) => value?.length < len ? createValidationError(field, `${field} must be at least ${len} characters`) : null;
const maxLength = (len, field) => (value) => value?.length > len ? createValidationError(field, `${field} must be at most ${len} characters`) : null;
const match = (regex, field) => (value) => !regex.test(value) ? createValidationError(field, `${field} format invalid`) : null;
const enum_ = (values, field) => (value) => !values.includes(value) ? createValidationError(field, `${field} must be one of: ${values.join(', ')}`) : null;

export function createFieldValidator(sourceExtractor) {
  return (schema) => {
    return (req, res, next) => {
      for (const [field, validators] of Object.entries(schema)) {
        const value = sourceExtractor(req)?.[field];
        for (const validator of Array.isArray(validators) ? validators : [validators]) {
          const error = typeof validator === 'function' ? validator(value, field) : null;
          if (error) return next(error);
        }
      }
      next();
    };
  };
}

export { required, string, array, object, number, boolean, custom, minLength, maxLength, match, enum_ };
