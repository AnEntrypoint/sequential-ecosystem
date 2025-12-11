export class TemplateEditor {
  constructor(registry, theme, advancedBuilder) {
    this.registry = registry;
    this.theme = theme;
    this.builder = advancedBuilder;
    this.templates = new Map();
    this.currentTemplate = null;
    this.templateCode = '';
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

  buildTemplateEditorUI() {
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
    const categories = this.categorizeTemplates();

    return {
      type: 'flex',
      direction: 'column',
      style: {
        width: '250px',
        background: this.theme.getColor('backgroundLight'),
        borderRight: `1px solid ${this.theme.getColor('border')}`,
        overflow: 'auto',
        padding: this.theme.getSpacing('lg')
      },
      children: [
        { type: 'heading', content: 'Templates', level: 3, style: { margin: 0, marginBottom: this.theme.getSpacing('md') } },
        {
          type: 'flex',
          direction: 'column',
          gap: this.theme.getSpacing('sm'),
          children: Array.from(categories.entries()).map(([category, templates]) =>
            this.buildCategoryGroup(category, templates)
          )
        }
      ]
    };
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

  buildCategoryGroup(category, templates) {
    return {
      type: 'flex',
      direction: 'column',
      gap: this.theme.getSpacing('xs'),
      style: { marginBottom: this.theme.getSpacing('md') },
      children: [
        {
          type: 'paragraph',
          content: category.toUpperCase(),
          style: { fontSize: '11px', color: this.theme.getColor('textMuted'), margin: 0, fontWeight: '600' }
        },
        {
          type: 'flex',
          direction: 'column',
          gap: this.theme.getSpacing('xs'),
          children: templates.map(t => ({
            type: 'button',
            label: t.name,
            onClick: () => this.selectTemplate(t.name),
            variant: this.currentTemplate?.name === t.name ? 'primary' : 'secondary',
            style: { width: '100%', textAlign: 'left', padding: this.theme.getSpacing('sm') }
          }))
        }
      ]
    };
  }

  selectTemplate(name) {
    this.currentTemplate = this.templates.get(name);
    this.templateCode = this.generateTemplateCode(this.currentTemplate);
  }

  buildEditor() {
    if (!this.currentTemplate) {
      return {
        type: 'flex',
        direction: 'column',
        style: {
          flex: 1,
          padding: this.theme.getSpacing('lg'),
          alignItems: 'center',
          justifyContent: 'center',
          background: this.theme.getColor('background')
        },
        children: [{
          type: 'paragraph',
          content: 'Select a template to edit',
          style: { color: this.theme.getColor('textMuted'), margin: 0 }
        }]
      };
    }

    return {
      type: 'flex',
      direction: 'column',
      style: {
        flex: 1,
        background: this.theme.getColor('background'),
        overflow: 'auto'
      },
      children: [
        this.buildEditorHeader(),
        this.buildMetadataEditor(),
        this.buildPropertyEditor(),
        this.buildCodeEditor()
      ]
    };
  }

  buildEditorHeader() {
    return {
      type: 'flex',
      direction: 'row',
      style: {
        padding: this.theme.getSpacing('lg'),
        background: this.theme.getColor('backgroundLight'),
        borderBottom: `1px solid ${this.theme.getColor('border')}`,
        justifyContent: 'space-between',
        alignItems: 'center'
      },
      children: [
        {
          type: 'flex',
          direction: 'column',
          gap: this.theme.getSpacing('xs'),
          children: [
            {
              type: 'heading',
              content: this.currentTemplate.name,
              level: 2,
              style: { margin: 0 }
            },
            {
              type: 'paragraph',
              content: this.currentTemplate.metadata.description,
              style: { fontSize: '12px', color: this.theme.getColor('textMuted'), margin: 0 }
            }
          ]
        },
        {
          type: 'flex',
          direction: 'row',
          gap: this.theme.getSpacing('sm'),
          children: [
            {
              type: 'button',
              label: 'Save',
              onClick: () => this.saveTemplate(),
              variant: 'primary',
              style: { padding: this.theme.getSpacing('md') }
            },
            {
              type: 'button',
              label: 'Export',
              onClick: () => this.exportTemplate(),
              variant: 'secondary',
              style: { padding: this.theme.getSpacing('md') }
            }
          ]
        }
      ]
    };
  }

  buildMetadataEditor() {
    return {
      type: 'card',
      variant: 'flat',
      style: {
        margin: this.theme.getSpacing('lg'),
        padding: this.theme.getSpacing('lg')
      },
      children: [
        { type: 'heading', content: 'Metadata', level: 3, style: { margin: 0, marginBottom: this.theme.getSpacing('md') } },
        {
          type: 'flex',
          direction: 'column',
          gap: this.theme.getSpacing('md'),
          children: [
            {
              type: 'flex',
              direction: 'column',
              gap: this.theme.getSpacing('xs'),
              children: [
                { type: 'paragraph', content: 'Description', style: { fontSize: '12px', margin: 0 } },
                {
                  type: 'input',
                  placeholder: 'Template description...',
                  value: this.currentTemplate.metadata.description,
                  onChange: (value) => {
                    this.currentTemplate.metadata.description = value;
                  }
                }
              ]
            },
            {
              type: 'flex',
              direction: 'column',
              gap: this.theme.getSpacing('xs'),
              children: [
                { type: 'paragraph', content: 'Code Reduction', style: { fontSize: '12px', margin: 0 } },
                {
                  type: 'input',
                  placeholder: '50%',
                  value: this.currentTemplate.metadata.codeReduction,
                  onChange: (value) => {
                    this.currentTemplate.metadata.codeReduction = value;
                  }
                }
              ]
            },
            {
              type: 'flex',
              direction: 'column',
              gap: this.theme.getSpacing('xs'),
              children: [
                { type: 'paragraph', content: 'Tags', style: { fontSize: '12px', margin: 0 } },
                {
                  type: 'input',
                  placeholder: 'comma, separated, tags',
                  value: this.currentTemplate.metadata.tags.join(', '),
                  onChange: (value) => {
                    this.currentTemplate.metadata.tags = value.split(',').map(t => t.trim());
                  }
                }
              ]
            }
          ]
        }
      ]
    };
  }

  buildPropertyEditor() {
    if (!this.currentTemplate.definition.properties) {
      return { type: 'box', style: { display: 'none' } };
    }

    return {
      type: 'card',
      variant: 'flat',
      style: {
        margin: this.theme.getSpacing('lg'),
        padding: this.theme.getSpacing('lg')
      },
      children: [
        { type: 'heading', content: 'Properties', level: 3, style: { margin: 0, marginBottom: this.theme.getSpacing('md') } },
        {
          type: 'flex',
          direction: 'column',
          gap: this.theme.getSpacing('md'),
          children: Object.entries(this.currentTemplate.definition.properties).map(([key, prop]) =>
            this.buildPropertyField(key, prop)
          )
        }
      ]
    };
  }

  buildPropertyField(key, prop) {
    return {
      type: 'flex',
      direction: 'column',
      gap: this.theme.getSpacing('xs'),
      style: { padding: this.theme.getSpacing('md'), background: this.theme.getColor('background'), borderRadius: '4px' },
      children: [
        {
          type: 'flex',
          direction: 'row',
          style: { justifyContent: 'space-between', alignItems: 'center' },
          children: [
            {
              type: 'paragraph',
              content: key,
              style: { fontSize: '12px', fontWeight: '600', margin: 0 }
            },
            {
              type: 'paragraph',
              content: `(${prop.type})`,
              style: { fontSize: '11px', color: this.theme.getColor('textMuted'), margin: 0 }
            }
          ]
        },
        {
          type: 'input',
          placeholder: prop.description || 'Property description...',
          value: prop.description || '',
          onChange: (value) => {
            prop.description = value;
          }
        }
      ]
    };
  }

  buildCodeEditor() {
    return {
      type: 'card',
      variant: 'flat',
      style: {
        margin: this.theme.getSpacing('lg'),
        padding: this.theme.getSpacing('lg')
      },
      children: [
        { type: 'heading', content: 'Generated Code', level: 3, style: { margin: 0, marginBottom: this.theme.getSpacing('md') } },
        {
          type: 'box',
          style: {
            background: '#1e1e1e',
            borderRadius: '4px',
            padding: this.theme.getSpacing('md'),
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#d4d4d4',
            overflow: 'auto',
            maxHeight: '300px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          },
          children: [{
            type: 'paragraph',
            content: this.templateCode,
            style: { margin: 0 }
          }]
        },
        {
          type: 'button',
          label: 'Copy Code',
          onClick: () => this.copyCode(),
          variant: 'primary',
          style: { marginTop: this.theme.getSpacing('md'), width: '100%' }
        }
      ]
    };
  }

  buildPreview() {
    if (!this.currentTemplate) {
      return {
        type: 'flex',
        direction: 'column',
        style: {
          width: '350px',
          background: this.theme.getColor('background'),
          borderLeft: `1px solid ${this.theme.getColor('border')}`,
          padding: this.theme.getSpacing('lg'),
          overflow: 'auto'
        },
        children: [{
          type: 'paragraph',
          content: 'Preview will appear here',
          style: { color: this.theme.getColor('textMuted'), textAlign: 'center', margin: 'auto' }
        }]
      };
    }

    return {
      type: 'flex',
      direction: 'column',
      style: {
        width: '350px',
        background: this.theme.getColor('background'),
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
          children: [
            this.renderTemplatePreview()
          ]
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
    if (!this.currentTemplate.definition) {
      return { type: 'paragraph', content: 'No preview available', style: { margin: 0 } };
    }

    return this.currentTemplate.definition;
  }

  generateTemplateCode(template) {
    const props = template.definition.properties || {};
    const propLines = Object.entries(props).map(([key, prop]) =>
      `  ${key}: ${prop.type === 'string' ? "'value'" : prop.type === 'number' ? '0' : '[]'}`
    );

    return `const ${template.name} = {
  type: '${template.definition.type}',
${propLines.join(',\n')}
};

bridge.render('${template.definition.type}', ${template.name});`;
  }

  copyCode() {
    navigator.clipboard.writeText(this.templateCode);
    console.log('Code copied to clipboard');
  }

  saveTemplate() {
    console.log('Template saved:', this.currentTemplate.name);
    return this.currentTemplate;
  }

  exportTemplate() {
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
}

export const createTemplateEditor = (registry, theme, advancedBuilder) =>
  new TemplateEditor(registry, theme, advancedBuilder);

export default TemplateEditor;
