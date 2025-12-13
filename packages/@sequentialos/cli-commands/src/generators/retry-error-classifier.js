/**
 * Retry Error Classifier
 * Classifies errors as retryable based on error patterns
 */

export function createRetryErrorClassifier(options = {}) {
  const {
    retryableErrors = [
      'ECONNREFUSED',
      'ECONNRESET',
      'ETIMEDOUT',
      'EHOSTUNREACH',
      'NetworkError',
      'TimeoutError'
    ]
  } = options;

  return {
    isRetryable(error) {
      const errorString = `${error.code || error.name || error.message}`;
      return retryableErrors.some(pattern => errorString.includes(pattern));
    },

    getRetryableErrors() {
      return retryableErrors;
    }
  };
}
