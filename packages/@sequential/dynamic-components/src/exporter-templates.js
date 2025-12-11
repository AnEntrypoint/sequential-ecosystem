// Template generation for different frameworks
import { StringConverters } from './string-converters.js';

export class ExporterTemplates {
  generateReactComponent(componentDef, componentName, useHooks) {
    return `const [state, setState] = useState({});\n\n` +
      `return (\n` +
      StringConverters.indent(`<${componentDef.type || 'div'}>\n` +
        `{/* ${componentName} content */}\n` +
        `</${componentDef.type || 'div'}>`, 4) +
      '\n);\n';
  }

  generateVueTemplate(componentDef) {
    const type = componentDef.type || 'div';
    return `<${type}>\n<!-- Vue template content -->\n</${type}>`;
  }

  generateVueCompositionAPI() {
    return `import { ref } from 'vue';\n\nconst count = ref(0);\n\nconst increment = () => {\n  count.value++;\n};\n`;
  }

  generateVueOptionsAPI() {
    return `export default {\n  data() {\n    return { count: 0 };\n  },\n  methods: {\n    increment() {\n      this.count++;\n    }\n  }\n};\n`;
  }

  generateSvelteTemplate(componentDef) {
    const type = componentDef.type || 'div';
    return `<${type}>\n  <!-- Svelte template content -->\n</${type}>`;
  }

  generateSvelteScript() {
    return `let count = 0;\n\nconst increment = () => {\n  count++;\n};\n`;
  }

  generateAngularTemplate(componentDef) {
    const type = componentDef.type || 'div';
    return `<${type}>\n  <!-- Angular template content -->\n</${type}>`;
  }

  generateAngularStyles(styleObj) {
    return Object.entries(styleObj)
      .map(([key, value]) => `${StringConverters.toCSSProperty(key)}: ${value};`)
      .join('\n');
  }

  generateWebComponentTemplate(componentDef) {
    const type = componentDef.type || 'div';
    return `<${type}><!-- Web Component content --></${type}>`;
  }

  generateWebComponentStyles(styleObj) {
    return Object.entries(styleObj)
      .map(([key, value]) => `${StringConverters.toCSSProperty(key)}: ${value};`)
      .join('\n');
  }

  generateFlutterWidgets(componentDef) {
    return 'Container(\n  child: Text(\'Flutter Widget\'),\n)';
  }

  generateSwiftUIViews(componentDef) {
    return 'VStack {\n    Text("SwiftUI View")\n  }';
  }
}
