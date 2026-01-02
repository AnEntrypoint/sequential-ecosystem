import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const vm = require('../sequential-fetch-vm-lib.cjs');

export default vm;
export const SequentialFetchVM = vm;
