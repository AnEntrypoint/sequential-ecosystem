import * as events from 'events';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let globalEmitter;

export const emitter = () => {
  if (!globalEmitter) {
    globalEmitter = new events.EventEmitter();
  }
  return globalEmitter;
};

export const logger = (file) => {
  file = file.replace(path.dirname(__dirname), '');
  return (args) => {
    if (!globalEmitter) return;
    globalEmitter.emit('log', file, args);
  };
};
