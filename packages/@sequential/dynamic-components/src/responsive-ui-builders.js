// Facade maintaining 100% backward compatibility with responsive UI builders
import { buildResponsiveStack } from './responsive-stack-builder.js';
import { buildBreakpointPreview, buildResponsivePreview } from './responsive-preview-builder.js';
import { buildBreakpointEditor } from './breakpoint-editor-builder.js';

export class ResponsiveUIBuilders {
  constructor(rps, registry) {
    this.rps = rps;
    this.registry = registry;
  }

  buildResponsiveStack(componentName, stackConfig = {}) {
    return buildResponsiveStack(this.rps, this.registry, componentName, stackConfig);
  }

  buildBreakpointPreview() {
    return buildBreakpointPreview(this.rps);
  }

  buildBreakpointEditor(componentName) {
    return buildBreakpointEditor(this.registry, this.rps, componentName);
  }

  buildResponsivePreview(componentName) {
    return buildResponsivePreview(this.registry, componentName);
  }
}
