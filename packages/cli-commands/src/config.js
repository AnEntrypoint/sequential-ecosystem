import path from 'path';
import { readJsonFile, writeFileAtomicJson } from '@sequentialos/file-operations';

const CONFIG_FILE = path.join(process.cwd(), '.sequentialrc.json');

export async function loadConfig() {
  return await readJsonFile(CONFIG_FILE, {
    default: { error: `Config file not found: ${CONFIG_FILE}. Run 'sequential-ecosystem init' first.` }
  }).then(config => {
    if (config.error) throw new Error(config.error);
    return config;
  });
}

export async function saveConfig(config) {
  await writeFileAtomicJson(CONFIG_FILE, config);
}

export async function getConfig(key) {
  const config = await loadConfig();
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

export async function setConfig(key, value) {
  const config = await loadConfig();
  const keys = key.split('.');

  let current = config;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }

  current[keys[keys.length - 1]] = value;
  await saveConfig(config);
}

export async function showConfig() {
  const config = await loadConfig();
  console.log('Sequential Ecosystem Configuration:');
  console.log(JSON.stringify(config, null, 2));
}
