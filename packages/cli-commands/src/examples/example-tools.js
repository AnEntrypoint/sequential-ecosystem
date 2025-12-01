import fs from 'fs';
import path from 'path';

export function createExampleTools(toolsDir) {
  const examples = [
    {
      name: 'database.js',
      content: `export const config = {
  name: 'database',
  description: 'Database operations with connection pooling',
  version: '1.0.0',
  category: 'data'
};

export async function query(sql, params = []) {
  console.log('Executing query:', sql);
  return { rows: [], rowCount: 0 };
}

export async function insert(table, data) {
  console.log(\`Inserting into \${table}:\`, data);
  return { id: Date.now(), ...data };
}

export async function update(table, id, data) {
  console.log(\`Updating \${table} id=\${id}:\`, data);
  return { id, ...data };
}

export async function del(table, id) {
  console.log(\`Deleting from \${table} id=\${id}\`);
  return { deleted: true, id };
}
`
    },
    {
      name: 'api-client.js',
      content: `export const config = {
  name: 'api-client',
  description: 'HTTP API client with retry logic',
  version: '1.0.0',
  category: 'network'
};

export async function get(url, options = {}) {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  return response.json();
}

export async function post(url, data, options = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: JSON.stringify(data)
  });
  return response.json();
}

export async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
`
    },
    {
      name: 'filesystem.js',
      content: `import fs from 'fs/promises';
import path from 'path';

export const config = {
  name: 'filesystem',
  description: 'File system operations with safety checks',
  version: '1.0.0',
  category: 'system'
};

export async function readFile(filePath) {
  return await fs.readFile(filePath, 'utf-8');
}

export async function writeFile(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf-8');
  return { path: filePath, size: Buffer.byteLength(content) };
}

export async function listFiles(dirPath, pattern = null) {
  const files = await fs.readdir(dirPath);
  if (pattern) {
    const regex = new RegExp(pattern);
    return files.filter(f => regex.test(f));
  }
  return files;
}

export async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
  return { path: dirPath, created: true };
}
`
    }
  ];

  for (const example of examples) {
    const filePath = path.join(toolsDir, example.name);
    fs.writeFileSync(filePath, example.content);
    console.log(`  ✓ Created example tool: ${example.name}`);
  }
}
