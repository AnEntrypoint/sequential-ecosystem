import path from 'path';
import { writeFileAtomicString } from '@sequentialos/file-operations';
import logger from '@sequentialos/sequential-logging';

export async function createExampleConfigs(rootDir) {
  const configs = [
    {
      name: '.sequentialrc.example.json',
      description: 'Default folder-based storage',
      content: {
        adaptor: 'folder',
        defaults: {
          timeout: 300000,
          maxRetries: 3
        }
      }
    },
    {
      name: '.sequentialrc.sqlite.json',
      description: 'SQLite database storage',
      content: {
        adaptor: 'sqlite',
        database: 'sequential.db',
        defaults: {
          timeout: 300000,
          maxRetries: 3
        },
        sqlite: {
          pragma: 'journal_mode = WAL'
        }
      }
    },
    {
      name: '.sequentialrc.postgres.json',
      description: 'PostgreSQL database storage',
      content: {
        adaptor: 'postgres',
        database: {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 5432,
          user: process.env.DB_USER || 'sequential',
          password: process.env.DB_PASSWORD || 'password',
          database: process.env.DB_NAME || 'sequential_ecosystem'
        },
        defaults: {
          timeout: 300000,
          maxRetries: 3
        }
      }
    },
    {
      name: '.env.example',
      description: 'Environment variables template',
      content: `# Sequential Ecosystem Configuration
# Copy this to .env and update with your values

# Storage Backend
STORAGE_TYPE=folder
# STORAGE_TYPE=sqlite
# STORAGE_TYPE=postgres

# For SQLite
# DB_PATH=./sequential.db

# For PostgreSQL
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=sequential
# DB_PASSWORD=your-password
# DB_NAME=sequential_ecosystem

# Server
PORT=3000
HOST=localhost
DEBUG=false

# Features
HOT_RELOAD=true
ENABLE_COMPONENTS=true
ENABLE_FLOWS=true

# Security
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Timeouts
TASK_TIMEOUT=300000
FETCH_TIMEOUT=30000

# Logging
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=false
REQUEST_LOG_THRESHOLD=1000
`
    }
  ];

  for (const config of configs) {
    const filePath = path.join(rootDir, config.name);
    const content = typeof config.content === 'string'
      ? config.content
      : JSON.stringify(config.content, null, 2);

    await writeFileAtomicString(filePath, content);
    logger.info(`  ✓ Created ${config.name} (${config.description})`);
  }
}
