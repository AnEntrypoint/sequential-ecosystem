const fs = require('fs');
const path = require('path');
const { AdapterExecution } = require('./adapter-execution.js');
const { AdapterCheckpoints } = require('./adapter-checkpoints.js');

class SequentialMachineAdapter {
  constructor(options = {}) {
    this.options = {
      stateDir: '.sequential-machine',
      workdir: '.sequential-machine/work',
      ...options
    };

    this.kit = new StateKit({
      stateDir: this.options.stateDir,
      workdir: this.options.workdir
    });

    this.vfs = new StateKitVFS(this.kit);
    this.currentLayer = null;
    this.execution = new AdapterExecution(this.kit);
    this.checkpoints = new AdapterCheckpoints(this.kit);
  }

  async initialize() {
    await fs.promises.mkdir(this.options.stateDir, { recursive: true });
    await fs.promises.mkdir(this.options.workdir, { recursive: true });
    this.currentLayer = this.kit.head();
    return this.currentLayer;
  }

  async execute(instruction, options = {}) {
    return await this.execution.execute(instruction, this.currentLayer, options);
  }

  async executeRaw(instruction) {
    return await this.execution.executeRaw(instruction);
  }

  getCurrentState() {
    return {
      layer: this.currentLayer,
      short: this.currentLayer ? this.currentLayer.slice(0, 12) : null
    };
  }

  async restore(layerRef) {
    await this.kit.checkout(layerRef);
    this.currentLayer = this.kit.head();
    return this.getCurrentState();
  }

  getHistory() {
    return this.kit.history().map(layer => ({
      hash: layer.hash,
      short: layer.short,
      instruction: layer.instruction,
      parent: layer.parent,
      parentShort: layer.parentShort,
      time: layer.time,
      isCurrent: layer.hash === this.currentLayer
    }));
  }

  async getStatus() {
    return await this.kit.status();
  }

  async diff(fromRef, toRef) {
    return await this.kit.diff(fromRef, toRef);
  }

  tag(name, layerRef) {
    return this.checkpoints.tag(name, layerRef);
  }

  getTags() {
    return this.checkpoints.getTags();
  }

  inspect(layerRef) {
    return this.kit.inspect(layerRef);
  }

  async batch(instructions, options = {}) {
    return await this.execution.batch(instructions, this.currentLayer, options);
  }

  async rebuild() {
    const count = await this.kit.rebuild();
    this.currentLayer = this.kit.head();
    return { rebuilt: count, currentLayer: this.currentLayer };
  }

  async reset() {
    await this.kit.reset();
    this.currentLayer = null;
    return { reset: true };
  }

  getVFSAdapter() {
    return this.vfs;
  }

  export() {
    return {
      currentLayer: this.currentLayer,
      history: this.getHistory(),
      tags: this.getTags(),
      options: this.options
    };
  }

  async import(exportedState) {
    if (exportedState.currentLayer) {
      await this.restore(exportedState.currentLayer);
    }
    return this.getCurrentState();
  }

  async checkpoint(name = null) {
    return await this.checkpoints.checkpoint(name);
  }

  listCheckpoints() {
    return this.checkpoints.listCheckpoints();
  }

  async restoreCheckpoint(name) {
    return await this.checkpoints.restoreCheckpoint(name, this.restore.bind(this));
  }
}

module.exports = { SequentialMachineAdapter };