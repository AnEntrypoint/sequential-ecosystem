import path from 'path';
import fs from 'fs-extra';
import logger from '@sequentialos/sequential-logging';

export class FileStore {
  constructor(baseDir) {
    this.baseDir = path.resolve(baseDir);
    this.baseReal = fs.existsSync(this.baseDir) ? fs.realpathSync(this.baseDir) : this.baseDir;
  }

  validatePath(filename) {
    const fullPath = path.resolve(path.join(this.baseDir, filename));
    let realPath;

    try {
      realPath = fs.realpathSync(fullPath);
    } catch (err) {
      if (err.code === 'ENOENT') {
        const parentDir = path.dirname(fullPath);
        try {
          const realParent = fs.realpathSync(parentDir);
          realPath = path.join(realParent, path.basename(fullPath));
        } catch (parentErr) {
          realPath = fullPath;
        }
      } else {
        throw err;
      }
    }

    const baseReal = fs.existsSync(this.baseDir) ? fs.realpathSync(this.baseDir) : this.baseDir;
    if (!realPath.startsWith(baseReal + path.sep) && realPath !== baseReal) {
      throw new Error(`Path traversal attempt: ${filename}`);
    }

    return fullPath;
  }

  listJsonFiles(filter = null) {
    if (!fs.existsSync(this.baseDir)) {
      return [];
    }
    return fs.readdirSync(this.baseDir)
      .filter(f => f.endsWith('.json'))
      .filter(f => !filter || filter(f))
      .map(f => {
        try {
          const validPath = this.validatePath(f);
          return JSON.parse(fs.readFileSync(validPath, 'utf8'));
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
  }

  listDirectories(configFile = null) {
    if (!fs.existsSync(this.baseDir)) {
      return [];
    }
    return fs.readdirSync(this.baseDir)
      .filter(f => {
        try {
          const validPath = this.validatePath(f);
          return fs.statSync(validPath).isDirectory();
        } catch (e) {
          return false;
        }
      })
      .map(name => {
        let result = { name, id: name };
        if (configFile) {
          try {
            const configPath = this.validatePath(path.join(name, configFile));
            if (fs.existsSync(configPath)) {
              try {
                const content = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                result = { ...result, ...content };
              } catch (parseErr) {
                if (process.env.DEBUG) {
                  logger.warn(`Failed to parse ${configPath}: ${parseErr.message}`);
                }
              }
            }
          } catch (validationErr) {
            if (process.env.DEBUG) {
              logger.warn(`Path validation failed for ${name}/${configFile}: ${validationErr.message}`);
            }
          }
        }
        return result;
      });
  }

  readJson(filename) {
    try {
      const filepath = this.validatePath(filename);
      if (!fs.existsSync(filepath)) {
        return null;
      }
      return JSON.parse(fs.readFileSync(filepath, 'utf8'));
    } catch (e) {
      return null;
    }
  }

  writeJson(filename, data) {
    const filepath = this.validatePath(filename);
    fs.ensureDirSync(path.dirname(filepath));
    return fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  }
}
