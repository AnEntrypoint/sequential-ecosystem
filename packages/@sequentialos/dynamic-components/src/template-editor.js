// Facade maintaining 100% backward compatibility
import { TemplateRegistry } from './template-registry.js';
import { TemplateUIBuilder } from './template-ui-builder.js';
import { TemplateGenerator } from './template-generator.js';

export class TemplateEditor {
  constructor(registry, theme, advancedBuilder) {
    this.registry = registry || new TemplateRegistry();
    this.theme = theme;
    this.builder = advancedBuilder;
    this.uiBuilder = new TemplateUIBuilder(theme);
    this.generator = new TemplateGenerator(advancedBuilder);
    this.currentTemplate = null;
    this.templateCode = '';
  }

  // Template management (delegated to registry)
  registerTemplate(name, category, definition, metadata = {}) {
    this.registry.registerTemplate(name, category, definition, metadata);
  }

  getTemplate(name) {
    return this.registry.getTemplate(name);
  }

  get templates() {
    return this.registry.templates;
  }

  // UI building (delegated to uiBuilder)
  buildTemplateEditorUI() {
    const categories = this.registry.categorizeTemplates();
    return {
      type: 'flex',
      direction: 'row',
      style: { height: '100vh' },
      children: [
        this.buildTemplateLibrary(),
        this.buildEditor(),
        this.buildPreview()
      ]
    };
  }

  buildTemplateLibrary() {
    const categories = this.registry.categorizeTemplates();
    return this.uiBuilder.buildTemplateLibrary(categories, (name) => this.selectTemplate(name));
  }

  categorizeTemplates() {
    return this.registry.categorizeTemplates();
  }

  buildCategoryGroup(category, templates) {
    return this.uiBuilder.buildCategoryGroup(category, templates, (name) => this.selectTemplate(name));
  }

  // Editor and preview
  selectTemplate(name) {
    this.currentTemplate = this.getTemplate(name);
    this.templateCode = this.generateTemplateCode(this.currentTemplate);
  }

  buildEditor() {
    if (!this.currentTemplate) {
      return this.uiBuilder.buildPlaceholder('Select a template to edit');
    }

    return {
      type: 'flex',
      direction: 'column',
      style: {
        flex: 1,
        background: this.theme.getColor('background'),
        borderRight: `1px solid ${this.theme.getColor('border')}`
      },
      children: [
        this.buildEditorHeader(),
        {
          type: 'box',
          style: { flex: 1, overflow: 'auto', padding: this.theme.getSpacing('lg') },
          children: [{
            type: 'code',
            content: this.templateCode,
            language: 'javascript',
            style: { fontSize: '12px' }
          }]
        }
      ]
    };
  }

  buildEditorHeader() {
    const codeLines = this.templateCode ? this.templateCode.split('\n').length : 0;
    return this.uiBuilder.buildEditorHeader(this.currentTemplate?.name, codeLines);
  }

  buildPreview() {
    if (!this.currentTemplate) {
      return this.uiBuilder.buildPlaceholder('No template selected');
    }

    return {
      type: 'flex',
      direction: 'column',
      style: {
        width: '300px',
        background: this.theme.getColor('backgroundLight'),
        borderLeft: `1px solid ${this.theme.getColor('border')}`,
        padding: this.theme.getSpacing('lg'),
        overflow: 'auto'
      },
      children: [
        { type: 'heading', content: 'Preview', level: 3, style: { margin: 0, marginBottom: this.theme.getSpacing('md') } },
        {
          type: 'card',
          variant: 'elevated',
          style: {
            padding: this.theme.getSpacing('lg'),
            marginBottom: this.theme.getSpacing('md')
          },
          children: [this.renderTemplatePreview()]
        },
        {
          type: 'flex',
          direction: 'column',
          gap: this.theme.getSpacing('sm'),
          children: [
            {
              type: 'heading',
              content: 'Metadata',
              level: 4,
              style: { margin: 0, marginBottom: this.theme.getSpacing('xs') }
            },
            {
              type: 'flex',
              direction: 'column',
              gap: this.theme.getSpacing('xs'),
              children: [
                this.buildMetaItem('Category', this.currentTemplate.category),
                this.buildMetaItem('Code Reduction', this.currentTemplate.metadata.codeReduction),
                this.buildMetaItem('Author', this.currentTemplate.metadata.author),
                this.buildMetaItem('Tags', this.currentTemplate.metadata.tags.join(', '))
              ]
            }
          ]
        }
      ]
    };
  }

  buildMetaItem(label, value) {
    return {
      type: 'flex',
      direction: 'row',
      style: { justifyContent: 'space-between' },
      children: [
        {
          type: 'paragraph',
          content: label,
          style: { fontSize: '12px', color: this.theme.getColor('textMuted'), margin: 0 }
        },
        {
          type: 'paragraph',
          content: value,
          style: { fontSize: '12px', fontWeight: '600', margin: 0 }
        }
      ]
    };
  }

  renderTemplatePreview() {
    if (!this.currentTemplate?.definition) {
      return { type: 'paragraph', content: 'No preview available', style: { margin: 0 } };
    }
    return this.currentTemplate.definition;
  }

  // Code generation (delegated to generator)
  generateTemplateCode(template) {
    return this.generator.generateCode(template);
  }

  generateJSX(template) {
    return this.generator.generateJSX(template);
  }

  // Export/import
  exportTemplate() {
    if (!this.currentTemplate) return null;
    const json = JSON.stringify(this.currentTemplate, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentTemplate.name}.json`;
    a.click();
  }

  importTemplate(json) {
    const template = JSON.parse(json);
    this.registerTemplate(template.name, template.category, template.definition, template.metadata);
    return template;
  }

  // Utility
  copyCode() {
    if (navigator.clipboard && this.templateCode) {
      navigator.clipboard.writeText(this.templateCode);
    }
  }

  saveTemplate() {
    return this.currentTemplate;
  }
}

export const createTemplateEditor = (registry, theme, advancedBuilder) =>
  new TemplateEditor(registry, theme, advancedBuilder);

export default TemplateEditor;
