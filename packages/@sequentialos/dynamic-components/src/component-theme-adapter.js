// Component theming and style application
export class ComponentThemeAdapter {
  constructor(themeEngine) {
    this.themeEngine = themeEngine;
  }

  getComponentStyles(componentType) {
    const theme = this.themeEngine.getCurrentTheme();
    const styles = {
      heading: {
        color: this.themeEngine.getColor('text'),
        fontFamily: theme.typography.fontFamily,
        fontWeight: theme.typography.fontWeight.semibold,
        lineHeight: theme.typography.lineHeight.tight
      },
      button: {
        background: this.themeEngine.getColor('primary'),
        color: 'white',
        padding: this.themeEngine.getSpacing('sm'),
        borderRadius: this.themeEngine.getBorderRadius('md'),
        fontWeight: theme.typography.fontWeight.semibold,
        border: 'none',
        cursor: 'pointer'
      },
      input: {
        background: this.themeEngine.getColor('backgroundLight'),
        color: this.themeEngine.getColor('text'),
        border: '1px solid',
        padding: this.themeEngine.getSpacing('sm'),
        borderRadius: this.themeEngine.getBorderRadius('md'),
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.fontSize.base
      },
      card: {
        background: this.themeEngine.getColor('backgroundLight'),
        border: '1px solid',
        borderRadius: this.themeEngine.getBorderRadius('lg'),
        padding: this.themeEngine.getSpacing('lg')
      },
      section: {
        background: this.themeEngine.getColor('background'),
        padding: this.themeEngine.getSpacing('lg'),
        borderRadius: this.themeEngine.getBorderRadius('lg'),
        border: '1px solid'
      }
    };
    return styles[componentType] || {};
  }

  applyThemeToProps(componentType, props) {
    const styles = this.getComponentStyles(componentType);
    return { ...props, style: { ...styles, ...(props.style || {}) } };
  }

  buildThemedComponent(componentType, props) {
    return this.applyThemeToProps(componentType, props);
  }
}
