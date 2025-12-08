class PatternCustomizer {
  constructor() {
    this.customizations = new Map();
  }

  createCustomization(basePatternId, customId, overrides = {}) {
    const customization = {
      id: customId,
      basePatternId,
      overrides: {
        style: overrides.style || {},
        props: overrides.props || {},
        children: overrides.children || null,
        layout: overrides.layout || null,
        ...overrides
      },
      tags: overrides.tags || [],
      description: overrides.description || `Custom variant of ${basePatternId}`,
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };

    this.customizations.set(customId, customization);
    return customization;
  }

  applyCustomization(pattern, customizationId) {
    const customization = this.customizations.get(customizationId);
    if (!customization || customization.basePatternId !== pattern.id) {
      return pattern;
    }

    return {
      ...pattern,
      definition: this.mergeDefinition(pattern.definition, customization.overrides),
      customizations: [...(pattern.customizations || []), customizationId],
      modified: new Date().toISOString()
    };
  }

  mergeDefinition(definition, overrides) {
    if (overrides.style) {
      definition = {
        ...definition,
        style: { ...definition.style, ...overrides.style }
      };
    }

    if (overrides.props) {
      definition = {
        ...definition,
        ...overrides.props
      };
    }

    if (overrides.children) {
      definition = {
        ...definition,
        children: overrides.children
      };
    }

    return definition;
  }

  createThemeVariant(patternId, variantName, colors) {
    const customId = `${patternId}-${variantName}`;
    return this.createCustomization(patternId, customId, {
      style: {
        color: colors.text,
        background: colors.background,
        borderColor: colors.border
      },
      tags: ['themed', variantName]
    });
  }

  createSizeVariant(patternId, size) {
    const sizeMap = {
      sm: { fontSize: '12px', padding: '4px 8px' },
      md: { fontSize: '14px', padding: '8px 12px' },
      lg: { fontSize: '16px', padding: '12px 16px' },
      xl: { fontSize: '18px', padding: '16px 20px' }
    };

    const customId = `${patternId}-${size}`;
    return this.createCustomization(patternId, customId, {
      style: sizeMap[size] || {},
      tags: ['sized', size]
    });
  }

  createResponsiveVariant(patternId, breakpoint, overrides) {
    const customId = `${patternId}-${breakpoint}`;
    return this.createCustomization(patternId, customId, {
      ...overrides,
      tags: ['responsive', breakpoint]
    });
  }

  getCustomization(id) {
    return this.customizations.get(id);
  }

  getCustomizationsForPattern(patternId) {
    return Array.from(this.customizations.values()).filter(
      c => c.basePatternId === patternId
    );
  }

  updateCustomization(id, updates) {
    const customization = this.customizations.get(id);
    if (!customization) return false;

    customization.overrides = { ...customization.overrides, ...updates };
    customization.modified = new Date().toISOString();
    return true;
  }

  deleteCustomization(id) {
    return this.customizations.delete(id);
  }

  getAllCustomizations() {
    return Array.from(this.customizations.values());
  }

  exportCustomization(id) {
    const customization = this.customizations.get(id);
    return customization ? { ...customization, exportedAt: new Date().toISOString() } : null;
  }

  importCustomization(data) {
    if (!data.id || !data.basePatternId) return false;

    const { id, basePatternId, overrides, tags, description } = data;
    this.createCustomization(basePatternId, id, { ...overrides, tags, description });
    return true;
  }

  clone(sourceId, targetId) {
    const source = this.customizations.get(sourceId);
    if (!source) return false;

    this.customizations.set(targetId, {
      ...source,
      id: targetId,
      created: new Date().toISOString()
    });
    return true;
  }
}

function createPatternCustomizer() {
  return new PatternCustomizer();
}

export { PatternCustomizer, createPatternCustomizer };
