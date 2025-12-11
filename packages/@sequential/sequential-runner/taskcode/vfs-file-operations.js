/**
 * vfs-file-operations.js - File Operations Facade
 *
 * Delegates to focused modules:
 * - write-operations: Write and delete operations
 * - read-operations: Read and stat operations
 * - directory-operations: Directory listing, creation, watching
 */

export { writeFile, deleteFile } from './write-operations.js';
export { readFileContent, fileExists, getFileStat } from './read-operations.js';
export { createDirectory, listDirectory, watchFile } from './directory-operations.js';
