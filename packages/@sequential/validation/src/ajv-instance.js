import Ajv from 'ajv';
import addFormats from 'ajv-formats';

let ajvInstance = null;

export function getAjvInstance() {
  if (!ajvInstance) {
    ajvInstance = new Ajv({ coerceTypes: true, allErrors: true });
    addFormats(ajvInstance);
  }
  return ajvInstance;
}

export function registerCustomKeyword(name, handler) {
  getAjvInstance().addKeyword({
    keyword: name,
    compile: () => handler
  });
}

export function resetAjv() {
  ajvInstance = null;
}
