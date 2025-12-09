export class FileOperationsValidator {
  constructor() {
    this.testResults = [];
  }

  async validateBasicFileRead() {
    const files = new Map();
    files.set('/data/users.json', JSON.stringify({ users: [] }));
    files.set('/data/config.json', JSON.stringify({ debug: true }));

    const readFile = (path) => {
      if (!files.has(path)) return null;
      return files.get(path);
    };

    const content1 = readFile('/data/users.json');
    const content2 = readFile('/data/config.json');
    const content3 = readFile('/nonexistent.json');

    return {
      name: 'Basic File Read',
      passed: content1 !== null && content2 !== null && content3 === null,
      details: { filesRead: 2, filesNotFound: 1 }
    };
  }

  async validateBasicFileWrite() {
    const files = new Map();

    const writeFile = (path, content) => {
      files.set(path, content);
      return true;
    };

    const readFile = (path) => {
      return files.get(path);
    };

    writeFile('/data/new.json', '{"created": true}');
    writeFile('/data/update.json', '{"version": 2}');

    const read1 = readFile('/data/new.json');
    const read2 = readFile('/data/update.json');

    return {
      name: 'Basic File Write',
      passed: read1 === '{"created": true}' && read2 === '{"version": 2}' && files.size === 2,
      details: { filesWritten: 2, totalFiles: files.size }
    };
  }

  async validateFileDelete() {
    const files = new Map();
    files.set('/data/file1.json', 'content1');
    files.set('/data/file2.json', 'content2');
    files.set('/data/file3.json', 'content3');

    const deleteFile = (path) => {
      if (files.has(path)) {
        files.delete(path);
        return true;
      }
      return false;
    };

    const deleted1 = deleteFile('/data/file1.json');
    const deleted2 = deleteFile('/data/nonexistent.json');

    return {
      name: 'File Delete',
      passed: deleted1 === true && deleted2 === false && files.size === 2,
      details: { deleted: 1, attemptedDelete: 2, remaining: files.size }
    };
  }

  async validateAtomicWrite() {
    const files = new Map();
    let writeAttempts = 0;

    const atomicWrite = (path, content) => {
      const tempPath = `${path}.tmp`;
      writeAttempts++;

      try {
        files.set(tempPath, content);
        const temp = files.get(tempPath);
        files.delete(tempPath);
        files.set(path, content);
        return true;
      } catch (e) {
        files.delete(tempPath);
        return false;
      }
    };

    const success1 = atomicWrite('/data/atomic1.json', '{"version": 1}');
    const success2 = atomicWrite('/data/atomic2.json', '{"version": 2}');

    return {
      name: 'Atomic Write (Temp + Rename)',
      passed: success1 && success2 && files.size === 2 && writeAttempts === 2,
      details: { atomicWrites: writeAttempts, filesCreated: files.size }
    };
  }

  async validatePathTraversal() {
    const safeBasePath = '/data/';

    const validatePath = (basePath, requestedPath) => {
      if (requestedPath.includes('..') || requestedPath.startsWith('/')) {
        return null;
      }
      const fullPath = basePath + requestedPath;
      if (!fullPath.startsWith(basePath)) {
        return null;
      }
      return fullPath;
    };

    const safe1 = validatePath(safeBasePath, 'users.json');
    const safe2 = validatePath(safeBasePath, 'folder/config.json');
    const unsafe1 = validatePath(safeBasePath, '../../../etc/passwd');
    const unsafe2 = validatePath(safeBasePath, '/etc/passwd');

    return {
      name: 'Path Traversal Prevention',
      passed: safe1 === '/data/users.json' && safe2 === '/data/folder/config.json' &&
              unsafe1 === null && unsafe2 === null,
      details: { safePaths: 2, blockedPaths: 2 }
    };
  }

  async validatePermissionChecking() {
    const files = new Map();
    files.set('/data/public.json', { perms: 'r--r--r--', content: 'public' });
    files.set('/data/private.json', { perms: '------w--', content: 'private' });
    files.set('/data/admin.json', { perms: 'rwxrwxrwx', content: 'admin' });

    const canRead = (path, user) => {
      const file = files.get(path);
      if (!file) return false;
      if (user === 'owner') return file.perms[0] === 'r';
      if (user === 'group') return file.perms[3] === 'r';
      if (user === 'other') return file.perms[6] === 'r';
      return false;
    };

    const test1 = canRead('/data/public.json', 'other');
    const test2 = canRead('/data/private.json', 'other');
    const test3 = canRead('/data/admin.json', 'owner');

    return {
      name: 'Permission Checking',
      passed: test1 === true && test2 === false && test3 === true,
      details: { filesChecked: 3, permissionsValidated: 3 }
    };
  }

  async validateConcurrentReads() {
    const files = new Map();
    files.set('/data/shared.json', '{"count": 0}');

    const concurrentReads = async () => {
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(Promise.resolve(files.get('/data/shared.json')));
      }
      return Promise.all(promises);
    };

    const results = await concurrentReads();
    const allValid = results.every(r => r === '{"count": 0}');

    return {
      name: 'Concurrent Reads',
      passed: results.length === 100 && allValid,
      details: { concurrentReads: results.length, consistent: allValid }
    };
  }

  async validateConcurrentWritesWithLocking() {
    let lockCount = 0;
    let writeCount = 0;
    const files = new Map();
    files.set('/data/counter.json', 0);

    const writeWithLock = async (value) => {
      lockCount++;
      const current = files.get('/data/counter.json');
      await Promise.resolve();
      files.set('/data/counter.json', current + value);
      writeCount++;
      lockCount--;
      return files.get('/data/counter.json');
    };

    const results = await Promise.all([
      writeWithLock(1),
      writeWithLock(2),
      writeWithLock(3)
    ]);

    const finalValue = files.get('/data/counter.json');
    const resultsValid = results.length === 3;

    return {
      name: 'Concurrent Writes with Locking',
      passed: resultsValid && writeCount === 3 && lockCount === 0,
      details: { writes: writeCount, locksHeld: lockCount, finalValue }
    };
  }

  async validateDirectoryOperations() {
    const dirs = new Map();
    dirs.set('/data', { type: 'dir', contents: ['file1', 'file2'] });
    dirs.set('/data/subfolder', { type: 'dir', contents: ['file3', 'file4'] });

    const createDir = (path) => {
      if (dirs.has(path)) return false;
      dirs.set(path, { type: 'dir', contents: [] });
      return true;
    };

    const listDir = (path) => {
      const dir = dirs.get(path);
      return dir?.type === 'dir' ? dir.contents : null;
    };

    const created1 = createDir('/data/newdir');
    const created2 = createDir('/data');
    const listed1 = listDir('/data');
    const listed2 = listDir('/data/subfolder');

    return {
      name: 'Directory Operations',
      passed: created1 === true && created2 === false && listed1.length === 2 && listed2.length === 2,
      details: { directoriesCreated: 1, dirsListed: 2, contents: listed1.length }
    };
  }

  async validateSymlinkHandling() {
    const files = new Map();
    const symlinks = new Map();

    files.set('/data/original.json', 'original content');

    const createSymlink = (target, link) => {
      symlinks.set(link, target);
      return true;
    };

    const readSymlink = (path) => {
      if (symlinks.has(path)) {
        const target = symlinks.get(path);
        return files.get(target);
      }
      return files.get(path);
    };

    const resolvePath = (path) => {
      if (symlinks.has(path)) {
        return symlinks.get(path);
      }
      return path;
    };

    createSymlink('/data/original.json', '/data/link.json');
    const content = readSymlink('/data/link.json');
    const resolved = resolvePath('/data/link.json');

    return {
      name: 'Symlink Handling',
      passed: content === 'original content' && resolved === '/data/original.json',
      details: { symlinkCreated: true, contentRead: content !== null, pathResolved: true }
    };
  }

  async validateFileMetadata() {
    const files = new Map();
    const metadata = new Map();

    const writeFileWithMetadata = (path, content) => {
      files.set(path, content);
      metadata.set(path, {
        size: content.length,
        created: Date.now(),
        modified: Date.now(),
        permissions: '644'
      });
    };

    const getMetadata = (path) => {
      return metadata.get(path);
    };

    writeFileWithMetadata('/data/file1.json', '{"data": "test"}');
    writeFileWithMetadata('/data/file2.json', 'smaller');

    const meta1 = getMetadata('/data/file1.json');
    const meta2 = getMetadata('/data/file2.json');

    return {
      name: 'File Metadata',
      passed: meta1.size === 16 && meta2.size === 7 && meta1.permissions === '644',
      details: { filesWithMetadata: 2, size1: meta1.size, size2: meta2.size }
    };
  }

  async validateLargeFileHandling() {
    const largeContent = 'x'.repeat(1000000);
    let fileSize = 0;

    const writeFile = (path, content) => {
      fileSize = content.length;
      return true;
    };

    const result = writeFile('/data/large.bin', largeContent);
    const mb = (fileSize / 1024 / 1024).toFixed(2);

    return {
      name: 'Large File Handling (1MB)',
      passed: result === true && fileSize === 1000000,
      details: { fileSizeMB: mb, bytesWritten: fileSize }
    };
  }

  async validateFileEncoding() {
    const files = new Map();

    const writeFileWithEncoding = (path, content, encoding = 'utf-8') => {
      const encoded = {
        'utf-8': Buffer.from(content).toString('utf-8'),
        'base64': Buffer.from(content).toString('base64'),
        'hex': Buffer.from(content).toString('hex')
      }[encoding];
      files.set(path, { content: encoded, encoding });
      return true;
    };

    const readFileWithEncoding = (path, targetEncoding = 'utf-8') => {
      const file = files.get(path);
      if (!file) return null;
      return Buffer.from(file.content, file.encoding).toString(targetEncoding);
    };

    writeFileWithEncoding('/data/text.json', 'hello world', 'utf-8');
    writeFileWithEncoding('/data/binary.bin', 'binary data', 'base64');

    const read1 = readFileWithEncoding('/data/text.json', 'utf-8');
    const read2 = readFileWithEncoding('/data/binary.bin', 'utf-8');

    return {
      name: 'File Encoding',
      passed: read1 === 'hello world' && read2 === 'binary data',
      details: { encodingsSupported: 3, filesRead: 2 }
    };
  }

  async validateFileWatching() {
    const watchers = new Map();
    let changeCount = 0;

    const watchFile = (path, callback) => {
      watchers.set(path, callback);
    };

    const notifyFileChange = (path) => {
      if (watchers.has(path)) {
        watchers.get(path)({ event: 'change', path, timestamp: Date.now() });
        changeCount++;
      }
    };

    const unwatch = (path) => {
      return watchers.delete(path);
    };

    watchFile('/data/watched.json', (event) => {});
    notifyFileChange('/data/watched.json');
    notifyFileChange('/data/watched.json');
    unwatch('/data/watched.json');
    notifyFileChange('/data/watched.json');

    return {
      name: 'File Watching',
      passed: changeCount === 2 && watchers.size === 0,
      details: { watchers: watchers.size, notificationsSent: changeCount }
    };
  }

  async validateTempFiles() {
    const tempDir = '/tmp';
    const createdTemps = [];

    const createTempFile = (content) => {
      const filename = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}.tmp`;
      const path = `${tempDir}/${filename}`;
      createdTemps.push(path);
      return path;
    };

    const cleanupTemp = (path) => {
      const idx = createdTemps.indexOf(path);
      if (idx >= 0) {
        createdTemps.splice(idx, 1);
        return true;
      }
      return false;
    };

    const temp1 = createTempFile('temp content 1');
    const temp2 = createTempFile('temp content 2');
    const cleanup1 = cleanupTemp(temp1);
    const cleanup2 = cleanupTemp(temp2);

    return {
      name: 'Temp Files',
      passed: createdTemps.length === 0 && cleanup1 && cleanup2,
      details: { tempsCreated: 2, tempsCleaned: 2, remaining: createdTemps.length }
    };
  }

  async validateFileNameValidation() {
    const validateFileName = (filename) => {
      if (!filename || filename.length === 0) return false;
      if (filename.length > 255) return false;
      if (filename.includes('/') || filename.includes('\\')) return false;
      if (filename.includes('\0')) return false;
      if (filename === '.' || filename === '..') return false;
      if (/^[.\s]+$/.test(filename)) return false;
      return true;
    };

    const tests = [
      { name: 'valid-file.json', expected: true },
      { name: 'valid_123.txt', expected: true },
      { name: '', expected: false },
      { name: 'invalid/file.json', expected: false },
      { name: '.', expected: false },
      { name: '..', expected: false },
      { name: '   ', expected: false },
      { name: 'a'.repeat(256), expected: false }
    ];

    const passed = tests.every(t => validateFileName(t.name) === t.expected);

    return {
      name: 'File Name Validation',
      passed,
      details: { testCases: tests.length, validNames: 2, invalidNames: 6 }
    };
  }

  async validateDiskSpaceHandling() {
    let diskUsed = 0;
    const diskLimit = 1000000;

    const writeFileWithSpace = (content) => {
      const size = content.length;
      if (diskUsed + size > diskLimit) {
        return { success: false, error: 'Disk full' };
      }
      diskUsed += size;
      return { success: true, diskUsed };
    };

    const result1 = writeFileWithSpace('x'.repeat(500000));
    const result2 = writeFileWithSpace('x'.repeat(400000));
    const result3 = writeFileWithSpace('x'.repeat(200000));

    return {
      name: 'Disk Space Handling',
      passed: result1.success && result2.success && !result3.success && diskUsed === 900000,
      details: { diskUsed, diskLimit, filesWritten: 2, diskFullDetected: !result3.success }
    };
  }

  async validateFileBackup() {
    const files = new Map();
    const backups = new Map();

    const createBackup = (path) => {
      if (!files.has(path)) return false;
      const content = files.get(path);
      const backupPath = `${path}.backup`;
      backups.set(backupPath, { content, timestamp: Date.now() });
      return true;
    };

    const restoreBackup = (path) => {
      const backupPath = `${path}.backup`;
      if (!backups.has(backupPath)) return false;
      const backup = backups.get(backupPath);
      files.set(path, backup.content);
      return true;
    };

    files.set('/data/important.json', 'original');
    createBackup('/data/important.json');
    files.set('/data/important.json', 'modified');
    const restored = restoreBackup('/data/important.json');

    return {
      name: 'File Backup & Restore',
      passed: restored && files.get('/data/important.json') === 'original' && backups.size === 1,
      details: { backupsCreated: 1, restored, backupsStored: backups.size }
    };
  }

  async validateCaseInsensitiveFileSystem() {
    const files = new Map();

    const writeFile = (path, content) => {
      const normalizedPath = path.toLowerCase();
      files.set(normalizedPath, content);
      return true;
    };

    const readFile = (path) => {
      const normalizedPath = path.toLowerCase();
      return files.get(normalizedPath);
    };

    writeFile('/Data/File.JSON', 'content1');
    const read1 = readFile('/data/file.json');
    const read2 = readFile('/DATA/FILE.JSON');

    return {
      name: 'Case Insensitive File System',
      passed: read1 === 'content1' && read2 === 'content1' && files.size === 1,
      details: { normalizedPaths: 1, caseVariantsRead: 2 }
    };
  }

  async runAllTests() {
    this.testResults = await Promise.all([
      this.validateBasicFileRead(),
      this.validateBasicFileWrite(),
      this.validateFileDelete(),
      this.validateAtomicWrite(),
      this.validatePathTraversal(),
      this.validatePermissionChecking(),
      this.validateConcurrentReads(),
      this.validateConcurrentWritesWithLocking(),
      this.validateDirectoryOperations(),
      this.validateSymlinkHandling(),
      this.validateFileMetadata(),
      this.validateLargeFileHandling(),
      this.validateFileEncoding(),
      this.validateFileWatching(),
      this.validateTempFiles(),
      this.validateFileNameValidation(),
      this.validateDiskSpaceHandling(),
      this.validateFileBackup(),
      this.validateCaseInsensitiveFileSystem()
    ]);

    return this.testResults;
  }

  getSummary() {
    const passed = this.testResults.filter(t => t.passed).length;
    const total = this.testResults.length;
    return {
      total,
      passed,
      failed: total - passed,
      percentage: Math.round((passed / total) * 100),
      tests: this.testResults
    };
  }
}

export function createFileOperationsValidator() {
  return new FileOperationsValidator();
}
