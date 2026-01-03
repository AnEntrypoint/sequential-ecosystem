#!/usr/bin/env node
import { diagnostic } from './src/mcp-diagnostic.js';

await diagnostic.runAllTests();
