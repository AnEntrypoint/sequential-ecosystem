export class VFSClient {
  constructor(requestHandler) {
    this.request = requestHandler;
  }

  async readdir(path) {
    return await this.request('/vfs/readdir', {
      method: 'POST',
      body: JSON.stringify({path})
    });
  }

  async readfile(path) {
    return await this.request('/vfs/readfile', {
      method: 'POST',
      body: JSON.stringify({path})
    });
  }

  async writefile(path, content) {
    return await this.request('/vfs/writefile', {
      method: 'POST',
      body: JSON.stringify({path, content})
    });
  }

  async mkdir(path) {
    return await this.request('/vfs/mkdir', {
      method: 'POST',
      body: JSON.stringify({path})
    });
  }

  async unlink(path) {
    return await this.request('/vfs/unlink', {
      method: 'POST',
      body: JSON.stringify({path})
    });
  }

  async stat(path) {
    return await this.request('/vfs/stat', {
      method: 'POST',
      body: JSON.stringify({path})
    });
  }
}

export default VFSClient;
