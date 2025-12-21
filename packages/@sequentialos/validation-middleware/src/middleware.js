import { createFieldValidator } from './validators.js';

export const validateBody = createFieldValidator(req => req.body);
export const validateParams = createFieldValidator(req => req.params);
export const validateQuery = createFieldValidator(req => req.query);

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
