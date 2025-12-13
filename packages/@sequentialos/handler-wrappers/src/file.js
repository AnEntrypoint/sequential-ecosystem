export function createFileOperationHandler(logger) {
  return {
    async withRead(filePath, operation) {
      try {
        const result = await operation();
        logger?.info(`Read succeeded: ${filePath}`);
        return result;
      } catch (err) {
        logger?.error(`Read failed: ${filePath}`, err);
        throw err;
      }
    },

    async withWrite(filePath, operation) {
      try {
        const result = await operation();
        logger?.info(`Write succeeded: ${filePath}`);
        return result;
      } catch (err) {
        logger?.error(`Write failed: ${filePath}`, err);
        throw err;
      }
    },

    async withDelete(filePath, operation) {
      try {
        const result = await operation();
        logger?.info(`Delete succeeded: ${filePath}`);
        return result;
      } catch (err) {
        logger?.error(`Delete failed: ${filePath}`, err);
        throw err;
      }
    },

    async withMkdir(dirPath, operation) {
      try {
        const result = await operation();
        logger?.info(`Mkdir succeeded: ${dirPath}`);
        return result;
      } catch (err) {
        logger?.error(`Mkdir failed: ${dirPath}`, err);
        throw err;
      }
    },

    async withRename(oldPath, newPath, operation) {
      try {
        const result = await operation();
        logger?.info(`Rename succeeded: ${oldPath} -> ${newPath}`);
        return result;
      } catch (err) {
        logger?.error(`Rename failed: ${oldPath} -> ${newPath}`, err);
        throw err;
      }
    },

    async withCopy(srcPath, destPath, operation) {
      try {
        const result = await operation();
        logger?.info(`Copy succeeded: ${srcPath} -> ${destPath}`);
        return result;
      } catch (err) {
        logger?.error(`Copy failed: ${srcPath} -> ${destPath}`, err);
        throw err;
      }
    }
  };
}

export function withFileOperation(operationType, filePath, operation, options = {}) {
  const { onSuccess, onError, logger } = options;
  return async function executeFileOp() {
    try {
      const result = await operation();
      onSuccess?.(filePath, result);
      logger?.info(`${operationType} succeeded: ${filePath}`);
      return result;
    } catch (err) {
      onError?.(filePath, err);
      logger?.error(`${operationType} failed: ${filePath}`, err);
      throw err;
    }
  };
}
