// Theme export and import functionality
export class ThemePersistence {
  constructor(tokenManager) {
    this.tokenManager = tokenManager;
  }

  exportTheme(themeName = null) {
    const name = themeName || this.tokenManager.currentTheme;
    const theme = this.tokenManager.themes.get(name);

    if (!theme) return null;

    return {
      name: theme.name,
      created: new Date(theme.created).toISOString(),
      updated: new Date(theme.updated).toISOString(),
      tokens: theme.tokens,
      exportedAt: new Date().toISOString()
    };
  }

  exportAllThemes() {
    const themes = {};
    this.tokenManager.themes.forEach((theme, name) => {
      themes[name] = this.exportTheme(name);
    });
    return themes;
  }

  importTheme(themeData) {
    if (!themeData.name || !themeData.tokens) return false;

    this.tokenManager.registerTheme(themeData.name, themeData.tokens);
    return true;
  }
}
