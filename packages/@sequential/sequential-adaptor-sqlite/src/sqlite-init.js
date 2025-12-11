import initSqlJs from 'sql.js';
import { existsSync } from 'fs';
import fse from 'fs-extra';
import path from 'path';
import logger from '@sequentialos/sequential-logging';

let SQL;

export const initSQL = async () => {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
};

export async function initializeDatabase(dbPath) {
  await initSQL();

  if (dbPath === ':memory:') {
    return new SQL.Database();
  }

  try {
    const dir = path.dirname(dbPath);
    await fse.ensureDir(dir);

    if (existsSync(dbPath)) {
      const buffer = await fse.readFile(dbPath);
      return new SQL.Database(buffer);
    } else {
      return new SQL.Database();
    }
  } catch (err) {
    logger.error('Error loading database', { error: err.message, dbPath });
    return new SQL.Database();
  }
}

export async function persistDatabase(db, dbPath) {
  if (dbPath === ':memory:') return;

  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    await fse.writeFile(dbPath, buffer);
  } catch (err) {
    logger.error('Error saving database', { error: err.message, dbPath });
  }
}
