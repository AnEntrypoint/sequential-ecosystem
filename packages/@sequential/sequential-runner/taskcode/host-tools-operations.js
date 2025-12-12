const { TaskVFS } = require('./vfs.js');
const { FileOperationsHandler } = require('./file-operations-handler.js');
const { DirectoryOperationsHandler } = require('./directory-operations-handler.js');

class HostToolsOperations {
  constructor(vfs) {
    this.vfs = vfs;
    this.fileOps = new FileOperationsHandler(vfs);
    this.dirOps = new DirectoryOperationsHandler(vfs);
  }

  async writeFile(params) {
    return this.fileOps.writeFile(params);
  }

  async readFile(params) {
    return this.fileOps.readFile(params);
  }

  async listFiles(params) {
    return this.dirOps.listFiles(params);
  }

  async deleteFile(params) {
    return this.fileOps.deleteFile(params);
  }

  async fileExists(params) {
    return this.fileOps.fileExists(params);
  }

  async fileStat(params) {
    return this.fileOps.fileStat(params);
  }

  async mkdir(params) {
    return this.dirOps.mkdir(params);
  }

  async watchFile(params) {
    return this.fileOps.watchFile(params);
  }

  vfsTree() {
    return this.dirOps.vfsTree();
  }
}

module.exports = { HostToolsOperations };
