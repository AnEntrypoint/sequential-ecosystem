import path from 'path';
import fs from 'fs-extra';

const TOOLS_DIR = path.join(process.cwd(), '.tools');

export class ToolRepository {
  constructor(toolsDir = TOOLS_DIR) {
    this.toolsDir = toolsDir;
  }

  async ensureDir() {
    await fs.ensureDir(this.toolsDir);
  }

  getAll() {
    if (!fs.existsSync(this.toolsDir)) {
      return [];
    }

    try {
      const files = fs.readdirSync(this.toolsDir).filter(f => f.endsWith('.json'));
      const tools = files.map(f => {
        try {
          return JSON.parse(fs.readFileSync(path.join(this.toolsDir, f), 'utf8'));
        } catch (e) {
          return null;
        }
      }).filter(Boolean);

      return tools.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (err) {
      return [];
    }
  }

  get(id) {
    const toolPath = path.join(this.toolsDir, `${id}.json`);

    if (!fs.existsSync(toolPath)) {
      const err = new Error(`Tool "${id}" not found`);
      err.status = 404;
      err.code = 'TOOL_NOT_FOUND';
      throw err;
    }

    try {
      return JSON.parse(fs.readFileSync(toolPath, 'utf8'));
    } catch (err) {
      const error = new Error(`Failed to read tool "${id}"`);
      error.status = 500;
      error.code = 'READ_ERROR';
      throw error;
    }
  }

  async save(id, tool) {
    await this.ensureDir();
    const toolPath = path.join(this.toolsDir, `${id}.json`);

    try {
      await fs.writeFile(toolPath, JSON.stringify(tool, null, 2), 'utf8');
    } catch (err) {
      const error = new Error(`Failed to save tool "${id}": ${err.message}`);
      error.status = 500;
      error.code = 'WRITE_ERROR';
      throw error;
    }
  }

  async delete(id) {
    const toolPath = path.join(this.toolsDir, `${id}.json`);

    if (!fs.existsSync(toolPath)) {
      const err = new Error(`Tool "${id}" not found`);
      err.status = 404;
      err.code = 'TOOL_NOT_FOUND';
      throw err;
    }

    try {
      await fs.remove(toolPath);
    } catch (err) {
      const error = new Error(`Failed to delete tool "${id}": ${err.message}`);
      error.status = 500;
      error.code = 'DELETE_ERROR';
      throw error;
    }
  }
}
