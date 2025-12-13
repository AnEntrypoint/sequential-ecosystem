// UI components for theme visualization and switching
export class ThemeUIBuilder {
  constructor(tokenManager) {
    this.tokenManager = tokenManager;
  }

  buildThemeSwitcher() {
    const themeNames = Array.from(this.tokenManager.themes.keys());

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '🎨 Theme Selector',
          level: 3,
          style: {
            margin: 0,
            fontSize: '12px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        {
          type: 'box',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '6px'
          },
          children: themeNames.map(name => ({
            type: 'box',
            style: {
              padding: '8px 12px',
              background: this.tokenManager.currentTheme === name ? '#667eea' : '#2d2d30',
              borderRadius: '4px',
              cursor: 'pointer',
              border: this.tokenManager.currentTheme === name ? '1px solid #667eea' : '1px solid #3e3e42',
              fontSize: '10px',
              color: this.tokenManager.currentTheme === name ? '#fff' : '#d4d4d4'
            },
            children: [{
              type: 'paragraph',
              content: name.charAt(0).toUpperCase() + name.slice(1),
              style: { margin: 0 }
            }]
          }))
        }
      ]
    };
  }

  buildDesignTokensPanel() {
    const groups = Array.from(this.tokenManager.tokenGroups.keys());

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '🎛️ Design Tokens',
          level: 3,
          style: {
            margin: 0,
            fontSize: '12px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        ...groups.map(group => {
          const groupTokens = this.tokenManager.designTokens.get(group);
          return {
            type: 'box',
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              padding: '8px',
              background: '#2d2d30',
              borderRadius: '4px'
            },
            children: [
              {
                type: 'heading',
                content: group.charAt(0).toUpperCase() + group.slice(1),
                level: 4,
                style: {
                  margin: 0,
                  fontSize: '10px',
                  color: '#667eea'
                }
              },
              ...Object.entries(groupTokens).slice(0, 3).map(([token, value]) => ({
                type: 'paragraph',
                content: `${token}: ${this.tokenToString(value)}`,
                style: {
                  margin: 0,
                  fontSize: '8px',
                  color: '#858585',
                  fontFamily: 'monospace',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }
              }))
            ]
          };
        })
      ]
    };
  }

  tokenToString(value) {
    if (typeof value === 'string') {
      return value;
    } else if (typeof value === 'object') {
      return JSON.stringify(value).substring(0, 30) + '...';
    }
    return String(value);
  }
}
