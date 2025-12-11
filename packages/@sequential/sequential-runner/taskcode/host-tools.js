const { HostToolsOperations } = require('./host-tools-operations.js');
const { validateParams } = require('./host-tools-validator.js');
const { getAvailableTools } = require('./host-tools-metadata.js');
const { TaskVFS } = require('./vfs.js');
const { validator } = require('@sequentialos/core-config');

class HostTools {
  constructor(ecosystemPath, taskId, runId) {
    this.vfs = new TaskVFS(ecosystemPath, taskId, runId);
    try {
      validator.validate(process.env, false);
      this.debug = validator.get('DEBUG');
    } catch {
      this.debug = process.env.DEBUG === '1';
    }

    const ops = new HostToolsOperations(this.vfs);

    this.tools = {
      writeFile: (params) => {
        validateParams(params, ['path', 'content']);
        return ops.writeFile(params);
      },
      readFile: (params) => {
        validateParams(params, ['path']);
        return ops.readFile(params);
      },
      listFiles: (params) => ops.listFiles(params),
      deleteFile: (params) => {
        validateParams(params, ['path']);
        return ops.deleteFile(params);
      },
      fileExists: (params) => {
        validateParams(params, ['path']);
        return ops.fileExists(params);
      },
      fileStat: (params) => {
        validateParams(params, ['path']);
        return ops.fileStat(params);
      },
      mkdir: (params) => {
        validateParams(params, ['path']);
        return ops.mkdir(params);
      },
      watchFile: (params) => {
        validateParams(params, ['path']);
        return ops.watchFile(params);
      },
      vfsTree: () => ops.vfsTree()
    };
  }

  getTool(toolName) {
    if (!this.tools[toolName]) {
      throw new Error(`Unknown host tool: ${toolName}. Available: ${Object.keys(this.tools).join(', ')}`);
    }
    return this.tools[toolName];
  }

  getVFS() {
    return this.vfs;
  }

  getAvailableTools() {
    return getAvailableTools(Object.keys(this.tools));
  }
}

module.exports = { HostTools };
