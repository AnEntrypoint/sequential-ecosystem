/**
 * native-exporters.js
 *
 * Flutter and SwiftUI native export functionality
 */

import { StringConverters } from './string-converters.js';
import { ExporterTemplates } from './exporter-templates.js';

export class FlutterExporter {
  constructor() {
    this.templates = new ExporterTemplates();
  }

  exportToFlutter(componentDef, options = {}) {
    const componentName = options.componentName || 'Component';
    const className = StringConverters.pascalCase(componentName);

    const widgets = this.templates.generateFlutterWidgets(componentDef);

    const code = `import 'package:flutter/material.dart';\n\n` +
      `class ${className} extends StatelessWidget {\n` +
      `  const ${className}({Key? key}) : super(key: key);\n\n` +
      `  @override\n` +
      `  Widget build(BuildContext context) {\n` +
      `    return ${StringConverters.indent(widgets, 6)};\n` +
      `  }\n` +
      `}\n`;

    return {
      code,
      filename: `${StringConverters.snakeCase(componentName)}.dart`,
      framework: 'flutter',
      dependencies: ['flutter/material.dart']
    };
  }
}

export class SwiftUIExporter {
  constructor() {
    this.templates = new ExporterTemplates();
  }

  exportToSwiftUI(componentDef, options = {}) {
    const componentName = options.componentName || 'Component';
    const structName = StringConverters.pascalCase(componentName);

    const views = this.templates.generateSwiftUIViews(componentDef);

    const code = `import SwiftUI\n\n` +
      `struct ${structName}: View {\n` +
      `  var body: some View {\n` +
      `    ${StringConverters.indent(views, 4)}\n` +
      `  }\n` +
      `}\n\n` +
      `#Preview {\n` +
      `  ${structName}()\n` +
      `}\n`;

    return {
      code,
      filename: `${structName}.swift`,
      framework: 'swift-ui',
      dependencies: ['SwiftUI']
    };
  }
}
