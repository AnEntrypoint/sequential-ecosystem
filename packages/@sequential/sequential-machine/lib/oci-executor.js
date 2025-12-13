/**
 * oci-executor.js - StateKit-based OCI image builder
 *
 * Builds OCI images using StateKit's content-addressable layer system
 */

class OCIExecutor {
  constructor(opts = {}, stateKit) {
    this.stateKit = stateKit;
    this.baseImageName = opts.baseImage || 'ubuntu:24.04';
    this.tag = opts.tag;
  }

  async exec(cmd) {
    if (!this.stateKit) {
      throw new Error('OCIExecutor requires StateKit instance');
    }

    return this.stateKit.run(cmd);
  }

  async layer(cmd) {
    const result = await this.exec(cmd);
    return {
      hash: result.hash,
      short: result.short,
      instruction: cmd,
      cached: result.cached,
      stdout: result.stdout,
      stderr: result.stderr
    };
  }

  async build(commands) {
    const results = [];
    for (const cmd of commands) {
      const result = await this.layer(cmd);
      results.push(result);
    }
    return results;
  }

  getCurrentImage() {
    if (!this.stateKit) return null;
    return {
      head: this.stateKit.head(),
      tag: this.tag,
      baseImage: this.baseImageName
    };
  }

  tagImage(name) {
    if (!this.stateKit) {
      throw new Error('Cannot tag without StateKit instance');
    }
    this.stateKit.tag(name);
    this.tag = name;
  }

  async export() {
    if (!this.stateKit) {
      throw new Error('Cannot export without StateKit instance');
    }
    const head = this.stateKit.head();
    const history = this.stateKit.history();
    return {
      head,
      tag: this.tag,
      layers: history,
      baseImage: this.baseImageName
    };
  }
}

module.exports = { OCIExecutor };
