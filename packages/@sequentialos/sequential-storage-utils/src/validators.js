/**
 * validators.js - Validators Facade
 *
 * Delegates to focused modules:
 * - primitive-validators: UUID, email, timestamp, ID validation
 * - schema-validators: Required fields and filter validation
 * - entity-validators: TaskRun, StackRun, TaskFunction, Keystore validation
 */

import { PrimitiveValidators } from './primitive-validators.js';
import { SchemaValidators } from './schema-validators.js';
import { EntityValidators } from './entity-validators.js';

export class Validators {
  static isValidUuid(str) {
    return PrimitiveValidators.isValidUuid(str);
  }

  static isValidEmail(str) {
    return PrimitiveValidators.isValidEmail(str);
  }

  static isValidTimestamp(str) {
    return PrimitiveValidators.isValidTimestamp(str);
  }

  static isValidId(id) {
    return PrimitiveValidators.isValidId(id);
  }

  static validateRequired(obj, fields) {
    return SchemaValidators.validateRequired(obj, fields);
  }

  static validateFilter(filter, allowedFields) {
    return SchemaValidators.validateFilter(filter, allowedFields);
  }

  static validateTaskRun(taskRun) {
    return EntityValidators.validateTaskRun(taskRun);
  }

  static validateStackRun(stackRun) {
    return EntityValidators.validateStackRun(stackRun);
  }

  static validateTaskFunction(taskFunction) {
    return EntityValidators.validateTaskFunction(taskFunction);
  }

  static validateKeystore(keystoreEntry) {
    return EntityValidators.validateKeystore(keystoreEntry);
  }
}
