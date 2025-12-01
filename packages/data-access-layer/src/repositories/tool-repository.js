import path from 'path';
import fs from 'fs-extra';
import { BaseRepository } from './base-repository.js';

const TOOLS_DIR = path.join(process.cwd(), '.tools');

export class ToolRepository extends BaseRepository {
  constructor(toolsDir = TOOLS_DIR) {
    super(toolsDir, 'Tool');
  }

  async ensureDir() {
    await fs.ensureDir(this.baseDir);
  }

  getAll() {
    const tools = this.getAllFiles();
    return tools.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  get(id) {
    const toolPath = path.join(this.baseDir, `${id}.json`);
    return this.readJsonFile(toolPath);
  }

  async save(id, tool) {
    await this.ensureDir();
    const toolPath = path.join(this.baseDir, `${id}.json`);
    await this.writeJsonFileAsync(toolPath, tool);
  }

  async delete(id) {
    const toolPath = path.join(this.baseDir, `${id}.json`);

    if (!fs.existsSync(toolPath)) {
      throw this.createError(`Tool not found`, 404, 'NOT_FOUND');
    }

    try {
      await fs.remove(toolPath);
    } catch (err) {
      throw this.createError(`Failed to delete tool: ${err.message}`, 500, 'DELETE_ERROR');
    }
  }
}
