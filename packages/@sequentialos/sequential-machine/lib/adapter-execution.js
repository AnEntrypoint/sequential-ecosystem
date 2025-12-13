// Execution operations for SequentialMachineAdapter
class AdapterExecution {
  constructor(kit) {
    this.kit = kit;
  }

  async execute(instruction, currentLayer, options = {}) {
    const result = await this.kit.run(instruction);

    if (!options.noCommit) {
      currentLayer = result.hash;
    }

    return {
      success: true,
      layer: result.hash,
      short: result.short,
      cached: result.cached,
      empty: result.empty,
      instruction
    };
  }

  async executeRaw(instruction) {
    await this.kit.exec(instruction);
    return {
      success: true,
      instruction,
      captured: false
    };
  }

  async batch(instructions, currentLayer, options = {}) {
    const results = [];
    for (const instruction of instructions) {
      const result = await this.execute(instruction, currentLayer, options);
      results.push(result);
    }
    return results;
  }
}

module.exports = { AdapterExecution };
