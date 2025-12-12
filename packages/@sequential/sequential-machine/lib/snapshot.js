const fs = require('fs');
const path = require('path');
const { SnapshotFileOps } = require('./snapshot-file-ops.js');
const { SnapshotState } = require('./snapshot-state.js');

class Snapshot {
  constructor(store) {
    this.store = store;
    this.fileOps = new SnapshotFileOps();
    this.stateOps = new SnapshotState(this.fileOps);
  }

  async capture(workdir) {
    const files = this.fileOps.walk(workdir);
    if (files.length === 0) return null;

    const buffer = await this.fileOps.pack(workdir, files.map(f => path.relative(workdir, f)));
    const hash = this.fileOps.hash(buffer);
    return { hash, buffer, files: files.length };
  }

  async diff(workdir, baseHash) {
    const current = await this.stateOps.computeState(workdir);
    const base = baseHash ? await this.stateOps.computeStateFromLayers(baseHash, this.store, this.fileOps) : new Map();

    const changed = [];
    const deleted = [];

    for (const [rel, cur] of current) {
      const prev = base.get(rel);
      if (!prev || prev.hash !== cur.hash) changed.push(rel);
    }

    for (const [rel] of base) {
      if (!current.has(rel)) deleted.push(rel);
    }

    if (changed.length === 0 && deleted.length === 0) return null;

    const buffer = changed.length > 0
      ? await this.fileOps.pack(workdir, changed)
      : Buffer.alloc(0);

    const hash = this.fileOps.hash(Buffer.concat([
      buffer,
      Buffer.from(JSON.stringify(deleted))
    ]));

    return { hash, buffer, changed, deleted };
  }

  async restore(workdir, hash) {
    await this.fileOps.restore(workdir, hash, this.store);
  }

  async rebuild(workdir, layers) {
    fs.rmSync(workdir, { recursive: true, force: true });
    fs.mkdirSync(workdir, { recursive: true });
    for (const layer of layers) {
      await this.restore(workdir, layer.hash);
    }
  }
}

module.exports = { Snapshot };
