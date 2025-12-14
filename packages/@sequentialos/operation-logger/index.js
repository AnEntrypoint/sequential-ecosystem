export function createOperationLogger(config = {}) {
  return {
    logOperation: (op) => console.log(`[OPERATION] ${op}`),
    logFileOperation: (op, path, err, meta) => {
      if (err) console.error(`[FILE ERROR] ${op} ${path}: ${err.message}`);
      else console.log(`[FILE OP] ${op} ${path}`);
    },
    logFileSuccess: (op, path, duration, meta) => console.log(`[FILE OK] ${op} ${path} (${duration}ms)`),
  };
}
export default { createOperationLogger };
