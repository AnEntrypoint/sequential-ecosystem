import logger from '@sequentialos/sequential-logging';

export function createCLICommand(fn) {
  return async (...args) => {
    try {
      await fn(...args);
    } catch (e) {
      logger.error('Error:', e instanceof Error ? e.message : String(e));
      if (process.env.DEBUG) {
        logger.error('Stack:', e instanceof Error ? e.stack : 'No stack trace');
      }
      process.exit(1);
    }
  };
}

export function createCLITask(fn) {
  return async (...args) => {
    try {
      const result = await fn(...args);
      return result;
    } catch (e) {
      logger.error('Task failed:', e instanceof Error ? e.message : String(e));
      throw e;
    }
  };
}
