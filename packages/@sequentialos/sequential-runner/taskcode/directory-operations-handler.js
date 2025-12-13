class DirectoryOperationsHandler {
  constructor(vfs) {
    this.vfs = vfs;
  }

  async listFiles(params = {}) {
    const { path = '/', scope = 'run', recursive = false } = params;
    try {
      const result = await this.vfs.listFiles(path, scope);

      if (recursive && result.directories.length > 0) {
        for (const dir of result.directories) {
          const subResult = await this.listFiles({
            path: dir.path,
            scope,
            recursive: true
          });
          if (subResult.success) {
            result.files.push(...subResult.files);
            result.directories.push(...subResult.directories);
          }
        }
      }

      return { ...result, success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        tool: 'listFiles',
        params: { path, scope }
      };
    }
  }

  async mkdir(params) {
    const { path, scope = 'run' } = params;
    try {
      return await this.vfs.mkdir(path, scope);
    } catch (error) {
      return {
        success: false,
        error: error.message,
        tool: 'mkdir',
        params: { path, scope }
      };
    }
  }

  vfsTree() {
    try {
      const tree = this.vfs.getVFSTree();
      return { success: true, tree };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        tool: 'vfsTree'
      };
    }
  }
}

module.exports = { DirectoryOperationsHandler };
