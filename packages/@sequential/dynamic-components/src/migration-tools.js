// Migration tools facade - maintains 100% backward compatibility
import { defaultDOMMappings } from './dom-mappings.js';
import { DOMMAnalyzer } from './dom-analyzer.js';
import { ComponentConverter } from './component-converter.js';
import { MigrationCodeGenerator } from './migration-code-generator.js';
import { ComponentDocGenerator } from './component-doc-generator.js';

export class DOMtoComponentMigrator {
  constructor() {
    this.mappings = new Map(Object.entries(defaultDOMMappings));
    this.analyzer = new DOMMAnalyzer(defaultDOMMappings);
    this.converter = new ComponentConverter(this.analyzer);
    this.codeGenerator = new MigrationCodeGenerator();
  }

  initializeDefaultMappings() {
    // Backward compatibility - no-op since mappings now initialized from defaults
    return this;
  }

  analyzeHTML(htmlString) {
    return this.analyzer.analyzeHTML(htmlString);
  }

  countElements(el) {
    return this.analyzer.countElements(el);
  }

  extractStyles(el) {
    return this.analyzer.extractStyles(el);
  }

  buildStructure(el) {
    return this.analyzer.buildStructure(el);
  }

  extractProps(el) {
    return this.analyzer.extractProps(el);
  }

  extractInlineStyle(el) {
    return this.analyzer.extractInlineStyle(el);
  }

  analyzeIssues(el) {
    return this.analyzer.analyzeIssues(el);
  }

  convertToComponent(structure) {
    return this.converter.convertToComponent(structure);
  }

  generateCode(component) {
    return this.codeGenerator.generateCode(component);
  }

  componentToJavaScript(comp, indent = 0) {
    return this.codeGenerator.componentToJavaScript(comp, indent);
  }

  generateMigrationReport(analysis) {
    return this.codeGenerator.generateMigrationReport(analysis);
  }

  assessComplexity(issues) {
    return this.codeGenerator.assessComplexity(issues);
  }

  getRecommendations(analysis) {
    return this.codeGenerator.getRecommendations(analysis);
  }
}

export { ComponentDocGenerator } from './component-doc-generator.js';

export const createDOMtoComponentMigrator = () => new DOMtoComponentMigrator();
export const createComponentDocGenerator = (registry) => new ComponentDocGenerator(registry);
