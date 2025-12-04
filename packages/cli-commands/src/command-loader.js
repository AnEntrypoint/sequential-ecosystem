import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { register, list, get } from '@sequential/sequential-adaptor';
import { listFiles } from '@sequential/file-operations';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadCommands(commandsDir) {
  const dir = commandsDir || path.join(__dirname, 'commands');
  if (!existsSync(dir)) return;

  const files = await listFiles(dir, { extensions: '.js' });
  for (const file of files) {
    const modulePath = path.join(dir, file);
    const mod = await import(`file://${modulePath}`);
    if (mod.command) {
      register('command', mod.command.name.split(' ')[0], () => mod.command);
    }
  }
}

export function getCommand(name) {
  const factory = get('command', name);
  return factory ? factory() : null;
}

export function listCommands() {
  return list('command');
}
