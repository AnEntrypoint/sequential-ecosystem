class ThemeCustomizerUI {
  constructor(uiToolkit) {
    this.toolkit = uiToolkit;
    this.currentTheme = this.getDefaultTheme();
    this.presets = this.initializePresets();
    this.listeners = [];
    this.previewElement = null;
  }

  getDefaultTheme() {
    return {
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
        info: '#17a2b8',
        bg: '#ffffff',
        surface: '#f8f9fa',
        border: '#dee2e6',
        text: '#212529',
        textSecondary: '#6c757d'
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
      },
      radius: {
        sm: '2px',
        md: '4px',
        lg: '8px',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px rgba(0,0,0,0.1)',
        lg: '0 10px 15px rgba(0,0,0,0.1)',
        xl: '0 20px 25px rgba(0,0,0,0.15)'
      },
      typography: {
        fontSize: {
          xs: '12px',
          sm: '14px',
          md: '16px',
          lg: '18px',
          xl: '20px',
          xxl: '24px'
        },
        fontWeight: {
          light: 300,
          normal: 400,
          semibold: 600,
          bold: 700
        }
      }
    };
  }

  initializePresets() {
    return {
      light: {
        name: 'Light',
        colors: {
          primary: '#667eea',
          secondary: '#764ba2',
          bg: '#ffffff',
          surface: '#f8f9fa',
          text: '#212529'
        }
      },
      dark: {
        name: 'Dark',
        colors: {
          primary: '#7c3aed',
          secondary: '#8b5cf6',
          bg: '#1e1e1e',
          surface: '#2d2d2d',
          text: '#e0e0e0'
        }
      },
      ocean: {
        name: 'Ocean',
        colors: {
          primary: '#0284c7',
          secondary: '#0369a1',
          success: '#06b6d4',
          bg: '#f0f9ff',
          text: '#164e63'
        }
      },
      forest: {
        name: 'Forest',
        colors: {
          primary: '#15803d',
          secondary: '#166534',
          success: '#22c55e',
          bg: '#f0fdf4',
          text: '#1b4332'
        }
      },
      sunset: {
        name: 'Sunset',
        colors: {
          primary: '#ea580c',
          secondary: '#dc2626',
          warning: '#f59e0b',
          bg: '#fffbeb',
          text: '#92400e'
        }
      }
    };
  }

  applyPreset(presetName) {
    const preset = this.presets[presetName];

    if (!preset) return false;

    Object.assign(this.currentTheme.colors, preset.colors);

    this.notifyListeners('presetApplied', { presetName, theme: this.currentTheme });

    return true;
  }

  updateColor(colorName, value) {
    if (!this.currentTheme.colors.hasOwnProperty(colorName)) {
      return false;
    }

    this.currentTheme.colors[colorName] = value;

    this.notifyListeners('colorUpdated', { colorName, value });

    return true;
  }

  updateSpacing(spacingName, value) {
    if (!this.currentTheme.spacing.hasOwnProperty(spacingName)) {
      return false;
    }

    this.currentTheme.spacing[spacingName] = value;

    this.notifyListeners('spacingUpdated', { spacingName, value });

    return true;
  }

  updateRadius(radiusName, value) {
    if (!this.currentTheme.radius.hasOwnProperty(radiusName)) {
      return false;
    }

    this.currentTheme.radius[radiusName] = value;

    this.notifyListeners('radiusUpdated', { radiusName, value });

    return true;
  }

  generateCSS() {
    let css = ':root {\n';

    Object.entries(this.currentTheme.colors).forEach(([name, value]) => {
      css += `  --color-${this.toKebab(name)}: ${value};\n`;
    });

    Object.entries(this.currentTheme.spacing).forEach(([name, value]) => {
      css += `  --spacing-${name}: ${value};\n`;
    });

    Object.entries(this.currentTheme.radius).forEach(([name, value]) => {
      css += `  --radius-${name}: ${value};\n`;
    });

    Object.entries(this.currentTheme.shadows).forEach(([name, value]) => {
      css += `  --shadow-${name}: ${value};\n`;
    });

    css += '}\n';

    return css;
  }

  buildCustomizerUI() {
    return {
      type: 'box',
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        padding: '20px',
        backgroundColor: '#fafafa'
      },
      children: [
        this.buildControlPanel(),
        this.buildPreviewPanel()
      ]
    };
  }

  buildControlPanel() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px',
        backgroundColor: '#fff',
        borderRadius: '6px',
        maxHeight: 'calc(100vh - 40px)',
        overflow: 'auto'
      },
      children: [
        {
          type: 'heading',
          content: 'Theme Customizer',
          level: 2,
          style: { margin: 0, fontSize: '18px', fontWeight: 700 }
        },
        this.buildPresetSelector(),
        this.buildColorEditor(),
        this.buildSpacingEditor(),
        this.buildRadiusEditor(),
        this.buildExportControls()
      ]
    };
  }

  buildPresetSelector() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      },
      children: [
        {
          type: 'heading',
          content: 'Presets',
          level: 4,
          style: { margin: 0, fontSize: '13px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '6px'
          },
          children: Object.entries(this.presets).map(([key, preset]) => ({
            type: 'button',
            content: preset.name,
            style: {
              padding: '8px 12px',
              backgroundColor: '#e0e0e0',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 400
            }
          }))
        }
      ]
    };
  }

  buildColorEditor() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      },
      children: [
        {
          type: 'heading',
          content: 'Colors',
          level: 4,
          style: { margin: 0, fontSize: '13px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          },
          children: Object.entries(this.currentTheme.colors).map(([name, value]) => ({
            type: 'box',
            style: {
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            },
            children: [
              {
                type: 'text',
                content: this.toLabel(name),
                style: { fontSize: '11px', fontWeight: 500, flex: '0 0 70px' }
              },
              {
                type: 'input',
                value: value,
                style: {
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '11px'
                }
              },
              {
                type: 'box',
                style: {
                  width: '32px',
                  height: '32px',
                  backgroundColor: value,
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }
              }
            ]
          }))
        }
      ]
    };
  }

  buildSpacingEditor() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      },
      children: [
        {
          type: 'heading',
          content: 'Spacing',
          level: 4,
          style: { margin: 0, fontSize: '13px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          },
          children: Object.entries(this.currentTheme.spacing).map(([name, value]) => ({
            type: 'box',
            style: {
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            },
            children: [
              {
                type: 'text',
                content: name,
                style: { fontSize: '11px', fontWeight: 500, flex: '0 0 30px' }
              },
              {
                type: 'input',
                value: value,
                style: {
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '11px'
                }
              }
            ]
          }))
        }
      ]
    };
  }

  buildRadiusEditor() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      },
      children: [
        {
          type: 'heading',
          content: 'Border Radius',
          level: 4,
          style: { margin: 0, fontSize: '13px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          },
          children: Object.entries(this.currentTheme.radius).map(([name, value]) => ({
            type: 'box',
            style: {
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            },
            children: [
              {
                type: 'text',
                content: name,
                style: { fontSize: '11px', fontWeight: 500, flex: '0 0 30px' }
              },
              {
                type: 'input',
                value: value,
                style: {
                  flex: 1,
                  padding: '6px 8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '11px'
                }
              }
            ]
          }))
        }
      ]
    };
  }

  buildExportControls() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        gap: '8px'
      },
      children: [
        {
          type: 'button',
          content: 'Export CSS',
          style: {
            flex: 1,
            padding: '10px 12px',
            backgroundColor: '#667eea',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '12px'
          }
        },
        {
          type: 'button',
          content: 'Export JSON',
          style: {
            flex: 1,
            padding: '10px 12px',
            backgroundColor: '#f0f0f0',
            color: '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }
        }
      ]
    };
  }

  buildPreviewPanel() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        backgroundColor: this.currentTheme.colors.surface,
        borderRadius: '6px',
        maxHeight: 'calc(100vh - 40px)',
        overflow: 'auto'
      },
      children: [
        {
          type: 'heading',
          content: 'Preview',
          level: 3,
          style: { margin: 0, fontSize: '14px', fontWeight: 600 }
        },
        this.buildComponentPreview('button'),
        this.buildComponentPreview('card'),
        this.buildComponentPreview('input'),
        this.buildColorPalette()
      ]
    };
  }

  buildComponentPreview(type) {
    if (type === 'button') {
      return {
        type: 'box',
        style: {
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          padding: '12px',
          backgroundColor: this.currentTheme.colors.bg,
          borderRadius: '6px',
          border: `1px solid ${this.currentTheme.colors.border}`
        },
        children: [
          {
            type: 'button',
            content: 'Primary',
            style: {
              padding: '8px 16px',
              backgroundColor: this.currentTheme.colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: this.currentTheme.radius.md,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600
            }
          },
          {
            type: 'button',
            content: 'Secondary',
            style: {
              padding: '8px 16px',
              backgroundColor: this.currentTheme.colors.secondary,
              color: '#fff',
              border: 'none',
              borderRadius: this.currentTheme.radius.md,
              cursor: 'pointer',
              fontSize: '12px'
            }
          },
          {
            type: 'button',
            content: 'Success',
            style: {
              padding: '8px 16px',
              backgroundColor: this.currentTheme.colors.success,
              color: '#fff',
              border: 'none',
              borderRadius: this.currentTheme.radius.md,
              cursor: 'pointer',
              fontSize: '12px'
            }
          }
        ]
      };
    }

    if (type === 'card') {
      return {
        type: 'box',
        style: {
          padding: this.currentTheme.spacing.md,
          backgroundColor: this.currentTheme.colors.bg,
          borderRadius: this.currentTheme.radius.lg,
          border: `1px solid ${this.currentTheme.colors.border}`,
          boxShadow: this.currentTheme.shadows.md
        },
        children: [
          {
            type: 'heading',
            content: 'Card Title',
            level: 4,
            style: { margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: this.currentTheme.colors.text }
          },
          {
            type: 'paragraph',
            content: 'This is a preview of the card component with the current theme applied.',
            style: { margin: 0, fontSize: '12px', color: this.currentTheme.colors.textSecondary }
          }
        ]
      };
    }

    if (type === 'input') {
      return {
        type: 'box',
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '12px',
          backgroundColor: this.currentTheme.colors.bg,
          borderRadius: '6px',
          border: `1px solid ${this.currentTheme.colors.border}`
        },
        children: [
          {
            type: 'text',
            content: 'Input Label',
            style: { fontSize: '12px', fontWeight: 600, color: this.currentTheme.colors.text }
          },
          {
            type: 'input',
            placeholder: 'Enter text...',
            style: {
              padding: '8px 12px',
              borderRadius: this.currentTheme.radius.md,
              border: `1px solid ${this.currentTheme.colors.border}`,
              fontSize: '12px'
            }
          }
        ]
      };
    }

    return null;
  }

  buildColorPalette() {
    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        backgroundColor: this.currentTheme.colors.bg,
        borderRadius: '6px',
        border: `1px solid ${this.currentTheme.colors.border}`
      },
      children: [
        {
          type: 'text',
          content: 'Color Palette',
          style: { fontSize: '11px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '6px'
          },
          children: Object.entries(this.currentTheme.colors).slice(0, 10).map(([name, value]) => ({
            type: 'box',
            style: {
              width: '100%',
              paddingBottom: '100%',
              position: 'relative',
              backgroundColor: value,
              borderRadius: '4px',
              border: `1px solid ${this.currentTheme.colors.border}`,
              title: name
            }
          }))
        }
      ]
    };
  }

  toLabel(name) {
    return name.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + name.replace(/([A-Z])/g, ' $1').trim().slice(1);
  }

  toKebab(name) {
    return name.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  exportJSON() {
    return JSON.stringify(this.currentTheme, null, 2);
  }

  exportCSS() {
    return this.generateCSS();
  }

  on(event, callback) {
    this.listeners.push({ event, callback });
    return this;
  }

  off(event, callback) {
    this.listeners = this.listeners.filter(
      l => !(l.event === event && l.callback === callback)
    );
    return this;
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(l => l.event === event)
      .forEach(l => {
        try {
          l.callback(data);
        } catch (e) {
          console.error(`Theme customizer listener error for ${event}:`, e);
        }
      });
  }

  clear() {
    this.listeners = [];
    return this;
  }
}

function createThemeCustomizerUI(uiToolkit) {
  return new ThemeCustomizerUI(uiToolkit);
}

export { ThemeCustomizerUI, createThemeCustomizerUI };
