// App UI component builders
export class AppUIBuilders {
  buildAppCard(app, deleteCallback) {
    return {
      type: 'box',
      style: {
        background: '#252526',
        border: '1px solid #3e3e42',
        borderRadius: '6px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s'
      },
      children: [
        {
          type: 'flex',
          style: {
            padding: '16px',
            borderBottom: '1px solid #3e3e42',
            alignItems: 'center',
            gap: '12px'
          },
          children: [
            { type: 'paragraph', content: app.icon || '📦', style: { fontSize: '32px', margin: 0 } },
            {
              type: 'flex',
              direction: 'column',
              style: { flex: 1, gap: '4px' },
              children: [
                { type: 'paragraph', content: app.name, style: { margin: 0, fontSize: '14px', fontWeight: '600' } },
                { type: 'paragraph', content: app.id, style: { margin: 0, fontSize: '11px', color: '#858585' } }
              ]
            },
            app.builtin ? {
              type: 'box',
              style: { background: '#0e639c', color: 'white', padding: '2px 6px', borderRadius: '2px', fontSize: '10px' },
              children: [{ type: 'paragraph', content: 'Built-in', style: { margin: 0 } }]
            } : null
          ].filter(Boolean)
        },
        {
          type: 'box',
          style: { padding: '12px 16px', flex: 1 },
          children: [
            { type: 'paragraph', content: app.description || 'No description', style: { margin: '0 0 12px 0', fontSize: '12px', color: '#858585' } },
            {
              type: 'flex',
              gap: '12px',
              style: { fontSize: '11px', color: '#858585' },
              children: [
                { type: 'paragraph', content: `v${app.version || '1.0.0'}`, style: { margin: 0 } },
                !app.builtin ? { type: 'paragraph', content: '👤 User', style: { margin: 0 } } : null
              ].filter(Boolean)
            }
          ]
        },
        {
          type: 'flex',
          style: { padding: '12px 16px', borderTop: '1px solid #3e3e42', gap: '6px', flexWrap: 'wrap' },
          children: [
            { type: 'button', label: '▶️ Run', style: { background: '#0e639c', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '2px', cursor: 'pointer', fontSize: '11px', flex: 1, minWidth: '60px' }, onClick: () => window.open(`/apps/${app.id}/dist/index.html`, '_blank') },
            { type: 'button', label: '✏️ Edit', style: { background: '#0e639c', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '2px', cursor: 'pointer', fontSize: '11px', flex: 1, minWidth: '60px' }, onClick: () => alert('Edit app coming soon') },
            !app.builtin ? { type: 'button', label: '🗑️ Delete', style: { background: '#3e3e42', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '2px', cursor: 'pointer', fontSize: '11px', flex: 1, minWidth: '60px' }, onClick: () => deleteCallback(app.id, app.name) } : null
          ].filter(Boolean)
        }
      ]
    };
  }

  buildAppsGrid(apps) {
    if (apps.length === 0) {
      return {
        type: 'box',
        style: { textAlign: 'center', padding: '40px', color: '#858585' },
        children: [
          { type: 'paragraph', content: '📭', style: { fontSize: '48px', marginBottom: '12px', margin: 0 } },
          { type: 'paragraph', content: 'No apps. Create one!', style: { fontSize: '14px', margin: 0 } }
        ]
      };
    }

    return {
      type: 'flex',
      direction: 'row',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px'
      },
      children: apps
    };
  }

  buildCreateModal(visible, formData, updateFn, submitFn, closeFn) {
    return {
      type: 'box',
      style: {
        position: 'fixed',
        inset: 0,
        background: visible ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: visible ? 'auto' : 'none'
      },
      children: [
        {
          type: 'box',
          style: {
            background: '#252526',
            border: '1px solid #3e3e42',
            borderRadius: '6px',
            padding: '20px',
            maxWidth: '500px',
            width: '90%',
            opacity: visible ? 1 : 0
          },
          children: [
            { type: 'heading', content: 'Create New App', level: 2, style: { margin: '0 0 16px 0', fontSize: '16px' } },
            {
              type: 'flex',
              direction: 'column',
              gap: '16px',
              children: [
                { type: 'box', children: [{ type: 'paragraph', content: 'App ID *', style: { margin: 0, fontSize: '12px', color: '#858585' } }, { type: 'input', value: formData.id, placeholder: 'app-my-app', style: { width: '100%', background: '#3e3e42', border: '1px solid #555', color: '#e0e0e0', padding: '6px 8px', borderRadius: '3px', fontSize: '12px' }, onChange: (e) => updateFn('id', e.target.value) }] },
                { type: 'box', children: [{ type: 'paragraph', content: 'App Name *', style: { margin: 0, fontSize: '12px', color: '#858585' } }, { type: 'input', value: formData.name, placeholder: 'My App', style: { width: '100%', background: '#3e3e42', border: '1px solid #555', color: '#e0e0e0', padding: '6px 8px', borderRadius: '3px', fontSize: '12px' }, onChange: (e) => updateFn('name', e.target.value) }] },
                { type: 'box', children: [{ type: 'paragraph', content: 'Description', style: { margin: 0, fontSize: '12px', color: '#858585' } }, { type: 'input', value: formData.description, placeholder: 'What does your app do?', style: { width: '100%', background: '#3e3e42', border: '1px solid #555', color: '#e0e0e0', padding: '6px 8px', borderRadius: '3px', fontSize: '12px' }, onChange: (e) => updateFn('description', e.target.value) }] },
                { type: 'box', children: [{ type: 'paragraph', content: 'Icon', style: { margin: 0, fontSize: '12px', color: '#858585' } }, { type: 'input', value: formData.icon, placeholder: '🚀', style: { width: '100%', background: '#3e3e42', border: '1px solid #555', color: '#e0e0e0', padding: '6px 8px', borderRadius: '3px', fontSize: '12px' }, onChange: (e) => updateFn('icon', e.target.value) }] }
              ]
            },
            {
              type: 'flex',
              gap: '8px',
              style: { marginTop: '16px', justifyContent: 'flex-end' },
              children: [
                { type: 'button', label: 'Cancel', style: { background: '#3e3e42', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }, onClick: closeFn },
                { type: 'button', label: 'Create', style: { background: '#0e639c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }, onClick: submitFn }
              ]
            }
          ]
        }
      ]
    };
  }
}
