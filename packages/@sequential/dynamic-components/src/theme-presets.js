// Default theme presets
export class ThemePresets {
  static getDefaultThemes() {
    const shared = {
      typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: { xs: '11px', sm: '12px', base: '14px', lg: '16px', xl: '18px', '2xl': '24px' },
        fontWeight: { light: '300', normal: '400', medium: '500', semibold: '600', bold: '700' },
        lineHeight: { tight: '1.2', normal: '1.5', relaxed: '1.75' }
      },
      spacing: { xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '20px', '2xl': '24px', '3xl': '32px' },
      borderRadius: { none: '0', sm: '2px', md: '4px', lg: '8px', xl: '12px', full: '999px' },
      shadows: { sm: '0 1px 2px rgba(0, 0, 0, 0.05)', md: '0 4px 6px rgba(0, 0, 0, 0.1)', lg: '0 10px 15px rgba(0, 0, 0, 0.1)', xl: '0 20px 25px rgba(0, 0, 0, 0.1)' },
      transitions: { fast: '0.15s ease-in-out', base: '0.2s ease-in-out', slow: '0.3s ease-in-out' }
    };

    return {
      default: {
        colors: {
          primary: '#667eea', secondary: '#764ba2', success: '#48bb78', warning: '#f6ad55', danger: '#ef4444',
          info: '#3b82f6', text: '#1a1a1a', textLight: '#666666', textMuted: '#999999',
          background: '#ffffff', backgroundLight: '#f5f5f5', border: '#e0e0e0', borderLight: '#f0f0f0'
        },
        ...shared
      },
      dark: {
        colors: {
          primary: '#8b5cf6', secondary: '#a78bfa', success: '#34d399', warning: '#fbbf24', danger: '#f87171',
          info: '#60a5fa', text: '#e0e0e0', textLight: '#999999', textMuted: '#666666',
          background: '#1a1a1a', backgroundLight: '#2d2d30', border: '#3e3e42', borderLight: '#555555'
        },
        ...shared
      },
      light: {
        colors: {
          primary: '#0e639c', secondary: '#1177bb', success: '#16a34a', warning: '#d97706', danger: '#dc2626',
          info: '#2563eb', text: '#0f0f0f', textLight: '#4b5563', textMuted: '#8b8b8b',
          background: '#fafafa', backgroundLight: '#ffffff', border: '#d1d5db', borderLight: '#e5e7eb'
        },
        ...shared
      }
    };
  }
}
