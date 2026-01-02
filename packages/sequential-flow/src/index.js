import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const edgeFunctions = require('../lib/edge-functions.cjs');

export default edgeFunctions;
export const SequentialFlow = edgeFunctions;
