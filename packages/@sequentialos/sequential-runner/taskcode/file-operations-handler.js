const { TaskVFS } = require('./vfs.js');

class FileOperationsHandler {
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
}

module.exports = { FileOperationsHandler };
