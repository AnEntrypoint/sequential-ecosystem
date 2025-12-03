export function withFileOperation(operation, onSuccess, onError) {
  return async (filePath, metadata = {}) => {
    try {
      const result = await operation(filePath);
      onSuccess?.(filePath, result, metadata);
      return { success: true, result, error: null };
    } catch (error) {
      onError?.(filePath, error, metadata);
      return { success: false, result: null, error };
    }
  };
}

export function createFileOperationHandler(logger) {
  return {
    read: async (filePath, metadata) => {
      try {
        const result = await read(filePath);
        logger?.fileSuccess?.('read', filePath, metadata.duration, metadata);
        return { success: true, result };
      } catch (error) {
        logger?.fileOperation?.('read', filePath, error, metadata);
        throw error;
      }
    },
    write: async (filePath, content, metadata) => {
      try {
        await write(filePath, content);
        logger?.fileSuccess?.('write', filePath, metadata.duration, metadata);
        return { success: true };
      } catch (error) {
        logger?.fileOperation?.('write', filePath, error, metadata);
        throw error;
      }
    },
    delete: async (filePath, metadata) => {
      try {
        await remove(filePath);
        logger?.fileSuccess?.('delete', filePath, metadata.duration, metadata);
        return { success: true };
      } catch (error) {
        logger?.fileOperation?.('delete', filePath, error, metadata);
        throw error;
      }
    },
    mkdir: async (dirPath, metadata) => {
      try {
        await ensureDir(dirPath);
        logger?.fileSuccess?.('mkdir', dirPath, metadata.duration, metadata);
        return { success: true };
      } catch (error) {
        logger?.fileOperation?.('mkdir', dirPath, error, metadata);
        throw error;
      }
    },
    rename: async (filePath, newName, metadata) => {
      try {
        await rename(filePath, newName);
        logger?.fileSuccess?.('rename', filePath, metadata.duration, metadata);
        return { success: true };
      } catch (error) {
        logger?.fileOperation?.('rename', filePath, error, metadata);
        throw error;
      }
    },
    copy: async (source, dest, metadata) => {
      try {
        await copy(source, dest);
        logger?.fileSuccess?.('copy', source, metadata.duration, metadata);
        return { success: true };
      } catch (error) {
        logger?.fileOperation?.('copy', source, error, metadata);
        throw error;
      }
    }
  };
}
