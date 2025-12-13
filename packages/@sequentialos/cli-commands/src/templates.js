export function generateGitignore() {
  return `# Development
*.log
*.db
.env
.env.local
.env.*.local
node_modules/
dist/
build/

# Task Database Files
tasks-dev.db
tasks-test.db
*.db-shm
*.db-wal

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
Thumbs.db

# Build Artifacts
.next/
.nuxt/
.cache/
.turbo/
.vercel/

# Test Coverage
coverage/
.nyc_output/

# Logs
logs/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Task Runs (optional - uncomment to track)
# tasks/*/runs/
`;
}

export function generateSequentialrc() {
  return {
    version: '1.0.0',
    adaptor: 'folder',
    adaptors: {
      folder: {
        type: 'folder',
        basePath: './tasks',
        description: 'Default file-based storage (Git-friendly)'
      },
      sqlite: {
        type: 'sqlite',
        path: './tasks.db',
        description: 'Single-machine SQLite database',
        maxConnections: 5
      },
      postgresql: {
        type: 'postgresql',
        connectionString: 'postgresql://user:password@localhost/sequential',
        description: 'Distributed PostgreSQL storage',
        maxConnections: 20,
        ssl: false
      },
      supabase: {
        type: 'postgresql',
        connectionString: 'postgresql://[user]:[password]@[project].supabase.co:5432/postgres',
        description: 'Supabase PostgreSQL (managed)',
        ssl: true
      }
    },
    storage: {
      folder: {
        type: 'folder',
        basePath: './tasks'
      }
    },
    server: {
      port: 3000,
      host: 'localhost',
      corsOrigin: '*'
    },
    task: {
      timeout: 300000,
      retryCount: 3,
      retryDelay: 1000,
      maxConcurrent: 10
    },
    execution: {
      verbose: false,
      dryRun: false
    }
  };
}
