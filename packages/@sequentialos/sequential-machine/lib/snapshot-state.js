const fs = require('fs');
const path = require('path');

class SnapshotState {
  constructor(fileOps) {
    this.fileOps = fileOps;
  }

  async computeState(workdir) {
    const state = new Map();
    const files = this.fileOps.walk(workdir);

    return new Promise((resolve, reject) => {
      let i = 0;
      const processNextBatch = () => {
        try {
          const batchSize = 10;
          const end = Math.min(i + batchSize, files.length);

          for (; i < end; i++) {
            const file = files[i];
            const rel = path.relative(workdir, file);
            const stat = fs.lstatSync(file);
            let hash;

            if (stat.isFile()) {
              hash = this.fileOps.hash(fs.readFileSync(file));
            } else if (stat.isDirectory()) {
              hash = 'dir';
            } else if (stat.isSymbolicLink()) {
              hash = 'link:' + fs.readlinkSync(file);
            }

            state.set(rel, { hash, mode: stat.mode });
          }

          if (i < files.length) {
            setImmediate(processNextBatch);
          } else {
            resolve(state);
          }
        } catch (err) {
          reject(err);
        }
      };

      processNextBatch();
    });
  }

  async computeStateFromLayers(baseHash, store, fileOps) {
    const tar = require('tar');
    const layers = this.getAncestryTo(baseHash, store);
    if (layers.length === 0) return new Map();

    const tmp = path.join(store.dir, `.tmp-state-${Date.now()}`);
    fs.mkdirSync(tmp, { recursive: true });

    try {
      for (const layer of layers) {
        const data = store.get(layer.hash);
        if (!data || data.length === 0) continue;

        const tarPath = path.join(store.dir, `.tmp-${Date.now()}-${layer.hash.slice(0, 8)}.tar`);
        fs.writeFileSync(tarPath, data);
        await tar.extract({ file: tarPath, cwd: tmp });
        fs.unlinkSync(tarPath);
      }

      return this.computeState(tmp);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  }

  getAncestryTo(hash, store) {
    const index = store._index();
    const byHash = new Map(index.layers.map(l => [l.hash, l]));
    const result = [];
    let current = hash;

    while (current) {
      const layer = byHash.get(current);
      if (!layer) break;
      result.unshift(layer);
      current = layer.parent;
    }

    return result;
  }
}

module.exports = { SnapshotState };
