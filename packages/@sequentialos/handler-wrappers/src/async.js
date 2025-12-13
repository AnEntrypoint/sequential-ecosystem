export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function asyncHandlerWithLogging(fn, logger) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(err => {
        if (logger) logger.error('Handler error:', err);
        next(err);
      });
  };
}

export function createAsyncHandler(options = {}) {
  const { onError, logger } = options;
  return (fn) => {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next))
        .catch(err => {
          if (onError) onError(err, req, res);
          if (logger) logger.error('Handler error:', err);
          next(err);
        });
    };
  };
}
