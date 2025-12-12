/**
 * Semantic and Container Layout Components
 * High-level container and semantic elements
 */

export const SEMANTIC_COMPONENTS = {
  container: {
    description: 'Centered container with max-width',
    jsxCode: 'React.createElement(\n      \'div\',\n      {\n        style: {\n          maxWidth: props.max || \'1200px\',\n          margin: \'0 auto\',\n          padding: props.p || \'0 16px\',\n          width: \'100%\',\n          ...props.style\n        }\n      },\n      props.children || \'\'\n    )'
  },

  section: {
    description: 'Semantic section with padding and background',
    jsxCode: 'React.createElement(\n      \'section\',\n      {\n        style: {\n          padding: props.p || \'24px\',\n          backgroundColor: props.bg || \'#fff\',\n          borderRadius: props.r || \'8px\',\n          border: props.border || \'1px solid #e0e0e0\',\n          marginBottom: props.mb || \'16px\',\n          ...props.style\n        }\n      },\n      props.children || \'\'\n    )'
  },

  card: {
    description: 'Card container with shadow and hover effect',
    jsxCode: 'React.createElement(\n      \'div\',\n      {\n        style: {\n          padding: props.p || \'16px\',\n          backgroundColor: props.bg || \'#fff\',\n          borderRadius: props.r || \'8px\',\n          boxShadow: props.shadow || \'0 2px 4px rgba(0,0,0,0.1)\',\n          border: props.border || \'none\',\n          transition: \'all 0.2s\',\n          cursor: props.clickable ? \'pointer\' : \'default\',\n          ...props.style\n        },\n        onMouseEnter: props.onHover ? () => console.log(\'Card hover\') : undefined,\n        ...props.events\n      },\n      props.children || \'\'\n    )'
  }
};
