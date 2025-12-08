export class DataResult {
  constructor(value, error = null) {
    this.value = value;
    this.error = error;
    this.isError = error !== null;
  }

  static ok(value) {
    return new DataResult(value);
  }

  static err(error) {
    return new DataResult(null, error);
  }

  isOk() {
    return !this.isError;
  }

  map(fn) {
    if (this.isError) return this;
    try {
      return DataResult.ok(fn(this.value));
    } catch (error) {
      return DataResult.err(error);
    }
  }

  flatMap(fn) {
    if (this.isError) return this;
    try {
      const result = fn(this.value);
      return result instanceof DataResult ? result : DataResult.ok(result);
    } catch (error) {
      return DataResult.err(error);
    }
  }

  filter(predicate, errorMsg = 'Filter condition not met') {
    if (this.isError) return this;
    if (predicate(this.value)) return this;
    return DataResult.err(new Error(errorMsg));
  }

  extract(path) {
    if (this.isError) return this;
    return this.map(value => extractPath(value, path));
  }

  extractMultiple(paths) {
    if (this.isError) return this;
    return this.map(value => {
      const result = {};
      for (const path of paths) {
        result[path] = extractPath(value, path);
      }
      return result;
    });
  }

  select(fields) {
    if (this.isError) return this;
    return this.map(value => {
      const result = {};
      for (const field of fields) {
        if (field in value) {
          result[field] = value[field];
        }
      }
      return result;
    });
  }

  reject(fields) {
    if (this.isError) return this;
    return this.map(value => {
      const result = { ...value };
      for (const field of fields) {
        delete result[field];
      }
      return result;
    });
  }

  transform(fn) {
    return this.flatMap(fn);
  }

  getOrThrow() {
    if (this.isError) throw this.error;
    return this.value;
  }

  getOrElse(defaultValue) {
    if (this.isError) return defaultValue;
    return this.value;
  }

  unwrap() {
    return { value: this.value, error: this.error, isError: this.isError };
  }
}

export function wrapResult(value) {
  if (value instanceof DataResult) return value;
  return DataResult.ok(value);
}

export function wrapError(error) {
  return DataResult.err(error);
}

export function compose(...transforms) {
  return (value) => {
    let result = DataResult.ok(value);
    for (const transform of transforms) {
      result = result.flatMap(transform);
    }
    return result;
  };
}

export function chain(result, ...transforms) {
  let output = wrapResult(result);
  for (const transform of transforms) {
    output = output.flatMap(transform);
  }
  return output;
}

export function pipeline(value, ...transforms) {
  return compose(...transforms)(value);
}

export function parallel(value, transforms) {
  const results = {};
  for (const [name, transform] of Object.entries(transforms)) {
    results[name] = wrapResult(value).flatMap(transform).unwrap();
  }
  return results;
}

export function aggregate(results, aggregateFn) {
  const values = [];
  for (const result of results) {
    if (!result.isError) {
      values.push(result.value);
    }
  }
  return DataResult.ok(aggregateFn(values));
}

export function combineResults(results, strategy = 'all') {
  const values = [];
  const errors = [];

  for (const result of results) {
    if (result.isError) {
      errors.push(result.error);
    } else {
      values.push(result.value);
    }
  }

  if (strategy === 'all' && errors.length > 0) {
    return DataResult.err(new Error(`${errors.length} errors: ${errors.map(e => e.message).join(', ')}`));
  }

  if (strategy === 'any' && values.length === 0) {
    return DataResult.err(new Error(`All results failed: ${errors.map(e => e.message).join(', ')}`));
  }

  return DataResult.ok(values);
}

export function createDataTransform(transformFn) {
  return (taskFn) => {
    return async function wrappedWithTransform(...args) {
      const result = await taskFn(...args);
      const wrapped = wrapResult(result);
      return wrapped.flatMap(transformFn).getOrThrow();
    };
  };
}

function extractPath(obj, path) {
  if (!path || path === '') return obj;

  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return null;

    const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
    if (arrayMatch) {
      const [, key, index] = arrayMatch;
      current = current[key]?.[parseInt(index)];
    } else {
      current = current[part];
    }
  }

  return current;
}
