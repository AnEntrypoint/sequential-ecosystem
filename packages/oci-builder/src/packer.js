import * as fs from 'fs';
import * as _path from 'path';
import {PassThrough, Readable, Transform} from 'stream';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

import {logger} from './emitter.js';
import * as walker from './walker.js';

const __filename = fileURLToPath(import.meta.url);
const log = logger(__filename);
const require = createRequire(import.meta.url);

const Header = require('tar/lib/header');
const ReadEntry = require('tar/lib/read-entry');
const Pack = require('tar/lib/pack.js');
const modeFix = require('tar/lib/mode-fix');

export const pack = (paths, options) => {
  let pathObj = {};
  if (typeof paths === 'string') {
    pathObj[paths] = paths;
  } else {
    pathObj = paths;
  }

  options = options || {};

  const outer = new Transform({
    transform(chunk, enc, cb) {
      cb(undefined, chunk);
    }
  });

  outer._debug_entries_written = 0;
  outer._debug_entries_paused = 0;

  options.find_links = false;
  options.no_return = true;

  let ends = 0;
  let starts = 0;

  const queue = [];

  const pack = new Pack(
      Object.assign({}, options.tar || {}, {gzip: false, jobs: Infinity}));

  let working = false;
  let paused = 0;
  let ended = false;
  const work = () => {
    if (working || paused) {
      if (paused === 1) {
        paused++;
      }
      return;
    }
    const obj = queue.shift();
    if (!obj) {
      if (walkEnded && !ended) {
        ended = true;
        pack.end();
      }
      return;
    }
    working = true;
    starts++;
    let entry;
    const {path, stat, toPath} = obj;

    entry = pathToReadEntry({path, stat, toPath, portable: false});

    entry.on('end', () => {
      ends++;
      working = false;
      work();
    });

    entry.on('pause', () => {
      console.log('entry paused');
    });

    entry.on('error', (err) => {
      pack.emit('error', err);
    });

    outer._debug_entries_written++;

    if (!pack.write(entry)) {
      paused = 1;
      outer._debug_entries_paused++;
    }
  };

  pack.on('drain', () => {
    paused = 0;
    work();
  });

  let walkEnded = false;

  const walks = [];
  Object.keys(pathObj).forEach((toPath) => {
    let path = pathObj[toPath];

    if (path instanceof CustomFile) {
      queue.push({
        path: toPath,
        toPath,
        stat: path,
      });
      return work();
    }
    path = _path.resolve(path);

    walks.push(walker.walk(path, options, function(file, stat) {
      queue.push({
        path: file,
        toPath: _path.join(toPath, file.replace(path, '')),
        stat,
      });
      work();
    }));
  });

  Promise.all(walks)
      .then(() => {
        walkEnded = true;
        if (!queue.length && !working) {
          pack.end();
        }
      })
      .catch((e) => {
        outer.emit('error', e);
      });

  return pack.pipe(outer);
};

function pathToReadEntry(opts) {
  const {path, stat} = opts;
  const linkpath = opts.linkpath;

  let {toPath} = opts;
  if (!stat) {
    throw new Error('stat missing for ' + opts);
  }

  const myuid = process.getuid && process.getuid();
  const myuser = process.env.USER || '';

  const mtime = opts.mtime;
  const noMtime = opts.noMtime;
  const portable = opts.portable || true;

  toPath = toPath || path;

  if (process.platform === 'win32') {
    if (_path.isAbsolute(toPath) && toPath.indexOf(':\\\\') > -1) {
      toPath = (toPath.split(':\\\\')[1] || toPath);
    }
    toPath = toPath.split(_path.sep).join(_path.posix.sep);
  }

  if (stat.isDirectory && stat.isDirectory() && toPath.substr(-1) !== '/') {
    toPath += '/';
  }

  const header = new Header({
    path: toPath.replace(/\\/g, '/'),
    linkpath: linkpath || (stat.linkPath),
    mode: modeFix(stat.mode, stat.isDirectory && stat.isDirectory()),
    uid: portable ? null : stat.uid || 0,
    gid: portable ? null : stat.gid || 0,
    size: stat.isDirectory && stat.isDirectory() ? 0 : stat.size,
    mtime: noMtime ? null : mtime || stat.mtime,
    type: statToType(stat) || 'File',
    uname: portable ? null : stat.uid === myuid ? myuser : '',
    atime: portable ? null : stat.atime,
    ctime: portable ? null : stat.ctime
  });

  const entry = new ReadEntry(header);

  if (stat instanceof CustomFile) {
    if (stat.data) {
      if (stat.data.pipe) {
        stat.data.pipe(entry);
      } else {
        const ps = new PassThrough();
        ps.pause();
        ps.on('resume', () => {
          ps.end(stat.data);
        });
        ps.pipe(entry);
      }
    } else {
      entry.end();
    }
  } else if (stat.isFile && stat.isFile()) {
    fs.createReadStream(path).pipe(entry);
  } else {
    entry.end();
  }

  return entry;
}

export class CustomFile {
  mode;
  linkPath;
  data;
  uid = 1;
  gid = 1;
  ctime = new Date();
  atime = new Date();
  mtime = new Date();
  size = 0;

  constructor(opts = {}) {
    const type = opts.type || 'File';
    this.mode = ((opts.mode || 0) & 0o7777) | entryTypeToMode(type) | 0o644;
    this.linkPath = opts.linkPath;
    this.data = opts.data;
    this.size = opts.size || 0;
    if (Buffer.isBuffer(opts.data)) {
      this.size = opts.data.length;
    } else if (!this.size && this.size !== 0 && type === 'File') {
      throw new Error(
          'if data is not a buffer and this CustomFile is a "File" `opts.size` is required');
    }
  }

  isDirectory() {
    return (this.mode & fs.constants.S_IFMT) === fs.constants.S_IFDIR;
  }

  isSymbolicLink() {
    return (this.mode & fs.constants.S_IFMT) === fs.constants.S_IFLNK;
  }

  isFile() {
    return (this.mode & fs.constants.S_IFMT) === fs.constants.S_IFREG;
  }
}

function statToType(stat) {
  if (stat.isDirectory && stat.isDirectory()) return 'Directory';
  if (stat.isSymbolicLink && stat.isSymbolicLink()) return 'SymbolicLink';
  if (stat.isFile && stat.isFile()) return 'File';
  return;
}

function entryTypeToMode(type) {
  if (type === 'Directory') return fs.constants.S_IFDIR;
  if (type === 'SymbolicLink') return fs.constants.S_IFLNK;
  if (type === 'File') return fs.constants.S_IFREG;
  throw new Error(
      'unsupported entry type ' + type +
      '. support types are "Directory", "SymbolicLink", "File"');
}
