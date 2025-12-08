export function createStateGuards() {
  const guards = new Map();
  const schemas = new Map();

  return {
    registerTransitionGuard(stateKey, fromState, toState, guardFn) {
      const key = `${stateKey}:${fromState}->${toState}`;
      guards.set(key, guardFn);
      return this;
    },

    registerSchema(stateKey, schema) {
      schemas.set(stateKey, schema);
      return this;
    },

    async validateTransition(stateKey, currentState, nextState, context = {}) {
      const key = `${stateKey}:${currentState}->${nextState}`;
      const guard = guards.get(key);

      if (guard) {
        const result = await guard(context);
        if (!result.allowed) {
          return {
            valid: false,
            reason: result.reason || `Transition from ${currentState} to ${nextState} not allowed`,
            code: result.code || 'transition_blocked'
          };
        }
      }

      return { valid: true };
    },

    validateStateShape(stateKey, data) {
      const schema = schemas.get(stateKey);
      if (!schema) return { valid: true };

      const errors = [];

      for (const [field, constraint] of Object.entries(schema.required || {})) {
        if (!data[field]) {
          errors.push({ field, message: `Required field missing: ${field}` });
        }
      }

      for (const [field, type] of Object.entries(schema.types || {})) {
        if (data[field] !== undefined && typeof data[field] !== type) {
          errors.push({
            field,
            message: `Type mismatch: ${field} is ${typeof data[field]}, expected ${type}`
          });
        }
      }

      return {
        valid: errors.length === 0,
        errors
      };
    },

    detectConflict(stateKey, currentVersion, incomingData, latestVersion) {
      if (currentVersion === latestVersion) {
        return { conflict: false };
      }

      const conflicts = [];
      for (const [field, value] of Object.entries(incomingData)) {
        if (currentVersion[field] !== latestVersion[field]) {
          conflicts.push({
            field,
            currentValue: currentVersion[field],
            incomingValue: value,
            latestValue: latestVersion[field]
          });
        }
      }

      return {
        conflict: conflicts.length > 0,
        conflicts,
        resolution: 'last_write_wins' // or 'first_write_wins', 'merge'
      };
    },

    async applyWithGuards(stateKey, fromState, toState, newData, context = {}) {
      const shapeValidation = this.validateStateShape(stateKey, newData);
      if (!shapeValidation.valid) {
        return {
          applied: false,
          reason: 'Schema validation failed',
          errors: shapeValidation.errors
        };
      }

      const transitionValidation = await this.validateTransition(stateKey, fromState, toState, context);
      if (!transitionValidation.valid) {
        return {
          applied: false,
          reason: transitionValidation.reason,
          code: transitionValidation.code
        };
      }

      return { applied: true, data: newData };
    }
  };
}
