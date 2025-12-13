/**
 * Stack and Spacer Layout Components
 * Directional stacking and spacing utilities
 */

export const STACK_SPACER_COMPONENTS = {
  stack: {
    description: 'Vertical stack (flex column) with spacing between items',
    jsxCode: 'React.createElement(\n      \'div\',\n      {\n        style: {\n          display: \'flex\',\n          flexDirection: \'column\',\n          gap: props.gap || \'12px\',\n          width: props.w || \'100%\',\n          alignItems: props.align || \'stretch\',\n          ...props.style\n        }\n      },\n      props.children || \'\'\n    )'
  },

  hstack: {
    description: 'Horizontal stack (flex row) with spacing between items',
    jsxCode: 'React.createElement(\n      \'div\',\n      {\n        style: {\n          display: \'flex\',\n          flexDirection: \'row\',\n          gap: props.gap || \'12px\',\n          alignItems: props.align || \'center\',\n          width: props.w || \'100%\',\n          ...props.style\n        }\n      },\n      props.children || \'\'\n    )'
  },

  divider: {
    description: 'Horizontal or vertical divider line',
    jsxCode: 'React.createElement(\n      \'div\',\n      {\n        style: {\n          width: props.dir === \'v\' ? \'1px\' : \'100%\',\n          height: props.dir === \'v\' ? props.h || \'100%\' : \'1px\',\n          backgroundColor: props.color || \'#e0e0e0\',\n          margin: props.m || \'12px 0\'\n        }\n      }\n    )'
  },

  spacer: {
    description: 'Empty space with flexible width/height',
    jsxCode: 'React.createElement(\n      \'div\',\n      {\n        style: {\n          flex: props.flex || 1,\n          width: props.w,\n          height: props.h,\n          minWidth: props.minW,\n          minHeight: props.minH\n        }\n      }\n    )'
  }
};
