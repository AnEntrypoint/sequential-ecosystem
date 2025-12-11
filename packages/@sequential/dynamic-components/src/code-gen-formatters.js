// Format generators for JSX, JSON, TypeScript, Vue output
export class CodeGenFormatters {
  static generateJSX(component, options = {}) {
    const indent = options.indent || 0;
    const spaces = '  '.repeat(indent);
    const nextSpaces = '  '.repeat(indent + 1);

    let jsx = `<${component.type}`;

    if (component.props && Object.keys(component.props).length > 0) {
      Object.entries(component.props).forEach(([key, value]) => {
        if (typeof value === 'string') {
          jsx += ` ${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          if (value) jsx += ` ${key}`;
        } else {
          jsx += ` ${key}={${JSON.stringify(value)}}`;
        }
      });
    }

    if (component.style && Object.keys(component.style).length > 0) {
      jsx += ` style={${JSON.stringify(component.style)}}`;
    }

    if (component.children && component.children.length > 0) {
      jsx += '>\n';
      component.children.forEach(child => {
        jsx += nextSpaces + CodeGenFormatters.generateJSX(child, { ...options, indent: indent + 1 }).trim() + '\n';
      });
      jsx += `${spaces}</${component.type}>`;
    } else if (component.content) {
      jsx += `>${component.content}</${component.type}>`;
    } else {
      jsx += ' />';
    }

    return jsx;
  }

  static generateJSON(component, options = {}) {
    const pretty = options.pretty !== false;
    return JSON.stringify(component, null, pretty ? 2 : 0);
  }

  static generateTypeScript(component, options = {}) {
    const indent = options.indent || 0;
    const spaces = '  '.repeat(indent);
    const nextSpaces = '  '.repeat(indent + 1);
    const typeName = CodeGenFormatters.pascalCase(component.type);

    let ts = `interface ${typeName}Props {\n`;

    if (component.props && Object.keys(component.props).length > 0) {
      Object.entries(component.props).forEach(([key, value]) => {
        const type = CodeGenFormatters.inferTypeScript(value);
        ts += `${nextSpaces}${key}?: ${type};\n`;
      });
    }

    if (component.children && component.children.length > 0) {
      ts += `${nextSpaces}children?: React.ReactNode;\n`;
    }

    ts += `}\n\n`;
    ts += `const ${typeName}: React.FC<${typeName}Props> = (props) => {\n`;
    ts += `${nextSpaces}return (\n`;
    ts += `${nextSpaces}  ${CodeGenFormatters.generateJSX(component, { ...options, indent: indent + 2 })}\n`;
    ts += `${nextSpaces});\n`;
    ts += `};\n\n`;
    ts += `export default ${typeName};`;

    return ts;
  }

  static generateVue(component, options = {}) {
    const indent = options.indent || 0;
    const nextSpaces = '  '.repeat(indent + 1);

    let vue = `<template>\n`;
    vue += nextSpaces + CodeGenFormatters.generateJSX(component, { ...options, indent: indent + 1 }).trim() + '\n';
    vue += `</template>\n\n`;

    vue += `<script setup>\n`;
    if (component.props && Object.keys(component.props).length > 0) {
      vue += `${nextSpaces}defineProps({\n`;
      Object.entries(component.props).forEach(([key]) => {
        vue += `${nextSpaces}  ${key}: [String, Number, Boolean, Object],\n`;
      });
      vue += `${nextSpaces}});\n`;
    }
    vue += `</script>\n\n`;

    vue += `<style scoped>\n`;
    vue += `${nextSpaces}/* Add component styles here */\n`;
    vue += `</style>`;

    return vue;
  }

  static inferTypeScript(value) {
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'any[]';
    if (typeof value === 'object') return 'Record<string, any>';
    return 'any';
  }

  static pascalCase(str) {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}
