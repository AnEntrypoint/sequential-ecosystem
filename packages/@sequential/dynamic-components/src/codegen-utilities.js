// Code generation utilities and transformations
export class CodegenUtilities {
  toCSSProperty(jsName) {
    return jsName.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  kebabCase(str) {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  }

  pascalCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  formatStyleValue(value) {
    if (typeof value === 'number') {
      return value > 100 ? `${value}px` : value;
    }
    return value;
  }

  indent(text, spaces = 2) {
    const indentation = ' '.repeat(spaces);
    return text.split('\n').map(line => indentation + line).join('\n');
  }

  styleObjToString(styleObj) {
    return Object.entries(styleObj)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => {
        const jsKey = this.toCamelCase(key);
        const formattedValue = typeof value === 'string' ? `'${value}'` : value;
        return `${jsKey}: ${formattedValue}`;
      })
      .join(', ');
  }
}
