/**
 * Basic Layout Components
 * Foundational box, flex, and grid layouts
 */

export const BASIC_LAYOUT_COMPONENTS = {
  box: {
    description: 'Flexible container with padding and styling',
    jsxCode: 'React.createElement(\n      \'div\',\n      {\n        style: {\n          padding: props.p || \'0px\',\n          margin: props.m || \'0px\',\n          backgroundColor: props.bg || \'transparent\',\n          borderRadius: props.r || \'0px\',\n          border: props.border || \'none\',\n          width: props.w || \'auto\',\n          height: props.h || \'auto\',\n          ...props.style\n        }\n      },\n      props.children || \'\'\n    )'
  },

  flex: {
    description: 'Flexbox layout with configurable direction and alignment',
    jsxCode: 'React.createElement(\n      \'div\',\n      {\n        style: {\n          display: \'flex\',\n          flexDirection: props.dir || \'row\',\n          gap: props.gap || \'0px\',\n          alignItems: props.align || \'stretch\',\n          justifyContent: props.justify || \'flex-start\',\n          flexWrap: props.wrap || \'nowrap\',\n          width: props.w || \'100%\',\n          height: props.h || \'auto\',\n          padding: props.p || \'0px\',\n          ...props.style\n        }\n      },\n      props.children || \'\'\n    )'
  },

  grid: {
    description: 'CSS Grid layout with customizable columns and gap',
    jsxCode: 'React.createElement(\n      \'div\',\n      {\n        style: {\n          display: \'grid\',\n          gridTemplateColumns: props.cols || \'repeat(auto-fit, minmax(250px, 1fr))\',\n          gap: props.gap || \'16px\',\n          padding: props.p || \'0px\',\n          width: props.w || \'100%\',\n          ...props.style\n        }\n      },\n      props.children || \'\'\n    )'
  }
};
