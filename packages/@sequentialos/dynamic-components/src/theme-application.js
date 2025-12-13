// Token resolution and component styling
export class ThemeApplication {
  constructor(tokenManager) {
    this.tokenManager = tokenManager;
  }

  getToken(path) {
    const parts = path.split('.');
    let value = null;

    if (this.tokenManager.designTokens.has(parts[0])) {
      value = this.tokenManager.designTokens.get(parts[0]);

      for (let i = 1; i < parts.length; i++) {
        if (value && typeof value === 'object') {
          value = value[parts[i]];
        } else {
          return null;
        }
      }
    }

    return value;
  }

  applyThemeToComponent(component, themeName = null) {
    const theme = themeName
      ? this.tokenManager.themes.get(themeName)
      : this.tokenManager.themes.get(this.tokenManager.currentTheme);
    if (!theme) return component;

    const tokens = theme.tokens;
    const styled = JSON.parse(JSON.stringify(component));

    if (styled.style) {
      styled.style = this.applyTokensToStyle(styled.style, tokens);
    }

    if (styled.children && Array.isArray(styled.children)) {
      styled.children = styled.children.map(child =>
        this.applyThemeToComponent(child, themeName)
      );
    }

    return styled;
  }

  applyTokensToStyle(style, tokens) {
    const newStyle = { ...style };

    Object.entries(newStyle).forEach(([key, value]) => {
      if (typeof value === 'string' && value.startsWith('token(')) {
        const tokenPath = value.match(/token\(([^)]+)\)/)?.[1];
        if (tokenPath) {
          const tokenValue = this.getToken(tokenPath);
          if (tokenValue !== null) {
            newStyle[key] = tokenValue;
          }
        }
      }
    });

    return newStyle;
  }
}
