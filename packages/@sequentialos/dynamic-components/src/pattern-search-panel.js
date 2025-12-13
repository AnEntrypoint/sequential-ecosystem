// Pattern search and discovery panel builder
export class PatternSearchPanel {
  constructor(discovery) {
    this.discovery = discovery;
  }

  buildPatternSearchPanel() {
    return {
      type: 'flex',
      direction: 'column',
      gap: '16px',
      style: {
        padding: '16px',
        background: '#f9f9f9',
        borderRight: '1px solid #e0e0e0',
        height: '100%',
        overflowY: 'auto',
        width: '300px'
      },
      children: [
        {
          type: 'heading',
          content: 'Pattern Library',
          level: 3,
          style: { margin: '0 0 12px 0', fontSize: '16px' }
        },
        this.buildSearchBox(),
        this.buildCategorySection(),
        this.buildTagsSection()
      ]
    };
  }

  buildSearchBox() {
    return {
      type: 'flex',
      direction: 'row',
      gap: '8px',
      style: { alignItems: 'center', marginBottom: '12px' },
      children: [
        {
          type: 'paragraph',
          content: '🔍',
          style: { margin: 0, fontSize: '16px' }
        },
        {
          type: 'input',
          placeholder: 'Search patterns...',
          style: {
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '13px'
          }
        }
      ]
    };
  }

  buildCategorySection() {
    return {
      type: 'flex',
      direction: 'column',
      gap: '8px',
      children: [
        {
          type: 'paragraph',
          content: 'Categories',
          style: { margin: 0, fontSize: '12px', fontWeight: '600', color: '#666' }
        },
        ...this.discovery.getCategories().map(cat => ({
          type: 'button',
          label: `${cat} (${this.discovery.filterByCategory(cat).length})`,
          variant: 'secondary',
          style: {
            width: '100%',
            padding: '8px 12px',
            background: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '12px'
          }
        }))
      ]
    };
  }

  buildTagsSection() {
    return {
      type: 'flex',
      direction: 'column',
      gap: '8px',
      style: { marginTop: '12px' },
      children: [
        {
          type: 'paragraph',
          content: 'Popular Tags',
          style: { margin: 0, fontSize: '12px', fontWeight: '600', color: '#666' }
        },
        {
          type: 'flex',
          direction: 'row',
          gap: '6px',
          style: { flexWrap: 'wrap' },
          children: this.discovery.getMostCommonTags(6).map(({ tag }) => ({
            type: 'button',
            label: tag,
            variant: 'secondary',
            style: {
              padding: '6px 10px',
              background: '#e8f5e9',
              border: '1px solid #81c784',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '11px',
              color: '#2e7d32'
            }
          }))
        }
      ]
    };
  }
}
