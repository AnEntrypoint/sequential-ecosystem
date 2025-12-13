/**
 * state-kit-mutations.js - StateKit mutation operations
 *
 * State mutation methods: run, checkout, reset, batch, tag
 */

class StateKitMutations {
  constructor(store, snapshot, workdir, execFn) {
    this.store = store;
    this.snapshot = snapshot;
    this.workdir = workdir;
    this.execFn = execFn;
  }

  async run(instruction) {
    const parent = this.store.head();
    const cached = this.store.find(instruction, parent);

    if (cached) {
      await this.snapshot.restore(this.workdir, cached.hash);
      return { hash: cached.hash, short: cached.hash.slice(0, 12), cached: true };
    }

    const { stdout, stderr } = await this.execFn(instruction);

    const result = parent
      ? await this.snapshot.diff(this.workdir, parent)
      : await this.snapshot.capture(this.workdir);

    if (!result) {
      return { hash: parent, short: parent?.slice(0, 12), cached: false, empty: true, stdout, stderr };
    }

    this.store.put(result.hash, result.buffer);
    this.store.commit(result.hash, instruction, parent);

    return { hash: result.hash, short: result.hash.slice(0, 12), cached: false, stdout, stderr };
  }

  async batch(instructions) {
    const results = [];
    for (const instruction of instructions) {
      results.push(await this.run(instruction));
    }
    return results;
  }

  async checkout(ref) {
    const hash = this._resolve(ref);
    const layers = this.store.ancestry();
    const idx = layers.findIndex(l => l.hash === hash);
    if (idx === -1) throw new Error(`Layer not found: ${ref}`);

    const subset = layers.slice(0, idx + 1);
    await this.snapshot.rebuild(this.workdir, subset);

    const index = this.store._index();
    index.head = hash;
    this.store._save(index);
  }

  async reset() {
    const fs = require('fs');
    fs.rmSync(this.stateDir, { recursive: true, force: true });
    this.store = new (require('./store'))(this.stateDir);
    this.snapshot = new (require('./snapshot'))(this.store);
    fs.mkdirSync(this.workdir, { recursive: true });
  }

  tag(name, hash) {
    const resolved = hash ? this._resolve(hash) : this.store.head();
    if (!resolved) throw new Error('Nothing to tag');

    const index = this.store._index();
    index.tags = index.tags || {};
    index.tags[name] = resolved;
    this.store._save(index);
  }

  _resolve(ref) {
    if (!ref) return null;

    const index = this.store._index();
    if (index.tags && index.tags[ref]) return index.tags[ref];

    const layers = index.layers;
    const byShort = layers.find(l => l.hash.startsWith(ref));
    if (byShort) return byShort.hash;

    const byFull = layers.find(l => l.hash === ref);
    if (byFull) return byFull.hash;

    throw new Error(`Cannot resolve ref: ${ref}`);
  }
}

module.exports = { StateKitMutations };
