/**
 * customization-variants.js - Variant factory methods for pattern customization
 *
 * Create theme, size, and responsive variants
 */

export class CustomizationVariants {
  constructor(customizer) {
    this.customizer = customizer;
  }

  createThemeVariant(patternId, variantName, colors) {
    const customId = `${patternId}-${variantName}`;
    return this.customizer.createCustomization(patternId, customId, {
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
    return this.customizer.createCustomization(patternId, customId, {
      style: sizeMap[size] || {},
      tags: ['sized', size]
    });
  }

  createResponsiveVariant(patternId, breakpoint, overrides) {
    const customId = `${patternId}-${breakpoint}`;
    return this.customizer.createCustomization(patternId, customId, {
      ...overrides,
      tags: ['responsive', breakpoint]
    });
  }
}
