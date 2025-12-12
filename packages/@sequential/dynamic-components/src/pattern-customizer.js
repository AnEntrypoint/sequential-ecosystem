import { CustomizationVariants } from './customization-variants.js';
import { CustomizationMerger } from './customization-merger.js';

class PatternCustomizer {
  constructor() {
    this.customizations = new Map();
    this.variants = new CustomizationVariants(this);
    this.merger = new CustomizationMerger();
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
    if (!customization) {
      return pattern;
    }
    return this.merger.applyCustomization(pattern, customization);
  }

  mergeDefinition(definition, overrides) {
    return this.merger.mergeDefinition(definition, overrides);
  }

  createThemeVariant(patternId, variantName, colors) {
    return this.variants.createThemeVariant(patternId, variantName, colors);
  }

  createSizeVariant(patternId, size) {
    return this.variants.createSizeVariant(patternId, size);
  }

  createResponsiveVariant(patternId, breakpoint, overrides) {
    return this.variants.createResponsiveVariant(patternId, breakpoint, overrides);
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
