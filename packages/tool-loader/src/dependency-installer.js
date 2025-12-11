/**
 * dependency-installer.js
 *
 * Install and cache dependencies
 */

import { execSync } from 'child_process';

export function createDependencyInstaller() {
  const dependencyCache = new Map();

  return {
    installDependencies(dependencies) {
      if (dependencies.length === 0) return;

      const cacheKey = dependencies.sort().join(',');
      if (dependencyCache.has(cacheKey)) {
        return;
      }

      try {
        const installed = dependencies.join(' ');
        execSync(`npm install ${installed}`, {
          stdio: 'pipe',
          cwd: process.cwd()
        });

        dependencyCache.set(cacheKey, true);
      } catch (error) {
        throw new Error(`Failed to install dependencies: ${error.message}`);
      }
    },

    getCacheSize() {
      return dependencyCache.size;
    },

    clearCache() {
      dependencyCache.clear();
    }
  };
}
