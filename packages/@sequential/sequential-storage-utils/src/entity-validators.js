/**
 * entity-validators.js - Entity-specific validation
 *
 * Validators for domain entities: TaskRun, StackRun, TaskFunction, Keystore
 */

export class EntityValidators {
  static validateTaskRun(taskRun) {
    const errors = [];

    if (!taskRun || typeof taskRun !== 'object') {
      return { valid: false, errors: ['TaskRun must be an object'] };
    }

    if (!('id' in taskRun) || !taskRun.id) {
      errors.push('TaskRun.id is required');
    }

    if (!('taskName' in taskRun) && !('task_identifier' in taskRun)) {
      errors.push('TaskRun must have taskName or task_identifier');
    }

    if ('status' in taskRun && taskRun.status) {
      const validStatuses = ['pending', 'running', 'completed', 'failed', 'suspended'];
      if (!validStatuses.includes(taskRun.status)) {
        errors.push(`TaskRun.status must be one of: ${validStatuses.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateStackRun(stackRun) {
    const errors = [];

    if (!stackRun || typeof stackRun !== 'object') {
      return { valid: false, errors: ['StackRun must be an object'] };
    }

    if (!('id' in stackRun) || !stackRun.id) {
      errors.push('StackRun.id is required');
    }

    if (!('task_run_id' in stackRun) || !stackRun.task_run_id) {
      errors.push('StackRun.task_run_id is required');
    }

    if ('status' in stackRun && stackRun.status) {
      const validStatuses = ['pending', 'running', 'completed', 'failed', 'suspended'];
      if (!validStatuses.includes(stackRun.status)) {
        errors.push(`StackRun.status must be one of: ${validStatuses.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateTaskFunction(taskFunction) {
    const errors = [];

    if (!taskFunction || typeof taskFunction !== 'object') {
      return { valid: false, errors: ['TaskFunction must be an object'] };
    }

    if (!('id' in taskFunction) || !taskFunction.id) {
      errors.push('TaskFunction.id is required');
    }

    if (!('name' in taskFunction) || !taskFunction.name) {
      errors.push('TaskFunction.name is required');
    }

    if (!('code' in taskFunction) || !taskFunction.code) {
      errors.push('TaskFunction.code is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateKeystore(keystoreEntry) {
    const errors = [];

    if (!keystoreEntry || typeof keystoreEntry !== 'object') {
      return { valid: false, errors: ['Keystore entry must be an object'] };
    }

    if (!('key' in keystoreEntry) || !keystoreEntry.key) {
      errors.push('Keystore.key is required');
    }

    if (!('value' in keystoreEntry) && keystoreEntry.value === null) {
      errors.push('Keystore.value is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
