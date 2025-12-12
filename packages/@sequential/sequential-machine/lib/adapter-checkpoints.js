// Checkpoint management for SequentialMachineAdapter
const nowISO = () => new Date().toISOString();

class AdapterCheckpoints {
  constructor(kit) {
    this.kit = kit;
  }

  tag(name, layerRef) {
    this.kit.tag(name, layerRef);
    return this.kit.tags();
  }

  getTags() {
    return this.kit.tags();
  }

  async checkpoint(name = null) {
    const timestamp = nowISO().replace(/[:.]/g, '-');
    const checkpointName = name || `checkpoint-${timestamp}`;
    return this.tag(checkpointName);
  }

  listCheckpoints() {
    const tags = this.getTags();
    return Object.entries(tags)
      .filter(([name]) => name.startsWith('checkpoint-'))
      .reduce((acc, [name, hash]) => {
        acc[name] = hash;
        return acc;
      }, {});
  }

  async restoreCheckpoint(name, restoreFn) {
    const checkpoints = this.listCheckpoints();
    if (!checkpoints[name]) {
      throw new Error(`Checkpoint not found: ${name}`);
    }
    return await restoreFn(checkpoints[name]);
  }
}

module.exports = { AdapterCheckpoints };
