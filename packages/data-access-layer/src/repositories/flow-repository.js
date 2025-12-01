import path from 'path';
import fs from 'fs-extra';
import { BaseRepository } from './base-repository.js';

export class FlowRepository extends BaseRepository {
  constructor(baseDir = null) {
    super(baseDir || path.join(process.cwd(), 'tasks'), 'Flow');
  }

  getAll() {
    if (!fs.existsSync(this.baseDir)) {
      return [];
    }

    const flows = [];
    const taskDirs = fs.readdirSync(this.baseDir)
      .filter(f => fs.statSync(path.join(this.baseDir, f)).isDirectory());

    for (const name of taskDirs) {
      const graphPath = path.join(this.baseDir, name, 'graph.json');
      const graph = this.readJsonFileOptional(graphPath);
      if (graph) {
        flows.push({ id: name, name, graph });
      }
    }
    return flows;
  }

  get(flowId) {
    const flowDir = this.validatePath(flowId);
    const graphPath = path.join(flowDir, 'graph.json');
    const graph = this.readJsonFile(graphPath, 'graph');
    return { id: flowId, graph };
  }

  async save(id, graphData, configData) {
    const flowDir = this.validatePath(id);
    const graphPath = path.join(flowDir, 'graph.json');
    await this.writeJsonFileAsync(graphPath, graphData);

    const configPath = path.join(flowDir, 'config.json');
    if (!fs.existsSync(configPath)) {
      await this.writeJsonFileAsync(configPath, configData);
    }
  }
}
