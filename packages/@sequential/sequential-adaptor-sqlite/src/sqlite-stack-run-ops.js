export function getStackRunById(db, id) {
  const result = db.exec('SELECT * FROM stack_runs WHERE id = ?', [id]);
  if (!result[0]) return null;

  const row = result[0];
  const cols = row.columns;
  const values = row.values[0];

  const obj = {};
  cols.forEach((col, i) => obj[col] = values[i]);
  return obj;
}

export function parseStackRunRow(serializer, crudPatterns, row) {
  const deserialized = serializer.deserializeRecord(row);
  return crudPatterns.normalizeStackRunRecord(deserialized);
}

export function createStackRunSQL(db, stackRun, crudPatterns) {
  const prepared = crudPatterns.buildStackRunCreate(stackRun);

  const sql = `
    INSERT INTO stack_runs (task_run_id, parent_stack_run_id, operation, status, input, result, error)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    prepared.task_run_id ?? null,
    prepared.parent_stack_run_id ?? null,
    prepared.operation ?? null,
    prepared.status ?? 'pending',
    prepared.input || null,
    prepared.result || null,
    prepared.error || null
  ]);

  const result = db.exec('SELECT last_insert_rowid() as id');
  return result[0]?.values[0]?.[0];
}

export function updateStackRunSQL(db, id, updates, crudPatterns) {
  const prepared = crudPatterns.buildStackRunUpdate(updates);
  const keys = Object.keys(prepared);
  const values = keys.map(k => prepared[k]);

  const setClause = keys.map(k => `${k} = ?`).join(', ');
  const sql = `
    UPDATE stack_runs
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [...values, id]);
}

export function queryStackRunsSQL(db, filter) {
  let sql = 'SELECT * FROM stack_runs WHERE 1=1';
  const values = [];

  Object.entries(filter).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      sql += ` AND ${key} IN (${value.map(() => '?').join(',')})`;
      values.push(...value);
    } else {
      sql += ` AND ${key} = ?`;
      values.push(value);
    }
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

export function getPendingStackRunsSQL(db) {
  const sql = `
    SELECT * FROM stack_runs
    WHERE status IN ('pending', 'suspended_waiting_child')
    ORDER BY created_at ASC
  `;

  const result = db.exec(sql);
  if (!result[0]) return [];

  const cols = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    cols.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });
}
