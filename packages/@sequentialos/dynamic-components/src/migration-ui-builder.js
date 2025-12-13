/**
 * migration-ui-builder.js - Migration UI construction
 *
 * Build migration status and version display UI
 */

export class MigrationUIBuilder {
  constructor(registry, versionEngine) {
    this.registry = registry;
    this.versionEngine = versionEngine;
  }

  buildMigrationUI() {
    const versions = this.versionEngine.getSortedVersions();

    return {
      type: 'box',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '12px',
        background: '#1e1e1e',
        borderRadius: '6px'
      },
      children: [
        {
          type: 'heading',
          content: '📦 Pattern Migrations',
          level: 3,
          style: {
            margin: 0,
            fontSize: '12px',
            color: '#e0e0e0',
            textTransform: 'uppercase'
          }
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            gap: '12px'
          },
          children: [
            this.buildVersionCard('Current Version', this.registry.currentVersion, '#667eea'),
            this.buildVersionCard('Available Migrations', this.registry.migrations.size.toString(), '#4ade80')
          ]
        },
        {
          type: 'box',
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          },
          children: versions.slice(0, 5).map(version => {
            const migration = this.registry.getMigration(version);
            return {
              type: 'box',
              style: {
                padding: '8px 12px',
                background: '#2d2d30',
                borderRadius: '4px',
                borderLeft: '3px solid #667eea'
              },
              children: [
                {
                  type: 'paragraph',
                  content: `v${version}${migration.rollback ? ' (reversible)' : ''}`,
                  style: {
                    margin: 0,
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#d4d4d4'
                  }
                },
                {
                  type: 'paragraph',
                  content: migration.description,
                  style: {
                    margin: '2px 0 0 0',
                    fontSize: '9px',
                    color: '#858585'
                  }
                }
              ]
            };
          })
        }
      ]
    };
  }

  buildVersionCard(label, value, color) {
    return {
      type: 'box',
      style: {
        padding: '8px 12px',
        background: '#2d2d30',
        borderRadius: '4px'
      },
      children: [
        {
          type: 'paragraph',
          content: label,
          style: { margin: 0, fontSize: '9px', color: '#858585' }
        },
        {
          type: 'heading',
          content: value,
          level: 4,
          style: { margin: '4px 0 0 0', fontSize: '12px', color }
        }
      ]
    };
  }
}
