// Pattern library and inspector panels
export function createPatternPalette(patternBridge) {
  const categories = patternBridge.getPatternCategories();

  return {
    type: 'box',
    className: 'pattern-ui-palette',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '12px',
      background: '#1e1e1e',
      borderRadius: '6px',
      height: '100%',
      overflow: 'auto'
    },
    children: [
      {
        type: 'heading',
        content: '🎨 Pattern Library',
        level: 3,
        style: { margin: 0, fontSize: '12px', color: '#e0e0e0', paddingBottom: '8px' }
      },
      {
        type: 'box',
        style: {
          display: 'flex',
          gap: '4px',
          marginBottom: '8px',
          flexWrap: 'wrap'
        },
        children: [
          { type: 'text', content: 'All' },
          ...categories.map(cat => ({
            type: 'text',
            content: cat.charAt(0).toUpperCase() + cat.slice(1),
            className: 'category-filter',
            style: { cursor: 'pointer', fontSize: '10px' }
          }))
        ]
      },
      ...categories.map(category => createCategorySection(patternBridge, category))
    ]
  };
}

function createCategorySection(patternBridge, category) {
  const patterns = patternBridge.getPatternsByCategory(category);

  return {
    type: 'box',
    className: `pattern-category-${category}`,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    children: [
      {
        type: 'heading',
        content: category.charAt(0).toUpperCase() + category.slice(1),
        level: 4,
        style: { margin: 0, fontSize: '10px', color: '#667eea', fontWeight: 600, padding: '6px 0' }
      },
      ...patterns.slice(0, 5).map(pattern => ({
        type: 'box',
        className: 'pattern-item',
        dataset: { patternId: pattern.id || pattern.name },
        style: {
          padding: '8px',
          background: '#2d2d30',
          borderRadius: '4px',
          cursor: 'pointer',
          border: '1px solid #3e3e42',
          transition: 'all 0.2s',
          userSelect: 'none'
        },
        children: [
          {
            type: 'paragraph',
            content: pattern.name,
            style: { margin: '0 0 2px 0', fontSize: '10px', fontWeight: 500, color: '#d4d4d4' }
          },
          {
            type: 'paragraph',
            content: pattern.description || '',
            style: { margin: 0, fontSize: '8px', color: '#858585' }
          }
        ]
      }))
    ]
  };
}

export function createInspectorPanel(patternBridge, componentId) {
  if (!componentId) {
    return {
      type: 'box',
      style: {
        padding: '20px',
        background: '#1e1e1e',
        borderRadius: '6px',
        textAlign: 'center'
      },
      children: [{
        type: 'paragraph',
        content: 'Select a component to inspect',
        style: { margin: 0, color: '#858585', fontSize: '12px' }
      }]
    };
  }

  return patternBridge.buildInspectorPanel(componentId);
}
