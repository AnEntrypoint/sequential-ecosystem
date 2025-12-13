/**
 * customization-merger.js - Definition merging for customizations
 *
 * Apply customization overrides to pattern definitions
 */

export class CustomizationMerger {
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

  applyCustomization(pattern, customization) {
    if (customization.basePatternId !== pattern.id) {
      return pattern;
    }

    return {
      ...pattern,
      definition: this.mergeDefinition(pattern.definition, customization.overrides),
      customizations: [...(pattern.customizations || []), customization.id],
      modified: new Date().toISOString()
    };
  }

  mergeMultiple(pattern, customizations) {
    let result = pattern;
    for (const customization of customizations) {
      if (customization.basePatternId === pattern.id) {
        result = {
          ...result,
          definition: this.mergeDefinition(result.definition, customization.overrides),
          customizations: [...(result.customizations || []), customization.id],
          modified: new Date().toISOString()
        };
      }
    }
    return result;
  }
}
