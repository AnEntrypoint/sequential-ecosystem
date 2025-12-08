import { AppSDK } from '@sequential/app-sdk';

class ComponentShowcase {
  constructor() {
    this.sdk = AppSDK.init('app-component-showcase');
    this.storage = this.createStorageManager();
    this.currentSection = 'overview';
    this.components = this.buildComponentsData();
    this.templates = this.buildTemplatesData();
    this.presets = this.buildPresetsData();
  }

  createStorageManager() {
    const appId = 'app-component-showcase';
    const stateKey = `app-state:${appId}`;
    const expiryKey = `app-state-expiry:${appId}`;
    return {
      save: (state, ttlMs = null) => {
        try {
          localStorage.setItem(stateKey, JSON.stringify(state));
          if (ttlMs) {
            const expiryTime = Date.now() + ttlMs;
            localStorage.setItem(expiryKey, expiryTime.toString());
          }
        } catch (e) {
          console.error('[Storage] Failed to save:', e);
        }
      },
      load: () => {
        try {
          const expiryTime = localStorage.getItem(expiryKey);
          if (expiryTime && Date.now() > parseInt(expiryTime)) {
            this.clear();
            return null;
          }
          const stateStr = localStorage.getItem(stateKey);
          return stateStr ? JSON.parse(stateStr) : null;
        } catch (e) {
          console.error('[Storage] Failed to load:', e);
          return null;
        }
      },
      clear: () => {
        try {
          localStorage.removeItem(stateKey);
          localStorage.removeItem(expiryKey);
        } catch (e) {
          console.error('[Storage] Failed to clear:', e);
        }
      }
    };
  }

  buildComponentsData() {
    return {
      'Data Visualization': [
        { name: 'chart-container', emoji: '📊', desc: 'Container for rendering charts and visualizations' },
        { name: 'stat-card', emoji: '📈', desc: 'Statistics card with trend indicators' },
        { name: 'progress-ring', emoji: '⭕', desc: 'Circular progress indicator' },
        { name: 'heat-map', emoji: '🔥', desc: 'Heatmap grid visualization' }
      ],
      'Forms': [
        { name: 'rich-textarea', emoji: '📝', desc: 'Enhanced textarea with character count' },
        { name: 'file-uploader', emoji: '📁', desc: 'Drag-and-drop file upload area' },
        { name: 'toggle-switch', emoji: '🔘', desc: 'iOS-style toggle switch' },
        { name: 'multi-select', emoji: '🏷️', desc: 'Tag-based multi-select input' },
        { name: 'radio-group', emoji: '⭕', desc: 'Grouped radio button selection' },
        { name: 'slider', emoji: '▬', desc: 'Range slider with value display' }
      ],
      'Layouts': [
        { name: 'container', emoji: '📦', desc: 'Responsive max-width container' },
        { name: 'panel-group', emoji: '▦▦▦', desc: 'Flexible panel grid layout' },
        { name: 'stack', emoji: '▮▮▮', desc: 'Flex-based vertical stack' },
        { name: 'divider', emoji: '────', desc: 'Visual separator line' },
        { name: 'spacer', emoji: '⬌', desc: 'Flexible spacing element' }
      ],
      'Navigation': [
        { name: 'breadcrumb', emoji: '🏠', desc: 'Breadcrumb trail navigation' },
        { name: 'pagination', emoji: '◀▶', desc: 'Page navigation controls' },
        { name: 'tabs-nav', emoji: '📑', desc: 'Tab navigation bar' },
        { name: 'menu-dropdown', emoji: '▼', desc: 'Dropdown menu component' }
      ],
      'Feedback': [
        { name: 'alert', emoji: '⚠️', desc: 'Alert messages with dismiss' },
        { name: 'skeleton-loader', emoji: '▯▯', desc: 'Loading skeleton animation' },
        { name: 'badge-pill', emoji: '🏷️', desc: 'Pill-shaped status badges' },
        { name: 'tooltip', emoji: '?', desc: 'Hover tooltips with text' },
        { name: 'tag-list', emoji: '✕', desc: 'Removable tag list' }
      ],
      'Utility': [
        { name: 'empty-state', emoji: '📭', desc: 'Empty state placeholder' },
        { name: 'loading-overlay', emoji: '⏳', desc: 'Full-page loading overlay' },
        { name: 'confirmation-dialog', emoji: '❓', desc: 'Confirmation dialog modal' },
        { name: 'expandable-section', emoji: '▼', desc: 'Collapsible section control' }
      ]
    };
  }

  buildTemplatesData() {
    return [
      { title: '📝 Form Template', desc: 'Auto-builds forms from field definitions', saves: '88%', code: '80→10' },
      { title: '📊 Dashboard Template', desc: 'Metrics dashboard with auto-sizing', saves: '93%', code: '120→8' },
      { title: '🎴 Card Grid Template', desc: 'Responsive grid of cards', saves: '85%', code: '100→15' },
      { title: '📋 Header-Content-Footer', desc: 'Standard 3-section layout', saves: '80%', code: 'varies' },
      { title: '📂 Sidebar-Main Layout', desc: 'Sidebar + main content area', saves: '82%', code: 'varies' }
    ];
  }

  buildPresetsData() {
    return [
      { emoji: '☀️', name: 'Light Preset', color: '#ffffff', desc: 'Light theme defaults' },
      { emoji: '🌙', name: 'Dark Preset', color: '#1a1a1a', desc: 'Dark theme defaults' },
      { emoji: '📦', name: 'Compact Preset', color: '#f0f0f0', desc: 'Dense spacing preset' },
      { emoji: '🎨', name: 'Spacious Preset', color: '#f9f9f9', desc: 'Generous spacing preset' }
    ];
  }

  setSection(section) {
    this.currentSection = section;
  }

  buildComponentCard(comp, category) {
    return {
      type: 'box',
      style: {
        background: '#ffffff',
        border: '1px solid #ddd',
        borderRadius: '6px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.2s'
      },
      children: [
        {
          type: 'box',
          style: { background: '#f9f9f9', padding: '12px', borderBottom: '1px solid #ddd', fontSize: '14px', fontWeight: '600', color: '#0078d4' },
          children: [{ type: 'paragraph', content: comp.name, style: { margin: 0 } }]
        },
        {
          type: 'box',
          style: { padding: '16px', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', borderBottom: '1px solid #eee' },
          children: [{ type: 'paragraph', content: `${comp.emoji} ${comp.name}`, style: { margin: 0, fontSize: '14px' } }]
        },
        {
          type: 'box',
          style: { padding: '12px' },
          children: [
            { type: 'paragraph', content: comp.desc, style: { margin: '0 0 8px 0', fontSize: '12px', color: '#666' } },
            {
              type: 'box',
              style: { background: '#e7f0ff', color: '#0078d4', padding: '2px 8px', borderRadius: '3px', display: 'inline-block', fontSize: '10px', fontWeight: '500' },
              children: [{ type: 'paragraph', content: category, style: { margin: 0 } }]
            }
          ]
        }
      ]
    };
  }

  buildComponentsSection() {
    const categories = Object.keys(this.components);
    const children = [];

    categories.forEach(category => {
      children.push({
        type: 'heading',
        content: `${category} (${this.components[category].length} components)`,
        level: 3,
        style: { margin: '20px 0 12px 0', color: '#333', fontSize: '16px' }
      });

      const grid = {
        type: 'flex',
        direction: 'row',
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        },
        children: this.components[category].map(comp => this.buildComponentCard(comp, category))
      };

      children.push(grid);
    });

    return {
      type: 'flex',
      direction: 'column',
      style: { flex: 1, padding: '20px', overflowY: 'auto' },
      children: [
        { type: 'heading', content: 'Component Library', level: 2, style: { margin: '0 0 16px 0', color: '#333' } },
        ...children
      ]
    };
  }

  buildTemplateCard(template) {
    return {
      type: 'box',
      style: {
        background: '#ffffff',
        border: '1px solid #ddd',
        borderRadius: '6px',
        overflow: 'hidden'
      },
      children: [
        {
          type: 'box',
          style: { background: 'linear-gradient(135deg, #0078d4, #106ebe)', color: 'white', padding: '16px', fontWeight: '600', fontSize: '14px' },
          children: [{ type: 'paragraph', content: template.title, style: { margin: 0 } }]
        },
        {
          type: 'flex',
          direction: 'column',
          style: { padding: '16px', gap: '8px' },
          children: [
            { type: 'paragraph', content: template.desc, style: { margin: 0, fontSize: '13px', color: '#666', fontWeight: '500' } },
            { type: 'paragraph', content: `Saves ${template.saves} vs vanilla DOM (${template.code} lines)`, style: { margin: '8px 0 0 0', fontSize: '12px', color: '#999' } },
            {
              type: 'flex',
              gap: '8px',
              style: { marginTop: '12px' },
              children: [
                { type: 'button', label: 'Preview', style: { padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', background: '#0078d4', color: 'white' }, onClick: () => {} },
                { type: 'button', label: 'Code', style: { padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', background: '#e7e7e7', color: '#333' }, onClick: () => {} }
              ]
            }
          ]
        }
      ]
    };
  }

  buildTemplatesSection() {
    return {
      type: 'flex',
      direction: 'column',
      style: { flex: 1, padding: '20px', overflowY: 'auto' },
      children: [
        { type: 'heading', content: 'Pre-built Templates', level: 2, style: { margin: '0 0 12px 0', color: '#333' } },
        { type: 'paragraph', content: 'Ready-to-use templates that reduce code by 50-90%:', style: { margin: '0 0 16px 0', fontSize: '14px', color: '#666' } },
        {
          type: 'flex',
          direction: 'row',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px'
          },
          children: this.templates.map(t => this.buildTemplateCard(t))
        }
      ]
    };
  }

  buildPresetCard(preset) {
    return {
      type: 'box',
      style: {
        background: '#ffffff',
        border: '1px solid #ddd',
        borderRadius: '6px',
        overflow: 'hidden'
      },
      children: [
        {
          type: 'box',
          style: { background: preset.color, padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px', borderBottom: '1px solid #eee' },
          children: [{ type: 'paragraph', content: `${preset.emoji} ${preset.name}`, style: { margin: 0, fontSize: '14px', fontWeight: '600', color: preset.color === '#ffffff' ? '#333' : '#fff' } }]
        },
        {
          type: 'box',
          style: { padding: '12px' },
          children: [
            { type: 'paragraph', content: preset.desc, style: { margin: '0 0 8px 0', fontSize: '12px', color: '#666', fontWeight: '500' } }
          ]
        }
      ]
    };
  }

  buildPresetsSection() {
    return {
      type: 'flex',
      direction: 'column',
      style: { flex: 1, padding: '20px', overflowY: 'auto' },
      children: [
        { type: 'heading', content: 'Style Presets', level: 2, style: { margin: '0 0 12px 0', color: '#333' } },
        { type: 'paragraph', content: 'Reusable style packages that ensure consistency:', style: { margin: '0 0 16px 0', fontSize: '14px', color: '#666' } },
        {
          type: 'flex',
          direction: 'row',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          },
          children: this.presets.map(p => this.buildPresetCard(p))
        }
      ]
    };
  }

  buildOverviewSection() {
    return {
      type: 'flex',
      direction: 'column',
      style: { flex: 1, padding: '20px', overflowY: 'auto' },
      children: [
        {
          type: 'flex',
          direction: 'row',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          },
          children: [
            { type: 'box', style: { background: '#ffffff', padding: '16px', borderRadius: '6px', borderLeft: '4px solid #0078d4', textAlign: 'center' }, children: [{ type: 'paragraph', content: '45+', style: { margin: '0 0 4px 0', fontSize: '28px', fontWeight: '700', color: '#0078d4' } }, { type: 'paragraph', content: 'Components', style: { margin: 0, fontSize: '12px', color: '#666', fontWeight: '500' } }] },
            { type: 'box', style: { background: '#ffffff', padding: '16px', borderRadius: '6px', borderLeft: '4px solid #0078d4', textAlign: 'center' }, children: [{ type: 'paragraph', content: '6', style: { margin: '0 0 4px 0', fontSize: '28px', fontWeight: '700', color: '#0078d4' } }, { type: 'paragraph', content: 'Categories', style: { margin: 0, fontSize: '12px', color: '#666', fontWeight: '500' } }] },
            { type: 'box', style: { background: '#ffffff', padding: '16px', borderRadius: '6px', borderLeft: '4px solid #0078d4', textAlign: 'center' }, children: [{ type: 'paragraph', content: '5', style: { margin: '0 0 4px 0', fontSize: '28px', fontWeight: '700', color: '#0078d4' } }, { type: 'paragraph', content: 'Templates', style: { margin: 0, fontSize: '12px', color: '#666', fontWeight: '500' } }] },
            { type: 'box', style: { background: '#ffffff', padding: '16px', borderRadius: '6px', borderLeft: '4px solid #0078d4', textAlign: 'center' }, children: [{ type: 'paragraph', content: '4', style: { margin: '0 0 4px 0', fontSize: '28px', fontWeight: '700', color: '#0078d4' } }, { type: 'paragraph', content: 'Presets', style: { margin: 0, fontSize: '12px', color: '#666', fontWeight: '500' } }] }
          ]
        },
        {
          type: 'box',
          style: { background: '#ffffff', padding: '20px', borderRadius: '6px', marginBottom: '20px' },
          children: [
            { type: 'heading', content: 'What is Component Showcase?', level: 2, style: { marginTop: 0, marginBottom: '12px', color: '#333', fontSize: '18px' } },
            { type: 'paragraph', content: 'This app provides an interactive preview and configuration system for all components in the dynamic renderer system. Use it to:', style: { margin: '0 0 12px 0', fontSize: '14px', color: '#666' } },
            {
              type: 'flex',
              direction: 'column',
              gap: '8px',
              children: [
                { type: 'paragraph', content: '• Browse Components: View all 45+ components organized by category', style: { margin: 0, fontSize: '13px', color: '#555' } },
                { type: 'paragraph', content: '• Explore Templates: See pre-built templates for common layouts (form, dashboard, etc.)', style: { margin: 0, fontSize: '13px', color: '#555' } },
                { type: 'paragraph', content: '• Test Presets: Preview how different style presets affect component rendering', style: { margin: 0, fontSize: '13px', color: '#555' } },
                { type: 'paragraph', content: '• Generate Code: Export configured components as JSX or JSON', style: { margin: 0, fontSize: '13px', color: '#555' } }
              ]
            }
          ]
        }
      ]
    };
  }

  buildUI() {
    const sectionMap = {
      overview: this.buildOverviewSection(),
      components: this.buildComponentsSection(),
      templates: this.buildTemplatesSection(),
      presets: this.buildPresetsSection()
    };

    return {
      type: 'flex',
      direction: 'column',
      style: {
        height: '100vh',
        background: '#f5f5f5',
        color: '#333',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
        overflow: 'hidden'
      },
      children: [
        {
          type: 'box',
          style: {
            background: '#0078d4',
            color: 'white',
            padding: '20px',
            borderRadius: '6px'
          },
          children: [
            { type: 'heading', content: '🎨 Component Showcase', level: 1, style: { margin: 0, fontSize: '28px', fontWeight: '700' } },
            { type: 'paragraph', content: 'Interactive preview of all 45+ dynamic components with live configuration', style: { margin: '5px 0 0 0', opacity: 0.9, fontSize: '14px' } }
          ]
        },
        {
          type: 'flex',
          style: {
            display: 'flex',
            gap: '10px',
            marginTop: '12px',
            marginBottom: '12px',
            paddingBottom: '10px',
            borderBottom: '1px solid #ddd',
            padding: '12px 16px'
          },
          children: [
            { type: 'button', label: 'Overview', style: { padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '500', borderBottom: this.currentSection === 'overview' ? '3px solid #0078d4' : '3px solid transparent', color: this.currentSection === 'overview' ? '#0078d4' : '#666', transition: 'all 0.2s' }, onClick: () => this.setSection('overview') },
            { type: 'button', label: 'Components', style: { padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '500', borderBottom: this.currentSection === 'components' ? '3px solid #0078d4' : '3px solid transparent', color: this.currentSection === 'components' ? '#0078d4' : '#666', transition: 'all 0.2s' }, onClick: () => this.setSection('components') },
            { type: 'button', label: 'Templates', style: { padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '500', borderBottom: this.currentSection === 'templates' ? '3px solid #0078d4' : '3px solid transparent', color: this.currentSection === 'templates' ? '#0078d4' : '#666', transition: 'all 0.2s' }, onClick: () => this.setSection('templates') },
            { type: 'button', label: 'Presets', style: { padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: '500', borderBottom: this.currentSection === 'presets' ? '3px solid #0078d4' : '3px solid transparent', color: this.currentSection === 'presets' ? '#0078d4' : '#666', transition: 'all 0.2s' }, onClick: () => this.setSection('presets') }
          ]
        },
        sectionMap[this.currentSection] || this.buildOverviewSection()
      ]
    };
  }

  render() {
    return this.buildUI();
  }
}

const showcase = new ComponentShowcase();

export { showcase };
export default showcase;
