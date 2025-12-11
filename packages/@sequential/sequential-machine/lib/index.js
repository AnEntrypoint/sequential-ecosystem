/**
 * index.js - StateKit Facade
 *
 * Delegates to focused modules:
 * - state-kit-query: Query operations (status, diff, history, inspect, tags)
 * - state-kit-mutations: Mutations (run, checkout, reset, batch, tag)
 * - state-kit-exec: Process execution and reference resolution
 */

const fs = require('fs');
const path = require('path');
const { Store } = require('./store');
const { Snapshot } = require('./snapshot');
const { StateKitQuery } = require('./state-kit-query');
const { StateKitMutations } = require('./state-kit-mutations');
const { createExecFunction } = require('./state-kit-exec');

class StateKit {
  constructor(opts = {}) {
    this.stateDir = path.resolve(opts.stateDir || '.statekit');
    this.workdir = path.resolve(opts.workdir || path.join(this.stateDir, 'work'));
    this.store = new Store(this.stateDir);
    this.snapshot = new Snapshot(this.store);
    fs.mkdirSync(this.workdir, { recursive: true });

    this._exec = createExecFunction(this.workdir);
    this.query = new StateKitQuery(this.store, this.snapshot, this.workdir);
    this.mutations = new StateKitMutations(this.store, this.snapshot, this.workdir, this._exec);
  }

  async run(instruction) {
    return this.mutations.run(instruction);
  }

  async exec(cmd) {
    await this._exec(cmd);
  }

  async batch(instructions) {
    return this.mutations.batch(instructions);
  }

  async rebuild() {
    const layers = this.store.ancestry();
    await this.snapshot.rebuild(this.workdir, layers);
    return layers.length;
  }

  async reset() {
    return this.mutations.reset();
  }

  async checkout(ref) {
    return this.mutations.checkout(ref);
  }

  async status() {
    return this.query.status();
  }

  async diff(fromRef, toRef) {
    return this.query.diff(fromRef, toRef);
  }

  tag(name, hash) {
    return this.mutations.tag(name, hash);
  }

  tags() {
    return this.query.tags();
  }

  inspect(ref) {
    return this.query.inspect(ref);
  }

  history() {
    return this.query.history();
  }

  head() {
    return this.store.head();
  }
}

const { SequentialMachineAdapter } = require('./adapter');

module.exports = { StateKit, Store, Snapshot, SequentialMachineAdapter };
