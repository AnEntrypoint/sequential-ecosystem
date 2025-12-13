// Template management and registration
export class TemplateRegistry {
  constructor() {
    this.templates = new Map();
  }

  registerTemplate(name, category, definition, metadata = {}) {
    this.templates.set(name, {
      name,
      category,
      definition,
      metadata: {
        description: metadata.description || '',
        codeReduction: metadata.codeReduction || '50%',
        author: metadata.author || 'system',
        tags: metadata.tags || [],
        ...metadata
      }
    });
  }

  getTemplate(name) {
    return this.templates.get(name);
  }

  getAllTemplates() {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category) {
    return Array.from(this.templates.values()).filter(t => t.category === category);
  }

  categorizeTemplates() {
    const categories = new Map();
    for (const [name, template] of this.templates) {
      if (!categories.has(template.category)) {
        categories.set(template.category, []);
      }
      categories.get(template.category).push({ name, ...template });
    }
    return categories;
  }

  exportTemplates(format = 'json') {
    return {
      format,
      exportedAt: new Date().toISOString(),
      templates: Array.from(this.templates.entries()).map(([name, template]) => ({
        ...template,
        name
      }))
    };
  }

  clear() {
    this.templates.clear();
  }
}
