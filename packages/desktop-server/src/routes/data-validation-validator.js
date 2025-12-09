export class DataValidationValidator {
  constructor() {
    this.testResults = [];
  }

  async validateBasicTypeChecking() {
    const typeOf = (value) => {
      if (value === null) return 'null';
      if (Array.isArray(value)) return 'array';
      return typeof value;
    };

    const validate = (value, expectedType) => {
      return typeOf(value) === expectedType;
    };

    const tests = [
      { val: 42, type: 'number', expected: true },
      { val: 'hello', type: 'string', expected: true },
      { val: true, type: 'boolean', expected: true },
      { val: [], type: 'array', expected: true },
      { val: {}, type: 'object', expected: true },
      { val: null, type: 'null', expected: true },
      { val: 42, type: 'string', expected: false }
    ];

    const passed = tests.every(t => validate(t.val, t.type) === t.expected);

    return {
      name: 'Basic Type Checking',
      passed,
      details: { testCases: tests.length, typesValidated: 6 }
    };
  }

  async validateStringConstraints() {
    const validateString = (value, rules) => {
      if (typeof value !== 'string') return false;
      if (rules.minLength && value.length < rules.minLength) return false;
      if (rules.maxLength && value.length > rules.maxLength) return false;
      if (rules.pattern && !rules.pattern.test(value)) return false;
      if (rules.enum && !rules.enum.includes(value)) return false;
      return true;
    };

    const tests = [
      { val: 'hello', rules: { minLength: 3, maxLength: 10 }, expected: true },
      { val: 'hi', rules: { minLength: 3 }, expected: false },
      { val: 'hello@world.com', rules: { pattern: /^[^@]+@[^@]+\.[^@]+$/ }, expected: true },
      { val: 'invalid-email', rules: { pattern: /^[^@]+@[^@]+\.[^@]+$/ }, expected: false },
      { val: 'red', rules: { enum: ['red', 'green', 'blue'] }, expected: true },
      { val: 'yellow', rules: { enum: ['red', 'green', 'blue'] }, expected: false }
    ];

    const passed = tests.every(t => validateString(t.val, t.rules) === t.expected);

    return {
      name: 'String Constraints',
      passed,
      details: { constraints: 4, testCases: tests.length }
    };
  }

  async validateNumberConstraints() {
    const validateNumber = (value, rules) => {
      if (typeof value !== 'number' || isNaN(value)) return false;
      if (rules.min !== undefined && value < rules.min) return false;
      if (rules.max !== undefined && value > rules.max) return false;
      if (rules.multipleOf && value % rules.multipleOf !== 0) return false;
      if (rules.integer && !Number.isInteger(value)) return false;
      return true;
    };

    const tests = [
      { val: 42, rules: { min: 0, max: 100 }, expected: true },
      { val: -5, rules: { min: 0 }, expected: false },
      { val: 150, rules: { max: 100 }, expected: false },
      { val: 10, rules: { multipleOf: 5 }, expected: true },
      { val: 12, rules: { multipleOf: 5 }, expected: false },
      { val: 42, rules: { integer: true }, expected: true },
      { val: 42.5, rules: { integer: true }, expected: false }
    ];

    const passed = tests.every(t => validateNumber(t.val, t.rules) === t.expected);

    return {
      name: 'Number Constraints',
      passed,
      details: { constraints: 5, testCases: tests.length }
    };
  }

  async validateArrayConstraints() {
    const validateArray = (value, rules) => {
      if (!Array.isArray(value)) return false;
      if (rules.minItems && value.length < rules.minItems) return false;
      if (rules.maxItems && value.length > rules.maxItems) return false;
      if (rules.items && !value.every(item => typeof item === rules.items)) return false;
      if (rules.unique && new Set(value).size !== value.length) return false;
      return true;
    };

    const tests = [
      { val: [1, 2, 3], rules: { minItems: 1 }, expected: true },
      { val: [], rules: { minItems: 1 }, expected: false },
      { val: [1, 2, 3, 4, 5], rules: { maxItems: 3 }, expected: false },
      { val: [1, 2, 3], rules: { items: 'number' }, expected: true },
      { val: [1, 'two', 3], rules: { items: 'number' }, expected: false },
      { val: [1, 2, 3], rules: { unique: true }, expected: true },
      { val: [1, 2, 2], rules: { unique: true }, expected: false }
    ];

    const passed = tests.every(t => validateArray(t.val, t.rules) === t.expected);

    return {
      name: 'Array Constraints',
      passed,
      details: { constraints: 5, testCases: tests.length }
    };
  }

  async validateObjectSchema() {
    const validateObject = (obj, schema) => {
      const errors = [];

      for (const [key, rules] of Object.entries(schema)) {
        if (rules.required && !(key in obj)) {
          errors.push(`${key} is required`);
        }
        if (key in obj && rules.type && typeof obj[key] !== rules.type) {
          errors.push(`${key} must be ${rules.type}`);
        }
      }

      return errors.length === 0;
    };

    const schema = {
      name: { required: true, type: 'string' },
      age: { required: true, type: 'number' },
      email: { type: 'string' }
    };

    const tests = [
      { obj: { name: 'John', age: 30 }, expected: true },
      { obj: { name: 'Jane', age: 25, email: 'jane@example.com' }, expected: true },
      { obj: { name: 'Bob' }, expected: false },
      { obj: { age: 35 }, expected: false },
      { obj: { name: 'Alice', age: 'thirty' }, expected: false }
    ];

    const passed = tests.every(t => validateObject(t.obj, schema) === t.expected);

    return {
      name: 'Object Schema',
      passed,
      details: { schemaFields: 3, testCases: tests.length }
    };
  }

  async validateTypeCoercion() {
    const coerce = (value, targetType) => {
      switch (targetType) {
        case 'string':
          return String(value);
        case 'number':
          const num = Number(value);
          return isNaN(num) ? null : num;
        case 'boolean':
          if (typeof value === 'boolean') return value;
          if (value === 'true' || value === 1) return true;
          if (value === 'false' || value === 0) return false;
          return null;
        case 'array':
          return Array.isArray(value) ? value : [value];
        default:
          return value;
      }
    };

    const tests = [
      { val: 42, type: 'string', expected: '42' },
      { val: '100', type: 'number', expected: 100 },
      { val: 'true', type: 'boolean', expected: true },
      { val: 1, type: 'boolean', expected: true },
      { val: 'false', type: 'boolean', expected: false },
      { val: 5, type: 'array', expected: [5] },
      { val: [1, 2], type: 'array', expected: [1, 2] }
    ];

    const passed = tests.every(t => {
      const result = coerce(t.val, t.type);
      if (Array.isArray(t.expected)) {
        return Array.isArray(result) && JSON.stringify(result) === JSON.stringify(t.expected);
      }
      return result === t.expected;
    });

    return {
      name: 'Type Coercion',
      passed,
      details: { coercions: 5, testCases: tests.length }
    };
  }

  async validateNestedValidation() {
    const validateNested = (obj, schema) => {
      for (const [key, rules] of Object.entries(schema)) {
        if (!(key in obj)) continue;
        if (rules.type === 'object' && rules.schema) {
          const result = validateNested(obj[key], rules.schema);
          if (!result) return false;
        } else if (rules.type && typeof obj[key] !== rules.type) {
          return false;
        }
      }
      return true;
    };

    const schema = {
      user: {
        type: 'object',
        schema: {
          name: { type: 'string' },
          email: { type: 'string' }
        }
      },
      settings: {
        type: 'object',
        schema: {
          theme: { type: 'string' },
          notifications: { type: 'boolean' }
        }
      }
    };

    const valid = {
      user: { name: 'John', email: 'john@example.com' },
      settings: { theme: 'dark', notifications: true }
    };

    const invalid = {
      user: { name: 'Jane', email: 123 },
      settings: { theme: 'light', notifications: true }
    };

    return {
      name: 'Nested Validation',
      passed: validateNested(valid, schema) === true && validateNested(invalid, schema) === false,
      details: { nestedLevels: 2, fieldsPerLevel: 2 }
    };
  }

  async validateConditionalValidation() {
    const validateConditional = (obj, schema) => {
      for (const [key, rules] of Object.entries(schema)) {
        if (rules.if && rules.then) {
          const conditionMet = rules.if(obj);
          if (conditionMet && rules.then.required && !(rules.then.key in obj)) {
            return false;
          }
        }

        if (!(key in obj)) continue;

        if (rules.type && typeof obj[key] !== rules.type) {
          return false;
        }
      }
      return true;
    };

    const schema = {
      userType: { type: 'string' },
      organizationId: {
        if: (obj) => obj.userType === 'organization',
        then: { required: true, key: 'organizationId' },
        type: 'string'
      }
    };

    const individualUser = { userType: 'individual' };
    const orgUserWithId = { userType: 'organization', organizationId: 'org-123' };
    const orgUserNoId = { userType: 'organization' };

    return {
      name: 'Conditional Validation',
      passed: validateConditional(individualUser, schema) === true &&
              validateConditional(orgUserWithId, schema) === true &&
              validateConditional(orgUserNoId, schema) === false,
      details: { conditions: 1, conditionalFields: 1 }
    };
  }

  async validateCustomValidators() {
    const validators = {
      email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      url: (value) => /^https?:\/\/.+/.test(value),
      ipv4: (value) => {
        const parts = value.split('.');
        if (parts.length !== 4) return false;
        return parts.every(p => /^\d+$/.test(p) && parseInt(p) >= 0 && parseInt(p) <= 255);
      },
      phone: (value) => /^\d{10,15}$/.test(value)
    };

    const validate = (value, validator) => {
      return validators[validator]?.(value) || false;
    };

    const tests = [
      { val: 'test@example.com', validator: 'email', expected: true },
      { val: 'invalid-email', validator: 'email', expected: false },
      { val: 'https://example.com', validator: 'url', expected: true },
      { val: 'ftp://example.com', validator: 'url', expected: false },
      { val: '192.168.1.1', validator: 'ipv4', expected: true },
      { val: '256.1.1.1', validator: 'ipv4', expected: false },
      { val: '1234567890', validator: 'phone', expected: true },
      { val: '123', validator: 'phone', expected: false }
    ];

    const passed = tests.every(t => validate(t.val, t.validator) === t.expected);

    return {
      name: 'Custom Validators',
      passed,
      details: { validators: Object.keys(validators).length, testCases: tests.length }
    };
  }

  async validateCrossFieldValidation() {
    const validateCrossField = (obj, rules) => {
      const errors = [];

      if (rules.passwordMatch && obj.password !== obj.confirmPassword) {
        errors.push('Passwords do not match');
      }

      if (rules.dateRange && obj.startDate && obj.endDate) {
        if (new Date(obj.startDate) > new Date(obj.endDate)) {
          errors.push('Start date must be before end date');
        }
      }

      if (rules.sumLimit && obj.amount1 && obj.amount2) {
        if (obj.amount1 + obj.amount2 > rules.sumLimit) {
          errors.push('Sum exceeds limit');
        }
      }

      return errors.length === 0;
    };

    const tests = [
      { obj: { password: 'p123', confirmPassword: 'p123' }, rules: { passwordMatch: true }, expected: true },
      { obj: { password: 'p123', confirmPassword: 'p456' }, rules: { passwordMatch: true }, expected: false },
      { obj: { startDate: '2025-01-01', endDate: '2025-12-31' }, rules: { dateRange: true }, expected: true },
      { obj: { startDate: '2025-12-31', endDate: '2025-01-01' }, rules: { dateRange: true }, expected: false },
      { obj: { amount1: 50, amount2: 40 }, rules: { sumLimit: 100 }, expected: true },
      { obj: { amount1: 60, amount2: 50 }, rules: { sumLimit: 100 }, expected: false }
    ];

    const passed = tests.every(t => validateCrossField(t.obj, t.rules) === t.expected);

    return {
      name: 'Cross-Field Validation',
      passed,
      details: { validationRules: 3, testCases: tests.length }
    };
  }

  async validateDefaultValues() {
    const applyDefaults = (obj, schema) => {
      const result = { ...obj };

      for (const [key, rules] of Object.entries(schema)) {
        if (!(key in result) && rules.default !== undefined) {
          result[key] = typeof rules.default === 'function' ? rules.default() : rules.default;
        }
      }

      return result;
    };

    const schema = {
      name: { type: 'string' },
      status: { default: 'active' },
      createdAt: { default: () => new Date().toISOString() },
      tags: { default: () => [] }
    };

    const input = { name: 'John' };
    const result = applyDefaults(input, schema);

    return {
      name: 'Default Values',
      passed: result.name === 'John' && result.status === 'active' &&
              result.createdAt !== undefined && Array.isArray(result.tags),
      details: { schemaFields: Object.keys(schema).length, appliedDefaults: 3 }
    };
  }

  async validateTransformation() {
    const transform = (obj, rules) => {
      const result = {};

      for (const [key, rule] of Object.entries(rules)) {
        if (key in obj) {
          result[key] = rule.transform ? rule.transform(obj[key]) : obj[key];
        }
      }

      return result;
    };

    const rules = {
      email: { transform: (v) => v.toLowerCase().trim() },
      name: { transform: (v) => v.trim() },
      age: { transform: (v) => Math.floor(v) },
      tags: { transform: (v) => Array.isArray(v) ? v.map(t => t.toLowerCase()) : [] }
    };

    const input = {
      email: '  JOHN@EXAMPLE.COM  ',
      name: '  John Doe  ',
      age: 30.7,
      tags: ['Python', 'JAVASCRIPT', 'TypeScript']
    };

    const result = transform(input, rules);

    return {
      name: 'Transformation',
      passed: result.email === 'john@example.com' && result.name === 'John Doe' &&
              result.age === 30 && result.tags[0] === 'python',
      details: { transformers: Object.keys(rules).length, fieldsTransformed: 4 }
    };
  }

  async validateBatchValidation() {
    const validateBatch = (items, schema) => {
      const results = { valid: [], invalid: [] };

      for (const item of items) {
        const errors = [];

        for (const [key, rules] of Object.entries(schema)) {
          if (rules.required && !(key in item)) {
            errors.push(`${key} is required`);
          }
          if (key in item && rules.type && typeof item[key] !== rules.type) {
            errors.push(`${key} must be ${rules.type}`);
          }
        }

        if (errors.length === 0) {
          results.valid.push(item);
        } else {
          results.invalid.push({ item, errors });
        }
      }

      return results;
    };

    const schema = {
      id: { required: true, type: 'number' },
      name: { required: true, type: 'string' }
    };

    const batch = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3 },
      { name: 'Item 4' },
      { id: 5, name: 'Item 5' }
    ];

    const results = validateBatch(batch, schema);

    return {
      name: 'Batch Validation',
      passed: results.valid.length === 3 && results.invalid.length === 2,
      details: { total: batch.length, valid: results.valid.length, invalid: results.invalid.length }
    };
  }

  async validatePolymorphicValidation() {
    const validatePolymorphic = (obj, schemas) => {
      for (const schema of schemas) {
        const errors = [];

        for (const [key, rules] of Object.entries(schema)) {
          if (rules.required && !(key in obj)) {
            errors.push(`${key} is required`);
          }
          if (key in obj && rules.type && typeof obj[key] !== rules.type) {
            errors.push(`${key} must be ${rules.type}`);
          }
        }

        if (errors.length === 0) return true;
      }

      return false;
    };

    const userSchema = { id: { required: true, type: 'number' }, name: { required: true, type: 'string' } };
    const orgSchema = { id: { required: true, type: 'number' }, orgName: { required: true, type: 'string' } };

    const user = { id: 1, name: 'John' };
    const org = { id: 100, orgName: 'Acme' };
    const invalid = { name: 'Test' };

    return {
      name: 'Polymorphic Validation',
      passed: validatePolymorphic(user, [userSchema, orgSchema]) === true &&
              validatePolymorphic(org, [userSchema, orgSchema]) === true &&
              validatePolymorphic(invalid, [userSchema, orgSchema]) === false,
      details: { schemas: 2, polymorphicTypes: 2 }
    };
  }

  async validateAsyncValidation() {
    const validateAsync = async (value, asyncValidator) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(asyncValidator(value));
        }, 10);
      });
    };

    const isUniqueEmail = async (email) => {
      const takenEmails = new Set(['existing@example.com', 'taken@example.com']);
      return !takenEmails.has(email);
    };

    const test1 = await validateAsync('new@example.com', isUniqueEmail);
    const test2 = await validateAsync('existing@example.com', isUniqueEmail);

    return {
      name: 'Async Validation',
      passed: test1 === true && test2 === false,
      details: { asyncValidators: 1, testCases: 2 }
    };
  }

  async validateErrorMessages() {
    const validator = {
      validate: (obj, schema) => {
        const errors = [];

        for (const [key, rules] of Object.entries(schema)) {
          if (rules.required && !(key in obj)) {
            errors.push({
              field: key,
              message: rules.requiredMessage || `${key} is required`,
              code: 'REQUIRED'
            });
          }
          if (key in obj && rules.type && typeof obj[key] !== rules.type) {
            errors.push({
              field: key,
              message: rules.typeMessage || `${key} must be ${rules.type}`,
              code: 'TYPE_MISMATCH'
            });
          }
          if (key in obj && rules.minLength && obj[key]?.length < rules.minLength) {
            errors.push({
              field: key,
              message: rules.minLengthMessage || `${key} must be at least ${rules.minLength} characters`,
              code: 'MIN_LENGTH'
            });
          }
        }

        return errors;
      }
    };

    const schema = {
      name: {
        required: true,
        requiredMessage: 'Name is required',
        type: 'string',
        typeMessage: 'Name must be text',
        minLength: 3,
        minLengthMessage: 'Name must be at least 3 characters'
      }
    };

    const errors1 = validator.validate({}, schema);
    const errors2 = validator.validate({ name: 'Jo' }, schema);

    return {
      name: 'Error Messages',
      passed: errors1.length === 1 && errors1[0].code === 'REQUIRED' &&
              errors2.length === 1 && errors2[0].code === 'MIN_LENGTH',
      details: { errorCodes: 3, customMessages: true }
    };
  }

  async runAllTests() {
    this.testResults = await Promise.all([
      this.validateBasicTypeChecking(),
      this.validateStringConstraints(),
      this.validateNumberConstraints(),
      this.validateArrayConstraints(),
      this.validateObjectSchema(),
      this.validateTypeCoercion(),
      this.validateNestedValidation(),
      this.validateConditionalValidation(),
      this.validateCustomValidators(),
      this.validateCrossFieldValidation(),
      this.validateDefaultValues(),
      this.validateTransformation(),
      this.validateBatchValidation(),
      this.validatePolymorphicValidation(),
      this.validateAsyncValidation(),
      this.validateErrorMessages()
    ]);

    return this.testResults;
  }

  getSummary() {
    const passed = this.testResults.filter(t => t.passed).length;
    const total = this.testResults.length;
    return {
      total,
      passed,
      failed: total - passed,
      percentage: Math.round((passed / total) * 100),
      tests: this.testResults
    };
  }
}

export function createDataValidationValidator() {
  return new DataValidationValidator();
}
