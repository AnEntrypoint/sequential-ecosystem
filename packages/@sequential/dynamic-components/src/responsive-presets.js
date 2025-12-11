// Responsive design presets
export class ResponsivePresets {
  static getPresets() {
    return {
      mobileFirst: {
        xs: { display: 'block', width: '100%' },
        md: { display: 'block', width: '100%' },
        lg: { display: 'flex', width: '100%' }
      },
      desktopFirst: {
        xs: { display: 'none' },
        lg: { display: 'block', width: '100%' }
      },
      hideOnMobile: {
        xs: { display: 'none' },
        md: { display: 'block' }
      },
      showOnMobile: {
        xs: { display: 'block' },
        md: { display: 'none' }
      },
      singleColumnOnMobile: {
        xs: { gridTemplateColumns: '1fr' },
        md: { gridTemplateColumns: 'repeat(2, 1fr)' },
        lg: { gridTemplateColumns: 'repeat(3, 1fr)' }
      },
      adaptiveGap: {
        xs: { gap: '8px' },
        sm: { gap: '12px' },
        md: { gap: '16px' },
        lg: { gap: '20px' },
        xl: { gap: '24px' }
      },
      adaptiveTextSize: {
        xs: { fontSize: '12px' },
        sm: { fontSize: '14px' },
        md: { fontSize: '16px' },
        lg: { fontSize: '18px' },
        xl: { fontSize: '20px' }
      },
      adaptivePadding: {
        xs: { padding: '8px' },
        sm: { padding: '12px' },
        md: { padding: '16px' },
        lg: { padding: '20px' },
        xl: { padding: '24px' }
      }
    };
  }

  static getPreset(name) {
    return this.getPresets()[name];
  }

  static getAllPresetNames() {
    return Object.keys(this.getPresets());
  }
}
