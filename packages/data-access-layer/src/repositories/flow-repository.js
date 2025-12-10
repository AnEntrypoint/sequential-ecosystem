import path from 'path';
import fs from 'fs-extra';
import { ensureDirectory } from '@sequentialos/file-operations';
import { BaseRepository } from './base-repository.js';

export class FlowRepository extends BaseRepository {
  constructor(baseDir = null) {
    super(baseDir || path.join(process.cwd(), 'tasks'), 'Flow');
  }

  async getAll() {
    if (!await fs.pathExists(this.baseDir)) {
      return [];
    }

    const flows = [];
    const entries = await fs.readdir(this.baseDir, { withFileTypes: true });
    const dirs = entries.filter(e => e.isDirectory()).map(e => e.name);

    for (const name of dirs) {
      const graphPath = path.join(this.baseDir, name, 'graph.json');
      const graph = await this.readJsonFileOptional(graphPath);
      if (graph) {
        flows.push({ id: name, name, graph });
      }
    }
    return flows;
  }

  async get(flowId) {
    const flowDir = this.validatePath(flowId);
    const graphPath = path.join(flowDir, 'graph.json');
    const graph = await this.readJsonFile(graphPath, 'graph');
    return { id: flowId, graph };
  }

  async save(id, graphData, configData) {
    const flowDir = this.validatePath(id);
    await ensureDirectory(flowDir);
    const graphPath = path.join(flowDir, 'graph.json');
    await this.writeJsonFileAsync(graphPath, graphData);

    const configPath = path.join(flowDir, 'config.json');
    if (!await fs.pathExists(configPath)) {
      await this.writeJsonFileAsync(configPath, configData);
    }
  }
}
