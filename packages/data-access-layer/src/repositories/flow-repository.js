import path from 'path';
import fs from 'fs-extra';

export class FlowRepository {
  constructor(baseDir = null) {
    this.baseDir = baseDir || path.join(process.cwd(), 'tasks');
  }

  validatePath(flowId) {
    const flowDir = path.join(this.baseDir, flowId);
    const realPath = path.resolve(flowDir);
    if (!realPath.startsWith(path.resolve(this.baseDir))) {
      const err = new Error(`Access to flow '${flowId}' denied`);
      err.status = 403;
      err.code = 'FORBIDDEN';
      throw err;
    }
    return flowDir;
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
      if (fs.existsSync(graphPath)) {
        try {
          const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
          flows.push({ id: name, name, graph });
        } catch (e) {}
      }
    }
    return flows;
  }

  get(flowId) {
    const flowDir = this.validatePath(flowId);
    const graphPath = path.join(flowDir, 'graph.json');
    if (!fs.existsSync(graphPath)) {
      const err = new Error(`Flow '${flowId}' not found`);
      err.status = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    try {
      const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
      return { id: flowId, graph };
    } catch (e) {
      throw new Error(`Invalid flow file: ${e.message}`);
    }
  }

  async save(id, graphData, configData) {
    const flowDir = this.validatePath(id);
    fs.ensureDirSync(flowDir);

    fs.writeFileSync(path.join(flowDir, 'graph.json'), JSON.stringify(graphData, null, 2));

    const configPath = path.join(flowDir, 'config.json');
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
    }
  }
}
