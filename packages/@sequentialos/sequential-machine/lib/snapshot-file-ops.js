const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const tar = require('tar');

class SnapshotFileOps {
  walk(dir) {
    if (!fs.existsSync(dir)) return [];
    const results = [];
    const stack = [dir];

    while (stack.length > 0) {
      const current = stack.pop();
      const entries = fs.readdirSync(current, { withFileTypes: true });

      for (const entry of entries) {
        const full = path.join(current, entry.name);
        results.push(full);
        if (entry.isDirectory()) stack.push(full);
      }
    }

    return results.sort();
  }

  hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async pack(cwd, files) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      const stream = tar.create({ gzip: false, portable: true, cwd }, files);
      stream.on('data', c => chunks.push(c));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async restore(workdir, hash, store) {
    const data = store.get(hash);
    if (!data || data.length === 0) return;

    const tmp = path.join(store.dir, `.tmp-${Date.now()}.tar`);
    fs.writeFileSync(tmp, data);

    try {
      await tar.extract({ file: tmp, cwd: workdir, strict: true });
    } finally {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    }
  }
}

module.exports = { SnapshotFileOps };
