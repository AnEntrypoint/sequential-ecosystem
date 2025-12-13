// UI building for template editor
export class TemplateUIBuilder {
  constructor(theme) {
    this.theme = theme;
  }

  buildTemplateLibrary(categories, selectCallback) {
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
        ...Array.from(categories.entries()).map(([category, templates]) =>
          this.buildCategoryGroup(category, templates, selectCallback)
        )
      ]
    };
  }

  buildCategoryGroup(category, templates, selectCallback) {
    return {
      type: 'flex',
      direction: 'column',
      style: { marginBottom: this.theme.getSpacing('md') },
      children: [
        { type: 'text', content: category.toUpperCase(), style: { fontSize: '11px', color: this.theme.getColor('textMuted'), margin: 0, fontWeight: '600' } },
        {
          type: 'flex',
          direction: 'column',
          style: { gap: '4px', marginTop: '8px' },
          children: templates.map(t => ({
            type: 'button',
            content: t.name,
            onClick: () => selectCallback(t.name),
            style: { width: '100%', textAlign: 'left', padding: this.theme.getSpacing('sm') }
          }))
        }
      ]
    };
  }

  buildEditorHeader(templateName, currentCodeLines) {
    return {
      type: 'flex',
      direction: 'row',
      style: {
        padding: this.theme.getSpacing('md'),
        borderBottom: `1px solid ${this.theme.getColor('border')}`,
        justifyContent: 'space-between'
      },
      children: [
        { type: 'heading', content: `Editing: ${templateName}`, level: 4, style: { margin: 0 } },
        { type: 'text', content: `${currentCodeLines} lines`, style: { fontSize: '12px', color: this.theme.getColor('textMuted') } }
      ]
    };
  }

  buildPlaceholder(message) {
    return {
      type: 'flex',
      direction: 'column',
      style: { justifyContent: 'center', alignItems: 'center', height: '100%' },
      children: [{
        type: 'paragraph',
        content: message,
        style: { color: this.theme.getColor('textMuted'), margin: 0 }
      }]
    };
  }
}
