export function validateBody(schema) {
  return (req, res, next) => {
    for (const [field, validators] of Object.entries(schema)) {
      const value = req.body?.[field];
      for (const validator of Array.isArray(validators) ? validators : [validators]) {
        const error = typeof validator === 'function' ? validator(value, field) : null;
        if (error) return next(error);
      }
    }
    next();
  };
}

export function validateParams(schema) {
  return (req, res, next) => {
    for (const [field, validators] of Object.entries(schema)) {
      const value = req.params?.[field];
      for (const validator of Array.isArray(validators) ? validators : [validators]) {
        const error = typeof validator === 'function' ? validator(value, field) : null;
        if (error) return next(error);
      }
    }
    next();
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    for (const [field, validators] of Object.entries(schema)) {
      const value = req.query?.[field];
      for (const validator of Array.isArray(validators) ? validators : [validators]) {
        const error = typeof validator === 'function' ? validator(value, field) : null;
        if (error) return next(error);
      }
    }
    next();
  };
}

export function compose(...validators) {
  return (req, res, next) => {
    let index = 0;
    const callNext = () => {
      if (index < validators.length) {
        validators[index++](req, res, callNext);
      } else {
        next();
      }
    };
    callNext();
  };
}
