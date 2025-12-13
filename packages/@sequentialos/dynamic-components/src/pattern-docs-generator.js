// Pattern documentation generator facade - maintains 100% backward compatibility
import { DocsPatternRegistry } from './docs-pattern-registry.js';
import { DocsMarkdownGenerator } from './docs-markdown-generator.js';
import { DocsHtmlGenerator } from './docs-html-generator.js';
import { DocsJsonGenerator } from './docs-json-generator.js';
import { DocsExport } from './docs-export.js';

class PatternDocsGenerator {
  constructor() {
    this.registry = new DocsPatternRegistry();
    this.markdownGen = new DocsMarkdownGenerator();
    this.htmlGen = new DocsHtmlGenerator();
    this.jsonGen = new DocsJsonGenerator();
    this.exporter = new DocsExport();

    // Expose for backward compatibility
    this.patterns = this.registry.patterns;
    this.categories = this.registry.categories;
    this.docFormats = ['html', 'markdown', 'json'];
  }

  registerPattern(patternId, metadata) {
    return this.registry.registerPattern(patternId, metadata);
  }

  updateCategoryIndex(pattern) {
    return this.registry.updateCategoryIndex(pattern);
  }

  generatePatternDocumentation(patternId, format = 'markdown') {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return null;

    switch (format) {
      case 'html':
        return this.generateHTMLDoc(pattern);
      case 'json':
        return this.generateJSONDoc(pattern);
      case 'markdown':
      default:
        return this.generateMarkdownDoc(pattern);
    }
  }

  generateMarkdownDoc(pattern) {
    return this.markdownGen.generateMarkdownDoc(pattern);
  }

  generateHTMLDoc(pattern) {
    return this.htmlGen.generateHTMLDoc(pattern);
  }

  generateJSONDoc(pattern) {
    return this.jsonGen.generateJSONDoc(pattern);
  }

  generateLibraryDocumentation(format = 'markdown') {
    const categories = Array.from(this.categories.keys());

    if (format === 'markdown') {
      return this.generateLibraryMarkdown(categories);
    } else if (format === 'html') {
      return this.generateLibraryHTML(categories);
    } else if (format === 'json') {
      return this.generateLibraryJSON(categories);
    }
  }

  generateLibraryMarkdown(categories) {
    return this.markdownGen.generateLibraryMarkdown(this.patterns, categories);
  }

  generateLibraryHTML(categories) {
    return this.htmlGen.generateLibraryHTML(this.patterns, categories);
  }

  generateLibraryJSON(categories) {
    return this.jsonGen.generateLibraryJSON(this.patterns, categories);
  }

  escapeHtml(text) {
    return this.htmlGen.escapeHtml(text);
  }

  exportDocumentation(patternIds = null, format = 'markdown') {
    return this.exporter.exportDocumentation(
      this.patterns,
      patternIds,
      format,
      (id, fmt) => this.generatePatternDocumentation(id, fmt)
    );
  }
}

function createPatternDocsGenerator() {
  return new PatternDocsGenerator();
}

export { PatternDocsGenerator, createPatternDocsGenerator };
