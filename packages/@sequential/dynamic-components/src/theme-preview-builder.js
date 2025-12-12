// Theme preview UI
export class ThemePreviewBuilder {
  constructor(theme) {
    this.theme = theme;
  }

  buildPreview() {
    return {
      type: 'card',
      variant: 'elevated',
      style: {
        width: '300px',
        padding: this.theme.getSpacing('lg'),
        overflow: 'auto'
      },
      children: [
        { type: 'heading', content: 'Preview', level: 3, style: { margin: 0, marginBottom: this.theme.getSpacing('md') } },
        {
          type: 'flex',
          direction: 'column',
          gap: this.theme.getSpacing('md'),
          children: [
            {
              type: 'button',
              label: 'Primary Button',
              variant: 'primary',
              style: { width: '100%' }
            },
            {
              type: 'button',
              label: 'Secondary Button',
              variant: 'secondary',
              style: { width: '100%' }
            },
            {
              type: 'card',
              variant: 'flat',
              style: { padding: this.theme.getSpacing('md') },
              children: [
                { type: 'heading', content: 'Card Preview', level: 4, style: { margin: 0, marginBottom: this.theme.getSpacing('sm') } },
                { type: 'paragraph', content: 'This is a preview of how your theme looks.', style: { margin: 0, fontSize: '12px' } }
              ]
            },
            {
              type: 'flex',
              direction: 'column',
              gap: this.theme.getSpacing('sm'),
              style: { marginTop: this.theme.getSpacing('md') },
              children: [
                { type: 'paragraph', content: 'Text Color', style: { margin: 0 } },
                { type: 'paragraph', content: 'Muted Text Color', style: { margin: 0, color: this.theme.getColor('textMuted') } }
              ]
            }
          ]
        }
      ]
    };
  }
}
