import { DynamicComponentRegistry, ComponentBuilder } from './core.js';

export const createAppComponentRegistry = () => {
  const registry = new DynamicComponentRegistry();
  const builder = new ComponentBuilder(registry);

  builder.registerBuiltins();

  registry.register('debug-timeline', `
    <div style={{padding: '16px', background: '#f5f5f5', borderRadius: '8px'}}>
      <h3 style={{margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600'}}>Execution Timeline</h3>
      <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap'}}>
        {props.events?.map((e, i) => (
          <div key={i} style={{width: '8px', height: '24px', background: e.type === 'start' ? '#4ade80' : e.type === 'error' ? '#ef4444' : '#3b82f6', borderRadius: '2px'}} title={e.name}/>
        ))}
      </div>
    </div>
  `, {
    category: 'debug',
    description: 'Timeline visualization for task/flow execution events',
    tags: ['debug', 'timeline', 'execution']
  });

  registry.register('metrics-card', `
    <div style={{border: '1px solid #e0e0e0', borderRadius: '8px', padding: '12px'}}>
      <div style={{fontSize: '12px', color: '#666', marginBottom: '4px'}}>{props.label}</div>
      <div style={{fontSize: '24px', fontWeight: '600', color: '#1a1a1a'}}>{props.value}</div>
      {props.unit && <div style={{fontSize: '11px', color: '#999'}}>{props.unit}</div>}
    </div>
  `, {
    category: 'metrics',
    description: 'Single metric display card',
    tags: ['metrics', 'dashboard', 'card']
  });

  registry.register('error-display', `
    <div style={{background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '6px', padding: '12px'}}>
      <div style={{color: '#dc2626', fontWeight: '600', marginBottom: '4px', fontSize: '12px'}}>Error</div>
      <div style={{color: '#991b1b', fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', overflowX: 'auto'}}>{props.message}</div>
      {props.stack && <div style={{color: '#7f1d1d', fontSize: '10px', marginTop: '8px', fontFamily: 'monospace', maxHeight: '150px', overflowY: 'auto', whiteSpace: 'pre-wrap'}}>{props.stack}</div>}
    </div>
  `, {
    category: 'feedback',
    description: 'Error display with message and optional stack trace',
    tags: ['error', 'feedback', 'debug']
  });

  registry.register('success-display', `
    <div style={{background: '#dcfce7', border: '1px solid #86efac', borderRadius: '6px', padding: '12px'}}>
      <div style={{color: '#16a34a', fontWeight: '600', marginBottom: '4px', fontSize: '12px'}}>Success</div>
      <div style={{color: '#166534', fontSize: '12px'}}>{props.message}</div>
    </div>
  `, {
    category: 'feedback',
    description: 'Success message display',
    tags: ['success', 'feedback', 'notification']
  });

  registry.register('loading-spinner', `
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px'}}>
      <div style={{width: '32px', height: '32px', border: '3px solid #e0e0e0', borderTop: '3px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite'}}/>
      {props.message && <div style={{fontSize: '12px', color: '#666'}}>{props.message}</div>}
    </div>
  `, {
    category: 'feedback',
    description: 'Animated loading spinner with optional message',
    tags: ['loading', 'spinner', 'feedback']
  });

  registry.register('button-group', `
    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
      {props.buttons?.map((btn, i) => (
        <button key={i} style={{padding: '8px 16px', borderRadius: '4px', border: 'none', background: btn.variant === 'primary' ? '#667eea' : btn.variant === 'danger' ? '#ef4444' : '#f0f0f0', color: btn.variant === 'primary' || btn.variant === 'danger' ? 'white' : '#1a1a1a', cursor: 'pointer', fontSize: '12px', fontWeight: '600'}}>
          {btn.label}
        </button>
      ))}
    </div>
  `, {
    category: 'forms',
    description: 'Flexible button group with multiple variants',
    tags: ['buttons', 'forms', 'controls']
  });

  registry.register('property-list', `
    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
      {props.items?.map((item, i) => (
        <div key={i} style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e0e0e0'}}>
          <span style={{fontSize: '12px', color: '#666', fontWeight: '500'}}>{item.key}</span>
          <span style={{fontSize: '12px', color: '#1a1a1a', fontFamily: 'monospace'}}>{item.value}</span>
        </div>
      ))}
    </div>
  `, {
    category: 'data',
    description: 'Key-value property list display',
    tags: ['properties', 'data', 'list']
  });

  registry.register('section-header', `
    <div style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0', borderBottom: '2px solid #667eea'}}>
      {props.icon && <span style={{fontSize: '16px'}}>{props.icon}</span>}
      <h2 style={{margin: 0, fontSize: '14px', fontWeight: '600', color: '#1a1a1a'}}>{props.title}</h2>
      {props.badge && <span style={{background: '#f0f0f0', color: '#666', padding: '2px 8px', borderRadius: '12px', fontSize: '10px'}}>{props.badge}</span>}
    </div>
  `, {
    category: 'layout',
    description: 'Section header with optional icon and badge',
    tags: ['headers', 'layout', 'typography']
  });

  registry.register('two-column-layout', `
    <div style={{display: 'grid', gridTemplateColumns: props.ratio || '1fr 2fr', gap: props.gap || '16px'}}>
      <div style={{minWidth: 0}}>{props.left}</div>
      <div style={{minWidth: 0}}>{props.right}</div>
    </div>
  `, {
    category: 'layout',
    description: 'Two-column responsive layout with configurable ratio',
    tags: ['layout', 'grid', 'columns']
  });

  registry.register('code-block', `
    <pre style={{background: '#1e1e1e', color: '#d4d4d4', padding: '12px', borderRadius: '6px', overflowX: 'auto', fontSize: '11px', fontFamily: 'monospace', margin: 0}}>
      <code>{props.code}</code>
    </pre>
  `, {
    category: 'data',
    description: 'Syntax-highlighted code display',
    tags: ['code', 'display', 'debug']
  });

  registry.register('badge', `
    <span style={{background: props.color || '#f0f0f0', color: props.textColor || '#666', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '500', whiteSpace: 'nowrap'}}>
      {props.label}
    </span>
  `, {
    category: 'ui',
    description: 'Colored badge with label',
    tags: ['badge', 'label', 'ui']
  });

  return registry;
};

export class AppComponentLibrary {
  constructor() {
    this.registry = createAppComponentRegistry();
  }

  getComponent(name) {
    return this.registry.components.get(name);
  }

  listByCategory(category) {
    return this.registry.getByCategory(category);
  }

  search(query) {
    return this.registry.search(query);
  }

  register(name, code, options) {
    this.registry.register(name, code, options);
  }

  getRegistry() {
    return this.registry;
  }
}
