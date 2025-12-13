// JSON documentation generator
export class DocsJsonGenerator {
  generateJSONDoc(pattern) {
    return {
      pattern: pattern.id,
      name: pattern.name,
      category: pattern.category,
      description: pattern.description,
      tags: pattern.tags,
      codeReduction: pattern.codeReduction,
      dependencies: pattern.dependencies,
      usage: pattern.usage,
      example: pattern.example,
      properties: pattern.properties,
      accessibility: pattern.accessibility,
      performance: pattern.performance,
      versions: pattern.versions,
      created: new Date(pattern.created).toISOString(),
      updated: new Date(pattern.updated).toISOString()
    };
  }

  generateLibraryJSON(patterns, categories) {
    return {
      library: 'pattern-library',
      generated: new Date().toISOString(),
      statistics: {
        totalPatterns: patterns.size,
        totalCategories: categories.length,
        totalCodeReduction: Array.from(patterns.values()).reduce((sum, p) => sum + p.codeReduction, 0),
        patterns: Array.from(patterns.values()).map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          description: p.description,
          tags: p.tags,
          codeReduction: p.codeReduction
        }))
      }
    };
  }
}
