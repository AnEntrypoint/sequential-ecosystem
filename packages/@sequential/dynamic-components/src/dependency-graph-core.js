// Core graph storage and dependency management
export class DependencyGraphCore {
  constructor() {
    this.graph = new Map();
    this.patterns = new Map();
  }

  registerPattern(patternId, definition, dependencies = []) {
    this.patterns.set(patternId, {
      id: patternId,
      definition,
      dependencies,
      dependents: [],
      metadata: {
        created: Date.now(),
        usageCount: 0,
        lastUsed: null
      }
    });

    if (!this.graph.has(patternId)) {
      this.graph.set(patternId, new Map());
    }

    dependencies.forEach(dep => {
      this.addDependency(patternId, dep);
    });
  }

  addDependency(patternId, dependencyId) {
    if (!this.graph.has(patternId)) {
      this.graph.set(patternId, new Map());
    }
    this.graph.get(patternId).set(dependencyId, true);

    const depPattern = this.patterns.get(dependencyId);
    if (depPattern && !depPattern.dependents.includes(patternId)) {
      depPattern.dependents.push(patternId);
    }
  }

  removeDependency(patternId, dependencyId) {
    if (this.graph.has(patternId)) {
      this.graph.get(patternId).delete(dependencyId);
    }

    const depPattern = this.patterns.get(dependencyId);
    if (depPattern) {
      depPattern.dependents = depPattern.dependents.filter(p => p !== patternId);
    }
  }

  getDependencies(patternId) {
    const deps = this.graph.get(patternId);
    return deps ? Array.from(deps.keys()) : [];
  }

  getDependents(patternId) {
    const pattern = this.patterns.get(patternId);
    return pattern ? pattern.dependents : [];
  }

  getPattern(patternId) {
    return this.patterns.get(patternId);
  }
}
