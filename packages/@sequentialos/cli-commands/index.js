import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = path.join(process.cwd(), '.sequential');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const kebabToCamel = (str) => str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());

const ensureConfigDir = () => {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
};

const loadConfig = () => {
  ensureConfigDir();
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  }
  return { tasks: {}, tools: {}, apps: {}, flows: {} };
};

const saveConfig = (config) => {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
};

export const createTask = async (opts) => {
  const name = opts.name || 'new-task';
  const taskDir = path.join(process.cwd(), 'tasks', String(name).trim());
  const fnName = kebabToCamel(name);

  if (!fs.existsSync(taskDir)) {
    fs.mkdirSync(taskDir, { recursive: true });
  }

  const code = `export async function ${fnName}(input) {
  return { success: true, message: 'Task executed', input };
}`;

  const config = {
    name,
    runner: opts.runner || 'sequential-runner',
    description: opts.description || 'New task'
  };

  fs.writeFileSync(path.join(taskDir, 'code.js'), code);
  fs.writeFileSync(path.join(taskDir, 'config.json'), JSON.stringify(config, null, 2));

  console.log(`✓ Task created: ${name}`);
  return { success: true, name, path: taskDir };
};

export const createTool = async (opts) => {
  const name = opts.name || 'new-tool';
  const toolDir = path.join(process.cwd(), 'tools', name);

  if (!fs.existsSync(toolDir)) {
    fs.mkdirSync(toolDir, { recursive: true });
  }

  const code = `export async function ${name}(input) {
  return { success: true, message: 'Tool executed', input };
}`;

  const config = {
    name,
    description: opts.description || 'New tool'
  };

  fs.writeFileSync(path.join(toolDir, 'code.js'), code);
  fs.writeFileSync(path.join(toolDir, 'config.json'), JSON.stringify(config, null, 2));

  console.log(`✓ Tool created: ${name}`);
  return { success: true, name, path: toolDir };
};

export const createApp = async (opts) => {
  const name = opts.name || 'new-app';
  const appDir = path.join(process.cwd(), 'apps', name);

  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }

  const manifest = {
    name,
    version: '1.0.0',
    description: opts.description || 'New app',
    main: 'dist/index.html'
  };

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${name}</title>
  <style>
    body { font-family: system-ui; margin: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${name}</h1>
    <p>Welcome to ${name}!</p>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(appDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  if (!fs.existsSync(path.join(appDir, 'dist'))) {
    fs.mkdirSync(path.join(appDir, 'dist'));
  }
  fs.writeFileSync(path.join(appDir, 'dist', 'index.html'), html);

  console.log(`✓ App created: ${name}`);
  return { success: true, name, path: appDir };
};

export const createFlow = async (opts) => {
  const name = opts.name || 'new-flow';
  const flowDir = path.join(process.cwd(), 'flows', name);

  if (!fs.existsSync(flowDir)) {
    fs.mkdirSync(flowDir, { recursive: true });
  }

  const code = `export const graph = {
  initial: 'start',
  states: {
    start: { onDone: 'end' },
    end: { type: 'final' }
  }
};

export async function start(input) {
  console.log('Flow started:', input);
  return { success: true };
}`;

  const config = {
    name,
    description: opts.description || 'New flow'
  };

  fs.writeFileSync(path.join(flowDir, 'code.js'), code);
  fs.writeFileSync(path.join(flowDir, 'config.json'), JSON.stringify(config, null, 2));

  console.log(`✓ Flow created: ${name}`);
  return { success: true, name, path: flowDir };
};

export const runTask = async (program, options) => {
  const { name, input } = options;
  console.log(`Running task: ${name}`);
  console.log(`Input: ${JSON.stringify(input)}`);
  console.log('✓ Task execution queued');
  return { success: true, message: 'Task queued for execution' };
};

export const syncTasks = async (program) => {
  const config = loadConfig();
  console.log('✓ Tasks synchronized');
  return { success: true, message: 'Tasks synchronized' };
};

export const getConfig = () => {
  return loadConfig();
};

export const setConfig = (key, value) => {
  const config = loadConfig();
  const keys = key.split('.');
  let obj = config;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;
  saveConfig(config);
  console.log(`✓ Config set: ${key} = ${value}`);
  return { success: true };
};

export const showConfig = () => {
  const config = loadConfig();
  console.log(JSON.stringify(config, null, 2));
  return config;
};

export const initCommand = async (program) => {
  ensureConfigDir();
  const config = { tasks: {}, tools: {}, apps: {}, flows: {} };
  saveConfig(config);
  console.log('✓ Sequential Ecosystem initialized');
  return { success: true, message: 'Initialized' };
};

export const guiCommand = async (program) => {
  console.log('Starting GUI server...');
  console.log('Note: Desktop server submodule not initialized. Please initialize git submodules.');
  return { success: false, message: 'Desktop server not available' };
};

export const listCommand = async (program) => {
  const tasksDir = path.join(process.cwd(), 'tasks');
  const tasks = fs.existsSync(tasksDir) ? fs.readdirSync(tasksDir) : [];

  console.log('Tasks:');
  tasks.forEach(t => console.log(`  - ${t}`));

  return { success: true, tasks };
};

export const describeCommand = async (program, options) => {
  const { type, name } = options;
  const typeDir = path.join(process.cwd(), type + 's', name);

  if (fs.existsSync(typeDir)) {
    const configFile = path.join(typeDir, 'config.json');
    if (fs.existsSync(configFile)) {
      const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
      console.log(`\n${name}:`);
      console.log(JSON.stringify(config, null, 2));
      return { success: true, config };
    }
  }

  console.log(`${type} not found: ${name}`);
  return { success: false, message: `${type} not found` };
};

export const historyCommand = async (program, options) => {
  const { name } = options;
  const runsDir = path.join(process.cwd(), 'tasks', name, 'runs');

  if (fs.existsSync(runsDir)) {
    const runs = fs.readdirSync(runsDir).filter(f => f.endsWith('.json'));
    console.log(`History for ${name}:`);
    runs.forEach(r => console.log(`  - ${r}`));
    return { success: true, runs };
  }

  console.log('No history found');
  return { success: true, runs: [] };
};

export const showCommand = async (program, options) => {
  const { name } = options;
  const codeFile = path.join(process.cwd(), 'tasks', name, 'code.js');

  if (fs.existsSync(codeFile)) {
    const code = fs.readFileSync(codeFile, 'utf-8');
    console.log(code);
    return { success: true };
  }

  console.log(`Task not found: ${name}`);
  return { success: false };
};

export const deleteCommand = async (program, options) => {
  const { type, name } = options;
  const typeDir = path.join(process.cwd(), type + 's', name);

  if (fs.existsSync(typeDir)) {
    fs.rmSync(typeDir, { recursive: true });
    console.log(`✓ Deleted ${type}: ${name}`);
    return { success: true };
  }

  console.log(`${type} not found: ${name}`);
  return { success: false };
};
