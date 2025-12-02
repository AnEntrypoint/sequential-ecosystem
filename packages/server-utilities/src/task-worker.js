import { parentPort } from 'worker_threads';

function extractFunctionBody(code) {
  const exportMatch = code.match(/export\s+(?:default\s+)?(?:async\s+)?function\s+\w+\s*\([^)]*\)\s*{([\s\S]*)}(?:\s*;)?$/);
  if (exportMatch) {
    return exportMatch[1];
  }

  const asyncMatch = code.match(/async\s+\([^)]*\)\s*=>\s*{([\s\S]*)}$/);
  if (asyncMatch) {
    return asyncMatch[1];
  }

  return code;
}

parentPort.on('message', async (message) => {
  const { taskCode, input, taskName } = message;

  try {
    const body = extractFunctionBody(taskCode);
    const fn = new Function('input', '__callHostTool__', `return (async (input) => { ${body} })(input)`);
    const result = await fn(input || {}, async () => {});
    parentPort.postMessage({ success: true, result });
  } catch (error) {
    parentPort.postMessage({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});
