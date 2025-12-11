// Component code generation and export
export class EditorCodeGenerator {
  generateComponentCode(component, indent = 0) {
    const spaces = '  '.repeat(indent);
    const nextSpaces = '  '.repeat(indent + 1);

    let code = `{\n`;
    code += `${nextSpaces}type: '${component.type}',\n`;

    if (Object.keys(component.props || {}).length > 0) {
      code += `${nextSpaces}props: {\n`;
      Object.entries(component.props).forEach(([key, value]) => {
        const valueStr = typeof value === 'string' ? `'${value}'` : JSON.stringify(value);
        code += `${nextSpaces}  ${key}: ${valueStr},\n`;
      });
      code += `${nextSpaces}},\n`;
    }

    if (component.style && Object.keys(component.style).length > 0) {
      code += `${nextSpaces}style: ${JSON.stringify(component.style)},\n`;
    }

    if (component.content) {
      code += `${nextSpaces}content: '${component.content}',\n`;
    }

    if (component.children && component.children.length > 0) {
      code += `${nextSpaces}children: [\n`;
      component.children.forEach((child, idx) => {
        code += `${this.generateComponentCode(child, indent + 2)}${idx < component.children.length - 1 ? ',' : ''}\n`;
      });
      code += `${nextSpaces}]\n`;
    }

    code += `${spaces}}`;
    return code;
  }

  copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        console.log('Code copied to clipboard');
      });
    }
  }

  exportJSON(component) {
    const json = JSON.stringify(component, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `component-${component.type}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
