// Pattern preview and insertion panel builder
export class PatternPreviewPanel {
  constructor(selectedPattern) {
    this.selectedPattern = selectedPattern;
  }

  buildPatternPreviewPanel() {
    if (!this.selectedPattern) {
      return this.buildEmptyState();
    }

    return {
      type: 'flex',
      direction: 'column',
      gap: '12px',
      style: {
        padding: '16px',
        background: '#fff',
        borderLeft: '1px solid #e0e0e0'
      },
      children: [
        this.buildPatternHeader(),
        this.buildPatternDescription(),
        this.buildPatternTags(),
        this.buildCodeReductionInfo(),
        this.buildInsertButton()
      ]
    };
  }

  buildEmptyState() {
    return {
      type: 'flex',
      direction: 'column',
      gap: '16px',
      style: { padding: '20px', background: '#fff', textAlign: 'center' },
      children: [
        {
          type: 'paragraph',
          content: 'Select a pattern to preview',
          style: { margin: 0, fontSize: '14px', color: '#999' }
        }
      ]
    };
  }

  buildPatternHeader() {
    return {
      type: 'heading',
      content: this.selectedPattern.name,
      level: 3,
      style: { margin: 0, fontSize: '16px' }
    };
  }

  buildPatternDescription() {
    return {
      type: 'paragraph',
      content: this.selectedPattern.description,
      style: { margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.5' }
    };
  }

  buildPatternTags() {
    return {
      type: 'flex',
      direction: 'row',
      gap: '12px',
      style: { flexWrap: 'wrap', marginTop: '8px' },
      children: this.selectedPattern.tags.map(tag => ({
        type: 'box',
        style: {
          padding: '4px 8px',
          background: '#e3f2fd',
          color: '#0078d4',
          borderRadius: '4px',
          fontSize: '11px'
        },
        children: [{ type: 'paragraph', content: tag, style: { margin: 0 } }]
      }))
    };
  }

  buildCodeReductionInfo() {
    return {
      type: 'flex',
      direction: 'row',
      gap: '8px',
      style: { marginTop: '12px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' },
      children: [
        {
          type: 'paragraph',
          content: `Code Reduction: ${this.selectedPattern.codeReduction}`,
          style: { margin: 0, fontSize: '13px', fontWeight: '600', color: '#2e7d32' }
        }
      ]
    };
  }

  buildInsertButton() {
    return {
      type: 'button',
      label: '+ Insert Pattern',
      variant: 'primary',
      style: {
        width: '100%',
        padding: '10px 16px',
        background: '#0078d4',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        marginTop: '12px'
      }
    };
  }
}
