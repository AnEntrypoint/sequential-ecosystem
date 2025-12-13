// Register component templates with registry
import {
  dataVisualizationTemplates,
  formComponentTemplates,
  layoutComponentTemplates,
  navigationComponentTemplates,
  feedbackComponentTemplates,
  utilityComponentTemplates
} from './component-templates.js';

const templateMetadata = {
  'chart-container': { category: 'data-visualization', description: 'Chart visualization container' },
  'stat-card': { category: 'data-visualization', description: 'Statistics card with trend' },
  'progress-ring': { category: 'data-visualization', description: 'Circular progress indicator' },
  'heat-map': { category: 'data-visualization', description: 'Heat map visualization' },
  'rich-textarea': { category: 'forms', description: 'Rich textarea with char count' },
  'file-uploader': { category: 'forms', description: 'Drag-drop file uploader' },
  'toggle-switch': { category: 'forms', description: 'Toggle switch component' },
  'multi-select': { category: 'forms', description: 'Multi-select with tags' },
  'radio-group': { category: 'forms', description: 'Radio button group' },
  'slider': { category: 'forms', description: 'Slider input control' },
  'container': { category: 'layouts', description: 'Responsive container' },
  'panel-group': { category: 'layouts', description: 'Flexible panel grid' },
  'stack': { category: 'layouts', description: 'Flexible stack layout' },
  'divider': { category: 'layouts', description: 'Visual divider' },
  'spacer': { category: 'layouts', description: 'Flexible spacer' },
  'breadcrumb': { category: 'navigation', description: 'Breadcrumb navigation' },
  'pagination': { category: 'navigation', description: 'Pagination controls' },
  'tabs-nav': { category: 'navigation', description: 'Tabbed navigation' },
  'menu-dropdown': { category: 'navigation', description: 'Dropdown menu' },
  'alert': { category: 'feedback', description: 'Alert message' },
  'skeleton-loader': { category: 'feedback', description: 'Skeleton loading state' },
  'badge-pill': { category: 'feedback', description: 'Pill-shaped badge' },
  'tooltip': { category: 'feedback', description: 'Tooltip component' },
  'tag-list': { category: 'feedback', description: 'Tag list component' },
  'empty-state': { category: 'utility', description: 'Empty state placeholder' },
  'loading-overlay': { category: 'utility', description: 'Full-page loading overlay' },
  'confirmation-dialog': { category: 'utility', description: 'Confirmation dialog' },
  'expandable-section': { category: 'utility', description: 'Expandable section' }
};

export class ComponentTemplateRegistrar {
  constructor(registry) {
    this.registry = registry;
  }

  registerAll() {
    this.registerTemplates(dataVisualizationTemplates);
    this.registerTemplates(formComponentTemplates);
    this.registerTemplates(layoutComponentTemplates);
    this.registerTemplates(navigationComponentTemplates);
    this.registerTemplates(feedbackComponentTemplates);
    this.registerTemplates(utilityComponentTemplates);
  }

  registerTemplates(templates) {
    Object.entries(templates).forEach(([name, code]) => {
      const meta = templateMetadata[name] || { category: 'general', description: name };
      this.registry.register(name, code, meta);
    });
  }
}
