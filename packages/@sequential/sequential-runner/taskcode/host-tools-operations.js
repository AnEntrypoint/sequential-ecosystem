const { TaskVFS } = require('./vfs.js');

class HostToolsOperations {
  constructor(vfs) {
    this.vfs = vfs;
  }

  async writeFile(params) {
    const { path, content, scope = 'run', encoding = 'utf8', append = false } = params;
    try {
      return await this.vfs.writeFile(path, content, scope, { encoding, append });
    } catch (error) {
      return {
        success: false,
        error: error.message,
        tool: 'writeFile',
        params: { path, scope }
      };
    }
  }

  async readFile(params) {
    const { path, scope = 'auto', encoding = 'utf8' } = params;
    try {
      return await this.vfs.readFile(path, scope, { encoding });
    } catch (error) {
      return {
        success: false,
        error: error.message,
        tool: 'readFile',
        params: { path, scope }
      };
    }
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

  async deleteFile(params) {
    const { path, scope = 'run' } = params;
    try {
      return await this.vfs.deleteFile(path, scope);
    } catch (error) {
      return {
        success: false,
        error: error.message,
        tool: 'deleteFile',
        params: { path, scope }
      };
    }
  }

  async fileExists(params) {
    const { path, scope = 'run' } = params;
    try {
      const exists = await this.vfs.exists(path, scope);
      return { success: true, exists, path, scope };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        tool: 'fileExists',
        params: { path, scope }
      };
    }
  }

  async fileStat(params) {
    const { path, scope = 'run' } = params;
    try {
      return await this.vfs.stat(path, scope);
    } catch (error) {
      return {
        success: false,
        error: error.message,
        tool: 'fileStat',
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

  async watchFile(params) {
    const { path, scope = 'run' } = params;
    try {
      return await new Promise((resolve) => {
        this.vfs.watch(path, scope, (event) => {
          resolve({ success: true, event, path, scope });
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error.message,
        tool: 'watchFile',
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

module.exports = { HostToolsOperations };
