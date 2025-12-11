// UI components for version management
export class VersionUIBuilder {
  constructor(versionManager) {
    this.versionManager = versionManager;
  }

  buildVersionTimeline(patternName) {
    const versions = this.listVersionsSummary(patternName);

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: `Version History: ${patternName}`,
          level: 4,
          style: { margin: 0, fontSize: '14px', fontWeight: 600 }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          },
          children: versions.map((v, idx) => ({
            type: 'box',
            style: {
              padding: '12px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px'
            },
            children: [
              {
                type: 'heading',
                content: `v${idx + 1} • ${new Date(v.createdAt).toLocaleDateString()}`,
                level: 5,
                style: { margin: '0 0 4px 0', fontSize: '12px', fontWeight: 600 },
                children: [
                  v.isStable && {
                    type: 'text',
                    content: ' [STABLE]',
                    style: { color: '#28a745', fontWeight: 600 }
                  },
                  v.isDeprecated && {
                    type: 'text',
                    content: ' [DEPRECATED]',
                    style: { color: '#dc3545', fontWeight: 600 }
                  }
                ].filter(Boolean)
              },
              {
                type: 'text',
                content: v.message || 'No message',
                style: { margin: 0, color: '#666' }
              }
            ].filter(Boolean)
          }))
        }
      ]
    };
  }

  buildVersionSelector(patternName) {
    const versions = this.listVersionsSummary(patternName);

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      },
      children: [
        {
          type: 'heading',
          content: 'Select Version',
          level: 5,
          style: { margin: 0, fontSize: '12px', fontWeight: 600 }
        },
        {
          type: 'select',
          value: this.versionManager.currentVersions.get(patternName)?.id || '',
          style: {
            padding: '6px 8px',
            fontSize: '12px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          },
          children: versions.map((v, idx) => ({
            type: 'option',
            value: v.id,
            content: `v${idx + 1} - ${new Date(v.createdAt).toLocaleDateString()} ${v.isStable ? '[S]' : ''}`
          }))
        }
      ]
    };
  }

  listVersionsSummary(patternName) {
    return (this.versionManager.versions.get(patternName) || []).map(v => ({
      id: v.id,
      patternName: v.patternName,
      createdAt: v.metadata.createdAt,
      createdBy: v.metadata.createdBy,
      message: v.metadata.message,
      tags: v.tags,
      isStable: v.isStable,
      isDeprecated: v.isDeprecated
    }));
  }
}
