import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), '.sequentialrc.json');

export function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    return {
      adaptor: 'default',
      defaults: {}
    };
  }

  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  } catch (e) {
    console.error('Error loading config:', e instanceof Error ? e.message : String(e));
    return {
      adaptor: 'default',
      defaults: {}
    };
  }
}

export function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getConfig(key) {
  const config = loadConfig();
  const keys = key.split('.');

  let value = config;
  for (const k of keys) {
    if (typeof value === 'object' && value !== null && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }

  return value;
}

export function setConfig(key, value) {
  const config = loadConfig();
  const keys = key.split('.');

  let current = config;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }

  current[keys[keys.length - 1]] = value;
  saveConfig(config);
}

export function showConfig() {
  const config = loadConfig();
  console.log('Sequential Ecosystem Configuration:');
  console.log(JSON.stringify(config, null, 2));
}
