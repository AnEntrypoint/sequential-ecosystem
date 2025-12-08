export class VisualBuilderUI {
  constructor(registry, themeEngine, advancedBuilder) {
    this.registry = registry;
    this.themeEngine = themeEngine;
    this.builder = advancedBuilder;
    this.selectedTemplate = null;
    this.selectedPreset = null;
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return this;
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  buildTemplateSelector() {
    const templates = this.builder.listTemplates();
    return {
      type: 'flex',
      direction: 'column',
      gap: this.themeEngine.getSpacing('md'),
      style: { padding: this.themeEngine.getSpacing('lg') },
      children: [
        {
          type: 'heading',
          content: 'Select Template',
          level: 3,
          style: { marginBottom: this.themeEngine.getSpacing('md') }
        },
        {
          type: 'flex',
          direction: 'column',
          gap: this.themeEngine.getSpacing('sm'),
          children: templates.map(name => ({
            type: 'button',
            label: name.replace('-', ' ').toUpperCase(),
            onClick: () => this.selectTemplate(name),
            variant: this.selectedTemplate === name ? 'primary' : 'outline',
            style: { width: '100%' }
          }))
        }
      ]
    };
  }

  buildPresetSelector() {
    const presets = this.builder.listPresets();
    return {
      type: 'flex',
      direction: 'column',
      gap: this.themeEngine.getSpacing('md'),
      style: { padding: this.themeEngine.getSpacing('lg') },
      children: [
        {
          type: 'heading',
          content: 'Style Preset',
          level: 3,
          style: { marginBottom: this.themeEngine.getSpacing('md') }
        },
        {
          type: 'flex',
          direction: 'row',
          gap: this.themeEngine.getSpacing('sm'),
          children: presets.map(name => ({
            type: 'button',
            label: name,
            onClick: () => this.selectPreset(name),
            variant: this.selectedPreset === name ? 'primary' : 'outline'
          }))
        }
      ]
    };
  }

  selectTemplate(name) {
    this.selectedTemplate = name;
    this.emit('templateSelected', { template: name });
  }

  selectPreset(name) {
    this.selectedPreset = name;
    this.emit('presetSelected', { preset: name });
  }

  buildComponentPalette() {
    const categories = {
      'Layout': ['flex', 'grid', 'container', 'spacer'],
      'Input': ['input', 'button', 'textarea', 'select'],
      'Display': ['heading', 'paragraph', 'card', 'badge'],
      'Navigation': ['tabs-nav', 'breadcrumb', 'pagination'],
      'Feedback': ['alert', 'tooltip', 'skeleton-loader'],
      'Data': ['data-table', 'stat-card', 'progress-ring']
    };

    return {
      type: 'flex',
      direction: 'column',
      gap: this.themeEngine.getSpacing('md'),
      style: {
        padding: this.themeEngine.getSpacing('lg'),
        borderRight: `1px solid ${this.themeEngine.getColor('border')}`
      },
      children: Object.entries(categories).map(([cat, items]) => ({
        type: 'flex',
        direction: 'column',
        gap: this.themeEngine.getSpacing('sm'),
        children: [
          {
            type: 'paragraph',
            content: cat,
            style: {
              fontWeight: '600',
              fontSize: '12px',
              color: this.themeEngine.getColor('textMuted'),
              textTransform: 'uppercase',
              marginBottom: this.themeEngine.getSpacing('xs')
            }
          },
          {
            type: 'flex',
            direction: 'column',
            gap: this.themeEngine.getSpacing('xs'),
            children: items.map(item => ({
              type: 'button',
              label: item,
              onClick: () => this.addComponentToCanvas(item),
              variant: 'flat',
              style: {
                width: '100%',
                textAlign: 'left',
                cursor: 'grab'
              }
            }))
          }
        ]
      }))
    };
  }

  addComponentToCanvas(componentType) {
    this.emit('componentAdded', { type: componentType });
  }

  buildPropertyInspector(component) {
    if (!component) {
      return {
        type: 'paragraph',
        content: 'Select component to inspect',
        style: { padding: this.themeEngine.getSpacing('lg'), color: this.themeEngine.getColor('textMuted') }
      };
    }

    return {
      type: 'flex',
      direction: 'column',
      gap: this.themeEngine.getSpacing('md'),
      style: { padding: this.themeEngine.getSpacing('lg') },
      children: [
        {
          type: 'heading',
          content: `${component.type} Properties`,
          level: 4
        },
        ...this.buildPropertyFields(component),
        {
          type: 'flex',
          direction: 'row',
          gap: this.themeEngine.getSpacing('sm'),
          style: { marginTop: this.themeEngine.getSpacing('md') },
          children: [
            {
              type: 'button',
              label: 'Delete',
              onClick: () => this.emit('componentDeleted', { id: component.id }),
              variant: 'danger'
            },
            {
              type: 'button',
              label: 'Duplicate',
              onClick: () => this.emit('componentDuplicated', { id: component.id }),
              variant: 'secondary'
            }
          ]
        }
      ]
    };
  }

  buildPropertyFields(component) {
    const commonFields = [
      { name: 'className', label: 'CSS Classes', type: 'text' },
      { name: 'padding', label: 'Padding', type: 'text', hint: 'e.g., "8px" or "md"' },
      { name: 'margin', label: 'Margin', type: 'text', hint: 'e.g., "8px" or "md"' },
      { name: 'width', label: 'Width', type: 'text', hint: 'e.g., "100%" or "200px"' },
      { name: 'height', label: 'Height', type: 'text', hint: 'e.g., "auto" or "200px"' }
    ];

    return commonFields.map(field => ({
      type: 'flex',
      direction: 'column',
      gap: this.themeEngine.getSpacing('xs'),
      children: [
        {
          type: 'paragraph',
          content: field.label,
          style: { fontSize: '12px', fontWeight: '500' }
        },
        {
          type: 'input',
          value: component.props?.[field.name] || '',
          placeholder: field.hint || '',
          onChange: (value) => this.emit('propertyChanged', {
            id: component.id,
            prop: field.name,
            value
          }),
          style: { width: '100%' }
        }
      ]
    }));
  }

  buildLivePreview(component) {
    if (!component) {
      return {
        type: 'flex',
        direction: 'column',
        style: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          background: this.themeEngine.getColor('backgroundLight'),
          padding: this.themeEngine.getSpacing('lg')
        },
        children: [{
          type: 'paragraph',
          content: 'Select or add a component to preview',
          style: { color: this.themeEngine.getColor('textMuted') }
        }]
      };
    }

    return {
      type: 'flex',
      direction: 'column',
      style: {
        flex: 1,
        padding: this.themeEngine.getSpacing('lg'),
        background: this.themeEngine.getColor('background'),
        border: `2px dashed ${this.themeEngine.getColor('border')}`,
        borderRadius: this.themeEngine.getBorderRadius('md')
      },
      children: [component]
    };
  }

  buildCompleteBuilder() {
    return {
      type: 'flex',
      direction: 'row',
      style: { height: '100vh', width: '100%' },
      children: [
        {
          type: 'flex',
          direction: 'column',
          style: {
            width: '250px',
            borderRight: `1px solid ${this.themeEngine.getColor('border')}`,
            overflow: 'auto'
          },
          children: [
            {
              type: 'paragraph',
              content: 'Component Palette',
              style: {
                padding: this.themeEngine.getSpacing('md'),
                fontWeight: '600',
                borderBottom: `1px solid ${this.themeEngine.getColor('border')}`
              }
            },
            this.buildComponentPalette()
          ]
        },
        {
          type: 'flex',
          direction: 'column',
          style: { flex: 1 },
          children: [
            {
              type: 'paragraph',
              content: 'Visual Builder',
              style: {
                padding: this.themeEngine.getSpacing('md'),
                fontWeight: '600',
                borderBottom: `1px solid ${this.themeEngine.getColor('border')}`
              }
            },
            {
              type: 'flex',
              direction: 'row',
              style: { flex: 1 },
              children: [
                {
                  type: 'flex',
                  direction: 'column',
                  style: {
                    flex: 1,
                    padding: this.themeEngine.getSpacing('lg'),
                    overflow: 'auto'
                  },
                  children: [
                    this.buildTemplateSelector(),
                    this.buildPresetSelector()
                  ]
                }
              ]
            }
          ]
        },
        {
          type: 'flex',
          direction: 'column',
          style: {
            width: '300px',
            borderLeft: `1px solid ${this.themeEngine.getColor('border')}`,
            overflow: 'auto'
          },
          children: [
            {
              type: 'paragraph',
              content: 'Properties',
              style: {
                padding: this.themeEngine.getSpacing('md'),
                fontWeight: '600',
                borderBottom: `1px solid ${this.themeEngine.getColor('border')}`
              }
            }
          ]
        }
      ]
    };
  }
}

export const createVisualBuilder = (registry, themeEngine, advancedBuilder) =>
  new VisualBuilderUI(registry, themeEngine, advancedBuilder);
