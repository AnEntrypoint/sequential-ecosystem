import { ExtendedPatternLibrary } from './patterns/extended/index.js';
import { PatternLibraryBase } from './pattern-library-base.js';
import { ThemeEngine } from './theme-engine.js';

class PatternRegistry {
  constructor() {
    this.patterns = new Map();
  }

  register(id, definition, metadata = {}) {
    this.patterns.set(id, {
      id,
      name: metadata.name || id,
      icon: metadata.icon || '◆',
      category: metadata.category || 'extended',
      codeReduction: metadata.codeReduction || '75%',
      description: metadata.description || `Extended pattern: ${id}`,
      definition,
      tags: metadata.tags || [metadata.category, 'extended'],
      author: metadata.author || 'system'
    });
  }

  getAllPatterns() {
    return Array.from(this.patterns.values());
  }
}

class ExtendedPatternIntegration extends PatternLibraryBase {
  constructor() {
    super();
    this.registry = new PatternRegistry();
    this.themeEngine = new ThemeEngine();
    this.library = new ExtendedPatternLibrary(this.registry, this.themeEngine);
    this.initializeExtendedPatterns();
  }

  initializeExtendedPatterns() {
    this.library.registerAllPatterns();
    const patterns = this.registry.getAllPatterns();
    patterns.forEach(p => {
      this.registerPattern(p.id, p);
    });
  }

  getECommercePatterns() {
    return this.getAllPatterns().filter(p => p.category === 'ecommerce');
  }

  getSaaSPatterns() {
    return this.getAllPatterns().filter(p => p.category === 'saas');
  }

  getAdminPatterns() {
    return this.getAllPatterns().filter(p => p.category === 'admin');
  }

  getDashboardPatterns() {
    return this.getAllPatterns().filter(p => p.category === 'dashboard');
  }

  getMarketingPatterns() {
    return this.getAllPatterns().filter(p => p.category === 'marketing');
  }

  getPatternsByDomain(domain) {
    return this.getAllPatterns().filter(p => p.category === domain);
  }
}

function createExtendedPatternIntegration() {
  return new ExtendedPatternIntegration();
}

export { ExtendedPatternIntegration, PatternRegistry, createExtendedPatternIntegration };
