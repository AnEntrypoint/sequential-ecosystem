/**
 * Config File Loader
 * Loads configuration from file system
 */

import path from 'path';
import fs from 'fs-extra';

export function createConfigFileLoader() {
  return {
    async loadFromFiles(resourceType, resourcePath) {
      let config = {};
      const searchPaths = [
        resourcePath,
        path.join(resourcePath, '..'),
        path.join(resourcePath, '../..'),
        process.cwd()
      ];

      for (const dir of searchPaths) {
        const configFile = path.join(dir, '.sequentialrc.json');
        const resourceConfigFile = path.join(dir, `${resourceType}.config.json`);

        if (fs.existsSync(configFile)) {
          const global = await fs.readJson(configFile);
          config = { ...config, ...global };
        }

        if (fs.existsSync(resourceConfigFile)) {
          const specific = await fs.readJson(resourceConfigFile);
          config = { ...config, ...specific };
        }
      }

      return config;
    }
  };
}
