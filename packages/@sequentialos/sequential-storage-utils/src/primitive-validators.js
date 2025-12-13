/**
 * primitive-validators.js - Primitive type validators
 *
 * Validators for basic types: UUID, email, timestamp, ID
 */

export class PrimitiveValidators {
  static isValidUuid(str) {
    if (typeof str !== 'string') {
      return false;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  static isValidEmail(str) {
    if (typeof str !== 'string') {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(str);
  }

  static isValidTimestamp(str) {
    if (typeof str !== 'string') {
      return false;
    }
    try {
      new Date(str);
      return !isNaN(new Date(str).getTime());
    } catch (e) {
      return false;
    }
  }

  static isValidId(id) {
    if (typeof id === 'number') {
      return id > 0;
    }
    if (typeof id === 'string') {
      return this.isValidUuid(id);
    }
    return false;
  }
}
