// UI components for data inspection and binding editing
export class DataUIBuilder {
  constructor(dataStore, bindings) {
    this.dataStore = dataStore;
    this.bindings = bindings;
  }

  buildDataInspector() {
    const entries = Array.from(this.dataStore.dataStore.entries());

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#fafafa',
        height: '100%',
        overflow: 'auto'
      },
      children: [
        {
          type: 'heading',
          content: 'Data Inspector',
          level: 3,
          style: { margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          },
          children: entries.map(([key, value]) => ({
            type: 'box',
            style: {
              padding: '12px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'monospace'
            },
            children: [
              {
                type: 'text',
                content: `${key}:`,
                style: { fontSize: '11px', fontWeight: 600, marginBottom: '4px' }
              },
              {
                type: 'text',
                content: JSON.stringify(value).substring(0, 100),
                style: { fontSize: '10px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis' }
              }
            ]
          }))
        }
      ]
    };
  }

  buildBindingEditor() {
    const bindingsList = Array.from(this.bindings.values());

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#fafafa'
      },
      children: [
        {
          type: 'heading',
          content: 'Data Bindings',
          level: 3,
          style: { margin: 0, fontSize: '14px', fontWeight: 700 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          },
          children: bindingsList.map(binding => ({
            type: 'box',
            style: {
              padding: '12px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px'
            },
            children: [
              {
                type: 'text',
                content: `${binding.source} → ${binding.target}`,
                style: { fontSize: '11px', fontWeight: 600, marginBottom: '4px' }
              },
              {
                type: 'box',
                style: {
                  display: 'flex',
                  gap: '8px',
                  fontSize: '10px',
                  color: '#666',
                  flexWrap: 'wrap'
                },
                children: [
                  { type: 'text', content: `ID: ${binding.id}` },
                  binding.bidirectional ? { type: 'text', content: '↔ Bidirectional' } : null,
                  binding.transform ? { type: 'text', content: '🔄 Transform' } : null,
                  binding.debounce ? { type: 'text', content: `⏱ Debounce ${binding.debounce}ms` } : null
                ].filter(Boolean)
              }
            ]
          }))
        }
      ]
    };
  }
}
