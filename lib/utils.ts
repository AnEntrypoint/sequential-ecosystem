import fs from 'fs';

/**
 * Get list of available tasks
 * @returns {string[]} Array of task names
 */
export function getAvailableTasks(): string[] {
  const tasksDir = './packages/tasker-sequential/taskcode/endpoints';
  if (!fs.existsSync(tasksDir)) return [];
  
  return fs.readdirSync(tasksDir)
    .filter(file => file.endsWith('.js'))
    .map(file => file.replace('.js', ''));
}

/**
 * Show help information
 */
export function showHelp(): void {
  console.log(`
Sequential Ecosystem - Task execution with automatic suspend/resume

Usage:
  node cli.js start [options]     Start the system
  node cli.js create-task <name>  Create a new task
  node cli.js setup-gapi          Set up GAPI task
  node cli.js init                Initialize environment

Options:
  --port <number>    Port for the server (default: 3000)
  --debug           Enable debug logging
  --help            Show this help
`);
}

/**
 * Initialize project directories
 */
export async function init(): Promise<void> {
  console.log('🚀 Initializing Sequential Ecosystem...');
  
  const dirs = [
    'packages/tasker-sequential/taskcode/endpoints',
    'packages/tasker-sequential/taskcode/boilerplate'
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log('✅ Created directory:', dir);
    }
  }
  
  console.log('\\n✅ Initialization complete!');
  console.log('\\nNext steps:');
  console.log('  1. Start: node cli.js start');
  console.log('  2. Create: node cli.js create-task my-task');
  console.log('  3. GAPI: node cli.js setup-gapi');
}
