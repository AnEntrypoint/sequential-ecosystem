export function setKeystoreSQL(db, key, value, crudPatterns) {
  const prepared = crudPatterns.buildKeystoreCreate({ key, value });

  const sql = `
    INSERT OR REPLACE INTO keystore (key, value)
    VALUES (?, ?)
  `;

  db.run(sql, [prepared.key, prepared.value]);
}

export function getKeystoreSQL(db, key, serializer) {
  const result = db.exec('SELECT value FROM keystore WHERE key = ?', [key]);
  if (!result[0]) return null;

  const value = result[0].values[0][0];
  return serializer.deserializeObject(value);
}

export function deleteKeystoreSQL(db, key) {
  db.run('DELETE FROM keystore WHERE key = ?', [key]);
}

export function storeTaskFunctionSQL(db, taskFunction, crudPatterns) {
  const prepared = crudPatterns.buildTaskFunctionCreate(taskFunction);

  const sql = `
    INSERT OR REPLACE INTO task_functions (identifier, code, metadata)
    VALUES (?, ?, ?)
  `;

  db.run(sql, [
    prepared.identifier || taskFunction.identifier,
    prepared.code,
    prepared.metadata || null
  ]);

  return prepared.identifier || taskFunction.identifier;
}

export function getTaskFunctionSQL(db, identifier) {
  const result = db.exec('SELECT * FROM task_functions WHERE identifier = ?', [identifier]);
  if (!result[0]) return null;

  const row = result[0];
  const cols = row.columns;
  const values = row.values[0];

  const obj = {};
  cols.forEach((col, i) => obj[col] = values[i]);
  return obj;
}

export function parseTaskFunctionRow(serializer, crudPatterns, row) {
  const deserialized = serializer.deserializeRecord(row);
  return crudPatterns.normalizeTaskFunctionRecord(deserialized);
}
