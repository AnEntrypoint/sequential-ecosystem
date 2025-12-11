/**
 * state-kit-query.js - StateKit query operations
 *
 * Readonly query methods: status, diff, history, inspect, tags
 */

class StateKitQuery {
  constructor(store, snapshot, workdir) {
    this.store = store;
    this.snapshot = snapshot;
    this.workdir = workdir;
  }

  async status() {
    const head = this.store.head();
    const headState = head ? await this.snapshot._stateFromLayer(head) : new Map();
    const workState = await this.snapshot._state(this.workdir);

    const added = [];
    const modified = [];
    const deleted = [];

    for (const [rel, cur] of workState) {
      const prev = headState.get(rel);
      if (!prev) added.push(rel);
      else if (prev.hash !== cur.hash) modified.push(rel);
    }

    for (const [rel] of headState) {
      if (!workState.has(rel)) deleted.push(rel);
    }

    return { added, modified, deleted, clean: added.length === 0 && modified.length === 0 && deleted.length === 0 };
  }

  async diff(fromRef, toRef) {
    const fromHash = fromRef ? this._resolve(fromRef) : null;
    const toHash = toRef ? this._resolve(toRef) : this.store.head();

    const fromState = fromHash ? await this.snapshot._stateFromLayer(fromHash) : new Map();
    const toState = toHash ? await this.snapshot._stateFromLayer(toHash) : new Map();

    const added = [];
    const modified = [];
    const deleted = [];

    for (const [rel, cur] of toState) {
      const prev = fromState.get(rel);
      if (!prev) added.push(rel);
      else if (prev.hash !== cur.hash) modified.push(rel);
    }

    for (const [rel] of fromState) {
      if (!toState.has(rel)) deleted.push(rel);
    }

    return { added, modified, deleted };
  }

  history() {
    return this.store.ancestry().map(l => ({
      ...l,
      short: l.hash.slice(0, 12),
      parentShort: l.parent?.slice(0, 12)
    }));
  }

  inspect(ref) {
    const hash = this._resolve(ref);
    const layers = this.store.layers();
    const layer = layers.find(l => l.hash === hash);
    if (!layer) throw new Error(`Layer not found: ${ref}`);

    const data = this.store.get(hash);
    return {
      hash: layer.hash,
      short: layer.hash.slice(0, 12),
      instruction: layer.instruction,
      parent: layer.parent,
      parentShort: layer.parent?.slice(0, 12),
      time: new Date(layer.time),
      size: data ? data.length : 0
    };
  }

  tags() {
    const index = this.store._index();
    return index.tags || {};
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

module.exports = { StateKitQuery };
