class PatternStorage {
  constructor() {
    this.storageKey = 'sequential-pattern-library';
  }

  saveComposition(composition) {
    const compositions = this.getAllCompositions();
    const idx = compositions.findIndex(c => c.id === composition.id);
    if (idx > -1) {
      compositions[idx] = composition;
    } else {
      compositions.push(composition);
    }
    this.setData('compositions', compositions);
    return composition;
  }

  deleteComposition(compositionId) {
    const compositions = this.getAllCompositions();
    const filtered = compositions.filter(c => c.id !== compositionId);
    this.setData('compositions', filtered);
    return true;
  }

  getAllCompositions() {
    return this.getData('compositions') || [];
  }

  getComposition(compositionId) {
    const compositions = this.getAllCompositions();
    return compositions.find(c => c.id === compositionId);
  }

  saveVariant(variant) {
    const variants = this.getAllVariants();
    const idx = variants.findIndex(v => v.id === variant.id);
    if (idx > -1) {
      variants[idx] = variant;
    } else {
      variants.push(variant);
    }
    this.setData('variants', variants);
    return variant;
  }

  deleteVariant(variantId) {
    const variants = this.getAllVariants();
    const filtered = variants.filter(v => v.id !== variantId);
    this.setData('variants', filtered);
    return true;
  }

  getAllVariants() {
    return this.getData('variants') || [];
  }

  getVariant(variantId) {
    const variants = this.getAllVariants();
    return variants.find(v => v.id === variantId);
  }

  getVariantsByPattern(patternId) {
    const variants = this.getAllVariants();
    return variants.filter(v => v.basePatternId === patternId);
  }

  saveTemplate(template) {
    const templates = this.getAllTemplates();
    const idx = templates.findIndex(t => t.id === template.id);
    if (idx > -1) {
      templates[idx] = template;
    } else {
      templates.push(template);
    }
    this.setData('templates', templates);
    return template;
  }

  deleteTemplate(templateId) {
    const templates = this.getAllTemplates();
    const filtered = templates.filter(t => t.id !== templateId);
    this.setData('templates', filtered);
    return true;
  }

  getAllTemplates() {
    return this.getData('templates') || [];
  }

  getTemplate(templateId) {
    const templates = this.getAllTemplates();
    return templates.find(t => t.id === templateId);
  }

  exportAllData() {
    return {
      compositions: this.getAllCompositions(),
      variants: this.getAllVariants(),
      templates: this.getAllTemplates(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  importData(data) {
    try {
      if (data.compositions) {
        this.setData('compositions', data.compositions);
      }
      if (data.variants) {
        this.setData('variants', data.variants);
      }
      if (data.templates) {
        this.setData('templates', data.templates);
      }
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  clearAll() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (e) {
      console.error('Clear failed:', e);
      return false;
    }
  }

  getStats() {
    return {
      compositions: this.getAllCompositions().length,
      variants: this.getAllVariants().length,
      templates: this.getAllTemplates().length,
      totalSize: JSON.stringify(this.getData('root') || {}).length
    };
  }

  getData(key) {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return null;
      const parsed = JSON.parse(data);
      return key ? parsed[key] : parsed;
    } catch (e) {
      console.error('Get data failed:', e);
      return null;
    }
  }

  setData(key, value) {
    try {
      const data = this.getData('root') || {};
      data[key] = value;
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Set data failed:', e);
      return false;
    }
  }
}

function createPatternStorage() {
  return new PatternStorage();
}
