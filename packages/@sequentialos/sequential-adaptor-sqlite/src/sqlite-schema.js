import logger from '@sequentialos/sequential-logging';

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS task_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_identifier TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    input TEXT,
    result TEXT,
    error TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS stack_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_run_id INTEGER NOT NULL REFERENCES task_runs(id),
    parent_stack_run_id INTEGER,
    operation TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    input TEXT,
    result TEXT,
    error TEXT,
    suspended_at TEXT,
    resume_payload TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS task_functions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL,
    metadata TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS keystore (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`,

  'CREATE INDEX IF NOT EXISTS idx_task_runs_identifier ON task_runs(task_identifier)',
  'CREATE INDEX IF NOT EXISTS idx_task_runs_status ON task_runs(status)',
  'CREATE INDEX IF NOT EXISTS idx_stack_runs_task ON stack_runs(task_run_id)',
  'CREATE INDEX IF NOT EXISTS idx_stack_runs_status ON stack_runs(status)',
  'CREATE INDEX IF NOT EXISTS idx_stack_runs_parent ON stack_runs(parent_stack_run_id)'
];

export async function createTables(db) {
  for (const stmt of SCHEMA_STATEMENTS) {
    try {
      db.run(stmt);
    } catch (err) {
      if (!err.message.includes('already exists')) {
        logger.error('Error creating table', { error: err.message, statement: stmt.substring(0, 50) });
      }
    }
  }
}
