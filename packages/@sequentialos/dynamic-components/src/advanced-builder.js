// Advanced component builder facade - maintains 100% backward compatibility
import { BuilderTemplates } from './builder-templates.js';
import { BuilderPresets } from './builder-presets.js';
import { BuilderComponents } from './builder-components.js';

export class AdvancedComponentBuilder {
  constructor(registry, themeEngine) {
    this.registry = registry;
    this.themeEngine = themeEngine;
    this.templates = new BuilderTemplates(themeEngine);
    this.presets = new BuilderPresets(themeEngine);
    this.components = new BuilderComponents(themeEngine);
    this.layouts = new Map();
  }

  registerTemplate(name, builder) {
    return this.templates.registerTemplate(name, builder);
  }

  registerPreset(name, config) {
    return this.presets.registerPreset(name, config);
  }

  registerLayout(name, layoutFn) {
    this.layouts.set(name, layoutFn);
    return this;
  }

  buildFormField(field) {
    return this.templates.buildFormField(field);
  }

  buildCard(item) {
    return this.templates.buildCard(item);
  }

  buildFormFromTemplate(fields, templateName = 'form', options = {}) {
    const template = this.templates.getTemplate(templateName);
    if (!template) throw new Error(`Template ${templateName} not found`);
    return template(fields, options);
  }

  buildDashboardFromMetrics(metrics, options = {}) {
    const template = this.templates.getTemplate('dashboard');
    return template(metrics, options);
  }

  buildLayoutWithSidebar(sidebarContent, mainContent, options = {}) {
    const template = this.templates.getTemplate('sidebar-main');
    return template({
      sidebar: sidebarContent,
      main: mainContent,
      ...options
    });
  }

  applyPreset(component, presetName) {
    return this.presets.applyPreset(component, presetName);
  }

  buildResponsiveGrid(items, options = {}) {
    return this.components.buildResponsiveGrid(items, options);
  }

  buildModalOverlay(content, options = {}) {
    return this.components.buildModalOverlay(content, options);
  }

  buildTabInterface(tabs, options = {}) {
    return this.components.buildTabInterface(tabs, options);
  }

  buildDataTable(columns, rows, options = {}) {
    return this.components.buildDataTable(columns, rows, options);
  }

  buildSearchableList(items, options = {}) {
    return this.components.buildSearchableList(items, options);
  }

  buildNotification(message, type = 'info', options = {}) {
    return this.components.buildNotification(message, type, options);
  }

  listTemplates() {
    return this.templates.listTemplates();
  }

  listPresets() {
    return this.presets.listPresets();
  }

  getTemplate(name) {
    return this.templates.getTemplate(name);
  }

  getPreset(name) {
    return this.presets.getPreset(name);
  }
}

export const createAdvancedBuilder = (registry, themeEngine) =>
  new AdvancedComponentBuilder(registry, themeEngine);
