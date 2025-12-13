export function getTaskRunById(db, id) {
  const result = db.exec('SELECT * FROM task_runs WHERE id = ?', [id]);
  if (!result[0]) return null;

  const row = result[0];
  const cols = row.columns;
  const values = row.values[0];

  const obj = {};
  cols.forEach((col, i) => obj[col] = values[i]);
  return obj;
}

export function parseTaskRunRow(serializer, crudPatterns, row) {
  const deserialized = serializer.deserializeRecord(row);
  return crudPatterns.normalizeTaskRunRecord(deserialized);
}

export function createTaskRunSQL(db, taskRun, crudPatterns) {
  const prepared = crudPatterns.buildTaskRunCreate(taskRun);

  const sql = `
    INSERT INTO task_runs (task_identifier, status, input, result, error)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    prepared.task_identifier ?? null,
    prepared.status ?? 'pending',
    prepared.input || null,
    prepared.result || null,
    prepared.error || null
  ]);

  const result = db.exec('SELECT last_insert_rowid() as id');
  return result[0]?.values[0]?.[0];
}

export function updateTaskRunSQL(db, id, updates, crudPatterns) {
  const prepared = crudPatterns.buildTaskRunUpdate(updates);
  const keys = Object.keys(prepared);
  const values = keys.map(k => prepared[k]);

  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const sql = `
    UPDATE task_runs
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [...values, id]);
}

export function queryTaskRunsSQL(db, filter) {
  let sql = 'SELECT * FROM task_runs WHERE 1=1';
  const values = [];

  Object.entries(filter).forEach(([key, value]) => {
    sql += ` AND ${key} = ?`;
    values.push(value);
  });

  const result = db.exec(sql, values);
  if (!result[0]) return [];

  const cols = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    cols.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}
